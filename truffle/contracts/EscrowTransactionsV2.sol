// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

struct SaleInfo {
    uint256 creationTimestamp;
    uint256 buyerAcceptedTimestamp;
    address sellerAddress;
    address presaleAddress;
    address buyerAddress;
    bool buyerAcceptedSaleAndSentBnbToContract;
    bool cancelled;
    bool walletAdded;
    string presalePlatform;
    bool moneySentToSellerByContract;
    uint256 price;
}

struct WalletAddedStats {
    mapping(address => uint256) salesToABuyerForAPresale;
}
// needed to calculate size of arrays to return in function
struct SellerStats {
    uint256 totalSales;
    uint256 totalSalesPending;
    uint256 totalSalesCancelled;
    uint256 totalSalesSuccessful;
    mapping(address => uint256) totalSalesForAPresale;
    // only have these mappings so I can get multiple sales to the same buyer for a presale
    mapping(address => WalletAddedStats) totalSalesToABuyerForAPresale; // key is presale. value is a mapping of wallet to number of sales to that wallet
}

// Create a struct for the buyer, use this to track sales with each buyer etc

struct BuyerStats {
    uint256 totalSalesBuyerWasPartOf;
    address[] sellersBuyerHasDealtWith;

    // return final array of SellerStats, the size will be totalSalesBuyerWasPartOf.
    // each element in the array will be a SellerStats struct

    // loop through sellers buyer dealt with
    // for each seller, loop through their sales and add to array if buyer is part of it

    // return array
}

