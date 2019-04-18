const express = require('express');
const app = express();
const port = 3001 || process.env.PORT;
const bodyParser = require('body-parser');
const cors = require('cors');

const assert = require ('assert');

const web3 = require('./seller_web3');
const {HouseSC,STTokenSC,ProxySC} = require ('./Contracts');

var proxyContractAddress = null;
var proxyContract = null;
var sellerAccount = null;
var tokenContract = null;
var tokenContractAddress = null;
const house = HouseSC;

// Socket to sync the proxy contract with the clearing house
const
    io = require("socket.io-client"),
    ioClient = io.connect("http://localhost:8088");
ioClient.on("proxyAddress",function(data){
    
    proxyContractAddress = data['proxyContractAddress'];
    tokenContractAddress = data['tokenContractAddress'];
    deploySCProxy();
});


app.use(bodyParser.json());


app.use('/', express.static('public_static'));
app.use(cors());

app.get('/getMyAccount', (req, res) => {
    console.log("getMyAccount");
    res.json(sellerAccount);

});
app.get('/getMyBalance', (req, res) => {
    console.log("getMyBalance");

    res.json(tokenContract.balanceOf(sellerAccount,{from: sellerAccount, gas:3000000 }));
});

app.post('/addHouse', (req, res) => {

    res.json(proxyContract.addHouse(req.body.location, req.body.area,req.body.rooms, req.body.price, req.body.image,{from:sellerAccount,
         gas:3000000 }));

});

app.get('/getMyPendingHouses', (req, res) => {
    let houses =[]
    let housesNbr = proxyContract.getMyPendingHouses({from:sellerAccount,gas:3000000 });
    if (housesNbr!=""){
        housesNbr = housesNbr.slice(0,housesNbr.length-1);
        console.log("housesNbr :"+housesNbr);

        let tab = housesNbr.split(";");
        tab.forEach(function (item) {
            console.log("housesNbr :"+item);
            let thisHouse = proxyContract.getHouseAt(item,{from:sellerAccount,
                gas:3000000 });
                houses.push( {
                    "indexHouse": item,
                    "location" : thisHouse[0],
                    "area": thisHouse[1],
                    "price": thisHouse[2],
                    "state": thisHouse[3],
                    "image" : thisHouse[4],
                    "owner" : thisHouse[5]
                })
        });
    }
    res.json(houses);
});

app.get('/getMyHouses', (req, res) => {
    let houses =[]
    let housesNbr = proxyContract.getMyHouses({from:sellerAccount,gas:3000000 });
    if (housesNbr!=""){
        housesNbr = housesNbr.slice(0,housesNbr.length-1);
        console.log("housesNbr :"+housesNbr);

        let tab = housesNbr.split(";");
        tab.forEach(function (item) {
            console.log("housesNbr :"+item);
            let thisHouse = proxyContract.getHouseAt(item,{from:sellerAccount,
                gas:3000000 });
                houses.push( {
                    "indexHouse": item,
                    "location" : thisHouse[0],
                    "area": thisHouse[1],
                    "price": thisHouse[2],
                    "state": thisHouse[3],
                    "image" : thisHouse[4],
                    "owner" : thisHouse[5]
                })
        });
    }
    res.json(houses);
});

app.post('/setConfirmed', (req, res) => {
    
    res.json(proxyContract.setHouseAsConfirmed(req.body.houseIndex,{from:sellerAccount,gas:3000000 }));

});

app.post('/setCanceled', (req, res) => {
    
    res.json(proxyContract.setHouseAsCanceled(req.body.houseIndex,{from:sellerAccount,gas:3000000 }));

});

var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    
});

function deploySCProxy (){
    accounts = web3.eth.accounts;
    sellerAccount = accounts[9];
    /* try {
        web3.personal.unlockAccount(sellerAccount, "123456789");
    } catch(e) {
        console.log(e);
        return;
    } */
    console.log("Seller account: "+sellerAccount);

    console.log("Contract Proxy deployment..."+proxyContractAddress);
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
    
    console.log("Contract STToken deployment..."+tokenContractAddress);
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