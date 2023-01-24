// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

struct SaleInfo {
    address presaleAddress;
    address buyerAddress;
    bool buyerAcceptedSaleAndSentBnbToContract;
    bool cancelled;
    bool walletAdded;
    string presalePlatform;
    bool moneySentToSellerByContract;
    uint256 price;
}

struct BuyerStats {
    mapping(address => uint256) salesToABuyerForAPresale;
}
// needed to calculate size of arrays to return in function
struct SellerStats {
    uint256 totalSales;
    uint256 totalSalesPending;
    uint256 totalSalesCancelled;
    uint256 totalSalesSuccessful;
    mapping(address => uint256) totalSalesForAPresale;
    mapping(address => BuyerStats) totalSalesToABuyerForAPresale;
}

contract EscrowTransactionsV2 {
    mapping(address => SaleInfo[]) sales;
    mapping(address => SellerStats) public sellerStats;

    // address is the seller.

    function createSale(
        address presale,
        address walletToAdd,
        uint256 price
    ) public {
        SaleInfo memory saleInfo = SaleInfo({
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

        sales[seller][saleIndex] = saleInfo;
    }

    function cancelSale(address presale, address walletToAdd) public {
        SaleInfo memory saleInfo;
        uint256 saleIndex;

        for (uint256 i = 0; i < sellerStats[msg.sender].totalSales; i++) {
            SaleInfo memory sale = sales[msg.sender][i];

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
        require(saleInfo.cancelled == false, "Sale has already been cancelled");
        require(
            saleInfo.walletAdded == false,
            "Wallet has already been added to the presale"
        );
        require(
            saleInfo.moneySentToSellerByContract == false,
            "Money has already been sent to the seller"
        );

        saleInfo.cancelled = true;

        if (saleInfo.buyerAcceptedSaleAndSentBnbToContract == true) {
            payable(saleInfo.buyerAddress).transfer(saleInfo.price);
        }

        sellerStats[msg.sender].totalSalesCancelled++;
        sellerStats[msg.sender].totalSalesPending--;
        sales[msg.sender][saleIndex] = saleInfo;

     
    }

    function completeSale(
        address seller,
        address presale,
        address walletToAdd
    ) public {
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
            revert("No valid sale found. Must not be cancelled, wallet must not be added, buyer must have accepted sale and sent BNB to contract, and money must not have been sent to seller by contract.");
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
        sellerStats[msg.sender].totalSalesPending--;
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
