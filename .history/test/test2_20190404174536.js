const Web3 = require('web3'); //Web3 is a constructor

const { interface, bytecode } = require('../compile');

require('events'). EventEmitter.prototype._maxListeners = 100;
var myContractReturned = null

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
accounts= web3.eth.getAccounts()
let MyContract = web3.eth.contract(JSON.parse(interface));
myContractReturned = MyContract.new(200, {
from:accounts[0],
data:'0x'+bytecode,
gas:500000}, function(err, myContract){
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