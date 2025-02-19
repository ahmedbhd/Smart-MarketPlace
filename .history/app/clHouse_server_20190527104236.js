const express = require("express");
const app = express();
const port = 3000 || process.env.PORT;
const bodyParser = require("body-parser");
const cors = require("cors");

const assert = require("assert");

const web3 = require("./cl_web3");
const {
  HouseSC,
  STTokenSC,
  ProxySC,
  PurchaseSC,
  STTokenBytecode,
  ProxyBytecode
} = require("./Contracts");

var proxyContractAddress = null;
var proxyContract = null;

var tokenContractAddress = null;
var tokenContract = null;

var bankAccount = null;
var insuranceAccount = null;
var accounts = null;
const house = HouseSC;
var purchase = PurchaseSC;
var clearingHouseAccount = null;
var wantedEvent = null; // this is the event ------------------
var confirmedEvent = null;

//var server = http.createServer(app);
var io = require("socket.io")();
io.on("connection", function(socket) {
  console.log("socket to be emitted1 : " + proxyContractAddress);
  console.log("socket to be emitted2 : " + tokenContractAddress);
  socket.emit("proxyAddress", { proxyContractAddress, tokenContractAddress });
  //socket.emit("tokenAddress",tokenContract);
});
io.listen(8088);

app.use(bodyParser.json());

app.use("/", express.static("public_static"));
app.use(cors());



app.get("/getAccounts", (req, res) => {
  res.json(accounts);
});
app.post("/chargeAcc", (req, res) => {
  console.log("acc: " + req.body.receiver + " amount: " + req.body.amount);
  res.json(
    tokenContract.transferFrom(
      clearingHouseAccount,
      req.body.receiver,
      req.body.amount,
      { from: clearingHouseAccount, gas: 3000000 }
    )
  );
});
app.post("/exchange", (req, res) => {
  console.log("exchange");
  res.json(
    tokenContract.transferFrom(
      req.body.sender,
      clearingHouseAccount,
      req.body.amount,
      { from: clearingHouseAccount, gas: 3000000 }
    )
  );
});
app.post("/getBalanceOf", (req, res) => {
  console.log("acc: " + req.body.account);
  res.json(
    tokenContract.balanceOf(req.body.account, {
      from: clearingHouseAccount,
      gas: 3000000
    })
  );
});





app.get("/getHouseAt", (req, res) => {
  let thisHouse = proxyContract.getHouseAt(req.body.houseIndex, {
    from: buyerAccount,
    gas: 3000000
  });

  let houseJSON = {
    location: thisHouse[0],
    area: thisHouse[1],
    price: thisHouse[2],
    state: thisHouse[3],
    image: thisHouse[4],
    owner: thisHouse[5]
  };
  res.json(houseJSON);
});

app.get("/getHousesNbr", (req, res) => {
  res.json(
    proxyContract.getHousesNbr({ from: clearingHouseAccount, gas: 3000000 })
  );
});

app.get("/getPurchases", (req, res) => {
  let purchases = [];
  let purchasesNbr = proxyContract.getMyPurchasesNbr({
    from: clearingHouseAccount,
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
        from: clearingHouseAccount,
        gas: 3000000
      });
      purchase = purchase.at(thisPurchaseAddr /* address */);
      purchases.push({
        indexPurchase: item,
        owner: purchase.getOwner({ from: clearingHouseAccount, gas: 3000000 }),
        buyer: purchase.getBuyer({ from: clearingHouseAccount, gas: 3000000 }),
        bank: purchase.getBank({ from: clearingHouseAccount, gas: 3000000 }),
        insurance: purchase.getInsurance({
          from: clearingHouseAccount,
          gas: 3000000
        }),
        houseIndex: purchase.getHouseIndex({
          from: clearingHouseAccount,
          gas: 3000000
        }),
        loan: purchase.getLoan({ from: clearingHouseAccount, gas: 3000000 }),
        date: purchase.getDate({ from: clearingHouseAccount, gas: 3000000 }),
        advance: purchase.getAdvance({
          from: clearingHouseAccount,
          gas: 3000000
        }),
        amountPerMonthForBank: purchase.getAmountForBank({
          from: clearingHouseAccount,
          gas: 3000000
        }),
        amountPerMonthForInsurance: purchase.getAmountForInsurance({
          from: clearingHouseAccount,
          gas: 3000000
        }),
        sellerConfirmation: purchase.getSellerConfirmation({
          from: clearingHouseAccount,
          gas: 3000000
        }),
        buyerConfirmation: purchase.getBuyerConfirmation({
          from: clearingHouseAccount,
          gas: 3000000
        })
      });
    });
  }
  res.json(purchases);
});



var server = app.listen(port, () => {
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)

  console.log("Express Listening at http://localhost:" + port);
  accounts = web3.eth.accounts;
  clearingHouseAccount = accounts[0];
  bankAccount = accounts[1];
  insuranceAccount = accounts[2];
  console.log("Clearing house account: " + clearingHouseAccount);
  console.log("bank account: " + bankAccount);
  console.log("insurance account: " + insuranceAccount);
  deploySCProxy();
  deploySCToken();
});



