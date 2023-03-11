// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

/**
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "poolDetails",
    "outputs": [
      { "internalType": "uint256", "name": "startDateTime", "type": "uint256" },
      { "internalType": "uint256", "name": "endDateTime", "type": "uint256" },
      { "internalType": "uint256", "name": "listDateTime", "type": "uint256" },
      {
        "internalType": "uint256",
        "name": "minAllocationPerUser",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxAllocationPerUser",
        "type": "uint256"
      },
      { "internalType": "uint256", "name": "dexLockup", "type": "uint256" },
      { "internalType": "string", "name": "extraData", "type": "string" },
      { "internalType": "bool", "name": "whitelistable", "type": "bool" },
      { "internalType": "bool", "name": "audit", "type": "bool" },
      { "internalType": "string", "name": "auditLink", "type": "string" },
      { "internalType": "bool", "name": "isHyper", "type": "bool" },
      {
        "internalType": "uint256",
        "name": "maxContributors",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  */

/**
  
  {
    "inputs": [
      { "internalType": "address", "name": "_pool", "type": "address" }
    ],
    "name": "getWhitelistAddresses",
    "outputs": [
      { "internalType": "address[]", "name": "t1", "type": "address[]" },
      { "internalType": "address[]", "name": "t2", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  } */

struct PoolDetails {
    uint256 startDateTime;
    uint256 endDateTime;
    uint256 listDateTime;
    uint256 minAllocationPerUser;
    uint256 maxAllocationPerUser;
    uint256 dexLockup;
    string extraData;
    bool whitelistable;
    bool audit;
    string auditLink;
    bool isHyper;
    uint256 maxContributors;
}

interface GempadContract {
    function poolDetails(address pool)
        external
        view
        returns (PoolDetails memory);

    function getWhitelistAddresses(address pool)
        external
        view
        returns (address[] memory, address[] memory);

    function getPoolAddresses() external view returns (address[] memory);
}

contract GempadTests {
    GempadContract gempadPresaleInstance =
        GempadContract(0x476F879CAC05c2976e0DCC7789406292B2f14E96);

    function getPoolDetails(address pool) public view returns (bool) {
        gempadPresaleInstance.poolDetails(pool);
        return true;
    }

    function getWhitelistAddresses(address pool)
        public
        view
        returns (address[] memory, address[] memory)
    {
        return gempadPresaleInstance.getWhitelistAddresses(pool);
    }

    function getPoolAddresses() public view returns (address[] memory) {
        return gempadPresaleInstance.getPoolAddresses();
    }
}
