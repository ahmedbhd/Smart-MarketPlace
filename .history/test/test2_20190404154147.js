const Web3 = require('web3'); //Web3 is a constructor

const { interface, bytecode } = require('../compile');

require('events'). EventEmitter.prototype._maxListeners = 100;

var web3 = null;
const deploySC = async () => {
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

    accounts = await web3.eth.getAccounts(); //eth is module of web3 library
    
    console.log ('Total number of accounts provided by Ganache '+accounts.length);
    
    console.log ('List of Accounts:');
    
    console.log(accounts);

    deployContract(interface)
        .then(rslt => console.log(rslt))
        .catch(err => console.log("errrrr "+err));
    console.log('deployment done');

    //This print contract address on successful deployment

    //console.log('SC Address '+deployContract.options.address);

}

deploySC(); //Call function to deploy contract

function deployContract(int) {
    return new web3.eth.Contract(JSON.parse(interface) )
        .deploy({data: '0x'+bytecode, arguments: [200]})
        .send({ from: accounts[0], gas:500000});

}