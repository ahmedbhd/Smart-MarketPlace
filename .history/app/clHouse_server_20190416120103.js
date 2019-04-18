const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const bodyParser = require('body-parser');
const cors = require('cors');

const assert = require ('assert');

const web3 = require('./cl_web3');
const {HouseSC,STTokenSC,ProxySC,STTokenBytecode,ProxyBytecode} = require ('./Contracts');


var proxyContractAddress = null;
var proxyContract = null;

var tokenContractAddress = null;
var tokenContract = null;

var accounts = null;
const house = HouseSC;
var clearingHouseAccount = null;
var wantedEvent = null;// this is the event ------------------
var confirmedEvent = null;


//var server = http.createServer(app);
var io = require('socket.io')();
io.on('connection', function(socket){
    console.log("socket to be emitted1 : "+proxyContractAddress);
    console.log("socket to be emitted2 : "+tokenContractAddress);
    socket.emit("proxyAddress",{proxyContractAddress,tokenContractAddress});
    //socket.emit("tokenAddress",tokenContract);
});
io.listen(8088);


app.use(bodyParser.json());


app.use('/', express.static('public_static'));
app.use(cors());

app.get('/getAccounts', (req, res) => {
    res.json(accounts);
});

app.post('/chargeAcc', (req, res) => {
    console.log("acc: "+req.body.receiver+" amount: "+req.body.amount)
    res.json(tokenContract.transfer(req.body.receiver,req.body.amount,{from: clearingHouseAccount, gas:3000000 }));
});

app.get('/getHouseAt', (req, res) => {
    let thisHouse = proxyContract.getHouseAt(req.body.houseIndex, {from: buyerAccount,
        gas:3000000 });
   
    let houseJSON = {
        "location" : thisHouse[0],
        "area": thisHouse[1],
        "price": thisHouse[2],
        "state": thisHouse[3],
        "image" : thisHouse[4],
        "owner" : thisHouse[5]
    }
    res.json(houseJSON);

});

app.get('/getHousesNbr', (req, res) => {

    res.json(proxyContract.getHousesNbr({from: clearingHouseAccount, gas:3000000 }));

});


var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    accounts = web3.eth.accounts
    clearingHouseAccount = accounts[0];
    console.log("Clearing house account: "+accounts[0]);
    deploySCProxy();
    deploySCToken();
});


function deploySCProxy (){
    
    console.log("Contract Proxy deployment...");
    MyContractDeployment = ProxySC;
    proxyContract = MyContractDeployment.new(clearingHouseAccount, {
        from:clearingHouseAccount,
        data: ProxyBytecode,
        gas:5000000}, function(err, MyContractDeployment){
        if(!err) {
            // NOTE: The callback will fire twice!
            // Once the contract has the transactionHash property set and once its deployed on an address.
            // e.g. check tx hash on the first call (transaction send)
            if(!MyContractDeployment.address) {
                console.log("The hash of the transaction : "+MyContractDeployment.transactionHash) // The hash of the transaction, which deploys the contract
            
            // check address on the second call (contract deployed)
            } else {
                proxyContractAddress = MyContractDeployment.address;
                console.log("Proxy contract address : "+proxyContractAddress) // the contract address
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
            console.log("deploy Proxy error :"+err)
        }
    });
}


function deploySCToken (){
    
    console.log("Contract Token deployment...");
    let MyContractDeployment = STTokenSC;
    tokenContract = MyContractDeployment.new(clearingHouseAccount, {
        from:clearingHouseAccount,
        data: STTokenBytecode,
        gas:5000000}, function(err, MyContractDeployment){
        if(!err) {
            if(!MyContractDeployment.address) {
                console.log("The hash of the transaction : "+MyContractDeployment.transactionHash) // The hash of the transaction, which deploys the contract
            
            // check address on the second call (contract deployed)
            } else {
                tokenContractAddress = MyContractDeployment.address;
                console.log("STToken contract address : "+tokenContractAddress) // the contract address
                console.log("Deployment STToken done!");
            }
        } else {
            console.log("deploy STToken error :"+err)
        }
    });

   /*  sendseller = web3.eth.sendTransaction({from:clearingHouseAccount,to:accounts[1], value:web3.toWei("3", "ether")});
    sendbuyer = web3.eth.sendTransaction({from:clearingHouseAccount,to:accounts[2], value:web3.toWei("3", "ether")}); */

}

function initiateEvents(){
    //----------------------------- watching for events from contracts--------------------------
    wantedEvent.watch(function(error, result){
        if (!error)
        {
            console.log(result.args._from);
            console.log(result.args._houseIndex);
            proxyContract.setHouseAsPending(result.args._houseIndex,result.args._from, {from: clearingHouseAccount, gas:3000000 })
        } else {
            console.log(error);
        }
    });

    confirmedEvent.watch(function(error, result){
    if (!error)
    {
        console.log("house index :"+result.args._houseIndex);
        let houseToBeSold = proxyContract.getHouseAt(result.args._houseIndex,{from:clearingHouseAccount,
            gas:3000000 });
        console.log("house  :"+houseToBeSold);
        let owner = houseToBeSold[3];
        let buyer = houseToBeSold[5];
        let price = parseInt(houseToBeSold[2]);
        //recheck buyer balance for double spending 
        let currentBuyerBalance = tokenContract.balanceOf(buyer,{from: clearingHouseAccount, gas:3000000 });
        let buyerBalance = parseInt(currentBuyerBalance);
        if (buyerBalance >= price){
            console.log("purchase accepted")
            proxyContract.transferHouseFrom(owner,buyer,result.args._houseIndex,
                {from:clearingHouseAccount,gas:3000000 }, function (error, result) {
                    if (!error){
                        tokenContract.transfer(owner,price,{from:buyer,gas:3000000 });
                        console.log("transfer success");
                    }else {
                        console.log("transfer error "+error);
                    }
                }); 
           
        }else{
            console.log("purchase refused "+buyerBalance+" "+price)
            proxyContract.revertPurchaseOf(result.args._houseIndex,{from:buyer,gas:3000000 }, function (error, result) {
                if (!error){
                    console.log("purchase revert done ");
                }else {
                    console.log("purchase revert error "+error);
                }
               }); 
            }
    } else {
        console.log(error);
    }
});
}
