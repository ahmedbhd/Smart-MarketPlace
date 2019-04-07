const express = require('express');
const app = express();
const port = 3002 || process.env.PORT;
const bodyParser = require('body-parser');

const assert = require ('assert');

const web3 = require('./web3');
const compiledContracts = require ('../compile');
//require('events'). EventEmitter.prototype._maxListeners = 100;
const events = require('./events');

var buyerAccount = null;
var myContract = null;
var accounts = null;
var proxyContract = null;
var homes = [];
const home = web3.eth.contract(JSON.parse(compiledContracts['Home.sol:Home'].interface));


app.use(bodyParser.json());


app.use('/', express.static('public_static'));

app.get('/getMyAccount', (req, res) => {

    res.send(buyerAddress);

});

app.get('/getHomeAt', (req, res) => {
    
    res.json(homeJSON);

});

app.get('/getHomes', (req, res) => {
    let homesNbr = proxyContract.getHomesNbr({from:buyerAccount,gas:3000000 });
    console.log("homesNbr :"+homesNbr)
    for (var i =0 ; i< homesNbr ; i++){
        console.log("i :"+i)
        let homeAddress = proxyContract.getHomeAt(web3.toBigNumber(i),{from:buyerAccount,
            gas:3000000 });
        let thisHome = home.at(homeAddress);
        homes.push( {
            "Location" : thisHome.getLocation({from:buyerAccount,gas:3000000 }),
            "Area": thisHome.getArea({from:buyerAccount,gas:3000000 }),
            "price": thisHome.getPrice({from:buyerAccount,gas:3000000 }),
            "State": thisHome.getState({from:buyerAccount,gas:3000000 }),
            "Owner" : thisHome.getOwner({from:buyerAccount,gas:3000000 })
        })
    }
    res.json(homes);
});


var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    deploySCProxy();
});


function deploySCProxy (){
    accounts = web3.eth.accounts;
    buyerAccount = accounts[8];
    console.log("Seller account: "+buyerAccount);

    console.log("Contract Proxy deployment...");
    proxyContract = web3.eth.contract(JSON.parse(compiledContracts['Proxy.sol:Proxy'].interface));
    proxyContract = proxyContract.at(
        "0x7468f24217eebf22721f94a4803a411b7abc6cf2" /* address */
      );
    console.log("Deployment Proxy done!");
}
