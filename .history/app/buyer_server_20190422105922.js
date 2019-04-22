const express = require('express');
const app = express();
const port = 3002 || process.env.PORT;
const bodyParser = require('body-parser');
const cors = require('cors');

const assert = require ('assert');

const web3 = require('./buyer_web3');
const {HouseSC,STTokenSC,ProxySC,PurchaseSC} = require ('./Contracts');

var proxyContract = null;
var proxyContractAddress = null;
var buyerAccount = null;
var accounts = null;
var tokenContract = null;
var tokenContractAddress = null;

var purchase = PurchaseSC;

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
app.use(cors());

app.get('/getMyAccount', (req, res) => {

    res.json(buyerAccount);

});

app.get('/getMyBalance', (req, res) => {
    res.json(tokenContract.balanceOf(buyerAccount,{from: buyerAccount, gas:3000000 }));
});

app.get('/getHouseAt', (req, res) => {
    
    let thisHouse = proxyContract.getHouseAt(req.body.houseIndex, {from: buyerAccount,
        gas:3000000 });
   
        let houseJSON = {
            "location" : thisHouse[0],
            "area": thisHouse[1],
            "price": thisHouse[2],
            "state": thisHouse[3],
            "image" : req.body.houseIndex,
            "owner" : thisHouse[4],
            "buyer" : thisHouse[5]
        }
    res.json(houseJSON);

});

app.get('/getHouses', (req, res) => {
    let houses =[]
    let housesNbr = proxyContract.getHousesNbr({from:buyerAccount,gas:3000000 });
    console.log("housesNbr :"+housesNbr)
    for (var i =1 ; i <= housesNbr ; i++){
        let thisHouse = proxyContract.getHouseAt(i,{from:buyerAccount,
            gas:3000000 });
       
        let state = thisHouse[3];
        console.log("state :"+state);
        if (state==1)
            houses.push( {
                "indexHouse": i,
                "location" : thisHouse[0],
                "area": thisHouse[1]+" rooms",
                "price": thisHouse[2],
                "state": state,
                "image":i,
                "owner" : thisHouse[4],
                "buyer" : thisHouse[5]
            })
    }
    res.json(houses);
});


app.post('/setWanted', (req, res) => {
    let myBalance = tokenContract.balanceOf(buyerAccount,{from: buyerAccount, gas:3000000 });
    let balance = parseInt(myBalance);
    let price = parseInt(req.body.housePrice);
    console.log("index :"+req.body.houseIndex+" balance :"+myBalance+" price :"+price);

        proxyContract.setHouseAsWanted(req.body.houseIndex,{from:buyerAccount,gas:3000000 }, function (error, result) {
            if (!error){
                res.json(result);
            }else {
                console.log("wanted "+error);
                res.status(400).send({
                    message: error
                });
            }
        });
    
});

app.get('/getMyPendingPurchases', (req, res) => {
    let purchases =[]
    let purchasesNbr = proxyContract.getPurchasesNbr({from:buyerAccount,gas:3000000 });
    console.log("purchasesNbr :"+purchasesNbr);
    if (purchasesNbr!=""){
        purchasesNbr = purchasesNbr.slice(0,purchasesNbr.length-1);
        console.log("purchasesNbr :"+purchasesNbr);

        let tab = purchasesNbr.split(";");
        tab.forEach(function (item) {
            console.log("purchaseNbr :"+item);
            let thisPurchaseAddr = proxyContract.getPurchaseAt(item,{from:buyerAccount,
                gas:3000000 });
            purchase = purchase.at(
                thisPurchaseAddr /* address */
            );
            let buyer = purchase.getBuyer({from:buyerAccount,gas:3000000 });
            let buyerConfir = purchase.getBuyerConfirmation({from:buyerAccount,gas:3000000 });
            if ( (buyer == buyerAccount) && (buyerConfir == false)){
                purchases.push( {
                        "indexPurchase": item,
                        "owner" : purchase.getOwner({from:buyerAccount,gas:3000000 }),
                        "buyer":buyer,
                        "bank": purchase.getBank({from:buyerAccount,gas:3000000 }),
                        "insurance": purchase.getInsurance({from:buyerAccount,gas:3000000 }),
                        "houseIndex":purchase.getHouseIndex({from:buyerAccount,gas:3000000 }),
                        "loan" : purchase.getLoan({from:buyerAccount,gas:3000000 }),
                        "date" :purchase.getDate({from:buyerAccount,gas:3000000 }),
                        "advance": purchase.getAdvance({from:buyerAccount,gas:3000000 }),
                        "amountPerMonthForBank":purchase.getAmountForBank({from:buyerAccount,gas:3000000 }),
                        "amountPerMonthForInsurance" : purchase.getAmountForInsurance({from:buyerAccount,gas:3000000 }),
                        "sellerConfirmation" : purchase.getSellerConfirmation({from:buyerAccount,gas:3000000 }),
                        "buyerConfirmation" : buyerConfir
                    })
            }
        });
    }
    res.json(purchases);
});


var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    accounts = web3.eth.accounts;
    buyerAccount = accounts[8];
    /* try {
        web3.personal.unlockAccount(buyerAccount, "producer");
        console.log("Buyer unlock done!");

    } catch(e) {
        console.log(e);
        return;
    } */
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