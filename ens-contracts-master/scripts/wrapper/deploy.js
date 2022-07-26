const fs = require('fs')
const envfile = require('envfile')
const ensAppSourcePath = '../ens-app/cypress.env.json'
const { network, run } = require("hardhat")
const parsedFile = envfile.parse(fs.readFileSync('./.env'))

async function verify(address, constructorArguments){
  console.log(`verify  ${address} with arguments ${constructorArguments.join(',')}`)
  await run("verify:verify", {
    address,
    constructorArguments
  })
}

async function main() {
  let registryAddress, registrarAddress, metadataAddress
      ,wrapperAddress,resolverAddress, metadataHost
      ,wrapperArguments, resolverArguments, metadataArguments
  ({
    METADATA_ADDRESS:metadataAddress,
    WRAPPER_ADDRESS:wrapperAddress,
    RESOLVER_ADDRESS:resolverAddress,
    METADATA_HOST:metadataHost = 'ens-metadata-service.appspot.com'
  } = parsedFile)
  if(network.name === 'localhost'){
    const addresses = JSON.parse(fs.readFileSync(ensAppSourcePath, 'utf8'))
    registryAddress = addresses.ensAddress
    registrarAddress = addresses.baseRegistrarAddress
    metadataUrl = 'http://localhost:8080/name/0x{id}'
    if(!(addresses.ensAddress && addresses.baseRegistrarAddress)){
      throw('please run yarn preTest on ../ens-app')
    }  
  }else{
    // Regisry and registrar addresses are same across all networks
    registryAddress = '0x1e7426a2b72B768bBBC5B2686280aB51196592FB'
    registrarAddress = '0xC36606d59d7570a26B1040c572Adbfd1936a5085'
    metadataUrl = `https://${metadataHost}/name/0x{id}`
  }
  const [deployer] = await ethers.getSigners()
    
  console.log(`Deploying contracts to ${network.name} with the account:${deployer.address}`)
  const balance = (await deployer.getBalance()).toString()
  console.log("Account balance:", balance, balance > 0)
  if(balance === 0){
    throw(`Not enough eth`)
  }

  const NameWrapper = await ethers.getContractFactory("NameWrapper")
  console.log({
    registryAddress, registrarAddress
  })
  const StaticMetadataService = await ethers.getContractFactory("StaticMetadataService")
  console.log(`Setting metadata service to ${metadataUrl}`)
  if(metadataAddress){
    console.log(`Metadata address ${metadataAddress} is already set.`)
  }else{
    metadataArguments = [metadataUrl]
    const metadata = await StaticMetadataService.deploy(...metadataArguments)
    await metadata.deployTransaction.wait()
    console.log("Metadata address:",metadata.address)
    metadataAddress = metadata.address
  }
  if(wrapperAddress){
    console.log(`Wrapper address ${wrapperAddress} is already set.`)
  }else{
    wrapperArguments = [registryAddress, registrarAddress, metadataAddress]
    const wrapper = await NameWrapper.deploy(registryAddress, registrarAddress, metadataAddress)
    await wrapper.deployTransaction.wait()
    console.log("Wrapper address:", wrapper.address)
    wrapperAddress = wrapper.address
  }
  if(resolverAddress){
    console.log(`Resolver address ${resolverAddress} is already set.`)
  }else{
    const PublicResolver = await ethers.getContractFactory("PublicResolver")
    resolverArguments = [registryAddress, wrapperAddress]
    const resolver = await PublicResolver.deploy(...resolverArguments)
    await resolver.deployTransaction.wait()
    console.log("Resolver address:", resolver.address)
    resolverAddress = resolver.address
  }

  if(network.name !== 'localhost'){
    console.log('wait for 5 sec until bytecodes are uploaded into etherscan')
    await new Promise(resolve => setTimeout(resolve, 5000));
    if(metadataArguments) verify(metadataAddress, metadataArguments)
    if(wrapperArguments) verify(wrapperAddress, wrapperArguments)
    if(resolverArguments) verify(resolverAddress, resolverArguments)
  }
  const DummyOracle = await ethers.getContractFactory("DummyOracle")
  const StableCoinOracle = await ethers.getContractFactory("StablePriceOracle")
  const ETHRegistrarController = await ethers.getContractFactory("ETHRegistrarController")

  const signers = await ethers.getSigners();
  const accounts = signers.map(s => s.address)

  const dummyOracle = await DummyOracle.deploy(100000000)
  await dummyOracle.deployed()
  console.log(`Dummy Oracle: ${dummyOracle.address}`)

  const oracle = await StableCoinOracle.deploy(dummyOracle.address,[0, 0, 4, 2, 1])
  await oracle.deployed()
  console.log(`StablePriceOracle Oracle: ${oracle.address}`)

  const ethRegistrar = await ETHRegistrarController.deploy(
      process.env.REGISTRY_ADDRESS,
      dummyOracle.address,
      60,
      86400,
      process.env.REVERSE_REGISTRAR,
      process.env.WRAPPER_ADDRESS
  )
  await ethRegistrar.deployed()
  console.log(`StablePriceOracle Oracle: ${ethRegistrar.address}`)
  if(network.name !== 'localhost'){
    console.log('wait for 5 sec until bytecodes are uploaded into etherscan')
    await new Promise(resolve => setTimeout(resolve, 5000));
    if(dummyOracle.address) await verify(dummyOracle, [100000000])
    if(oracle.address) await verify(oracle, [dummyOracle.address,[0, 0, 4, 2, 1]])
    if(ethRegistrar.address) await verify(ethRegistrar.address, [
      process.env.REGISTRY_ADDRESS,
      dummyOracle.address,
      60,
      86400,
      process.env.REVERSE_REGISTRAR,
      process.env.WRAPPER_ADDRESS
    ])
   
  }



 

  console.log("done");
  



//   await lock.deployed();

  console.log("done");

  parsedFile.REGISTRY_ADDRESS = registryAddress
  parsedFile.REGISTRAR_ADDRESS = registrarAddress
  parsedFile.METADATA_ADDRESS = metadataAddress
  parsedFile.WRAPPER_ADDRESS = wrapperAddress
  parsedFile.RESOLVER_ADDRESS = resolverAddress
  // parsedFile.DUMMY_ADDRESS = dummyOracle.address
  // parsedFile.ORACLE = oracle.address
  // parsedFile.CONTROLLER = ethRegistrar.address
  fs.writeFileSync('./.env', envfile.stringify(parsedFile))
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
//   Dummy Oracle: 0x7355Ee9480cbee0cdC9A1B8F801fdF97e6525957
// StablePriceOracle Oracle: 0x9bE0d0d90c9205da08c03f7fb02d81497365e631
// Controller: 0x5D0dB02815660Ca98C61B0Fea86fe009EcF88c22
