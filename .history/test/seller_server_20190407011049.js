const express = require('express');
const app = express();
const port = 3001 || process.env.PORT;
const bodyParser = require('body-parser');

const assert = require ('assert');

const web3 = require('./web3');
const compiledContracts = require ('../compile');
//const events = require('./events');

var proxyContractAddress = null;
var myContractAddress = null;
var proxyContract = null;
var sellerAccount = null;




var socket = require('socket.io-client')('http://127.0.0.1:8088', {forceNew: true});
  socket.on('connection', function(){
    socket.on("proxyAddress",function(data){
        console.log("Proxy address: "+data);
        proxyContractAddress = data;
        deploySCProxy();
    });
});


app.use(bodyParser.json());


app.use('/', express.static('public_static'));

app.get('/getMyAccount', (req, res) => {

    res.send(sellerAccount);

});

app.post('/addHome', (req, res) => {

    res.json(proxyContract.addHome(req.body.area, req.body.location, req.body.price,{from:sellerAccount,
         gas:3000000 }));

});

app.get('/getMyPendingHomes', (req, res) => {
    let homes =[]
    let homesNbr = proxyContract.getMyPendingHomes({from:sellerAccount,gas:3000000 });
    console.log("homesNbr :"+homesNbr)
    /* for (var i =1 ; i <= homesNbr ; i++){
        console.log("i :"+web3.toBigNumber("0x"+i))
        let homeAddress = proxyContract.getHomeAt(i,{from:buyerAccount,
            gas:3000000 });
        console.log("home address :"+homeAddress)
        let thisHome = home.at(homeAddress);
        homes.push( {
            "Location" : thisHome.getLocation({from:buyerAccount,gas:3000000 }),
            "Area": thisHome.getArea({from:buyerAccount,gas:3000000 }),
            "price": thisHome.getPrice({from:buyerAccount,gas:3000000 }),
            "State": thisHome.getState({from:buyerAccount,gas:3000000 }),
            "Owner" : thisHome.getOwner({from:buyerAccount,gas:3000000 })
        })
    } */
    res.json(homes);
});

var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    
});

function deploySCProxy (){
    accounts = web3.eth.accounts;
    sellerAccount = accounts[9];
    console.log("Seller account: "+sellerAccount[9]);

    console.log("Contract Proxy deployment...");
    assert (proxyContractAddress)
    proxyContract = web3.eth.contract(JSON.parse(compiledContracts['Proxy.sol:Proxy'].interface));
    proxyContract = proxyContract.at(
        proxyContractAddress /* address */
    );
    console.log("Deployment Proxy done!");
}
