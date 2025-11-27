// The 'task' utility is imported from the modern Hardhat package.
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { verifyContract, checkVerification } from '../../helpers/etherscan-verification';

// Define the interface for the parsed parameters with better types for libraries.
interface VerifyParams {
  contractName: string;
  address: string;
  constructorArguments: string[];
  // Libraries are expected to be a JSON string, which we will parse into an object.
  libraries: string;
}

/**
 * Task to automatically verify a deployed smart contract on Etherscan.
 * It handles the required arguments including the complex libraries object and constructor arguments.
 */
task('verify-sc', 'Verifies a deployed smart contract on Etherscan.')
  .addParam('contractName', 'Name of the Solidity smart contract.')
  .addParam('address', 'Ethereum address of the smart contract.')
  .addOptionalParam(
    'libraries',
    'Stringified JSON object of linked libraries (e.g., {"Library1": "0xAddr..."})',
    '{}' // Default to an empty object string to simplify parsing
  )
  .addOptionalVariadicPositionalParam(
    'constructorArguments',
    'Arguments for the contract constructor.',
    []
  )
  .setAction(
    async (
      { contractName, address, constructorArguments, libraries }: VerifyParams,
      hre: HardhatRuntimeEnvironment // Use the modern 'hre' (Hardhat Runtime Environment)
    ) => {
      // 1. Check if Etherscan verification setup is complete (as per helper logic).
      checkVerification();

      // 2. Parse the libraries string into an object if it's not empty.
      let parsedLibraries: Record<string, string> = {};
      try {
        if (libraries && libraries !== '{}') {
          parsedLibraries = JSON.parse(libraries);
        }
      } catch (e) {
        throw new Error(`Invalid JSON provided for 'libraries' parameter: ${libraries}. Error: ${e}`);
      }
      
      console.log(`Verifying contract: ${contractName} at ${address}`);
      console.log(`Constructor Arguments: ${constructorArguments.join(', ')}`);
      console.log(`Linked Libraries: ${JSON.stringify(parsedLibraries)}`);

      // NOTE: The original `await localBRE.run('set-bre')` is removed as the HRE 
      // is already fully initialized when the task runs.

      // 3. Execute the core verification logic using the external helper function.
      const result = await verifyContract(
        contractName,
        address,
        constructorArguments,
        parsedLibraries // Pass the parsed object
      );
      
      return result;
    }
  );
