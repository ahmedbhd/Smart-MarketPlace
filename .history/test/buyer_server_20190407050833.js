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

    res.send(buyerAddress);

});

app.get('/getMyBalance', (req, res) => {

    res.send(tokenContract.balanceOf(buyerAccount,{from: buyerAccount, gas:3000000 }));

});

app.get('/getHomeAt', (req, res) => {
    
    res.json(homeJSON);

});

app.get('/getHomes', (req, res) => {
    let homes =[]
    let homesNbr = proxyContract.getHomesNbr({from:buyerAccount,gas:3000000 });
    console.log("homesNbr :"+homesNbr)
    for (var i =1 ; i <= homesNbr ; i++){
        console.log("i :"+web3.toBigNumber("0x"+i))
        let homeAddress = proxyContract.getHomeAt(i,{from:buyerAccount,
            gas:3000000 });
        console.log("home address :"+homeAddress)
        let thisHome = home.at(homeAddress);
        let state = thisHome.getState({from:buyerAccount,gas:3000000 });
        if (state==1)
            homes.push( {
                "Location" : thisHome.getLocation({from:buyerAccount,gas:3000000 }),
                "Area": thisHome.getArea({from:buyerAccount,gas:3000000 }),
                "price": thisHome.getPrice({from:buyerAccount,gas:3000000 }),
                "State": state,
                "Owner" : thisHome.getOwner({from:buyerAccount,gas:3000000 })
            })
    }
    res.json(homes);
});


app.post('/setWanted', (req, res) => {
    
    res.json(proxyContract.setHomeAtAsWanted(req.body.homeIndex,{from:buyerAccount,gas:3000000 }));

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