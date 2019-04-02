const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;

const assert = require ('assert');
var Web3 = require('web3');
const {bytecode , interface} = require ('../compile');
require('events'). EventEmitter.prototype._maxListeners = 100;



//const provider = new Web3.providers.HttpProvider("http://localhost:8501");
var myContract = null;
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8510"));
async function deploySC {
     let accounts = await web3.eth.getAccounts();
     const deployContract = await new web3.eth.Contract(JSON.parse(interface));

    //   deployContract   .deploy({data: bytecode, arguments: []})

    //         .send({ from: account, gas:5000000});
    let contractInstance = await deployContract.deploy({data: '0x'+bytecode, arguments: []})
    .send({
        from: accounts[0],
        gas: 5000000
    });

    console.log('deployment done');

    //This print contract address on successful deployment

    console.log('SC Address ' +contractInstance.options.address);      
    return {
        address: contractInstance.options.address
    };
 }
    
    deploySC();



