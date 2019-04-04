const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const bodyParser = require('body-parser');

const assert = require ('assert');

const web3 = require('./web3');
const {bytecode , interface} = require ('../compile');
//require('events'). EventEmitter.prototype._maxListeners = 100;
const events = require('./events');

var myContractAddress = null;
var myContract = null;
var accounts = null;


async function deploySC (){
    accounts = web3.eth.accounts
    console.log("my account: "+accounts[0]);

    let MyContract = web3.eth.contract(JSON.parse(interface));
    myContractReturned = MyContract.new(200, {
        from:accounts[0],
        data:'0x'+bytecode,
        gas:500000}, function(err, myContract){
        if(!err) {
            // NOTE: The callback will fire twice!
            // Once the contract has the transactionHash property set and once its deployed on an address.
            // e.g. check tx hash on the first call (transaction send)
            if(!myContract.address) {
                console.log(myContract.transactionHash) // The hash of the transaction, which deploys the contract
            
            // check address on the second call (contract deployed)
            } else {
                console.log(myContract.address) // the contract address
            }
            // Note that the returned "myContractReturned" === "myContract",
            // so the returned "myContractReturned" object will also get the address set.
        }
    });

    //This print contract address on successful deployment
    return {
        address: contractInstance.options.address
    };
}





app.use(bodyParser.json());


app.use('/', express.static('public_static'));

app.get('/getAccounts', (req, res) => {

    res.send(accounts);

});

app.post('/addFarmer', (req, res) => {
    /* myContract.methods.addFarmer(req.body.activity, req.body.username, req.body.location).send( */
        myContract.methods.setValue(req.body.number).send(
        {from:accounts[0]})
       .then(response =>{
            res.send(response);
        })
       .catch(err => console.error(err));

});
/* contract=0x27a2311D83061C7B51666CcaE9aC9914ec74a84d */
app.get('/farmer', (req, res) => {
    /* myContract.methods.getCompanyById(1,0).call( */
        myContract.methods.getValue().call(
        {from:accounts[0]})
       .then(response =>{
            res.send({result: web3.utils.hexToNumber(response)});
        })
       .catch(err => console.error(err));

});


var server = app.listen(port, () => {

    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  
    console.log("Express Listening at http://localhost:" + port);
    deploySC()
        .then(result => {
            myContractAddress = result.address;
            console.log('SC Address ' +result.address);
            myContract = new web3.eth.Contract(JSON.parse(interface), /* myContractAddress */ "0x27a2311D83061C7B51666CcaE9aC9914ec74a84d");
            //events.subscribeLogEvent(myContract , "Event");
        })
        .catch(err => console.error(err));
        //myContract = new web3.eth.Contract(JSON.parse(interface), /* myContractAddress */ "0x27a2311D83061C7B51666CcaE9aC9914ec74a84d");   
        
});