// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract LeaderboardContract is Ownable {
    // Player stats
    struct PlayerStats {
        uint256 visitCount;
        uint256 matchCount;
        uint256 totalRewards;
        bool exists;
    }

    // Mapping from address to stats
    mapping(address => PlayerStats) public playerStats;

    // Prize pool
    uint256 public prizePool;

    // Events
    event VisitRecorded(address indexed visitor, address indexed homeOwner);
    event MatchMade(address indexed homeOwner, address indexed visitor);
    event RewardsDistributed(address indexed player, uint256 amount);
    event PrizePoolFunded(uint256 amount);

    constructor() Ownable(msg.sender) {}

    // Record a visit
    function recordVisit(address visitor, address homeOwner) public {
        require(
            visitor != address(0) && homeOwner != address(0),
            "Invalid addresses"
        );
        require(visitor != homeOwner, "Cannot visit yourself");

        // Initialize player stats if they don't exist
        if (!playerStats[visitor].exists) {
            playerStats[visitor] = PlayerStats(0, 0, 0, true);
        }
        if (!playerStats[homeOwner].exists) {
            playerStats[homeOwner] = PlayerStats(0, 0, 0, true);
        }

        // Increment visit count for visitor
        playerStats[visitor].visitCount++;

        emit VisitRecorded(visitor, homeOwner);
    }

    // Record a match (homeowner swipes right)
    function recordMatch(address homeOwner, address visitor) public {
        require(
            visitor != address(0) && homeOwner != address(0),
            "Invalid addresses"
        );
        require(visitor != homeOwner, "Cannot match yourself");

        // Initialize player stats if they don't exist
        if (!playerStats[visitor].exists) {
            playerStats[visitor] = PlayerStats(0, 0, 0, true);
        }
        if (!playerStats[homeOwner].exists) {
            playerStats[homeOwner] = PlayerStats(0, 0, 0, true);
        }

        // Only increment match count for the visitor (the one being liked)
        playerStats[visitor].matchCount++;

        emit MatchMade(homeOwner, visitor);
    }

    // Get player stats
    function getPlayerStats(
        address player
    ) public view returns (PlayerStats memory) {
        return playerStats[player];
    }

    // Fund the prize pool
    function fundPrizePool() public payable {
        require(msg.value > 0, "Must send ETH");
        prizePool += msg.value;
        emit PrizePoolFunded(msg.value);
    }

    // Distribute rewards to top players (owner only)
    function distributeRewards(
        address[] calldata players,
        uint256[] calldata amounts
    ) public onlyOwner {
        require(players.length == amounts.length, "Arrays length mismatch");
        require(players.length > 0, "No players to reward");

        for (uint256 i = 0; i < players.length; i++) {
            require(amounts[i] > 0, "Amount must be positive");
            require(amounts[i] <= prizePool, "Insufficient prize pool");
            require(players[i] != address(0), "Invalid player address");

            prizePool -= amounts[i];
            playerStats[players[i]].totalRewards += amounts[i];

            (bool success, ) = players[i].call{value: amounts[i]}("");
            require(success, "Transfer failed");

            emit RewardsDistributed(players[i], amounts[i]);
        }
    }

    // Get total prize pool
    function getPrizePool() public view returns (uint256) {
        return prizePool;
    }

    // Withdraw remaining funds (owner only)
    function withdrawFunds() public onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No funds to withdraw");

        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdrawal failed");
    }
}