contract EscrowTransactionsV2 {
    mapping(address => SaleInfo[]) sales;
    mapping(address => SellerStats) public sellerStats;
    mapping(address => BuyerStats) public buyerStats;
    address owner = 0xd08F6D0571125C6f7Ec137473c1Cb80aee4306EA;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function getSalesForBuyer(address buyer)
        public
        view
        returns (SaleInfo[] memory)
    {
        SaleInfo[] memory salesForBuyer = new SaleInfo[](
            buyerStats[buyer].totalSalesBuyerWasPartOf
        );
        uint256 index = 0;

        for (
            uint256 i = 0;
            i < buyerStats[buyer].sellersBuyerHasDealtWith.length;
            i++
        ) {
            address seller = buyerStats[buyer].sellersBuyerHasDealtWith[i];
            for (uint256 j = 0; j < sellerStats[seller].totalSales; j++) {
                SaleInfo memory sale = sales[seller][j];
                if (sale.buyerAddress == buyer) {
                    salesForBuyer[index] = sale;
                    index++;
                }
            }
        }

        return salesForBuyer;
    }

    function createSale(
        address presale,
        address walletToAdd,
        uint256 price
    ) public {
        SaleInfo memory saleInfo = SaleInfo({
            buyerAcceptedTimestamp: 0,
            creationTimestamp: block.timestamp,
            sellerAddress: msg.sender,
            presaleAddress: presale,
            buyerAddress: walletToAdd,
            buyerAcceptedSaleAndSentBnbToContract: false,
            cancelled: false,
            walletAdded: false,
            presalePlatform: "Pink",
            moneySentToSellerByContract: false,
            price: price
        });

        bool buyersWalletAlreadyExists = false;

        for (uint256 i = 0; i < sales[msg.sender].length; i++) {
            if (
                sales[msg.sender][i].presaleAddress == presale &&
                sales[msg.sender][i].cancelled == false &&
                sales[msg.sender][i].walletAdded == false &&
                sales[msg.sender][i].buyerAddress == walletToAdd
            ) {
                buyersWalletAlreadyExists = true;
            }
        }

        bool hasBuyerDealtWithSeller = false;

        for (
            uint256 i = 0;
            i < buyerStats[walletToAdd].sellersBuyerHasDealtWith.length;
            i++
        ) {
            if (
                buyerStats[walletToAdd].sellersBuyerHasDealtWith[i] ==
                msg.sender
            ) {
                hasBuyerDealtWithSeller = true;
            }
        }

        if (hasBuyerDealtWithSeller == false) {
            buyerStats[walletToAdd].sellersBuyerHasDealtWith.push(msg.sender);
        }

        buyerStats[walletToAdd].totalSalesBuyerWasPartOf++;

        require(
            buyersWalletAlreadyExists == false,
            "You already have an active sale for this wallet"
        );

        sales[msg.sender].push(saleInfo);
        sellerStats[msg.sender].totalSales++;
        sellerStats[msg.sender].totalSalesForAPresale[presale]++;
        sellerStats[msg.sender].totalSalesPending++;
        sellerStats[msg.sender]
            .totalSalesToABuyerForAPresale[presale]
            .salesToABuyerForAPresale[walletToAdd]++;
    }

    function acceptSaleAsBuyer(address seller, address presale) public payable {
        SaleInfo memory saleInfo;
        uint256 saleIndex;

        for (uint256 i = 0; i < sellerStats[seller].totalSales; i++) {
            SaleInfo memory sale = sales[seller][i];

            if (
                sale.presaleAddress == presale &&
                sale.cancelled == false &&
                sale.walletAdded == false &&
                sale.buyerAddress == msg.sender &&
                sale.buyerAcceptedSaleAndSentBnbToContract == false
            ) {
                saleIndex = i;
                saleInfo = sale;
            }
        }
        if (saleInfo.price == 0) {
            revert("Sale does not exist");
        }
        require(
            msg.value == saleInfo.price,
            "You must send the exact amount of ETHER"
        );
        require(
            saleInfo.moneySentToSellerByContract == false,
            "Money has already been sent to the seller"
        );

        payable(address(this)).transfer(msg.value);
        saleInfo.buyerAcceptedSaleAndSentBnbToContract = true;
        saleInfo.buyerAcceptedTimestamp = block.timestamp;

        sales[seller][saleIndex] = saleInfo;
    }

    // both seller and buyer can cancel a sale. here buyer can onlu cancel within 5 minutes of accepting the sale

    function cancelSale(
        address presale,
        address walletToAdd,
        address sellersAddress
    ) public {
        SaleInfo memory saleInfo;
        uint256 saleIndex;

        for (uint256 i = 0; i < sellerStats[sellersAddress].totalSales; i++) {
            SaleInfo memory sale = sales[sellersAddress][i];

            if (
                sale.presaleAddress == presale &&
                sale.cancelled == false &&
                sale.walletAdded == false &&
                sale.buyerAddress == walletToAdd
            ) {
                saleIndex = i;
                saleInfo = sale;
            }
        }
        if (saleInfo.price == 0) {
            revert("Sale does not exist");
        }
        require(
            msg.sender == saleInfo.buyerAddress ||
                msg.sender == saleInfo.sellerAddress,
            "You are not the buyer or seller of this sale"
        );
        require(saleInfo.cancelled == false, "Sale has already been cancelled");

        // check if sale has been completed.
        require(
            saleInfo.walletAdded == false,
            "Wallet has already been added to the presale"
        );
        require(
            saleInfo.moneySentToSellerByContract == false,
            "Money has already been sent to the seller"
        );

        // Seller can cancel anytime before sale completes.

        // Buyer can't. Seller may have submitted the wallet, before it get's added he can maliciously cancel the sale and get a refund.
        // He can only cancel within 5 minutes of accepting the sale.
        if (msg.sender == saleInfo.buyerAddress) {
            uint256 timeDifference = block.timestamp -
                saleInfo.buyerAcceptedTimestamp;

            require(
                timeDifference < 5 minutes,
                "You can't cancel a sale after 5 minutes of accepting it (as a buyer)"
            );
        }

        saleInfo.cancelled = true;

        // if buyer sent BNB to ca refund him.
        if (saleInfo.buyerAcceptedSaleAndSentBnbToContract == true) {
            payable(saleInfo.buyerAddress).transfer(saleInfo.price);
        }

        sellerStats[sellersAddress].totalSalesCancelled++;
        sellerStats[sellersAddress].totalSalesPending--;
        sales[sellersAddress][saleIndex] = saleInfo;
    }

    // Owner can call on behalf of buyer if wallet isnt added after presale started.
    function cancelSaleAsBuyer(
        address presale,
        address walletToAdd,
        address sellersAddress
    ) public onlyOwner {
        SaleInfo memory saleInfo;
        uint256 saleIndex;

        for (uint256 i = 0; i < sellerStats[sellersAddress].totalSales; i++) {
            SaleInfo memory sale = sales[sellersAddress][i];

            if (
                sale.presaleAddress == presale &&
                sale.cancelled == false &&
                sale.walletAdded == false &&
                sale.buyerAddress == walletToAdd
            ) {
                saleIndex = i;
                saleInfo = sale;
            }
        }
        if (saleInfo.price == 0) {
            revert("Sale does not exist");
        }
        require(
            msg.sender == saleInfo.buyerAddress ||
                msg.sender == saleInfo.sellerAddress ||
                msg.sender == owner,
            "You are not the buyer or seller of this sale"
        );
        require(saleInfo.cancelled == false, "Sale has already been cancelled");

        // check if sale has been completed.
        require(
            saleInfo.walletAdded == false,
            "Wallet has already been added to the presale"
        );
        require(
            saleInfo.moneySentToSellerByContract == false,
            "Money has already been sent to the seller"
        );

        saleInfo.cancelled = true;

        // if buyer sent BNB to ca refund him.
        if (saleInfo.buyerAcceptedSaleAndSentBnbToContract == true) {
            payable(saleInfo.buyerAddress).transfer(saleInfo.price);
        }

        sellerStats[sellersAddress].totalSalesCancelled++;
        sellerStats[sellersAddress].totalSalesPending--;
        sales[sellersAddress][saleIndex] = saleInfo;
    }

    function completeSale(
        address seller,
        address presale,
        address walletToAdd
    ) public onlyOwner {
        SaleInfo memory saleInfo;
        uint256 saleIndex;

        for (uint256 i = 0; i < sellerStats[seller].totalSales; i++) {
            SaleInfo memory sale = sales[seller][i];

            if (
                sale.presaleAddress == presale &&
                sale.cancelled == false &&
                sale.walletAdded == false &&
                sale.buyerAddress == walletToAdd &&
                sale.buyerAcceptedSaleAndSentBnbToContract == true
            ) {
                saleIndex = i;
                saleInfo = sale;
            }
        }

        if (saleInfo.price == 0) {
            revert(
                "No valid sale found. Must not be cancelled, wallet must not be added, buyer must have accepted sale and sent BNB to contract, and money must not have been sent to seller by contract."
            );
        }
        require(
            saleInfo.buyerAcceptedSaleAndSentBnbToContract == true,
            "Buyer has not accepted sale and sent BNB to the contract"
        );
        require(saleInfo.cancelled == false, "Sale has been cancelled");
        require(
            saleInfo.walletAdded == false,
            "Wallet has already been added to the presale"
        );
        require(
            saleInfo.moneySentToSellerByContract == false,
            "Money has already been sent to the seller"
        );

        saleInfo.walletAdded = true;

        if (saleInfo.buyerAcceptedSaleAndSentBnbToContract == true) {
            payable(seller).transfer(saleInfo.price);
            saleInfo.moneySentToSellerByContract = true;
        }
        sales[seller][saleIndex] = saleInfo;
        sellerStats[seller].totalSalesSuccessful++;
        sellerStats[seller].totalSalesPending--;
    }

    // assume that for the same presale, a buyer can have a cancelled sale with the same wallet address,
    // ill return an array.
    function getSaleInfo(
        address seller,
        address presale,
        address walletToAdd
    ) public view returns (SaleInfo[] memory) {
        SaleInfo[] memory saleInfo = new SaleInfo[](
            sellerStats[seller]
                .totalSalesToABuyerForAPresale[presale]
                .salesToABuyerForAPresale[walletToAdd]
        );

        uint256 saleInfoCounter = 0;

        for (uint256 i = 0; i < sellerStats[seller].totalSales; i++) {
            SaleInfo memory sale = sales[seller][i];

            if (
                sale.presaleAddress == presale &&
                sale.buyerAddress == walletToAdd
            ) {
                saleInfo[saleInfoCounter] = sale;
                saleInfoCounter++;
            }
        }
        if (saleInfo.length == 0) {
            revert("Can't get sale info of a sale that doesn't exist. ");
        }
        return saleInfo;
    }

    function getSalesForSeller(address seller)
        public
        view
        returns (SaleInfo[] memory)
    {
        return sales[seller];
    }

    receive() external payable {}

    function withdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }
}
