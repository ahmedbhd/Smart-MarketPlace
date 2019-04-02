const path = require('path');
const fs = require('fs');
const solc = require ('solc');
const foodPath = path.resolve(__dirname , 'contracts','Food.sol');
const productPath = path.resolve(__dirname , 'contracts','Product.sol');
const source = fs.readFileSync (foodPath , 'UTF-8');

//module.exports = solc.compile (source , 1).contracts[':food'];

var input = {
    'Food.sol': fs.readFileSync(foodPath, 'utf8'),
    'Product.sol': fs.readFileSync(productPath, 'utf8')
};

//console.log(solc.compile ({sources: input},1).contracts['Food.sol:Food'])
module.exports = solc.compile ({sources: input},1).contracts['Food.sol:Food'];