function deploySCProxy() {
  console.log("Contract Proxy deployment...");
  MyContractDeployment = ProxySC;
  proxyContract = MyContractDeployment.new(clearingHouseAccount,{from: clearingHouseAccount,data: ProxyBytecode,gas: 3000000},function(err, MyContractDeployment) {
      if (!err) {
        // NOTE: The callback will fire twice!
        // Once the contract has the transactionHash property set and once its deployed on an address.
        // e.g. check tx hash on the first call (transaction send)
        if (!MyContractDeployment.address) {
          console.log(
            "The hash of the transaction : " +
              MyContractDeployment.transactionHash
          ); // The hash of the transaction, which deploys the contract

          // check address on the second call (contract deployed)
        } else {
          proxyContractAddress = MyContractDeployment.address;
          console.log("Proxy contract address : " + proxyContractAddress); // the contract address
          console.log("Deployment Proxy done!");

          console.log("Setting up Events");
          wantedEvent = proxyContract.Wanted();
          confirmedEvent = proxyContract.Confirmed();
          initiateEvents();
          console.log("Events are well set!");
        }
        // Note that the returned "myContractReturned" === "myContract",
        // so the returned "myContractReturned" object will also get the address set.
      } else {
        console.log("deploy Proxy error :" + err);
      }
    }
  );
}



function deploySCToken() {
  console.log("Contract Token deployment...");
  let MyContractDeployment = STTokenSC;
  tokenContract = MyContractDeployment.new(bankAccount,{from: clearingHouseAccount,data: STTokenBytecode,gas: 3000000 },function(err, MyContractDeployment) {
      if (!err) {
        if (!MyContractDeployment.address) {
          console.log(
            "The hash of the transaction : " +
              MyContractDeployment.transactionHash
          ); // The hash of the transaction, which deploys the contract

          // check address on the second call (contract deployed)
        } else {
          tokenContractAddress = MyContractDeployment.address;
          console.log("STToken contract address : " + tokenContractAddress); // the contract address
          console.log("Deployment STToken done!");
        }
      } else {
        console.log("deploy STToken error :" + err);
      }
    }
  );

  /*  sendseller = web3.eth.sendTransaction({from:clearingHouseAccount,to:accounts[1], value:web3.toWei("3", "ether")});
    sendbuyer = web3.eth.sendTransaction({from:clearingHouseAccount,to:accounts[2], value:web3.toWei("3", "ether")}); */
}



function initiateEvents() {
  //----------------------------- watching for events from contracts--------------------------
  wantedEvent.watch(function(error, result) {
    if (!error) {
      console.log(result.args._houseIndex);
      let houseIndex = result.args._houseIndex;
      let owner = result.args._owner;
      let buyer = result.args._buyer;
      let price = parseInt(result.args._price);
      let currentBuyerBalance = tokenContract.balanceOf(buyer,{from: clearingHouseAccount,gas: 3000000});
      let buyerBalance = parseInt(currentBuyerBalance);
      if (buyerBalance >= price) {
        console.log("Buyer has enough balance!");
        upFrontPurchase(houseIndex, buyer);
      } else {
        console.log("Buyer has enough balance!");
        purchaseWithLoan(houseIndex, buyer, price);
      }
    } else {
      console.log(error);
    }
  });



  confirmedEvent.watch(function(error, result) {
    if (!error) {
      console.log("house _price :" + result.args._price);
      let _owner = result.args._owner;
      let _buyer = result.args._buyer;
      let _price = parseInt(result.args._price);
      let _houseIndex = result.args._houseIndex;
      let _history =result.args._history;
      let _purchaseIndex = result.args._purchaseIndex;
      let _payments = result.args._loanAdvanceMonthlyBankMonthlyInsurance;
      let _paymentsTab = _payments.split("|");
      let _purchaseLoan = parseFloat(_paymentsTab[0]);
      //check the type of the purchase
      if (_purchaseLoan == 0) {
        console.log("purchase up front");
        confirmUpFrontPurchase(_owner, _buyer, _price, _houseIndex, _purchaseIndex,_history);
      } else {
        console.log("purchase with loan " + _price);
        confirmPurchaseWithLoan(_owner, _buyer, _price, _houseIndex, _purchaseIndex,_history);
      }
    } else {
      console.log(error);
    }
  });
}



function upFrontPurchase(houseIndex, buyer) {
  let _d = new Date();
  let _timeStamp = _d.getTime();
  console.log("timeStamp :" + _timeStamp);
  console.log("date :" + new Date(_timeStamp));
  let _loanAdvanceMonthlyBankMonthlyInsurance="0"
  proxyContract.addInProgressPurchase(0,houseIndex,buyer,0,0,_loanAdvanceMonthlyBankMonthlyInsurance,_timeStamp,
   { from: clearingHouseAccount, gas: 3000000 }
  );
}



