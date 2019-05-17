const express = require("express");
const app = express();
const port = 3002 || process.env.PORT;
const bodyParser = require("body-parser");
const cors = require("cors");

const assert = require("assert");

const web3 = require("./buyer_web3");
const { HouseSC, STTokenSC, ProxySC, PurchaseSC } = require("./Contracts");

var proxyContract = null;
var proxyContractAddress = null;
var buyerAccount = null;
var accounts = null;
var tokenContract = null;
var tokenContractAddress = null;

var purchase = PurchaseSC;

// Socket to sync the proxy contract with the clearing house
const io = require("socket.io-client"),
  ioClient = io.connect("http://localhost:8088");
ioClient.on("proxyAddress", function(data) {
  console.log("Proxy address: " + data["proxyContractAddress"]);
  proxyContractAddress = data["proxyContractAddress"];
  tokenContractAddress = data["tokenContractAddress"];
  deploySCProxy();
});

app.use(bodyParser.json());

app.use("/", express.static("public_static"));
app.use(cors());

app.get("/getMyAccount", (req, res) => {
  res.json(buyerAccount);
});

app.get("/getMyBalance", (req, res) => {
  /* const tx = {
        // this could be provider.addresses[0] if it exists
        from: buyerAccount, 
        // target address, this could be a smart contract address
        to: tokenContractAddress, 
        // optional if you want to specify the gas limit 
        gas: 3000000, 
        // optional if you are invoking say a payable function 
        value: buyerAccount,
        // this encodes the ABI of the method and the arguements
        data: tokenContract.balanceOf(buyerAccount).encodeABI() 
      };
      const signPromise = web3.eth.signTransaction(tx, tx.from);

      signPromise.then((signedTx) => {
        // raw transaction string may be available in .raw or 
        // .rawTransaction depending on which signTransaction
        // function was called
        const sentTx = web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
        sentTx.on("receipt", receipt => {
          // do something when receipt comes back
          res.json(receipt);
        });
        sentTx.on("error", err => {
          // do something on transaction error
        });
      }).catch((err) => {
        // do something when promise fails
      }); */
  res.json(
    tokenContract.balanceOf(buyerAccount, { from: buyerAccount, gas: 3000000 })
  );
});

app.post("/getHouseAt", (req, res) => {
  console.log("getHouseAt");
  let _thisHouse = proxyContract.getHouseAt(req.body.houseIndex, {
    from: sellerAccount,
    gas: 3000000
  });
  let _descLocationAreaRooms = _thisHouse[0];
  let _history=_thisHouse[1];
  let _price =_thisHouse[2];
  let _state = _thisHouse[3];
  let _owner = _thisHouse[4];
  let _buyer =_thisHouse[5];

  let _tab = _descLocationAreaRooms.split("|");
  let _desc = _tab[0]
  let _loc = _tab[1]
  let _area = _tab[2]
  let _rooms = _tab[3]
  _rooms = parseInt(_rooms);

  let _houseJSON = {
    description: _desc,
    location: _loc,
    area: _area,
    rooms: _rooms,
    history: _history,
    price: _price,
    state: _state,
    image: "h_" + req.body.houseIndex + ".jpg",
    owner: _owner,
    buyer: _buyer
  };
  console.log(_houseJSON);
  res.json(_houseJSON);
});

app.get("/getHouses", (req, res) => {
  console.log("getHouses");
  let _houseJSON = [];
  let _housesNbr = proxyContract.getHousesNbr({from: buyerAccount,gas: 3000000});
  console.log("housesNbr :" + _housesNbr);
  for (var _i = 1; _i <= _housesNbr; _i++) {
    let _thisHouse = proxyContract.getHouseAt(_i,{from:buyerAccount,gas: 3000000});
    let _descLocationAreaRooms = _thisHouse[0];
    let _history=_thisHouse[1];
    let _price =_thisHouse[2];
    let _state = _thisHouse[3];
    let _owner = _thisHouse[4];
    let _buyer =_thisHouse[5];

    let _tab = _descLocationAreaRooms.split("|");
    let _desc = _tab[0]
    let _loc = _tab[1]
    let _area = _tab[2]
    let _rooms = _tab[3]
    _rooms = parseInt(_rooms);
    _houseJSON.push({
      description: _desc,
      location: _loc,
      area: _area,
      rooms: _rooms,
      history: _history,
      price: _price,
      state: _state,
      image: "h_" + req.body.houseIndex + ".jpg",
      owner: _owner,
      buyer: _buyer
    });
    
  }
  res.json(_houseJSON);
});

app.post("/setWanted", (req, res) => {
  console.log("index :" + req.body.houseIndex);
  let _d = new Date();
  let _timeStamp = _d.getTime();
  let _history = req.body.history+"|"+buyerAccount+"/"+_timeStamp+"/Wanted"
  proxyContract.setHouseAsWanted(req.body.houseIndex,_history,{ from: buyerAccount, gas: 3000000 },function(error, result) {
      if (!error) {
        res.json(result);
      } else {
        console.log("wanted " + error);
        res.status(400).send({
          message: error
        });
      }
    }
  );
});

