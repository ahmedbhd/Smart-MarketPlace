const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const bodyParser = require('body-parser');

const assert = require ('assert');

const web3 = require('./web3');
const compiledContracts = require ('../compile');
//require('events'). EventEmitter.prototype._maxListeners = 100;
const events = require('./events');

var myContractAddress = null;
var myContract = null;
var accounts = null;
var proxyContract = null;

function deploySC (){
    accounts = web3.eth.accounts
    console.log("my account: "+accounts[0]);

    console.log("Contract deployment...");
    MyContractDeployment = web3.eth.contract(JSON.parse(compiledContracts['Home.sol:Home'].interface));
    myContract = MyContractDeployment.new(accounts[0], {
        from:accounts[0],
        data:'0x'+compiledContracts['Home.sol:Home'].bytecode,
        gas:5000000}, function(err, MyContractDeployment){
        if(!err) {
            // NOTE: The callback will fire twice!
            // Once the contract has the transactionHash property set and once its deployed on an address.
            // e.g. check tx hash on the first call (transaction send)
            if(!MyContractDeployment.address) {
                console.log("The hash of the transaction :"+MyContractDeployment.transactionHash) // The hash of the transaction, which deploys the contract
            
            // check address on the second call (contract deployed)
            } else {
                console.log("contract address :"+MyContractDeployment.address) // the contract address
                console.log("Deployment done!");
            }
            // Note that the returned "myContractReturned" === "myContract",
            // so the returned "myContractReturned" object will also get the address set.
        } else {
            console.log("deploy error :"+err)
        }
    });
}





app.use(bodyParser.json());


app.use('/', express.static('public_static'));

app.get('/getAccounts', (req, res) => {

    res.send(accounts);

});

app.get('/getTokenBalance', (req, res) => {

    res.json(myContract.balanceOf(accounts[req.body.account],{from:accounts[req.body.account],
         gas:3000000 }));

});

app.get('/sendTokenTo', (req, res) => {

    res.json(myContract.transfer(accounts[req.body.to],req.body.ammount,{from:accounts[req.body.account],
         gas:3000000 }));

});





var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    deploySC();
    deploySCBuyer();
});


function deploySCBuyer() {

}