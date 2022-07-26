const namehash = require('eth-ens-namehash');
const tld = "test";
module.exports = [
    "0x1e7426a2b72B768bBBC5B2686280aB51196592FB",
    namehash.hash(tld)
  ];