app.post("/getMyPendingPurchaseAt", (req, res) => {
  console.log("getMyPendingPurchaseAt");
  let purchases = null;
  let item = req.body.purchaseIndex;
  console.log(item);

  let thisPurchaseAddr = proxyContract.getPurchaseAt(item, {
    from: buyerAccount,
    gas: 3000000
  });
  console.log(thisPurchaseAddr);
  let thisPurchase = purchase.at(thisPurchaseAddr[0] /* address */);
  let addresses = thisPurchase.getAddresses({
    from: buyerAccount,
    gas: 3000000
  });
  let strings = thisPurchase.getStrings({ from: buyerAccount, gas: 3000000 });
  let houseIndex = thisPurchase.getHouseIndex({
    from: buyerAccount,
    gas: 3000000
  });
  let loan = thisPurchase.getLoan({ from: buyerAccount, gas: 3000000 });

  let buyer = thisPurchase.getBuyer({ from: buyerAccount, gas: 3000000 });
  let advance = thisPurchase.getAdvance({ from: buyerAccount, gas: 3000000 });
  let desc = thisPurchaseAddr[1].split("|");

  if (buyer == buyerAccount) {
    purchases = {
      ref: strings[0],
      purchaseIndex: item,
      owner: addresses[0],
      buyer: buyer,
      bank: addresses[1],
      insurance: addresses[2],
      houseIndex: houseIndex,
      houseDesc: desc[0],
      loan: loan,
      date: strings[3],
      advance: advance,
      amountPerMonthForBank: strings[1],
      amountPerMonthForInsurance: strings[2],
      sellerConfirmation: strings[4],
      buyerConfirmation: strings[5]
    };
  }
  console.log(purchases);
  res.json(purchases);
});

app.get("/getPurchasesNbr", (req, res) => {
  console.log("getPurchasesNbr");

  let purchases = [];
  let purchasesNbr = proxyContract.getPurchasesNbr({
    from: buyerAccount,
    gas: 3000000
  });
  console.log("purchasesNbr :" + purchasesNbr);
  if (purchasesNbr != "") {
    purchasesNbr = purchasesNbr.slice(0, purchasesNbr.length - 1);
    console.log("purchasesNbr :" + purchasesNbr);

    let tab = purchasesNbr.split(";");
    tab.forEach(function(item) {
      console.log("purchaseNbr :" + item);
      purchases.push(item);
    });
  }
  console.log(purchases);
  res.json(purchases);
});

app.get("/getMyPendingPurchaseList", (req, res) => {
  console.log("getMyPendingPurchaseList");

  let purchases = [];
  let purchasesNbr = proxyContract.getPurchasesNbr({
    from: buyerAccount,
    gas: 3000000
  });
  console.log("purchasesNbr :" + purchasesNbr);
  if (purchasesNbr != "") {
    purchasesNbr = purchasesNbr.slice(0, purchasesNbr.length - 1);
    console.log("purchasesNbr :" + purchasesNbr);

    let tab = purchasesNbr.split(";");
    tab.forEach(function(item) {
      console.log("purchaseNbr :" + item);

      let thisPurchaseAddr = proxyContract.getPurchaseAt(item, {
        from: buyerAccount,
        gas: 3000000
      });
      let localPurchase = purchase;
      localPurchase = localPurchase.at(thisPurchaseAddr[0] /* address */);
      let buyer = localPurchase.getBuyer({ from: buyerAccount, gas: 3000000 });
      let strings = localPurchase.getStrings({
        from: buyerAccount,
        gas: 3000000
      });
      let desc = thisPurchaseAddr[1].split("|");

      if (buyer == buyerAccount) {
        purchases.push({
          ref: strings[0],
          purchaseIndex: item,
          houseDesc: desc[0],
          date: strings[3],
          amountPerMonthForBank: strings[1],
          amountPerMonthForInsurance: strings[2],
          sellerConfirmation: strings[4],
          buyerConfirmation: strings[5]
        });
      }
    });
  }
  console.log(purchases);
  res.json(purchases);
});

app.post("/setPurchaseAsInProgress", (req, res) => {
  console.log("setPurchaseAsInProgress " + req.body.purchaseIndex);
  proxyContract.setPurchaseAsInProgress(
    req.body.purchaseIndex,
    req.body.houseIndex,
    { from: buyerAccount, gas: 3000000 },
    function(error, result) {
      if (!error) {
        res.json(result);
      } else {
        console.log("confirmed " + error);
        res.status(400).send({
          message: error
        });
      }
    }
  );
});
app.post("/setCanceled", (req, res) => {
  console.log("setCanceled");
  let _d = new Date();
  let _timeStamp = _d.getTime();
  let _history = req.body.history;
  _history = _history+"|"+buyerAccount+"/"+_timeStamp+"/Canceled";
  res.json(
    proxyContract.setPurchaseAsCanceled(req.body.houseIndex,req.body.purchaseIndex,_history,{from: buyerAccount, gas: 3000000})
  );
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
  console.log("Buyer account: " + buyerAccount);
});

function deploySCProxy() {
  console.log("Contract Proxy deployment...");
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
  console.log("Contract STToken deployment...");
  if (tokenContractAddress) {
    tokenContract = STTokenSC;
    tokenContract = tokenContract.at(tokenContractAddress /* address */);
    console.log("Deployment STToken done!");
  } else {
    console.log("Waiting for a STToken contract to be deployed");
  }
}
