const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const bodyParser = require('body-parser');

const assert = require ('assert');

const web3 = require('./web3');
const compiledContracts = require ('../compile');
//require('events'). EventEmitter.prototype._maxListeners = 100;
const events = require('./events');

var homes = [];
var proxyContract = null;
var accounts = null;
const home = web3.eth.contract(compiledContracts['Home.sol:Home'].interface);







app.use(bodyParser.json());


app.use('/', express.static('public_static'));

app.get('/getAccounts', (req, res) => {

    res.send(accounts);

});


app.get('/getHomeAt', (req, res) => {
    let homeAddress = proxyContract.getHomeAt(req.body.homeIndex,{from:accounts[0],
        gas:3000000 });
    let thisHome = home.at(homeAddress);
    let homeJSON = {
        "Location" : thisHome.getLocation({from:accounts[0],gas:3000000 }),
        "Area": thisHome.getArea({from:accounts[0],gas:3000000 }),
        "price": thisHome.getPrice({from:accounts[0],gas:3000000 }),
        "State": thisHome.getState({from:accounts[0],gas:3000000 }),
        "Owner" : thisHome.getOwner({from:accounts[0],gas:3000000 })
    }
    res.json(homeJSON);

});

app.get('/getHomesNbr', (req, res) => {

    res.json(proxyContract.getHomesNbr({from:accounts[0],
        gas:3000000 }));

});


var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    deploySCProxy();
});


function deploySCProxy (){
    accounts = web3.eth.accounts
    console.log("my account: "+accounts[0]);

    console.log("Contract Proxy deployment...");
    MyContractDeployment = web3.eth.contract(JSON.parse(compiledContracts['Proxy.sol:Proxy'].interface));
    proxyContract = MyContractDeployment.new(accounts[0], {
        from:accounts[0],
        data:'0x'+compiledContracts['Proxy.sol:Proxy'].bytecode,
        gas:5000000}, function(err, MyContractDeployment){
        if(!err) {
            // NOTE: The callback will fire twice!
            // Once the contract has the transactionHash property set and once its deployed on an address.
            // e.g. check tx hash on the first call (transaction send)
            if(!MyContractDeployment.address) {
                console.log("The hash of the transaction :"+MyContractDeployment.transactionHash) // The hash of the transaction, which deploys the contract
            
            // check address on the second call (contract deployed)
            } else {
                console.log("Proxy contract address :"+MyContractDeployment.address) // the contract address
                console.log("Deployment Proxy done!");
            }
            // Note that the returned "myContractReturned" === "myContract",
            // so the returned "myContractReturned" object will also get the address set.
        } else {
            console.log("deploy Proxy error :"+err)
        }
    });
}

function getHomeAt(){
    proxyContract.getHomesNbr()
}