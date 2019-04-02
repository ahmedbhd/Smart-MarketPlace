const assert = require ('assert');
var Web3 = require('web3');
const {bytecode , interface} = require ('../compile');
require('events'). EventEmitter.prototype._maxListeners = 100;


//const provider = new Web3.providers.HttpProvider("http://localhost:8501");

 var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8510"));
 const deploySC = async () => {
      account = (web3.eth.defaultAccount = web3.eth.accounts[0]);
      console.log("heeeeey  "+account);
      const deployContract = await new web3.eth.Contract(JSON.parse(interface) ,{ from: account, gas:5000000 , data: bytecode} );

    //   deployContract   .deploy({data: bytecode, arguments: []})

    //         .send({ from: account, gas:5000000});
    let contractInstance = await deployContract.deploy({
        arguments: []
    })
    .send({
        from: account,
        gas: 5000000
    }, (err, txHash) => {
        console.log('send:', err, txHash);
    })
    .on('error', (err) => {
        console.log('error:', err);
    })
    .on('transactionHash', (err) => {
        console.log('transactionHash:', err);
    })
    .on('receipt', (receipt) => {
        console.log('receipt:', receipt);
        votingContract.options.address = receipt.contractAddress;
    });

        console.log('deployment done');

        //This print contract address on successful deployment

        console.log('SC Address ' +deployContract.options.address);      
 }
    // accounts = web3.eth.getAccounts();
    // food = new Web3.eth.Contract(JSON.parse(interface))
    //     .deploy({data: bytecode, arguments: ['hey food']})
    //     .send({from: accounts[0], gas: '30000000'});

    // food.setProvider(new Web3.providers.HttpProvider("http://localhost:8510"));
    // console.log(accounts);

    
    deploySC();

/*describe('hello2' , () => {
    it ('deploys an account', () => {
        assert.ok(food.options.address);
    });
})*/


