pragma solidity >=0.4.22 <= 0.5.7;
import "./House.sol";
contract Purchase {
    
    address private _owner;
    address private _buyer;
    address private _bank;
    address private _insurance;
    uint256 private _houseIndex;
    string private _loan="0";
    string private _date;
    string private _advance;
    string private _amountPerMonthForBank;
    string private _amountPerMonthForInsurance;
   
    function setArguments(address owner, address buyer, address bank, address insurance, uint256 house, string memory loan,string memory date,string memory forBank,string memory forInsurance) public {
        _owner = owner;
        _buyer = buyer;
        _bank =bank;
        _insurance =insurance;
        _houseIndex = house;
        _loan = loan;
        _date = date;
        _amountPerMonthForBank = forBank;
        _amountPerMonthForInsurance = forInsurance;
    }
    
    function getOwner() view public returns(address){
        return _owner;
    }
    function getBuyer() view public returns(address){
        return _buyer;
    }
    function getBank() view public returns(address){
        return _bank;
    }
    function getInsurance() view public returns(address){
        return _insurance;
    }
    function getLoan() view public returns(string memory){
        return _loan;
    }
    function getDate() view public returns(string memory){
        return _date;
    }
    function getAdvance() view public returns(string memory){
        return _advance;
    }
    function getHouseIndex() view public returns(uint256){
        return _houseIndex;
    }
    function getAmountForBank() view public returns(string memory){
        return _amountPerMonthForBank;
    }
    function getAmountForInsurance() view public returns(string memory){
        return _amountPerMonthForInsurance;
    } 
}