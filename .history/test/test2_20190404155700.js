const Web3 = require('web3'); //Web3 is a constructor

const { interface, bytecode } = require('../compile');

require('events'). EventEmitter.prototype._maxListeners = 100;

var web3 = null;
web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
let MyContract = web3.eth.contract(JSON.parse(abi));
var myContractReturned = MyContract.new(param1, param2, {
  from:mySenderAddress,
  data:bytecode,
  gas:gasEstimate}, function(err, myContract){
   if(!err) {
      // NOTE: The callback will fire twice!
      // Once the contract has the transactionHash property set and once its deployed on an address.
       // e.g. check tx hash on the first call (transaction send)
      if(!myContract.address) {
          console.log(myContract.transactionHash) // The hash of the transaction, which deploys the contract
      
      // check address on the second call (contract deployed)
      } else {
          console.log(myContract.address) // the contract address
      }
       // Note that the returned "myContractReturned" === "myContract",
      // so the returned "myContractReturned" object will also get the address set.
   }
 });

function deployContract(int) {
    return new web3.eth.Contract(JSON.parse(interface) )
        .deploy({data: '0x'+bytecode, arguments: [200]})
        .send({ from: accounts[0], gas:500000});

}