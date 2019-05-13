pragma solidity >=0.4.22 <= 0.5.7;
import "./House.sol";
contract Purchase {
    
    address private _owner;
    address private _buyer;
    address private _bank;
    address private _insurance;
    uint256 private _houseIndex;
    string private _loan="0";
    uint256 private _date;
    string private _advance="0";
    string private _amountPerMonthForBank="0";
    string private _amountPerMonthForInsurance="0";
    bool private _sellerConfirmation = false;
    bool private _buyerConfirmation = false;
    function setArguments(address owner, address buyer, address bank, address insurance, uint256 house, string memory loan,uint256 date,string memory forBank,string memory forInsurance,string memory advance)public{
        _owner=owner;
        _buyer=buyer;
        _bank=bank;
        _insurance=insurance;
        _houseIndex=house;
        _loan=loan;
        _date=date;
        _amountPerMonthForBank=forBank;
        _amountPerMonthForInsurance=forInsurance;
        _advance=advance;
    }
    
    function getOwner() public view returns(address){
        return _owner;
    }
    function getBuyer() public view returns(address){
        return _buyer;
    }
    function getBank() public view returns(address){
        return _bank;
    }
    function getInsurance() public view returns(address){
        return _insurance;
    }
    function getLoan() public view returns(string memory){
        return _loan;
    }
    function getDate() public view returns(uint256){
        return _date;
    }
    function getAdvance() public view returns(string memory){
        return _advance;
    }
    function getHouseIndex() public view returns(uint256){
        return _houseIndex;
    }
    function getAmountForBank() public view returns(string memory){
        return _amountPerMonthForBank;
    }
    function getAmountForInsurance() public view returns(string memory){
        return _amountPerMonthForInsurance;
    } 
    function setSellerConfirmation()  public{
        _sellerConfirmation=true;
    } 
    function setBuyerConfirmation() public {
        _buyerConfirmation=true;
    } 
    function getSellerConfirmation() public view returns(bool){
        return _sellerConfirmation;
    } 
    function getBuyerConfirmation()public view returns(bool){
        return _buyerConfirmation;
    }
}