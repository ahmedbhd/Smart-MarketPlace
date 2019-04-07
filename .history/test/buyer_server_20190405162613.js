const express = require('express');
const app = express();
const port = 3002 || process.env.PORT;
const bodyParser = require('body-parser');

const assert = require ('assert');

const web3 = require('./web3');
const compiledContracts = require ('../compile');
//require('events'). EventEmitter.prototype._maxListeners = 100;
const events = require('./events');

var buyerAddress = null;
var myContract = null;
var accounts = null;
var proxyContract = null;
var homes = [];


app.use(bodyParser.json());


app.use('/', express.static('public_static'));

app.get('/getMyAccount', (req, res) => {

    res.send(buyerAddress);

});

app.get('/getHomeAt', (req, res) => {
    
    res.json(homeJSON);

});

app.get('/getHomes', (req, res) => {
    let homesNbr = proxyContract.getHomesNbr({from:accounts[0],gas:3000000 });
    for (var i =0 ; i< homesNbr ; i++){
        let homeAddress = proxyContract.getHomeAt(req.body.homeIndex,{from:accounts[0],
            gas:3000000 });
        let thisHome = home.at(homeAddress);
        homes.push( {
            "Location" : thisHome.getLocation({from:accounts[0],gas:3000000 }),
            "Area": thisHome.getArea({from:accounts[0],gas:3000000 }),
            "price": thisHome.getPrice({from:accounts[0],gas:3000000 }),
            "State": thisHome.getState({from:accounts[0],gas:3000000 }),
            "Owner" : thisHome.getOwner({from:accounts[0],gas:3000000 })
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
    buyerAddress = accounts[9];
    console.log("Seller account: "+buyerAddress[0]);

    console.log("Contract Proxy deployment...");
    proxyContract = web3.eth.contract(JSON.parse(compiledContracts['Proxy.sol:Proxy'].interface));
    proxyContract = proxyContract.at(
        "0x50a8cfe2d23045f59f352860ddaa80b81ed5e9c8" /* address */
      );
    console.log("Deployment Proxy done!");
}
