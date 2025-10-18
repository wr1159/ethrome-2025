// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/LeaderboardContract.sol";

contract LeaderboardContractTest is Test {
    LeaderboardContract public leaderboard;
    address public owner;
    address public player1;
    address public player2;
    address public player3;

    // Allow the test contract to receive ETH
    receive() external payable {}

    event VisitRecorded(address indexed visitor, address indexed homeOwner);
    event MatchMade(address indexed homeOwner, address indexed visitor);
    event RewardsDistributed(address indexed player, uint256 amount);
    event PrizePoolFunded(uint256 amount);

    function setUp() public {
        owner = address(this);
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");
        player3 = makeAddr("player3");

        leaderboard = new LeaderboardContract();
    }

    function testInitialState() public view {
        assertEq(leaderboard.owner(), owner);
        assertEq(leaderboard.getPrizePool(), 0);
    }

    function testRecordVisit() public {
        vm.expectEmit(true, true, false, false);
        emit VisitRecorded(player1, player2);

        leaderboard.recordVisit(player1, player2);

        LeaderboardContract.PlayerStats memory stats1 = leaderboard
            .getPlayerStats(player1);
        LeaderboardContract.PlayerStats memory stats2 = leaderboard
            .getPlayerStats(player2);

        assertEq(stats1.visitCount, 1);
        assertEq(stats1.matchCount, 0);
        assertEq(stats1.totalRewards, 0);
        assertTrue(stats1.exists);

        assertEq(stats2.visitCount, 0);
        assertEq(stats2.matchCount, 0);
        assertEq(stats2.totalRewards, 0);
        assertTrue(stats2.exists);
    }

    function testRecordMatch() public {
        vm.expectEmit(true, true, false, false);
        emit MatchMade(player2, player1);

        leaderboard.recordMatch(player2, player1);

        LeaderboardContract.PlayerStats memory stats1 = leaderboard
            .getPlayerStats(player1);
        LeaderboardContract.PlayerStats memory stats2 = leaderboard
            .getPlayerStats(player2);

        assertEq(stats1.visitCount, 0);
        assertEq(stats1.matchCount, 1); // Visitor gets the match count
        assertEq(stats1.totalRewards, 0);
        assertTrue(stats1.exists);

        assertEq(stats2.visitCount, 0);
        assertEq(stats2.matchCount, 0); // Homeowner doesn't get match count
        assertEq(stats2.totalRewards, 0);
        assertTrue(stats2.exists);
    }

    function testCannotVisitSelf() public {
        vm.expectRevert("Cannot visit yourself");
        leaderboard.recordVisit(player1, player1);
    }

    function testCannotMatchSelf() public {
        vm.expectRevert("Cannot match yourself");
        leaderboard.recordMatch(player1, player1);
    }

    function testCannotVisitZeroAddress() public {
        vm.expectRevert("Invalid addresses");
        leaderboard.recordVisit(address(0), player1);

        vm.expectRevert("Invalid addresses");
        leaderboard.recordVisit(player1, address(0));
    }

    function testFundPrizePool() public {
        uint256 amount = 1 ether;

        vm.expectEmit(false, false, false, true);
        emit PrizePoolFunded(amount);

        leaderboard.fundPrizePool{value: amount}();

        assertEq(leaderboard.getPrizePool(), amount);
        assertEq(address(leaderboard).balance, amount);
    }

    function testDistributeRewards() public {
        // Fund prize pool
        uint256 prizeAmount = 2 ether;
        leaderboard.fundPrizePool{value: prizeAmount}();

        address[] memory players = new address[](2);
        players[0] = player1;
        players[1] = player2;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 0.5 ether;
        amounts[1] = 1 ether;

        uint256 player1BalanceBefore = player1.balance;
        uint256 player2BalanceBefore = player2.balance;

        leaderboard.distributeRewards(players, amounts);

        assertEq(player1.balance, player1BalanceBefore + 0.5 ether);
        assertEq(player2.balance, player2BalanceBefore + 1 ether);
        assertEq(leaderboard.getPrizePool(), 0.5 ether);

        LeaderboardContract.PlayerStats memory stats1 = leaderboard
            .getPlayerStats(player1);
        LeaderboardContract.PlayerStats memory stats2 = leaderboard
            .getPlayerStats(player2);

        assertEq(stats1.totalRewards, 0.5 ether);
        assertEq(stats2.totalRewards, 1 ether);
    }

    function testCannotDistributeMoreThanPrizePool() public {
        leaderboard.fundPrizePool{value: 1 ether}();

        address[] memory players = new address[](1);
        players[0] = player1;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 2 ether; // More than prize pool

        vm.expectRevert("Insufficient prize pool");
        leaderboard.distributeRewards(players, amounts);
    }

    function testCannotDistributeToZeroAddress() public {
        leaderboard.fundPrizePool{value: 1 ether}();

        address[] memory players = new address[](1);
        players[0] = address(0);

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 0.5 ether;

        vm.expectRevert("Invalid player address");
        leaderboard.distributeRewards(players, amounts);
    }

    function testWithdrawFunds() public {
        leaderboard.fundPrizePool{value: 1 ether}();

        uint256 ownerBalanceBefore = owner.balance;

        leaderboard.withdrawFunds();

        assertEq(owner.balance, ownerBalanceBefore + 1 ether);
        assertEq(address(leaderboard).balance, 0);
    }

    function testOnlyOwnerCanDistributeRewards() public {
        vm.prank(player1);
        vm.expectRevert();
        leaderboard.distributeRewards(new address[](0), new uint256[](0));
    }

    function testOnlyOwnerCanWithdrawFunds() public {
        leaderboard.fundPrizePool{value: 1 ether}();

        vm.prank(player1);
        vm.expectRevert();
        leaderboard.withdrawFunds();
    }

    function testMultipleVisitsAndMatches() public {
        // Record multiple visits
        leaderboard.recordVisit(player1, player2);
        leaderboard.recordVisit(player1, player3);
        leaderboard.recordVisit(player2, player3);

        // Record matches
        leaderboard.recordMatch(player2, player1);
        leaderboard.recordMatch(player3, player1);

        LeaderboardContract.PlayerStats memory stats1 = leaderboard
            .getPlayerStats(player1);
        LeaderboardContract.PlayerStats memory stats2 = leaderboard
            .getPlayerStats(player2);
        LeaderboardContract.PlayerStats memory stats3 = leaderboard
            .getPlayerStats(player3);

        assertEq(stats1.visitCount, 2);
        assertEq(stats1.matchCount, 2); // Player1 got 2 matches

        assertEq(stats2.visitCount, 1);
        assertEq(stats2.matchCount, 0); // Player2 didn't get any matches

        assertEq(stats3.visitCount, 0);
        assertEq(stats3.matchCount, 0); // Player3 didn't get any matches
    }

    function testFuzzRecordVisit(address visitor, address homeOwner) public {
        vm.assume(visitor != address(0));
        vm.assume(homeOwner != address(0));
        vm.assume(visitor != homeOwner);

        leaderboard.recordVisit(visitor, homeOwner);

        LeaderboardContract.PlayerStats memory visitorStats = leaderboard
            .getPlayerStats(visitor);
        assertEq(visitorStats.visitCount, 1);
        assertTrue(visitorStats.exists);
    }
}
