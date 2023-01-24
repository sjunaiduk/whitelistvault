// // SPDX-License-Identifier: MIT

// pragma solidity >=0.4.22 <0.9.0;

// struct SaleInfo {
//     bool buyerAcceptedSaleAndSentBnbToContract;
//     bool cancelled;
//     bool walletAdded;
//     string presalePlatform;
//     bool moneySentToSellerByContract;
//     uint256 price;
// }

// struct SalesForAPresale {
//     mapping(address => SaleInfo) saleInfoForWalletsToAdd;
//     // address is the key, (wallet to add to presale)
// }

// struct Seller {
//     uint256 totalSales;
//     address[] presales;
//     mapping(address => address[]) walletsForAPresale;
//     mapping(address => SalesForAPresale) salesForAPresale;
//     // address is the presale.
// }

// contract EscrowTransactions {
//     mapping(address => Seller) sellers;

//     // address is the seller.

//     function createSale(
//         address presale,
//         address walletToAdd,
//         uint256 price
//     ) public {
//         SaleInfo memory saleInfo = SaleInfo({
//             buyerAcceptedSaleAndSentBnbToContract: false,
//             cancelled: false,
//             walletAdded: false,
//             presalePlatform: "Pink",
//             moneySentToSellerByContract: false,
//             price: price
//         });

//         bool presaleAlreadyExists = false;
//         for (uint256 i = 0; i < sellers[msg.sender].presales.length; i++) {
//             if (sellers[msg.sender].presales[i] == presale) {
//                 presaleAlreadyExists = true;
//             }
//         }

//         bool buyersWalletAlreadyExists = false;
//         if (
//             sellers[msg.sender]
//                 .salesForAPresale[presale]
//                 .saleInfoForWalletsToAdd[walletToAdd]
//                 .price >
//             0 &&
//             sellers[msg.sender]
//                 .salesForAPresale[presale]
//                 .saleInfoForWalletsToAdd[walletToAdd]
//                 .cancelled ==
//             false &&
//             sellers[msg.sender]
//                 .salesForAPresale[presale]
//                 .saleInfoForWalletsToAdd[walletToAdd]
//                 .walletAdded ==
//             false
//         ) {
//             buyersWalletAlreadyExists = true;
//         }

//         require(
//             buyersWalletAlreadyExists == false,
//             "You already have a sale for this wallet"
//         );

//         sellers[msg.sender].salesForAPresale[presale].saleInfoForWalletsToAdd[
//                 walletToAdd
//             ] = saleInfo;

//         sellers[msg.sender].totalSales++;

//         if (presaleAlreadyExists == false) {
//             sellers[msg.sender].presales.push(presale);
//         }

//         sellers[msg.sender].walletsForAPresale[presale].push(walletToAdd);
//     }

//     function acceptSaleAsBuyer(address seller, address presale) public payable {
//         SaleInfo memory saleInfo = sellers[seller]
//             .salesForAPresale[presale]
//             .saleInfoForWalletsToAdd[msg.sender];
//         require(saleInfo.cancelled == false, "Sale has been cancelled");
//         require(saleInfo.walletAdded == false, "Wallet has already been added");
//         require(
//             saleInfo.moneySentToSellerByContract == false,
//             "Money has already been sent to the seller"
//         );
//         require(
//             msg.value == saleInfo.price,
//             "You must send the exact amount of ETHER"
//         );

//         payable(address(this)).transfer(msg.value);
//         saleInfo.buyerAcceptedSaleAndSentBnbToContract = true;

//         sellers[seller].salesForAPresale[presale].saleInfoForWalletsToAdd[
//                 msg.sender
//             ] = saleInfo;
//     }

//     function cancelSale(address presale, address walletToAdd) public {
//         SaleInfo memory saleInfo = sellers[msg.sender]
//             .salesForAPresale[presale]
//             .saleInfoForWalletsToAdd[walletToAdd];
//         if (
//             saleInfo.moneySentToSellerByContract == false &&
//             saleInfo.walletAdded == false
//         ) {
//             // Send ETHER back to buyer from contract
//             payable(walletToAdd).transfer(saleInfo.price);
//         }
//         sellers[msg.sender]
//             .salesForAPresale[presale]
//             .saleInfoForWalletsToAdd[walletToAdd]
//             .cancelled = true;
//     }

//     function completeSale(
//         address seller,
//         address presale,
//         address walletToAdd
//     ) public {
//         SaleInfo memory saleInfo = sellers[seller]
//             .salesForAPresale[presale]
//             .saleInfoForWalletsToAdd[walletToAdd];

//         require(
//             saleInfo.buyerAcceptedSaleAndSentBnbToContract == true,
//             "Buyer has not accepted sale and hasn't sent required BNB to the contract"
//         );
//         require(saleInfo.cancelled == false, "Sale has been cancelled");
//         require(saleInfo.walletAdded == false, "Wallet has already been added");
//         require(
//             saleInfo.moneySentToSellerByContract == false,
//             "Money has already been sent to the seller"
//         );

//         // Add wallet to presale
//         saleInfo.walletAdded = true;

//         // Send ETHER to seller from contract
//         payable(seller).transfer(saleInfo.price);
//         saleInfo.moneySentToSellerByContract = true;

//         sellers[seller].salesForAPresale[presale].saleInfoForWalletsToAdd[
//                 walletToAdd
//             ] = saleInfo;
//     }

//     function getSaleInfo(
//         address seller,
//         address presale,
//         address walletToAdd
//     ) public view returns (SaleInfo memory) {
//         return
//             sellers[seller].salesForAPresale[presale].saleInfoForWalletsToAdd[
//                 walletToAdd
//             ];
//     }

//     function getSalesForSeller(address seller)
//         public
//         view
//         returns (SaleInfo[] memory)
//     {
//         uint256 salesAdded = 0;
//         SaleInfo[] memory saleInfo = new SaleInfo[](sellers[seller].totalSales);
//         for (uint256 i = 0; i < sellers[seller].presales.length; i++) {
//             address presale = sellers[seller].presales[i];
//             address[] memory walletsAddedToPresale = sellers[seller]
//                 .walletsForAPresale[presale];

//             for (uint256 j = 0; j < walletsAddedToPresale.length; j++) {
//                 address walletToAdd = walletsAddedToPresale[j];
//                 saleInfo[salesAdded] = sellers[seller]
//                     .salesForAPresale[presale]
//                     .saleInfoForWalletsToAdd[walletToAdd];
//                 salesAdded++;
//             }
//         }
//         return saleInfo;
//     }

//     receive() external payable {}

//     function withdraw() public {
//         payable(msg.sender).transfer(address(this).balance);
//     }
// }
