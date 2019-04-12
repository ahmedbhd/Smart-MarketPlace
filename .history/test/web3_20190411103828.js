const Web3 = require('web3')

const cl_web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8560"));
const buyer_web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8520"));
const seller_web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8530"));

module.exports = {
    cl_web3 ,
    buyer_web3 ,
    seller_web3
}