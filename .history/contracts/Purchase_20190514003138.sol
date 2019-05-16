pragma solidity >=0.4.22 <= 0.5.7;
contract Purchase {
    string private _ref;
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
    function setArguments(address owner, address buyer, address bank, address insurance,
         uint256 house, string memory loan,uint256 date,string memory forBank,string memory forInsurance,string memory advance)public{
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
    function setRef(string memory ref) public returns(bool){
        _ref=ref;
        return true;
    }
    function getHouseIndex() public view returns(uint256){
        return _houseIndex;
    }
    function getLoan() public view returns(string memory){
        return _loan;
    }
    function getBuyer() public view returns(address){
        return _buyer;
    }
    function getAdvance() public view returns(string memory){
        return _advance;
    }
    /* function getRef() public view returns(string memory){
        return _ref;
    }
    function getOwner() public view returns(address){
        return _owner;
    }
    function getBank() public view returns(address){
        return _bank;
    }
    function getInsurance() public view returns(address){
        return _insurance;
    }
    function getDate() public view returns(uint256){
        return _date;
    }
    function getAmountForBank() public view returns(string memory){
        return _amountPerMonthForBank;
    }
    function getAmountForInsurance() public view returns(string memory){
        return _amountPerMonthForInsurance;
    }
    function getSellerConfirmation() public view returns(bool){
        return _sellerConfirmation;
    }
    function getBuyerConfirmation()public view returns(bool){
        return _buyerConfirmation;
    } */
    function getAddresses() public view returns(address,address,address){
        return(_owner,_bank,_insurance);
    }
    function getStrings() public view returns(string memory,string memory,string memory,uint256,bool,bool){
        return(_ref,_amountPerMonthForBank,_amountPerMonthForInsurance,_date,_sellerConfirmation,_buyerConfirmation);
    }
    function setSellerConfirmation()  public{
        _sellerConfirmation=true;
    }
    function setBuyerConfirmation() public {
        _buyerConfirmation=true;
    }
}