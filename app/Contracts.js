const web3 = require('./cl_web3');
const compiledContracts = require ('../compile');

const STTokenSC = web3.eth.contract(JSON.parse(compiledContracts['STToken.sol:STToken'].interface));
const HomeSC = web3.eth.contract(JSON.parse(compiledContracts['Home.sol:Home'].interface));
const ProxySC = web3.eth.contract(JSON.parse(compiledContracts['Proxy.sol:Proxy'].interface));
const ProxyBytecode = '0x'+compiledContracts['Proxy.sol:Proxy'].bytecode;
const STTokenBytecode = '0x'+compiledContracts['STToken.sol:STToken'].bytecode
module.exports = {
    STTokenSC,
    HomeSC,
    ProxySC,
    STTokenBytecode,
    ProxyBytecode
}