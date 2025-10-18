// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/AvatarNFT.sol";

contract AvatarNFTTest is Test {
    AvatarNFT public avatarNFT;
    address public owner;
    address public user1;
    address public user2;

    uint256 public constant FID1 = 12345;
    uint256 public constant FID2 = 67890;
    string public constant TOKEN_URI = "https://supabase.com/avatar1.png";

    event AvatarMinted(
        uint256 indexed tokenId,
        uint256 indexed fid,
        string tokenURI
    );

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        avatarNFT = new AvatarNFT("Trick or TrETH Avatars", "TOTA");
    }

    function testInitialState() public {
        assertEq(avatarNFT.name(), "Trick or TrETH Avatars");
        assertEq(avatarNFT.symbol(), "TOTA");
        assertEq(avatarNFT.owner(), owner);
    }

    function testMint() public {
        vm.prank(user1);
        uint256 tokenId = avatarNFT.mint(FID1, TOKEN_URI);

        assertEq(tokenId, 1);
        assertEq(avatarNFT.ownerOf(tokenId), user1);
        assertEq(avatarNFT.getTokenIdByFid(FID1), tokenId);
        assertEq(avatarNFT.getFidByTokenId(tokenId), FID1);
        assertTrue(avatarNFT.hasAvatar(FID1));
    }

    function testMintEmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit AvatarMinted(1, FID1, TOKEN_URI);

        vm.prank(user1);
        avatarNFT.mint(FID1, TOKEN_URI);
    }

    function testCannotMintWithZeroFID() public {
        vm.prank(user1);
        vm.expectRevert("Invalid FID");
        avatarNFT.mint(0, TOKEN_URI);
    }

    function testMultipleMints() public {
        vm.prank(user1);
        uint256 tokenId1 = avatarNFT.mint(FID1, TOKEN_URI);

        vm.prank(user2);
        uint256 tokenId2 = avatarNFT.mint(
            FID2,
            "https://supabase.com/avatar2.png"
        );

        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(avatarNFT.getTokenIdByFid(FID1), tokenId1);
        assertEq(avatarNFT.getTokenIdByFid(FID2), tokenId2);
        assertTrue(avatarNFT.hasAvatar(FID1));
        assertTrue(avatarNFT.hasAvatar(FID2));
    }

    // function testSetBaseURI() public {
    //     string memory newBaseURI = "https://api.trickortreth.com/metadata/";
    //     avatarNFT.setBaseURI(newBaseURI);
    //     assertEq(avatarNFT._baseURI(), newBaseURI);
    // }

    function testOnlyOwnerCanSetBaseURI() public {
        vm.prank(user1);
        vm.expectRevert();
        avatarNFT.setBaseURI("https://malicious.com/");
    }

    function testTokenURI() public {
        string memory baseURI = "https://api.trickortreth.com/metadata/";
        avatarNFT.setBaseURI(baseURI);

        vm.prank(user1);
        uint256 tokenId = avatarNFT.mint(FID1, TOKEN_URI);

        string memory expectedURI = string(
            abi.encodePacked(baseURI, vm.toString(tokenId))
        );
        assertEq(avatarNFT.tokenURI(tokenId), expectedURI);
    }

    function testFuzzMint(uint256 fid) public {
        vm.assume(fid > 0);
        vm.assume(fid <= type(uint256).max);

        vm.prank(user1);
        uint256 tokenId = avatarNFT.mint(fid, TOKEN_URI);

        assertEq(avatarNFT.getTokenIdByFid(fid), tokenId);
        assertEq(avatarNFT.getFidByTokenId(tokenId), fid);
        assertTrue(avatarNFT.hasAvatar(fid));
    }
}
