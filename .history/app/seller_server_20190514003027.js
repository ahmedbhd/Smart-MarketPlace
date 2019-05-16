const express = require('express');
const app = express();
const port = 3001 || process.env.PORT;
const bodyParser = require('body-parser');
const cors = require('cors');

const assert = require ('assert');

const web3 = require('./seller_web3');
const {HouseSC,STTokenSC,ProxySC,PurchaseSC} = require ('./Contracts');

var proxyContractAddress = null;
var proxyContract = null;
var sellerAccount = null;
var tokenContract = null;
var tokenContractAddress = null;
var purchase = PurchaseSC;

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
    console.log("addhouse");
    console.log("acc "+sellerAccount);
    let location = req.body.description+"|"+req.body.location;
    let area =  req.body.area+"/"+req.body.rooms;
    proxyContract.addHouse(location,area, req.body.price,{from:sellerAccount,
         gas:3000000 }, function(err, result){
            if(!err) {
                console.log(result);
                res.json(result);
            }else{
                console.log(err);
                res.status(400).send({
                    message: err
                });
            }
        }
        );
});

app.post('/getHouseAt', (req, res) => {
    console.log("getHouseAt")
    let thisHouse = proxyContract.getHouseAt(req.body.houseIndex, {from: sellerAccount,
        gas:3000000 });
        let tab = thisHouse[1].split("/");
        let rooms = parseInt(tab[1]);
        let t =thisHouse[0].split("|");
        let houseJSON = {
            "description":t[0],
            "location" : t[1],
            "area": tab[0],
            "rooms":rooms,
            "price": thisHouse[2],
            "state": thisHouse[3],
            "image" : "h_"+req.body.houseIndex+".jpg",
            "owner" : thisHouse[4],
            "buyer" : thisHouse[5]
        }
        console.log(houseJSON)
    res.json(houseJSON);

});

app.get('/getMyHouses', (req, res) => {
    console.log("getMyHouses");

    let houses =[]
    let housesNbr = proxyContract.getMyHouses({from:sellerAccount,gas:30000000 });
    if (housesNbr!=""){
        housesNbr = housesNbr.slice(0,housesNbr.length-1);
        console.log("housesNbr :"+housesNbr);

        let tab = housesNbr.split(";");
        tab.forEach(function (item) {
            console.log("housesNbr :"+item);
            let thisHouse = proxyContract.getHouseAt(item,{from:sellerAccount,
                gas:3000000 });
                let t = thisHouse[1].split("/");
                let rooms = parseInt(t[1]);
                let tab =thisHouse[0].split("|");
                houses.push( {
                    "indexHouse": item,
                    "description":tab[0],
                    "location" : tab[1],
                    "area": t[0],
                    "rooms":rooms,
                    "price": thisHouse[2],
                    "state": thisHouse[3],
                    "image":"h_"+item+".jpg",
                    "owner" : thisHouse[4],
                    "buyer" : thisHouse[5]
                })
        });
    }
    res.json(houses);
});

app.post('/setConfirmed', (req, res) => {
    console.log("set confirmed "+req.body.purchaseIndex);
    res.json(proxyContract.setPurchaseAsConfirmed(req.body.purchaseIndex,req.body.houseIndex,{from:sellerAccount,gas:3000000 }));

});

app.post('/setCanceled', (req, res) => {
    console.log("setCanceled");
    res.json(proxyContract.setPurchaseAsCanceled(req.body.houseIndex,req.body.purchaseIndex,{from:sellerAccount,gas:3000000 }));

});

app.post('/deleteHouse', (req, res) => {
    console.log("deleteHouse");
    res.json(proxyContract.deleteHouseAt(req.body.houseIndex,{from:sellerAccount,gas:3000000 }));

});



