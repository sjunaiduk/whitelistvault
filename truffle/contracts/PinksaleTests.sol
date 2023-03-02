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

struct PoolSettings {
    address token;
    address currency;
    uint256 startTime;
    uint256 endTime;
    uint256 rate;
    uint256 softCap;
    uint256 hardCap;
    uint256 liquidityListingRate;
    uint256 liquidityLockDays;
    uint256 liquidityPercent;
    uint128 ethFeePercent;
    uint128 tokenFeePercent;
}

interface PinksaleContract {
    function isUserWhitelisted(address user) external view returns (bool);

    function startTime() external view returns (uint256);

    function getNumberOfWhitelistedUsers() external view returns (uint256);

    function poolSettings() external view returns (PoolSettings memory);
}

contract PinksaleTests {
    function isUserWhitelisted(address user, address presale)
        public
        view
        returns (bool)
    {
        PinksaleContract presaleInstance = PinksaleContract(presale);
        return presaleInstance.isUserWhitelisted(user);
    }

    function numberOfWhitelistedUsers(address presale)
        public
        view
        returns (uint256)
    {
        PinksaleContract presaleInstance = PinksaleContract(presale);
        return presaleInstance.getNumberOfWhitelistedUsers();
    }

    function getPoolSettings(address presale)
        public
        view
        returns (PoolSettings memory)
    {
        PinksaleContract presaleInstance = PinksaleContract(presale);
        return presaleInstance.poolSettings();
    }
}
