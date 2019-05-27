const express = require("express");
const app = express();
const port = 3001 || process.env.PORT;
const bodyParser = require("body-parser");
const cors = require("cors");

const assert = require("assert");

const web3 = require("./seller_web3");
const { HouseSC, STTokenSC, ProxySC, PurchaseSC } = require("./Contracts");

var proxyContractAddress = null;
var proxyContract = null;
var sellerAccount = null;
var tokenContract = null;
var tokenContractAddress = null;
var purchase = PurchaseSC;

// Socket to sync the proxy contract with the clearing house
const io = require("socket.io-client"),
  ioClient = io.connect("http://localhost:8088");
ioClient.on("proxyAddress", function(data) {
  proxyContractAddress = data["proxyContractAddress"];
  tokenContractAddress = data["tokenContractAddress"];
  deploySCProxy();
});

app.use(bodyParser.json());

app.use("/", express.static("public_static"));
app.use(cors());

app.get("/getMyAccount", (req, res) => {
  console.log("getMyAccount");
  res.json(sellerAccount);
});



app.get("/getMyBalance", (req, res) => {
  console.log("getMyBalance");

  res.json(
    tokenContract.balanceOf(sellerAccount, {
      from: sellerAccount,
      gas: 3000000
    })
  );
});



app.post("/addHouse", (req, res) => {
  console.log("addhouse");
  console.log("acc " + sellerAccount);
  let _descLocationAreaRoomsReview = req.body.description + "|" + req.body.location+"|"+req.body.area + "|" + req.body.rooms+"|0/";
  let _d = new Date();
  let _timeStamp = _d.getTime();
  let _history = sellerAccount+"/"+_timeStamp+"/Adding|"
  proxyContract.addHouse(_descLocationAreaRoomsReview,_history,req.body.price,sellerAccount,{ from: sellerAccount, gas: 3000000 },
    function(err, result) {
      if (!err) {
        console.log(result);
        res.json(result);
      } else {
        console.log(err);
        res.status(400).send({
          message: err
        });
      }
    }
  );
});



app.post("/getHouseAt", (req, res) => {
  console.log("getHouseAt "+req.body.indexHouse);
  let _thisHouse = proxyContract.getHouseAt(req.body.indexHouse,{from: sellerAccount, gas: 3000000});
  let _descLocationAreaRoomsReview = _thisHouse[0];
  let _history=_thisHouse[1];
  let _price =_thisHouse[2];
  let _state = _thisHouse[3];
  let _owner = _thisHouse[4];
  let _buyer =_thisHouse[5];

  let _tab = _descLocationAreaRoomsReview.split("|");
  let _desc = _tab[0]
  let _loc = _tab[1]
  let _area = _tab[2]
  let _rooms = _tab[3]
  _rooms = parseInt(_rooms);
  let _review = _tab[4];

  let _houseJSON = {
    indexHouse:req.body.indexHouse,
    description: _desc.charAt(0).toUpperCase() + _desc.slice(1),
    location: _loc.charAt(0).toUpperCase() + _loc.slice(1),
    area: _area,
    rooms: _rooms,
    history: _history,
    price: _price,
    state: _state,
    image: "h_" + req.body.indexHouse + ".jpg",
    review: _review,
    owner: _owner,
    buyer: _buyer
  };
  console.log(_houseJSON);
  res.json(_houseJSON);
});



