const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const bodyParser = require('body-parser');

const assert = require ('assert');
var Web3 = require('web3');
const {bytecode , interface} = require ('../compile');
require('events'). EventEmitter.prototype._maxListeners = 100;


var web3 = null;
//const provider = new Web3.providers.HttpProvider("http://localhost:8501");
var myContractAddress = null;
var myContract = null;
var accounts = null;
var instructorEvent = null;

async function deploySC (){
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8511"));
    accounts = await web3.eth.getAccounts();
    var deployContract = await new web3.eth.Contract(JSON.parse(interface));

    //   deployContract   .deploy({data: bytecode, arguments: []})

    //         .send({ from: account, gas:5000000});
    let contractInstance = await deployContract
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





app.use(bodyParser.json());


app.use('/', express.static('public_static'));

app.get('/getAccounts', (req, res) => {

    res.send(accounts);

});

app.post('/addFarmer', (req, res) => {
    myContract.methods.addFarmer(req.body.activity, req.body.username, req.body.location).send(
        {from:accounts[0]})
       .then(response => res.send(response))
       .catch(err => console.error(err));

}); 

var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    deploySC()
        .then(result => {
            myContractAddress = result.address;
            console.log('SC Address ' +result.address);
            myContract = new web3.eth.Contract(JSON.parse(interface), myContractAddress);
            myContract.getPastEvents("Event",
                {
                    filter: {}, // Using an array means OR: e.g. 20 or 23
                    fromBlock: 0,
                    toBlock: 'latest'
                },(error,e) =>console.log("event :"+e))
                .on('error', console.error);
        })
        .catch(err => console.error(err));
  });