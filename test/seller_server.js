const express = require('express');
const app = express();
const port = 3001 || process.env.PORT;
const bodyParser = require('body-parser');

const assert = require ('assert');

const web3 = require('./web3');
const {HomeSC,STTokenSC,ProxySC} = require ('./Contracts');

var proxyContractAddress = null;
var proxyContract = null;
var sellerAccount = null;
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

    res.send(sellerAccount);

});

app.post('/addHome', (req, res) => {

    res.json(proxyContract.addHome(req.body.area, req.body.location, req.body.price,{from:sellerAccount,
         gas:3000000 }));

});

app.get('/getMyPendingHomes', (req, res) => {
    let homes =[]
    let homesNbr = proxyContract.getMyPendingHomes({from:sellerAccount,gas:3000000 });
    if (homesNbr!=""){
        homesNbr = homesNbr.slice(0,homesNbr.length-1);
        console.log("homesNbr :"+homesNbr);

        let tab = homesNbr.split(";");
        tab.forEach(function (item) {
            console.log("homesNbr :"+item);
            let homeAddress = proxyContract.getHomeAt(item,{from:sellerAccount,
                gas:3000000 });
            console.log("home address :"+homeAddress)
            let thisHome = home.at(homeAddress);
            homes.push( {
                "Location" : thisHome.getLocation({from:sellerAccount,gas:3000000 }),
                "Area": thisHome.getArea({from:sellerAccount,gas:3000000 }),
                "price": thisHome.getPrice({from:sellerAccount,gas:3000000 }),
                "State": thisHome.getState({from:sellerAccount,gas:3000000 }),
                "Owner" : thisHome.getOwner({from:sellerAccount,gas:3000000 })
            })
        });
    }
    res.json(homes);
});

app.post('/setConfirmed', (req, res) => {
    
    res.json(proxyContract.setHomeAsConfirmed(req.body.homeIndex,{from:sellerAccount,gas:3000000 }));

});

var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    
});

function deploySCProxy (){
    accounts = web3.eth.accounts;
    sellerAccount = accounts[9];
    console.log("Seller account: "+sellerAccount);

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