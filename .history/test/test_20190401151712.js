const assert = require ('assert');
var Web3 = require('web3');
const {bytecode , interface} = require ('../compile');
require('events'). EventEmitter.prototype._maxListeners = 100;


//const provider = new Web3.providers.HttpProvider("http://localhost:8501");

 var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8510"));
 var ABI = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_activity",
				"type": "string"
			},
			{
				"name": "_username",
				"type": "string"
			},
			{
				"name": "_location",
				"type": "string"
			}
		],
		"name": "addFarmer",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_pType",
				"type": "string"
			},
			{
				"name": "_name",
				"type": "string"
			},
			{
				"name": "_harDate",
				"type": "uint256"
			},
			{
				"name": "_shipAddr",
				"type": "string"
			},
			{
				"name": "_quantity",
				"type": "uint256"
			},
			{
				"name": "_owner",
				"type": "uint256"
			}
		],
		"name": "addProduct",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_activity",
				"type": "string"
			},
			{
				"name": "_company",
				"type": "string"
			},
			{
				"name": "_location",
				"type": "string"
			},
			{
				"name": "_type",
				"type": "uint256"
			}
		],
		"name": "addSupplier",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_productId",
				"type": "uint256"
			},
			{
				"name": "_owner",
				"type": "uint256"
			},
			{
				"name": "_addrReceiver",
				"type": "uint256"
			},
			{
				"name": "_shipDate",
				"type": "uint256"
			},
			{
				"name": "_receiver",
				"type": "uint256"
			},
			{
				"name": "_addr",
				"type": "string"
			}
		],
		"name": "ship",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_productId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "_msg",
				"type": "string"
			}
		],
		"name": "Event",
		"type": "event"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_type",
				"type": "uint256"
			}
		],
		"name": "getCompaniesNbr",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_idF",
				"type": "uint256"
			},
			{
				"name": "_type",
				"type": "uint256"
			}
		],
		"name": "getCompanyById",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "string"
			},
			{
				"name": "",
				"type": "string"
			},
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_productId",
				"type": "uint256"
			}
		],
		"name": "getProductCurrentState",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "string"
			},
			{
				"name": "",
				"type": "string"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "string"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_productId",
				"type": "uint256"
			}
		],
		"name": "getProductHistory",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "string"
			},
			{
				"name": "",
				"type": "string"
			},
			{
				"name": "",
				"type": "string"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]
 const deploySC = async () => {
     let accounts = await web3.eth.getAccounts();
      console.log("heeeeey  "+accounts[0]);
      console.log("yooooo  "+(interface));
      const deployContract = await new web3.eth.Contract(ABI);

    //   deployContract   .deploy({data: bytecode, arguments: []})

    //         .send({ from: account, gas:5000000});
    let contractInstance = await deployContract.deploy({data: bytecode,})
    .send({
        from: accounts[0],
        gas: 5000000
    });

        console.log('deployment done');

        //This print contract address on successful deployment

        console.log('SC Address ' +contractInstance.options.address);      
 }
    // accounts = web3.eth.getAccounts();
    // food = new Web3.eth.Contract(JSON.parse(interface))
    //     .deploy({data: bytecode, arguments: ['hey food']})
    //     .send({from: accounts[0], gas: '30000000'});

    // food.setProvider(new Web3.providers.HttpProvider("http://localhost:8510"));
    // console.log(accounts);

    
    deploySC();

/*describe('hello2' , () => {
    it ('deploys an account', () => {
        assert.ok(food.options.address);
    });
})*/


