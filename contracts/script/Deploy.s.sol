// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/AvatarNFT.sol";
import "../src/LeaderboardContract.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy AvatarNFT
        AvatarNFT avatarNFT = new AvatarNFT("Trick or TrETH Avatars", "TOTA");
        console.log("AvatarNFT deployed at:", address(avatarNFT));

        // Deploy LeaderboardContract
        LeaderboardContract leaderboard = new LeaderboardContract();
        console.log("LeaderboardContract deployed at:", address(leaderboard));

        // Fund the prize pool (optional - can be done later)
        // leaderboard.fundPrizePool{value: 1 ether}();

        vm.stopBroadcast();

        console.log("Network Chain ID:", block.chainid);
    }
}
