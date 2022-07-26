const hre = require("hardhat");
const namehash = require('eth-ens-namehash');
const tld = "test";
const ethers = hre.ethers;
const utils = ethers.utils;
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
async function verify(address, constructorArguments){
  console.log(`verify  ${address} with arguments ${constructorArguments.join(',')}`)
  await hre.run("verify:verify", {
    address,
    constructorArguments
  })
}
async function main() {

  // Getting abis
  const ENSRegistry = await ethers.getContractFactory("ENSRegistry")
  // const ENSRegistryWithFallback = await ethers.getContractFactory("ENSRegistryWithFallback")
  const BaseRegistrarImplementation = await ethers.getContractFactory("BaseRegistrarImplementation")
  const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar")
  const PublicResolver = await ethers.getContractFactory("PublicResolver")

  // getting accounts
  const signers = await ethers.getSigners();
  const accounts = signers.map(s => s.address)
  
  // ENS Registery deployed
  const ens = await ENSRegistry.deploy()
  await ens.deployed()
  console.log(`ENS  Registery: ${ens.address}`)

  // const ens = await ENSRegistryWithFallback.deploy(ensOld.address)
  // await ens.deployed()
  // console.log(`ENS Registery: ${ens.address}`)

//  ENS Resolver Deployed
  const resolver = await PublicResolver.deploy(ens.address, ZERO_ADDRESS,ZERO_ADDRESS,ZERO_ADDRESS);
  await resolver.deployed()
  console.log(`ENS Resolver: ${resolver.address}`)
  await setupResolver(ens, resolver, accounts)

  // ENS Registar Deployed
  const registrar = await  BaseRegistrarImplementation.deploy(ens.address, namehash.hash(tld));
  await registrar.deployed()
  console.log(`ENS Base Registar: ${registrar.address}`)
  await setupRegistrar(ens, registrar);
  
  // ENS Reverse Registrar Deployed
  const reverseRegistrar = await ReverseRegistrar.deploy(ens.address);
  await reverseRegistrar.deployed()
  console.log(`ENS ReverseRegistrar: ${reverseRegistrar.address}`)
  await setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts);
  //verification
  console.log("done");
  if(network.name !== 'localhost'){
    console.log('wait for 5 sec until bytecodes are uploaded into etherscan')
    await new Promise(resolve => setTimeout(resolve, 5000));
    if(ens.address) verify(ens.address, [])
    if(resolver.address) verify(resolver.address, [ens.address, ZERO_ADDRESS,ZERO_ADDRESS,ZERO_ADDRESS])
    if(registrar.address) verify(registrar.address, [ens.address, namehash.hash(tld)])
    if(reverseRegistrar.address) verify(reverseRegistrar.address, [ens.address])
  }
};


async function setupResolver(ens, resolver, accounts) {
  const resolverNode = namehash.hash("resolver");
  const resolverLabel = labelhash("resolver");
  await ens.setSubnodeOwner(ZERO_HASH, resolverLabel, accounts[0]);
  await ens.setResolver(resolverNode, resolver.address);
  await resolver['setAddr(bytes32,address)'](resolverNode, resolver.address);
}

async function setupRegistrar(ens, registrar) {
  await ens.setSubnodeOwner(ZERO_HASH, labelhash(tld), registrar.address);
}

async function setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts) {
  await ens.setSubnodeOwner(ZERO_HASH, labelhash("reverse"), accounts[0]);
  await ens.setSubnodeOwner(namehash.hash("reverse"), labelhash("addr"), reverseRegistrar.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });