// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/AvatarNFT.sol";
import "../src/LeaderboardContract.sol";

contract IntegrationTest is Test {
    AvatarNFT public avatarNFT;
    LeaderboardContract public leaderboard;

    address public owner;
    address public player1;
    address public player2;
    address public player3;

    uint256 public constant FID1 = 12345;
    uint256 public constant FID2 = 67890;
    uint256 public constant FID3 = 11111;

    function setUp() public {
        owner = address(this);
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");
        player3 = makeAddr("player3");

        avatarNFT = new AvatarNFT("Trick or TrETH Avatars", "TOTA");
        leaderboard = new LeaderboardContract();
    }

    function testFullGameFlow() public {
        // 1. Players mint avatars
        vm.prank(player1);
        uint256 tokenId1 = avatarNFT.mint(
            FID1,
            "https://supabase.com/avatar1.png"
        );

        vm.prank(player2);
        uint256 tokenId2 = avatarNFT.mint(
            FID2,
            "https://supabase.com/avatar2.png"
        );

        vm.prank(player3);
        uint256 tokenId3 = avatarNFT.mint(
            FID3,
            "https://supabase.com/avatar3.png"
        );

        // Verify avatars are minted
        assertTrue(avatarNFT.hasAvatar(FID1));
        assertTrue(avatarNFT.hasAvatar(FID2));
        assertTrue(avatarNFT.hasAvatar(FID3));

        // 2. Player1 visits Player2's house
        leaderboard.recordVisit(player1, player2);

        // 3. Player2 visits Player3's house
        leaderboard.recordVisit(player2, player3);

        // 4. Player3 visits Player1's house
        leaderboard.recordVisit(player3, player1);

        // 5. Homeowners swipe right (match)
        leaderboard.recordMatch(player2, player1); // Player2 likes Player1
        leaderboard.recordMatch(player3, player2); // Player3 likes Player2

        // 6. Fund prize pool
        leaderboard.fundPrizePool{value: 3 ether}();

        // 7. Distribute rewards based on match count
        address[] memory topPlayers = new address[](2);
        topPlayers[0] = player1; // 1 match
        topPlayers[1] = player2; // 1 match

        uint256[] memory rewards = new uint256[](2);
        rewards[0] = 1 ether;
        rewards[1] = 1 ether;

        leaderboard.distributeRewards(topPlayers, rewards);

        // Verify final state
        LeaderboardContract.PlayerStats memory stats1 = leaderboard
            .getPlayerStats(player1);
        LeaderboardContract.PlayerStats memory stats2 = leaderboard
            .getPlayerStats(player2);
        LeaderboardContract.PlayerStats memory stats3 = leaderboard
            .getPlayerStats(player3);

        assertEq(stats1.visitCount, 1); // Visited player2
        assertEq(stats1.matchCount, 1); // Matched by player2
        assertEq(stats1.totalRewards, 1 ether);

        assertEq(stats2.visitCount, 1); // Visited player3
        assertEq(stats2.matchCount, 1); // Matched by player3
        assertEq(stats2.totalRewards, 1 ether);

        assertEq(stats3.visitCount, 1); // Visited player1
        assertEq(stats3.matchCount, 0); // Matched player2
        assertEq(stats3.totalRewards, 0); // No reward distributed

        assertEq(leaderboard.getPrizePool(), 1 ether); // Remaining prize pool
    }

    function testGameFlowWithMultipleVisits() public {
        // Setup: All players have avatars
        vm.prank(player1);
        avatarNFT.mint(FID1, "https://supabase.com/avatar1.png");

        vm.prank(player2);
        avatarNFT.mint(FID2, "https://supabase.com/avatar2.png");

        vm.prank(player3);
        avatarNFT.mint(FID3, "https://supabase.com/avatar3.png");

        // Player1 visits both Player2 and Player3
        leaderboard.recordVisit(player1, player2);
        leaderboard.recordVisit(player1, player3);

        // Player2 visits Player3
        leaderboard.recordVisit(player2, player3);

        // Player3 visits Player1
        leaderboard.recordVisit(player3, player1);

        // Some matches occur
        leaderboard.recordMatch(player2, player1); // Player2 likes Player1
        leaderboard.recordMatch(player3, player1); // Player3 likes Player1

        // Verify Player1 is the most popular (2 matches)
        LeaderboardContract.PlayerStats memory stats1 = leaderboard
            .getPlayerStats(player1);
        LeaderboardContract.PlayerStats memory stats2 = leaderboard
            .getPlayerStats(player2);
        LeaderboardContract.PlayerStats memory stats3 = leaderboard
            .getPlayerStats(player3);

        assertEq(stats1.visitCount, 2); // Visited 2 houses
        assertEq(stats1.matchCount, 2); // Got 2 matches

        assertEq(stats2.visitCount, 1); // Visited 1 house
        assertEq(stats2.matchCount, 0); // Got 1 match

        assertEq(stats3.visitCount, 1); // Visited 1 house
        assertEq(stats3.matchCount, 0); // Made 2 matches
    }

    function testPrizeDistribution() public {
        // Setup players with avatars
        vm.prank(player1);
        avatarNFT.mint(FID1, "https://supabase.com/avatar1.png");

        vm.prank(player2);
        avatarNFT.mint(FID2, "https://supabase.com/avatar2.png");

        // Fund prize pool
        leaderboard.fundPrizePool{value: 10 ether}();

        // Simulate some game activity
        leaderboard.recordVisit(player1, player2);
        leaderboard.recordMatch(player2, player1);

        // Distribute rewards
        address[] memory players = new address[](1);
        players[0] = player1;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 5 ether;

        uint256 player1BalanceBefore = player1.balance;

        leaderboard.distributeRewards(players, amounts);

        assertEq(player1.balance, player1BalanceBefore + 5 ether);
        assertEq(leaderboard.getPrizePool(), 5 ether);

        // Verify player stats
        LeaderboardContract.PlayerStats memory stats1 = leaderboard
            .getPlayerStats(player1);
        assertEq(stats1.totalRewards, 5 ether);
    }

    function testGasOptimization() public {
        // Test gas usage for common operations
        vm.prank(player1);
        avatarNFT.mint(FID1, "https://supabase.com/avatar1.png");

        uint256 gasStart = gasleft();
        leaderboard.recordVisit(player1, player2);
        uint256 gasUsed = gasStart - gasleft();

        // Gas usage should be reasonable (adjust threshold as needed)
        assertLt(gasUsed, 100000); // Less than 100k gas

        gasStart = gasleft();
        leaderboard.recordMatch(player2, player1);
        gasUsed = gasStart - gasleft();

        assertLt(gasUsed, 100000); // Less than 100k gas
    }
}
