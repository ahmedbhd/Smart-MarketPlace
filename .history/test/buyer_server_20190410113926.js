const express = require('express');
const app = express();
const port = 3002 || process.env.PORT;
const bodyParser = require('body-parser');

const assert = require ('assert');

const web3 = require('./web3');
const {HomeSC,STTokenSC,ProxySC} = require ('./Contracts');

var proxyContract = null;
var proxyContractAddress = null;
var buyerAccount = null;
var accounts = null;
var tokenContract = null;
var tokenContractAddress = null;

const home = HomeSC;

// Socket to sync the proxy contract with the clearing house
const
    io = require("socket.io-client"),
    ioClient = io.connect("http://localhost:8088");
ioClient.on("proxyAddress",function(data){
    console.log("Proxy address: "+data['proxyContractAddress']);
    proxyContractAddress = data['proxyContractAddress'];
    tokenContractAddress = data['tokenContractAddress'];
    deploySCProxy();
});

app.use(bodyParser.json());


app.use('/', express.static('public_static'));

app.get('/getMyAccount', (req, res) => {

    res.json(buyerAddress);

});

app.get('/getMyBalance', (req, res) => {
    res.json(tokenContract.balanceOf(buyerAccount,{from: buyerAccount, gas:3000000 }));
});

app.get('/getHomeAt', (req, res) => {
    
    let thisHome = proxyContract.getHomeAt(req.body.homeIndex, {from: buyerAccount,
        gas:3000000 });
   
    let homeJSON = {
        "Location" : thisHome[0],
        "Area": thisHome[1],
        "price": thisHome[2],
        "State": thisHome[3],
        "Owner" : thisHome[4]
    }
    res.json(homeJSON);

});

app.get('/getHomes', (req, res) => {
    let homes =[]
    let homesNbr = proxyContract.getHomesNbr({from:buyerAccount,gas:3000000 });
    console.log("homesNbr :"+homesNbr)
    for (var i =1 ; i <= homesNbr ; i++){
        let thisHome = proxyContract.getHomeAt(i,{from:buyerAccount,
            gas:3000000 });
       
        let state = thisHome[4];
        console.log("state :"+state);
        if (state==1)
            homes.push( {
                "indexHome": i,
                "Location" : thisHome[0],
                "Area": thisHome[1],
                "price": thisHome[2],
                "Owner" :thisHome[3],
                "State": state
            })
    }
    res.json(homes);
});


app.post('/setWanted', (req, res) => {
    let myBalance = tokenContract.balanceOf(buyerAccount,{from: buyerAccount, gas:3000000 });
    res.json(proxyContract.setHomeAtAsWanted(req.body.homeIndex,myBalance,{from:buyerAccount,gas:3000000 }));
});

var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    accounts = web3.eth.accounts;
    buyerAccount = accounts[8];
    console.log("Buyer account: "+buyerAccount);

});



function deploySCProxy (){
    
    console.log("Contract Proxy deployment...");
    if (proxyContractAddress){
        proxyContract = ProxySC;
        proxyContract = proxyContract.at(
            proxyContractAddress /* address */
        );
        console.log("Deployment Proxy done!");
        deploySCToken ()
    }else{
        console.log("Waiting for a Proxy contract to be deployed");
    }
}

function deploySCToken (){
    
    console.log("Contract STToken deployment...");
    if (tokenContractAddress){
        tokenContract = STTokenSC;
        tokenContract = tokenContract.at(
            tokenContractAddress /* address */
        );
        console.log("Deployment STToken done!");
    }else{
        console.log("Waiting for a STToken contract to be deployed");
    }
}