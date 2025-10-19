# Trick or TrETH – Base Mini App MVP

![hero](https://github.com/user-attachments/assets/7693231b-e4bc-45eb-bd25-214411ee2169)


## Project Overview  
An 8-bit Halloween social game where users create pixel avatars (minted as NFTs), visit neighbours’ “houses” to leave messages, and swipe on visitors. The most popular players earn ETH rewards.

## Tech Stack  
- **Frontend**: Next.js mini-app with Farcaster Mini App SDK  
- **Auth**: Quick Auth (Sign-in with Farcaster)  
- **Database**: Supabase (player profiles, avatars, visit records)  
- **Blockchain**: Base network (ERC-721 avatar NFTs, leaderboard contract), XMTP Bot, ENS Addresses.  
- **NFT Storage**: Supabase Storage (avatar images)

## Core Implementation  

### Smart Contracts  
- **AvatarNFT.sol** (ERC-721)  
  - `mint(string memory tokenURI)` for avatar creation  
  - Gasless mint via paymaster fallback to user-paid transaction  
  - `tokenURI(uint256 tokenId)` returns the Supabase storage URL  
  - Tracks mapping: Farcaster FID → tokenId  
- **LeaderboardContract.sol**  
  - Records visits: `recordVisit(address visitor, address homeOwner)`  
  - Records matches (swipe right): `recordMatch(address homeOwner, address visitor)`  
  - `getLeaderboard()` returns top players by match count  
  - Owner-funded prize pool and `withdrawRewards()` for top players  
  - Events: `VisitRecorded`, `MatchMade`

Please refer project.md for more details.
