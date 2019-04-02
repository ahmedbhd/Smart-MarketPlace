const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const bodyParser = require('body-parser');

const assert = require ('assert');
var Web3 = require('web3');
const {bytecode , interface} = require ('../compile');
require('events'). EventEmitter.prototype._maxListeners = 100;



//const provider = new Web3.providers.HttpProvider("http://localhost:8501");
var myContractAddress = null;
var myContract = null;
var accounts = null;
async function deploySC (){
    accounts = await web3.eth.getAccounts();
    const myContract = await new web3.eth.Contract(JSON.parse(interface));

    //   deployContract   .deploy({data: bytecode, arguments: []})

    //         .send({ from: account, gas:5000000});
    let contractInstance = await myContract
        .deploy({data: '0x'+bytecode, arguments: []})
        .send({
            from: accounts[0],
            gas: 5000000
        });

    console.log('deployment done');

    //This print contract address on successful deployment
    return {
        address: contractInstance.options.address
    };
}

if (myContractAddress == null)
    deploySC()
        .then(result => {
            myContractAddress = result.address;
            console.log('SC Address ' +result.address);
        })
        .catch(err => console.error(err));


myContract = myContract.at(
    myContractAddress /* address */
);

app.use(bodyParser.json());


app.use('/', express.static('public_static'));

app.get('/getAccounts', (req, res) => {

    res.send(accounts);

});

var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8510"));
  
    console.log("Express Listening at http://localhost:" + port);
  
  });