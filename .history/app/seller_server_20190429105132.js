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
    proxyContract.addHouse(req.body.location, req.body.area,req.body.rooms, req.body.price,{from:sellerAccount,
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

app.get('/getMyInProgressHouses', (req, res) => {
    let houses =[]
    let housesNbr = proxyContract.getMyInProgressHouses({from:sellerAccount,gas:3000000 });
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
                houses.push( {
                    "indexHouse": item,
                    "location" : thisHouse[0],
                    "area": t[0],
                    "rooms": rooms,
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
                let t = thisHouse[1].split("/");
                let rooms = parseInt(t[1]);
                houses.push( {
                    "indexHouse": item,
                    "location" : thisHouse[0],
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
    
    res.json(proxyContract.setPurchaseAsConfirmed(req.body.purchaseIndex,{from:sellerAccount,gas:3000000 }));

});

app.post('/setCanceled', (req, res) => {
    
    res.json(proxyContract.setHouseAsCanceled(req.body.houseIndex,{from:sellerAccount,gas:3000000 }));

});

app.get('getPurchasesNbr',(req,res) => {
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


app.post('/getMyInProgressPurchaseAt', (req, res) => {
    let purchases =[]
    let item = req.body.purchaseIndex;
    let thisPurchaseAddr = proxyContract.getPurchaseAt(item,{from:sellerAccount,
        gas:3000000 });
    purchase = purchase.at(
        thisPurchaseAddr /* address */
    );
    let owner = purchase.getOwner({from:sellerAccount,gas:3000000 });
    let ownerConfir = purchase.getSellerConfirmation({from:sellerAccount,gas:3000000 });
    if ( (owner == sellerAccount) && (ownerConfir == false)){
        purchases.push( {
                "purchaseIndex": item,
                "owner" : owner,
                "buyer":purchase.getBuyer({from:sellerAccount,gas:3000000 }),
                "bank": purchase.getBank({from:sellerAccount,gas:3000000 }),
                "insurance": purchase.getInsurance({from:sellerAccount,gas:3000000 }),
                "houseIndex":purchase.getHouseIndex({from:sellerAccount,gas:3000000 }),
                "loan" : purchase.getLoan({from:sellerAccount,gas:3000000 }),
                "date" :purchase.getDate({from:sellerAccount,gas:3000000 }),
                "advance": purchase.getAdvance({from:sellerAccount,gas:3000000 }),
                "amountPerMonthForBank":purchase.getAmountForBank({from:sellerAccount,gas:3000000 }),
                "amountPerMonthForInsurance" : purchase.getAmountForInsurance({from:sellerAccount,gas:3000000 }),
                "sellerConfirmation" : ownerConfir,
                "buyerConfirmation" : purchase.getBuyerConfirmation({from:sellerAccount,gas:3000000 })
            });
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