app.post('/getMyInProgressPurchaseAt', (req, res) => {
    console.log("getMyInProgressPurchaseAt");
    let purchases = null;
    let item = req.body.purchaseIndex;
    console.log(item);
    let thisPurchaseAddr = proxyContract.getPurchaseAt(item,{from:sellerAccount,
        gas:3000000 });
    let localPurchase = purchase;
    localPurchase = localPurchase.at(
        thisPurchaseAddr[0]  /* address */
    );
    let addresses = localPurchase.getAddresses({from:sellerAccount,gas:3000000 });
    let strings = localPurchase.getStrings({from:sellerAccount,gas:3000000 });
    let houseIndex = localPurchase.getHouseIndex({from:sellerAccount,gas:3000000 });
    let loan = localPurchase.getLoan({from:sellerAccount,gas:3000000 });
    let buyer = localPurchase.getBuyer({from:sellerAccount,gas:3000000 });
    let advance = localPurchase.getAdvance({from:sellerAccount,gas:3000000 });
    if (addresses[0] == sellerAccount){
        purchases = {
                "ref":strings[0],
                "purchaseIndex": item,
                "owner" : addresses[0],
                "buyer":buyer,
                "bank": addresses[1],
                "insurance": addresses[2],
                "houseIndex":houseIndex,
                "houseDesc":thisPurchaseAddr[1],
                "loan" : loan,
                "date" :addresses[3],
                "advance": advance,
                "amountPerMonthForBank":strings[1],
                "amountPerMonthForInsurance" : strings[2],
                "sellerConfirmation" : addresses[4],
                "buyerConfirmation" : strings[3]
            };
    }
    console.log(purchases);
    res.json(purchases);
});

app.get('/getPurchasesNbr',(req,res) => {
    console.log("getPurchasesNbr");

    let purchases =[]
    let purchasesNbr = proxyContract.getPurchasesNbr({from:sellerAccount,gas:3000000 });
    console.log("purchasesNbr :"+purchasesNbr);
    if (purchasesNbr!=""){
        purchasesNbr = purchasesNbr.slice(0,purchasesNbr.length-1);
        console.log("purchasesNbr :"+purchasesNbr);

        let tab = purchasesNbr.split(";");
        tab.forEach(function (item) {
            console.log("purchaseNbr :"+item);
            purchases.push(item);
        })
    }
    console.log(purchases);
    res.json(purchases);
});

app.post('/getMyInProgressPurchaseList', (req, res) => {
    console.log("getMyInProgressPurchaseList");

    let purchases =[]
    let purchasesNbr = proxyContract.getPurchasesNbr({from:sellerAccount,gas:3000000 });
    console.log("purchasesNbr :"+purchasesNbr);
    if (purchasesNbr!=""){
        purchasesNbr = purchasesNbr.slice(0,purchasesNbr.length-1);
        console.log("purchasesNbr :"+purchasesNbr);

        let tab = purchasesNbr.split(";");
        tab.forEach(function (item) {
            console.log("purchaseNbr :"+item);
            
            let thisPurchaseAddr = proxyContract.getPurchaseAt(item,{from:sellerAccount,
                gas:3000000 });
            let localPurchase = purchase;
            localPurchase = localPurchase.at(
                thisPurchaseAddr[0]  /* address */
            );
            let addresses = localPurchase.getAddresses({from:sellerAccount,gas:3000000 });
            let strings = localPurchase.getStrings({from:sellerAccount,gas:3000000 });
            if (addresses[0] == sellerAccount){
                purchases.push({
                        "ref":strings[0],
                        "purchaseIndex": item,
                        "houseDesc":thisPurchaseAddr[1],
                        "date" :addresses[3],
                        "amountPerMonthForBank":strings[1],
                        "amountPerMonthForInsurance" : strings[2],
                        "sellerConfirmation" : strings[3],
                        "buyerConfirmation" : strings[4]
                    });
            }
        })
    }
    console.log(purchases);
    res.json(purchases);
});

var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    accounts = web3.eth.accounts;
    sellerAccount = accounts[9];
    /* try {
        web3.personal.unlockAccount(sellerAccount, "utility");
    } catch(e) {
        console.log(e);
        return;
    } */
    console.log("Seller account: "+sellerAccount);
});

function deploySCProxy (){
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