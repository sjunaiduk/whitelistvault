// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

/**
  {
    "inputs": [],
    "name": "poolSettings",
    "outputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "startTime", "type": "uint256" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "internalType": "uint256", "name": "rate", "type": "uint256" },
      {
        "internalType": "uint256",
        "name": "minContribution",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxContribution",
        "type": "uint256"
      },
      { "internalType": "uint256", "name": "softCap", "type": "uint256" },
      { "internalType": "uint256", "name": "hardCap", "type": "uint256" },
      {
        "internalType": "uint256",
        "name": "liquidityListingRate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "liquidityLockDays",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "liquidityPercent",
        "type": "uint256"
      },
      { "internalType": "uint128", "name": "ethFeePercent", "type": "uint128" },
      {
        "internalType": "uint128",
        "name": "tokenFeePercent",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }, */

/**
    {
    "inputs": [],
    "name": "poolStates",
    "outputs": [
      {
        "internalType": "enum PoolStorageLibrary.State",
        "name": "state",
        "type": "uint8"
      },
      { "internalType": "uint256", "name": "finishTime", "type": "uint256" },
      { "internalType": "uint256", "name": "totalRaised", "type": "uint256" },
      {
        "internalType": "uint256",
        "name": "totalVolumePurchased",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "publicSaleStartTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "liquidityUnlockTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalVestedTokens",
        "type": "uint256"
      },
      { "internalType": "int256", "name": "lockId", "type": "int256" },
      { "internalType": "string", "name": "poolDetails", "type": "string" },
      { "internalType": "string", "name": "kycDetails", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  }, */

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

interface PinksaleContract {
    function getNumberOfWhitelistedUsers() external view returns (uint256);

    function poolSettings() external view returns (PoolSettings memory);

    function getWhitelistedUsers(
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (address[] memory);
}

contract PinksaleTests {
    function getPoolSettings(
        address presale
    ) public view returns (PoolSettings memory) {
        PinksaleContract presaleInstance = PinksaleContract(presale);
        return presaleInstance.poolSettings();
    }

    function isUserWhitelistedCustom(
        address presale,
        address user
    ) internal view returns (bool) {
        PinksaleContract presaleInstance = PinksaleContract(presale);
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

    function getAllWhitelistedUsers(
        address presale
    ) public view returns (address[] memory) {
        PinksaleContract presaleInstance = PinksaleContract(presale);
        return
            presaleInstance.getWhitelistedUsers(
                0,
                presaleInstance.getNumberOfWhitelistedUsers()
            );
    }
}
