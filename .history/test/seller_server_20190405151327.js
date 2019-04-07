const express = require('express');
const app = express();
const port = 3001 || process.env.PORT;
const bodyParser = require('body-parser');

const assert = require ('assert');

const web3 = require('./web3');
const compiledContracts = require ('../compile');
//const events = require('./events');

var myContractAddress = null;
var proxyContract = null;
var sellerAccount = null;


function deploySCProxy (){
    accounts = web3.eth.accounts;
    sellerAccount = accounts[9];
    console.log("Seller account: "+sellerAccount[0]);

    console.log("Contract Proxy deployment...");
    proxyContract = web3.eth.contract(compiledContracts['Proxy.sol:Proxy'].interface);
    proxyContract = proxyContract.at(
        "0x40de44e9b35a22d951cea02e16bf680ced08d878" /* address */
      );
    console.log("Deployment Proxy done!");
}





app.use(bodyParser.json());


app.use('/', express.static('public_static'));

app.get('/getMyAccount', (req, res) => {

    res.send(sellerAccount);

});

app.post('/addHome', (req, res) => {

    res.json(proxyContract.addHome(req.body.area,req.location,req.body.price,{from:sellerAccount,
         gas:3000000 }));

});


var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    deploySCProxy();
});