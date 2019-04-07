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

function deploySCProxy (){
    accounts = web3.eth.accounts;
    sellerAccount = accounts[9];
    console.log("Seller account: "+sellerAccount[0]);

    console.log("Contract Proxy deployment...");
    proxyContract = web3.eth.contract(JSON.parse(compiledContracts['Proxy.sol:Proxy'].interface));
    proxyContract = proxyContract.at(
        "0x50a8cfe2d23045f59f352860ddaa80b81ed5e9c8" /* address */
      );
    console.log("Deployment Proxy done!");
}





app.use(bodyParser.json());


app.use('/', express.static('public_static'));

app.get('/getAccounts', (req, res) => {

    res.send(accounts);

});


var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    deploySCProxy();
    deploySCBuyer();
});


function deploySCBuyer() {

}