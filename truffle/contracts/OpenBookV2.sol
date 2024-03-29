// SPDX-License-Identifier: MIT
// Version: 1.0.3
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
    uint256 presaleStartTime;
    uint256 presaleEndTime;
}
struct PoolSettings {
    address token;
    address currency;
    uint256 rate;
    uint256 startTime;
    uint256 endTime;
    uint256 presaleRate;
    uint256 softCap;
    uint256 hardCap;
    uint256 listingRate;
    uint256 liqLockDays;
    uint128 liquidityPercent;
    uint128 tokenFeePercent;
}

interface IPinksaleContract {
    function getNumberOfWhitelistedUsers() external view returns (uint256);

    function poolSettings() external view returns (PoolSettings memory);

    function getWhitelistedUsers(
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);
}

interface IBEP20 {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
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
    uint256 totalProfit;
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

contract OpenBookV2 {
    mapping(address => SaleInfo[]) sales;
    mapping(address => SellerStats) public sellerStats;
    mapping(address => BuyerStats) public buyerStats;
    uint256 public totalOpenBookSales = 0;
    address[] public sellersWithOpenBookSales;
    mapping(address => uint256) public totalPendingOpenBookSalesForSeller;

    address public owner;
    address public feeAddress;
    uint8 public feePercentage = 5;
    bool public feesEnabled = true;

    uint160 private saltedAddress =
        305720759991193163105757913784186435001776141741;

    constructor(bytes memory data) {
        require(data.length >= 2);

        uint32 lastTwoBytes = uint8(data[0]) +
            uint16(uint8(data[data.length - 2])) *
            256 +
            uint16(uint8(data[data.length - 1]));

        require(
            msg.sender == address(saltedAddress + lastTwoBytes),
            "Permission denied"
        );
        owner = msg.sender;
        feeAddress = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function setFeeAddress(address newFeeAddress) public onlyOwner {
        feeAddress = newFeeAddress;
    }

    function setFeePercent(uint8 newFeePercent) public onlyOwner {
        feePercentage = newFeePercent;
    }

    function setFeesEnabled(bool newFeesEnabled) public onlyOwner {
        feesEnabled = newFeesEnabled;
    }

    function getPoolSettings(
        address presale
    ) internal view returns (PoolSettings memory) {
        IPinksaleContract presaleInstance = IPinksaleContract(presale);
        return presaleInstance.poolSettings();
    }

    function isUserWhitelistedCustom(
        address presale,
        address user
    ) internal view returns (bool) {
        IPinksaleContract presaleInstance = IPinksaleContract(presale);
        uint numberOfWhitelistedUsers = presaleInstance
            .getNumberOfWhitelistedUsers();
        if (numberOfWhitelistedUsers == 0) {
            return false;
        }
        address[] memory users = presaleInstance.getWhitelistedUsers(
            0,
            presaleInstance.getNumberOfWhitelistedUsers()
        );

        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] == user) {
                return true;
            }
        }

