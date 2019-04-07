const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const bodyParser = require('body-parser');

const assert = require ('assert');

const web3 = require('./web3');
const compiledContracts = require ('../compile');


var proxyContractAddress = null;
var proxyContract = null;
var accounts = null;
const home = web3.eth.contract(JSON.parse(compiledContracts['Home.sol:Home'].interface));
var clearingHouseAccount = null;
var wantedEvent = null;// this is the event ------------------
var confirmedEvent = null;


//var server = http.createServer(app);
var io = require("socket.io").listen(3000).sockets;

io.on("connection",function(socket){
    
});
var io = require('socket.io')();
io.on('connection', function(socket){
    socket.broadcast.emit("proxyAddress",proxyContractAddress);
});
io.listen(3000);


app.use(bodyParser.json());


app.use('/', express.static('public_static'));

app.get('/getAccounts', (req, res) => {

    res.send(accounts);

});


app.get('/getHomeAt', (req, res) => {
    let homeAddress = proxyContract.getHomeAt(req.body.homeIndex, {from: clearingHouseAccount,
        gas:3000000 });
    let thisHome = home.at(homeAddress);
    let homeJSON = {
        "Location" : thisHome.getLocation({from: clearingHouseAccount, gas:3000000 }),
        "Area": thisHome.getArea({from: clearingHouseAccount, gas:3000000 }),
        "price": thisHome.getPrice({from: clearingHouseAccount, gas:3000000 }),
        "State": thisHome.getState({from: clearingHouseAccount, gas:3000000 }),
        "Owner" : thisHome.getOwner({from: clearingHouseAccount, gas:3000000 })
    }
    res.json(homeJSON);

});

app.get('/getHomesNbr', (req, res) => {

    res.json(proxyContract.getHomesNbr({from: clearingHouseAccount, gas:3000000 }));

});


var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    deploySCProxy();
});


function deploySCProxy (){
    accounts = web3.eth.accounts
    clearingHouseAccount = accounts[0];
    console.log("Clearing house account: "+accounts[0]);
    console.log("Contract Proxy deployment...");
    MyContractDeployment = web3.eth.contract(JSON.parse(compiledContracts['Proxy.sol:Proxy'].interface));
    proxyContract = MyContractDeployment.new(clearingHouseAccount, {
        from:clearingHouseAccount,
        data:'0x'+compiledContracts['Proxy.sol:Proxy'].bytecode,
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


function initiateEvents(){
    //----------------------------- watching for events from contracts--------------------------
    wantedEvent.watch(function(error, result){
        if (!error)
        {
            console.log(result.args._from);
            console.log(result.args._homeIndex);
            proxyContract.setHomeAsPending(result.args._homeIndex, {from: clearingHouseAccount, gas:3000000 })
        } else {
            console.log(error);
        }
    });

    confirmedEvent.watch(function(error, result){
    if (!error)
    {
        console.log(result.args._from);
        console.log(result.args._homeIndex);
    } else {
        console.log(error);
    }
});
}
