pragma solidity >=0.4.22 <= 0.5.7;
contract Purchase {
    address private _owner;
    address private _buyer;
    address private _bank;
    address private _insurance;
    uint256 private _houseIndex;
    string private _loanAdvanceMonthlyBankMonthlyInsurance="0";
    uint256 private _date;
    bool private _sellerConfirmation = false;
    bool private _buyerConfirmation = false;
    function setArguments(address owner, address buyer, address bank, address insurance,
         uint256 house, string memory payments,uint256 date)public{
        _owner=owner;
        _buyer=buyer;
        _bank=bank;
        _insurance=insurance;
        _houseIndex=house;
        _loanAdvanceMonthlyBankMonthlyInsurance=payments;
        _date=date;
    }
    function getHouseIndex() public view returns(uint256){
        return _houseIndex;
    }
    function getLoanAdvanceMonthlyBankMonthlyInsurance() public view returns(string memory){
        return _loanAdvanceMonthlyBankMonthlyInsurance;
    }
    function getBuyer() public view returns(address){
        return _buyer;
    }
    function setSellerConfirmation()  public{
        _sellerConfirmation=true;
    }
    function setBuyerConfirmation() public {
        _buyerConfirmation=true;
    }
    function getAddresses() public view returns(address,address,address){
        return(_owner,_bank,_insurance);
    }
    function getStrings() public view returns(string memory,uint256,bool,bool){
        return(_loanAdvanceMonthlyBankMonthlyInsurance,_date,_sellerConfirmation,_buyerConfirmation);
    }
}