function purchaseWithLoan(houseIndex, buyer, price) {
  let _d = new Date();
  let _timeStamp = _d.getTime();

  let _loan = price * 1.5;
  let _insurance = (_loan / 100) * 0.5;
  let _bank = _loan - _insurance;
  let _advance = Math.round(_bank / 10);
  let _forBank = Math.round((_bank - _advance) / 72);
  let _forInsurance = Math.round(_insurance / 72);

  if (_forBank == 0) _forBank = 1;
  if (_forInsurance == 0) _forInsurance = 1;

  _loan = _forInsurance * 72 + _forBank * 72 + _advance;
  console.log(
    "purchase :" + _loan + " " + _advance + " " + _forBank + " " + _forInsurance
  );
  let _loanAdvanceMonthlyBankMonthlyInsurance = _loan + "|" + _advance + "|" + _forBank + "|" + _forInsurance
  proxyContract.addPendingPurchase(houseIndex,buyer,bankAccount,insuranceAccount,_loanAdvanceMonthlyBankMonthlyInsurance,_timeStamp,
    {from: clearingHouseAccount, gas: 3000000}
  );
}



function confirmUpFrontPurchase(owner,buyer,price,houseIndex,purchaseIndex,history) {
  let _currentBuyerBalance = tokenContract.balanceOf(buyer,{from: clearingHouseAccount,gas: 3000000});
  let _buyerBalance = parseInt(_currentBuyerBalance);
  if (_buyerBalance >= price) {
    let _d = new Date();
    let _timeStamp = _d.getTime();
    history = buyer+"/"+_timeStamp+"/Buying|"+history;
    proxyContract.transferHouseFrom(houseIndex,owner,buyer,history,{ from: clearingHouseAccount, gas: 3000000 },function(error, result) {
        if (!error) {
          tokenContract.transferFrom(buyer,owner,price,{ from: clearingHouseAccount, gas: 3000000 },function(error, result) {
              if (error) {
                history = history+buyer+"/"+_timeStamp+"/Reverting|";
                proxyContract.revertPurchaseOf(purchaseIndex,houseIndex,history,{ from: buyer, gas: 3000000 },function(error, result) {
                    if (!error) {
                      console.log("purchase revert done ");
                    } else {
                      console.log("purchase revert error " + error);
                    }
                  }
                );
              } else {
                console.log("transfer success");
              }
            }
          );
          console.log("transfer success");
        } else {
          console.log("transfer error " + error);
        }
      }
    );
  } else {
    console.log("Not enough balance for purchase!");
  }
}



function confirmPurchaseWithLoan(owner,buyer,price,houseIndex,purchaseIndex,history) {
  let _currentBuyerBalance = tokenContract.balanceOf(buyer, {from: clearingHouseAccount,gas: 3000000});
  let _buyerBalance = parseInt(_currentBuyerBalance);
  let _thisPurchaseAddr = proxyContract.getPurchaseAt(purchaseIndex,{from: clearingHouseAccount,gas: 3000000});
  let _thisPurchase = purchase;
  _thisPurchase = _thisPurchase.at(_thisPurchaseAddr[0] /* address */);
  let _loanAdvanceMonthlyBankMonthlyInsurance = _thisPurchase.getLoanAdvanceMonthlyBankMonthlyInsurance({from: clearingHouseAccount,gas: 3000000});
  let _infosTab = _loanAdvanceMonthlyBankMonthlyInsurance.split("|");
  let _advance = parseFloat(_infosTab[1]);
  console.log("advance :" + _advance);
  if (_buyerBalance >= _advance) {
    let _d = new Date();
    let _timeStamp = _d.getTime();
    history = buyer+"/"+_timeStamp+"/Buying|"+history;
    proxyContract.transferHouseFrom(houseIndex,owner,buyer,history,{from:clearingHouseAccount, gas:3000000},function(error, result) {
        if (!error) {
          tokenContract.transferFrom(buyer,bankAccount,_advance,{from: clearingHouseAccount, gas: 3000000},function(error, result) {
              if (error) {
                history = history+buyer+"/"+_timeStamp+"/Reverting|";
                proxyContract.revertPurchaseOf(purchaseIndex,houseIndex,history,{from:buyer, gas:3000000},function(error, result) {
                    if (!error) {
                      console.log("purchase revert done ");
                    } else {
                      console.log("purchase revert error " + error);
                    }
                  }
                );
              } else {
                console.log("transfer success");
                tokenContract.transferFrom(bankAccount, owner, price, {from:clearingHouseAccount, gas:3000000});
              }
            }
          );
          console.log("transfer success");
        } else {
          console.log("transfer error " + error);
        }
      }
    );
  } else {
    console.log("Not enough balance to pay the advance to the bank!");
    proxyContract.setPurchaseAsCanceled(houseIndex, purchaseIndex,history,{from: clearingHouseAccount,gas: 3000000});
  }
}