app.get("/getMyHouses", (req, res) => {
  console.log("getMyHouses");

  let _houseJSON = [];
  let _housesNbr = proxyContract.getHouses({from: sellerAccount,gas:30000000});
  if (_housesNbr != "") {
    _housesNbr = _housesNbr.slice(0, _housesNbr.length - 1);
    console.log("housesNbr :" + _housesNbr);

    let _houses = _housesNbr.split(";");
    _houses.forEach(function(item) {
      console.log("housesNbr :" + item);
      let _thisHouse = proxyContract.getHouseAt(item,{from:sellerAccount,gas: 3000000});
      let _owner = _thisHouse[4];

      if(_owner==sellerAccount){
        let _descLocationAreaRoomsReview = _thisHouse[0];
        let _history=_thisHouse[1];
        let _price =_thisHouse[2];
        let _state = _thisHouse[3];
        let _buyer =_thisHouse[5];

        let _tab = _descLocationAreaRoomsReview.split("|");
        let _desc = _tab[0]
        let _loc = _tab[1]
        let _area = _tab[2]
        let _rooms = _tab[3]
        let _review = _tab[4];
        _rooms = parseInt(_rooms);
    
        _houseJSON.push({
          indexHouse:item,
          description: _desc.charAt(0).toUpperCase() + _desc.slice(1),
          location: _loc.charAt(0).toUpperCase() + _loc.slice(1),
          area: _area,
          rooms: _rooms,
          history: _history,
          price: _price,
          state: _state,
          image: "h_" + item + ".jpg",
          review: _review,
          owner: _owner,
          buyer: _buyer
        });
    }
    });
  }
  console.log(_houseJSON);
  res.json(_houseJSON);
});



app.post("/setConfirmed", (req, res) => {
  console.log("set confirmed " + req.body.purchaseIndex);
  res.json(
    proxyContract.setPurchaseAsConfirmed(req.body.purchaseIndex,req.body.indexHouse,{ from: sellerAccount, gas: 3000000 })
  );
});



app.post("/setCanceled", (req, res) => {
  console.log("setCanceled");
  let _d = new Date();
  let _timeStamp = _d.getTime();
  let _history = req.body.history;
  _history = sellerAccount+"/"+_timeStamp+"/Cancellation|"+_history;
  res.json(
    proxyContract.setPurchaseAsCanceled(req.body.indexHouse,req.body.purchaseIndex,_history,{from: sellerAccount, gas: 3000000})
  );
});



app.post("/deleteHouse", (req, res) => {
  console.log("deleteHouse");
  res.json(
    proxyContract.deleteHouseAt(req.body.indexHouse,{from: sellerAccount,gas: 3000000})
  );
});



app.post("/getMyInProgressPurchaseAt", (req, res) => {
  console.log("getMyInProgressPurchaseAt");
  let _purchases = null;
  let _item = req.body.purchaseIndex;
  console.log(_item);

  let _thisPurchaseAddr = proxyContract.getPurchaseAt(_item,{from: sellerAccount,gas: 3000000});
  console.log(_thisPurchaseAddr);
  let _thisPurchase = purchase.at(_thisPurchaseAddr[0] /* address */);

  let _history = _thisPurchaseAddr[2];
  let _addresses = _thisPurchase.getAddresses({from: sellerAccount,gas: 3000000});
  let _strings = _thisPurchase.getStrings({ from: sellerAccount, gas: 3000000 });
  let _houseIndex = _thisPurchase.getHouseIndex({from: sellerAccount,gas: 3000000});

  _loanAdvanceMonthlyBankMonthlyInsurance = _strings[0];
  let _descLocationAreaRoomsReview = _thisPurchaseAddr[1].split("|");
  let _paymentsTab = _loanAdvanceMonthlyBankMonthlyInsurance.split("|");

  if (_addresses[0] == sellerAccount) {
    _purchases = {
      ref: _strings[1],
      purchaseIndex: _item,
      owner: _addresses[0],
      buyer: _addresses[3],
      bank: _addresses[1],
      insurance: _addresses[2],
      indexHouse: _houseIndex,
      houseDesc: _descLocationAreaRoomsReview[0],
      history:_history,
      loan: _paymentsTab[0],
      date: _strings[1],
      advance: _paymentsTab[1],
      amountPerMonthForBank: _paymentsTab[2],
      amountPerMonthForInsurance: _paymentsTab[3],
      sellerConfirmation: _strings[2],
      buyerConfirmation: _strings[3]
    };
  }
  console.log(_purchases);
  res.json(_purchases);
});



app.get("/getPurchasesNbr", (req, res) => {
  console.log("getPurchasesNbr");

  let _purchases = [];
  let _purchasesNbr = proxyContract.getPurchasesNbr({from: sellerAccount,gas: 3000000});
  console.log("purchasesNbr :" + _purchasesNbr);

  if (_purchasesNbr != "") {
    _purchasesNbr = _purchasesNbr.slice(0, _purchasesNbr.length - 1);
    console.log("purchasesNbr :" + _purchasesNbr);

    let _tab = _purchasesNbr.split(";");
    _tab.forEach(function(_item) {
      console.log("purchaseNbr :" + _item);
      _purchases.push(_item);
    });
  }
  console.log(_purchases);
  res.json(_purchases);
});



