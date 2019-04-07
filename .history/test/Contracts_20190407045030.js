const web3 = require('./web3');
const compiledContracts = require ('../compile');

const STToken = web3.eth.contract(JSON.parse(compiledContracts['STToken.sol:STToken'].interface));
const Home = web3.eth.contract(JSON.parse(compiledContracts['Home.sol:Home'].interface));
const Proxy= web3.eth.contract(JSON.parse(compiledContracts['Proxy.sol:Proxy'].interface));
const ProxyBytecode = '0x'+compiledContracts['Proxy.sol:Proxy'].bytecode;
const STTokenBytecode = '0x'+compiledContracts['STToken.sol:STToken'].bytecode
module.exports = {
    STToken,
    Home,
    Proxy,
    STTokenBytecode,
    ProxyBytecode
}