require('dotenv').config()
const hre = require("hardhat");
const ethers = hre.ethers;
const { network, run } = require("hardhat")

// const {verify}= require('./deploy')

async function main() {
  
  const DummyOracle = await ethers.getContractFactory("DummyOracle")
  const StableCoinOracle = await ethers.getContractFactory("StablePriceOracle")
  const ETHRegistrarController = await ethers.getContractFactory("ETHRegistrarController")

  const signers = await ethers.getSigners();
  const accounts = signers.map(s => s.address)

  // const dummyOracle = await DummyOracle.deploy(100000000)
  // await dummyOracle.deployed()
  // console.log(`Dummy Oracle: ${dummyOracle.address}`)

  // const oracle = await StableCoinOracle.deploy(dummyOracle.address,[0, 0, 4, 2, 1])
  // await oracle.deployed()
  // console.log(`StablePriceOracle Oracle: ${oracle.address}`)

  const ethRegistrar = await ETHRegistrarController.deploy(
    '0x1e7426a2b72B768bBBC5B2686280aB51196592FB',
      "0xA760E890D782f93A3ca53Fa50c733c380Ac9fC6A",
      60,
      86400,
      "0x6DFf05F3D006b48FAA57176939dc4c6617522086",
      "0xdc3abd007e3ef5aBC1a3a1139237fA602d743368"
  )
  await ethRegistrar.deployed()
  console.log(`Eth registrar: ${ethRegistrar.address}`)
  // if(network.name !== 'localhost'){
  //   console.log('wait for 5 sec until bytecodes are uploaded into etherscan')
  //   await new Promise(resolve => setTimeout(resolve, 5000));
  //   if(dummyOracle.address) await verify(dummyOracle, [100000000])
  //   if(oracle.address) await verify(oracle, [dummyOracle.address,[0, 0, 4, 2, 1]])
  //   if(ethRegistrar.address) await verify(ethRegistrar.address, [
  //     process.env.REGISTRY_ADDRESS,
  //     dummyOracle.address,
  //     60,
  //     86400,
  //     process.env.REVERSE_REGISTRAR,
  //     process.env.WRAPPER_ADDRESS
  //   ])
   
  // }



 

  console.log("done");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