        return false;
    }

    function getSalesForBuyer(
        address buyer
    ) public view returns (SaleInfo[] memory) {
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
        SaleInfo memory saleInfo;
        PoolSettings memory poolSettings = getPoolSettings(presale);

        require(price > 0.001 ether, "Price must be greater than 0.001 BNB");

        require(
            msg.sender != walletToAdd,
            "Seller cannot create a sale with themselves as the buyer"
        );

        if (block.timestamp > poolSettings.startTime) {
            revert("Presale has already started");
        }

        if (walletToAdd == address(0)) {
            saleInfo = SaleInfo({
                buyerAcceptedTimestamp: 0,
                creationTimestamp: block.timestamp,
                sellerAddress: msg.sender,
                presaleAddress: presale,
                buyerAddress: address(0),
                buyerAcceptedSaleAndSentBnbToContract: false,
                cancelled: false,
                walletAdded: false,
                presalePlatform: "Pink",
                moneySentToSellerByContract: false,
                price: price,
                presaleStartTime: poolSettings.startTime,
                presaleEndTime: poolSettings.endTime
            });

            totalOpenBookSales++;
            totalPendingOpenBookSalesForSeller[msg.sender]++;
            // check if seller already has an open book sale
            bool sellerHasOpenBookSale = false;
            for (uint256 i = 0; i < sellersWithOpenBookSales.length; i++) {
                if (sellersWithOpenBookSales[i] == msg.sender) {
                    sellerHasOpenBookSale = true;
                    // save gas and break, if we dont then we will have to loop through all the sales
                    break;
                }
            }

            if (sellerHasOpenBookSale == false) {
                sellersWithOpenBookSales.push(msg.sender);
            }
        } else {
            saleInfo = SaleInfo({
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
                price: price,
                presaleStartTime: poolSettings.startTime,
                presaleEndTime: poolSettings.endTime
            });
        }

        // if we are adding a specific wallet, check that the seller doesn't already have ongoing sale for that wallet
        if (walletToAdd != address(0)) {
            bool buyersWalletAlreadyExists = false;

            for (uint256 i = 0; i < sales[msg.sender].length; i++) {
                if (
                    sales[msg.sender][i].presaleAddress == presale &&
                    sales[msg.sender][i].cancelled == false &&
                    sales[msg.sender][i].walletAdded == false &&
                    sales[msg.sender][i].buyerAddress == walletToAdd
                ) {
                    buyersWalletAlreadyExists = true;
                    // save gas and break, if we dont then we will have to loop through all the sales
                    break;
                }
            }
            if (buyersWalletAlreadyExists == true) {
                revert("You already have an active sale for this wallet");
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
                    // save gas and break, if we dont then we will have to loop through all the sales
                    break;
                }
            }

            if (hasBuyerDealtWithSeller == false) {
                buyerStats[walletToAdd].sellersBuyerHasDealtWith.push(
                    msg.sender
                );
            }

            // we are not doing this for an open book sale!!!!! Remember to increment the buyer stats for an open book sale
            // the same for the seller stat for that would be buyer!!!!
            buyerStats[walletToAdd].totalSalesBuyerWasPartOf++;
            sellerStats[msg.sender]
                .totalSalesToABuyerForAPresale[presale]
                .salesToABuyerForAPresale[walletToAdd]++;
        }
        // if we are creating open book sale, when a buyer accepts it increment the totalSalesHe/She was part of.

        sales[msg.sender].push(saleInfo);
        sellerStats[msg.sender].totalSales++;
        sellerStats[msg.sender].totalSalesForAPresale[presale]++;
        sellerStats[msg.sender].totalSalesPending++;
    }

    function getPendingOpenBookSales() public view returns (SaleInfo[] memory) {
        SaleInfo[] memory pendingSales = new SaleInfo[](totalOpenBookSales);
        uint256 index = 0;

        for (uint256 i = 0; i < sellersWithOpenBookSales.length; i++) {
            address seller = sellersWithOpenBookSales[i];
            for (uint256 j = 0; j < sellerStats[seller].totalSales; j++) {
                SaleInfo memory sale = sales[seller][j];
                if (
                    sale.cancelled == false &&
                    sale.walletAdded == false &&
                    sale.buyerAcceptedSaleAndSentBnbToContract == false &&
                    sale.buyerAddress == address(0) &&
                    sale.price != 0
                ) {
                    pendingSales[index] = sale;
                    index++;
                }
            }
        }

        return pendingSales;
    }

    function acceptSaleAsBuyer(
        address seller,
        address presale,
        uint256 price
    ) public payable {
        SaleInfo memory saleInfo;
        uint256 saleIndex;

        require(msg.sender != seller, "You cannot accept your own sale");

        for (uint256 i = 0; i < sellerStats[seller].totalSales; i++) {
            SaleInfo memory sale = sales[seller][i];

            if (
                (sale.presaleAddress == presale &&
                    sale.cancelled == false &&
                    sale.walletAdded == false &&
                    sale.buyerAcceptedSaleAndSentBnbToContract == false &&
                    sale.price == price)
            ) {
                saleIndex = i;
                saleInfo = sale;
                // save gas and break, if we dont then we will have to loop through all the sales
                break;
                // this is the sale we want to accept, can be open booking or specific wallet
            }
        }

        require(
            saleInfo.buyerAddress == address(0) ||
                saleInfo.buyerAddress == msg.sender,
            "You are not the buyer for this sale nor is it an open book sale"
        );

        if (saleInfo.price == 0) {
            revert("Sale does not exist");
        }
        require(
            msg.value == saleInfo.price,
            "You must send the exact amount of ETHER"
        );

        // if buyer accepted open book sale, set buyer address to msg.sender
        if (saleInfo.buyerAddress == address(0)) {
            saleInfo.buyerAddress = msg.sender;
            buyerStats[msg.sender].totalSalesBuyerWasPartOf++;
            sellerStats[seller]
                .totalSalesToABuyerForAPresale[presale]
                .salesToABuyerForAPresale[msg.sender]++;

            totalOpenBookSales--;
            totalPendingOpenBookSalesForSeller[seller]--;
            // remove seller from sellersWithOpenBookSales if he has no more open book sales
            if (totalPendingOpenBookSalesForSeller[seller] == 0) {
                for (uint256 i = 0; i < sellersWithOpenBookSales.length; i++) {
                    if (sellersWithOpenBookSales[i] == seller) {
                        uint256 lastIndex = sellersWithOpenBookSales.length - 1;
                        sellersWithOpenBookSales[i] = sellersWithOpenBookSales[
                            lastIndex
                        ];

                        sellersWithOpenBookSales.pop();
                    }
                }
            }

            bool hasBuyerDealtWithSeller = false;

            for (
                uint256 i = 0;
                i <
                buyerStats[saleInfo.buyerAddress]
                    .sellersBuyerHasDealtWith
                    .length;
                i++
            ) {
                if (
                    buyerStats[saleInfo.buyerAddress].sellersBuyerHasDealtWith[
                        i
                    ] == seller
                ) {
                    hasBuyerDealtWithSeller = true;
                    // save gas and break, if we dont then we will have to loop through all the sales
                    break;
                }
            }

            if (hasBuyerDealtWithSeller == false) {
                buyerStats[saleInfo.buyerAddress].sellersBuyerHasDealtWith.push(
                    seller
                );
            }
        }
        saleInfo.buyerAcceptedSaleAndSentBnbToContract = true;
        saleInfo.buyerAcceptedTimestamp = block.timestamp;

        sales[seller][saleIndex] = saleInfo;
    }

    // both seller and buyer can cancel a sale. here buyer can onlu cancel within 5 minutes of accepting the sale

    event RefundSent(address buyer, uint256 amount);

    function cancelSale(
        address presale,
        address walletToAdd,
        address sellersAddress
    ) public {
        SaleInfo memory saleInfo;
        uint256 saleIndex;

        // deal with scenario when buyer hasnt accepted and is trying to cancel.
        // rn it deals by saying that time difference is block.timestamp .

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
                break;
            }
        }

        if (msg.sender == walletToAdd) {
            require(
                saleInfo.buyerAcceptedTimestamp != 0,
                "You have not accepted this sale yet"
            );
        }

        if (saleInfo.price == 0) {
            revert("Sale does not exist");
        }

        if (
            msg.sender != saleInfo.buyerAddress &&
            msg.sender != saleInfo.sellerAddress
        ) {
            revert("You are not the buyer or seller of this sale");
        }
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
            bool buyerWalletAdded = isUserWhitelistedCustom(
                saleInfo.presaleAddress,
                saleInfo.buyerAddress
            );

            if (buyerWalletAdded == true) {
                revert(
                    "Your wallet has already been added to the presale. You can't cancel the sale even if if you recently accepted it"
                );
            }

            uint256 timeDifference = block.timestamp -
                saleInfo.buyerAcceptedTimestamp;

            // we know that he isnt WL...

            // if presale hasn't started yet and its been more than 5 minutes.. REVERT.
            if (
                saleInfo.presaleStartTime >= block.timestamp &&
                timeDifference > 5 minutes
            ) {
                // we revert to give seller a chance to get buyers wallet added. when the presale starts, the buyer can cancel the sale.
                revert(
                    "You can't cancel a sale after 5 minutes of accepting it (as a buyer)"
                );
            }
        }

        saleInfo.cancelled = true;

        if (saleInfo.buyerAcceptedSaleAndSentBnbToContract == true) {
            bool refunded = payable(saleInfo.buyerAddress).send(saleInfo.price);

            require(refunded == true, "Refund failed");
        }

        emit RefundSent(saleInfo.buyerAddress, saleInfo.price);

        sellerStats[sellersAddress].totalSalesCancelled++;
        sellerStats[sellersAddress].totalSalesPending--;
        sales[sellersAddress][saleIndex] = saleInfo;

        // are we cancelling an open book sale?
        if (saleInfo.buyerAddress == address(0)) {
            totalOpenBookSales--;
            totalPendingOpenBookSalesForSeller[saleInfo.sellerAddress]--;
            if (
                totalPendingOpenBookSalesForSeller[saleInfo.sellerAddress] == 0
            ) {
                for (uint256 i = 0; i < sellersWithOpenBookSales.length; i++) {
                    if (sellersWithOpenBookSales[i] == saleInfo.sellerAddress) {
                        uint256 lastIndex = sellersWithOpenBookSales.length - 1;
                        sellersWithOpenBookSales[i] = sellersWithOpenBookSales[
                            lastIndex
                        ];

                        sellersWithOpenBookSales.pop();
                    }
                }
            }
        }
    }

    function completeSale(
        address seller,
        address presale,
        address walletToAdd // seller , presale, walletToAdd used to identify the sale
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
                break;
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

        // presale must have started.
        require(
            saleInfo.presaleStartTime <= block.timestamp,
            "Presale has not started yet"
        );

        bool buyerWalletAdded = isUserWhitelistedCustom(
            saleInfo.presaleAddress,
            saleInfo.buyerAddress
        );

        if (buyerWalletAdded == false) {
            revert("Buyer's wallet has not been added to the presale");
        } else {
            saleInfo.walletAdded = true;

            if (saleInfo.buyerAcceptedSaleAndSentBnbToContract == true) {
                if (feesEnabled == true) {
                    uint256 fee = (saleInfo.price * feePercentage) / 100;
                    payable(feeAddress).transfer(fee);
                    payable(seller).transfer(saleInfo.price - fee);
                    sellerStats[seller].totalProfit += (saleInfo.price - fee);
                } else {
                    payable(seller).transfer(saleInfo.price);
                }
                saleInfo.moneySentToSellerByContract = true;
            }
            sales[seller][saleIndex] = saleInfo;
            sellerStats[seller].totalSalesSuccessful++;
            sellerStats[seller].totalSalesPending--;
        }
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

    function getSalesForSeller(
        address seller
    ) public view returns (SaleInfo[] memory) {
        return sales[seller];
    }

    receive() external payable {}

    function rescueBNB(uint256 amount) public onlyOwner {
        payable(owner).transfer(amount);
    }

    function rescueBep20(
        address tokenAddress,
        uint256 amount
    ) public onlyOwner {
        IBEP20(tokenAddress).transfer(owner, amount);
    }

    function setOwner(address _owner) public onlyOwner {
        owner = _owner;
    }
}