app.get("/getMyInProgressPurchaseList", (req, res) => {
  console.log("getMyInProgressPurchaseList");

  let _purchases = [];
  let _purchasesNbr = proxyContract.getPurchasesNbr({from: sellerAccount,gas: 3000000});
  console.log("purchasesNbr :" + _purchasesNbr);
  if (_purchasesNbr != "") {
    _purchasesNbr = _purchasesNbr.slice(0, _purchasesNbr.length - 1);
    console.log("purchasesNbr :" + _purchasesNbr);

    let _tab = _purchasesNbr.split(";");
    _tab.forEach(function(_item) {
      console.log("purchaseNbr :" + _item);

      let _thisPurchaseAddr = proxyContract.getPurchaseAt(_item, {from: sellerAccount,gas: 3000000});
      let _thisPurchase = purchase;
      _thisPurchase = _thisPurchase.at(_thisPurchaseAddr[0] /* address */);

      let _strings = _thisPurchase.getStrings({ from: sellerAccount, gas: 3000000 });
      let _houseIndex = _thisPurchase.getHouseIndex({from: sellerAccount,gas: 3000000});
      let _addresses = _thisPurchase.getAddresses({ from: sellerAccount, gas: 3000000 });

      let _descLocationAreaRoomsReview = _thisPurchaseAddr[1].split("|");

      if (_addresses[0] == sellerAccount) {
        _purchases.push({
          ref: _strings[1],
          purchaseIndex: _item,
          indexHouse: _houseIndex,
          houseDesc: _descLocationAreaRoomsReview[0],
          date: _strings[1],
          sellerConfirmation: _strings[2],
          buyerConfirmation: _strings[3]
        });
      }
    });
  }
  console.log(_purchases);
  res.json(_purchases);
});


// app.post("/unsellHouseAt", (req, res) => {
//   console.log("unsellHouseAt");
//   res.json(
//     proxyContract.unsellHouseAt(req.body.houseIndex,{from: sellerAccount,gas: 3000000})
//   );
// });



app.post("/sellHouseAt", (req, res) => {
  console.log("sellHouseAt");
  let _d = new Date();
  let _timeStamp = _d.getTime();
  let _history = req.body.history;
  _history = sellerAccount+"/"+_timeStamp+"/Selling|"+_history;
  console.log(req.body.history)

  console.log(_history)
  res.json(
    proxyContract.sellHouseAt(req.body.indexHouse,_history,{from: sellerAccount,gas: 3000000})
  );
});

var server = app.listen(port, () => {
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)

  console.log("Express Listening at http://localhost:" + port);
  accounts = web3.eth.accounts;
  sellerAccount = accounts[4];
  console.log(sellerAccount);

  try {
        web3.personal.unlockAccount(sellerAccount, "seller");
    } catch(e) {
        console.log(e);
        return;
    }
    web3.sendTransaction({to:sellerAccount, from:accounts[0], value:web3.toWei("10", "ether")});
    console.log(web3.eth.getBalance(sellerAccount));

  console.log("Seller account: " + sellerAccount);
});



function deploySCProxy() {
  console.log("Contract Proxy deployment..." + proxyContractAddress);
  if (proxyContractAddress) {
    proxyContract = ProxySC;
    proxyContract = proxyContract.at(proxyContractAddress /* address */);
    console.log("Deployment Proxy done!");
    deploySCToken();
  } else {
    console.log("Waiting for a Proxy contract to be deployed");
  }
}



function deploySCToken() {
  console.log("Contract STToken deployment..." + tokenContractAddress);
  if (tokenContractAddress) {
    tokenContract = STTokenSC;
    tokenContract = tokenContract.at(tokenContractAddress /* address */);
    console.log("Deployment STToken done!");
  } else {
    console.log("Waiting for a STToken contract to be deployed");
  }
}
