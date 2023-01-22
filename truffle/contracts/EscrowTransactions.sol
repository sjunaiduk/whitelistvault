// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

struct SaleInfo {
    bool buyerAcceptedSaleAndSentBnbToContract;
    bool cancelled;
    bool walletAdded;
    string presalePlatform;
    bool moneySentToSellerByContract;
    uint256 price;
}

struct SalesForAPresale {
    mapping(address => SaleInfo) saleInfoForWalletsToAdd;
    // address is the key, (wallet to add to presale)
}

struct Seller {
    mapping(address => SalesForAPresale) salesForAPresale;
    // address is the presale.
}

contract EscrowTransactions {
    mapping(address => Seller) sellers;

    // address is the seller.

    function createSale(
        address presale,
        address walletToAdd,
        uint256 price
    ) public {
        SaleInfo memory saleInfo = SaleInfo({
            buyerAcceptedSaleAndSentBnbToContract: false,
            cancelled: false,
            walletAdded: false,
            presalePlatform: "Pink",
            moneySentToSellerByContract: false,
            price: price
        });
        sellers[msg.sender].salesForAPresale[presale].saleInfoForWalletsToAdd[
                walletToAdd
            ] = saleInfo;
    }

    function acceptSaleAsBuyer(address seller, address presale) public payable {
        SaleInfo memory saleInfo = sellers[seller]
            .salesForAPresale[presale]
            .saleInfoForWalletsToAdd[msg.sender];
        require(saleInfo.cancelled == false, "Sale has been cancelled");
        require(saleInfo.walletAdded == false, "Wallet has already been added");
        require(
            saleInfo.moneySentToSellerByContract == false,
            "Money has already been sent to the seller"
        );
        require(
            msg.value == saleInfo.price,
            "You must send the exact amount of ETHER"
        );

        payable(address(this)).transfer(msg.value);
        saleInfo.buyerAcceptedSaleAndSentBnbToContract = true;

        sellers[seller].salesForAPresale[presale].saleInfoForWalletsToAdd[
                msg.sender
            ] = saleInfo;
    }

    function cancelSale(address presale, address walletToAdd) public {
        SaleInfo memory saleInfo = sellers[msg.sender]
            .salesForAPresale[presale]
            .saleInfoForWalletsToAdd[walletToAdd];
        if (
            saleInfo.moneySentToSellerByContract == false &&
            saleInfo.walletAdded == false
        ) {
            // Send ETHER back to buyer from contract
            payable(walletToAdd).transfer(saleInfo.price);
        }
        sellers[msg.sender]
            .salesForAPresale[presale]
            .saleInfoForWalletsToAdd[walletToAdd]
            .cancelled = true;
    }

    function completeSale(
        address seller,
        address presale,
        address walletToAdd
    ) public {
        SaleInfo memory saleInfo = sellers[seller]
            .salesForAPresale[presale]
            .saleInfoForWalletsToAdd[walletToAdd];

        require(
            saleInfo.buyerAcceptedSaleAndSentBnbToContract == true,
            "Buyer has not accepted sale and hasn't sent required BNB to the contract"
        );
        require(saleInfo.cancelled == false, "Sale has been cancelled");
        require(saleInfo.walletAdded == false, "Wallet has already been added");
        require(
            saleInfo.moneySentToSellerByContract == false,
            "Money has already been sent to the seller"
        );

        // Add wallet to presale
        saleInfo.walletAdded = true;

        // Send ETHER to seller from contract
        payable(seller).transfer(saleInfo.price);
        saleInfo.moneySentToSellerByContract = true;

        sellers[seller].salesForAPresale[presale].saleInfoForWalletsToAdd[
                walletToAdd
            ] = saleInfo;
    }

    function getSaleInfo(
        address seller,
        address presale,
        address walletToAdd
    ) public view returns (SaleInfo memory) {
        return
            sellers[seller].salesForAPresale[presale].saleInfoForWalletsToAdd[
                walletToAdd
            ];
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }
}
