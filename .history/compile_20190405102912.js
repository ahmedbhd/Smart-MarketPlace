const path = require('path');
const fs = require('fs');
const solc = require ('solc');
const foodPath = path.resolve(__dirname , 'contracts','Food.sol');
const productPath = path.resolve(__dirname , 'contracts','Product.sol');
const testPath = path.resolve(__dirname , 'contracts','test.sol');

//Token contract
const tokentPath = path.resolve(__dirname , 'contracts','STToken.sol');

const source = fs.readFileSync (foodPath , 'UTF-8');

var input = {
    'Food.sol': fs.readFileSync(foodPath, 'utf8'),
    'Product.sol': fs.readFileSync(productPath, 'utf8'),
    'test.sol': fs.readFileSync(testPath, 'utf8'),
    'STToken.sol': fs.readFileSync(tokentPath, 'utf8')
};

var c = solc.compile ({sources: input},4).contracts;
console.log(c['test.sol:test'])
/* module.exports = solc.compile ({sources: input},1).contracts['STToken.sol:STToken']; */