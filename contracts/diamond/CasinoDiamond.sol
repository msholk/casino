// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

/******************************************************************************\
* Uses the diamond-2, version 1.3.4, diamond implementation:
* https://github.com/mudgen/diamond-2
/******************************************************************************/

import "contracts/diamond/libraries/LibDiamond.sol";
import "./interfaces/IDiamondLoupe.sol";
import "./interfaces/IDiamondCut.sol";
import "contracts/libraries/cashier/CashierStorageLib.sol";
import "contracts/libraries/roulette/RouletCroupierStorage.sol";
import "contracts/libraries/house/HouseStorage.sol";

contract CasinoDiamond {
    CashierStorage cs;
    HouseStorage hs;
    RouletCroupierStorage rcs;

    struct ConstructorArgs {
        address owner;
    }

    constructor(
        IDiamondCut.FacetCut[] memory _diamondCut,
        ConstructorArgs memory _args
    ) {
        require(
            _args.owner != address(0),
            "CasinoDiamond: owner can't be address(0)"
        );
        LibDiamond.diamondCut(_diamondCut, address(0), new bytes(0));
        LibDiamond.setContractOwner(_args.owner);

        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();

        ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;

        hs.houseBalance = 10_000 * 1e18;
    }

    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    fallback() external payable {
        LibDiamond.DiamondStorage storage ds;
        bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
        address facet = address(
            bytes20(ds.facetAddressAndSelectorPosition[msg.sig].facetAddress)
        );
        require(facet != address(0), "CasinoDiamond: Function does not exist");
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    receive() external payable {
        revert("CasinoDiamond: Does not accept ether");
    }
}
