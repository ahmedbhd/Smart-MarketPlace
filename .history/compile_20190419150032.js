const path = require('path');
const fs = require('fs');
const solc = require ('solc');
const proxyPath = path.resolve(__dirname , 'contracts','Proxy.sol');
const housePath = path.resolve(__dirname , 'contracts','House.sol');
//Token contract
const tokentPath = path.resolve(__dirname , 'contracts','STToken.sol');
const purchasePath = path.resolve(__dirname , 'contracts','Purchase.sol');

//const source = fs.readFileSync (foodPath , 'UTF-8');

/* var input = {
    'Food.sol': fs.readFileSync(foodPath, 'utf8'),
    'Product.sol': fs.readFileSync(productPath, 'utf8'),
    'test.sol': fs.readFileSync(testPath, 'utf8'),
    'STToken.sol': fs.readFileSync(tokentPath, 'utf8')
}; */

/* var input = {
    'Proxy.sol': fs.readFileSync(proxyPath, 'utf8'),
    'House.sol': fs.readFileSync(housePath, 'utf8'),
    'STToken.sol': fs.readFileSync(tokentPath, 'utf8'),
    'Purchase.sol': fs.readFileSync(purchasePath, 'utf8')
};
 */
const source = fs.readFileSync (housePath , 'UTF-8');

var c = solc.compile ({sources: source},1);
console.log(c)

/* module.exports = solc.compile ({sources: input},4).contracts; */