# Trick or TrETH - Base Mini App MVP

## Project Overview

An 8-bit Halloween social game where users create pixel avatars (minted as NFTs), visit neighbors' houses to leave messages, and swipe on visitors. Most popular players earn ETH rewards.

## Tech Stack

- **Frontend**: Next.js mini app with @farcaster/miniapp-sdk
- **Auth**: Quick Auth (Sign-in with Farcaster)
- **Database**: Supabase (player profiles, avatars, visit records)
- **Blockchain**: Base (ERC721 avatar NFTs, leaderboard contract)
- **NFT Storage**: Supabase Storage (avatar images)

## Core Implementation

### 1. Smart Contracts (Solidity)

**AvatarNFT.sol** (ERC721)

- `mint(string memory tokenURI)` - Gasless mint via paymaster (fallback to user-paid)
- `tokenURI(uint256 tokenId)` returns Supabase storage URL
- Track FID → tokenId mapping

**LeaderboardContract.sol**

- Store visit counts and "trETH" matches
- `recordVisit(address visitor, address homeOwner)`
- `recordMatch(address homeOwner, address visitor)` - homeOwner swipes right
- `getLeaderboard()` returns top players by match count
- Owner-funded prize pool with `withdrawRewards()` for top players
- Events: `VisitRecorded`, `MatchMade`

### 2. Supabase Setup

**Tables**:

```sql
-- players
CREATE TABLE players (
  fid BIGINT PRIMARY KEY,
  username TEXT,
  address TEXT UNIQUE,
  token_id BIGINT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- visits  
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_fid BIGINT REFERENCES players(fid),
  homeowner_fid BIGINT REFERENCES players(fid),
  message TEXT,
  matched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_visits_homeowner ON visits(homeowner_fid, created_at DESC);
CREATE INDEX idx_visits_visitor ON visits(visitor_fid);
```

**Storage Bucket**: `avatars` (public read access)

**RLS Policies**: Enable read for all, write for authenticated users

### 3. Backend API Routes

**`/api/auth/route.ts`** - Quick Auth verification

- Verify JWT from miniapp-sdk
- Return FID and create/fetch user from Supabase
- Reference: <https://docs.base.org/mini-apps/core-concepts/authentication>

**`/api/avatar/upload/route.ts`** - Upload avatar

- Accept base64 image data
- Save to Supabase Storage
- Return public URL

**`/api/avatar/mint/route.ts`** - Mint NFT

- Frontend calls AvatarNFT.mint() directly with user's wallet
  - Try gasless first (paymaster), fallback to user EOA
- Backend only records the mint result in database (token_id, transaction hash)
- No backend contract signing

**`/api/players/route.ts`** - Get all players with avatars

**`/api/visits/create/route.ts`** - Record visit

- Create visit record in Supabase database only
- Frontend calls LeaderboardContract.recordVisit() directly with user's wallet
- Backend only stores the visit data, no contract interaction

**`/api/visits/[fid]/route.ts`** - Get visits for homeowner

**`/api/visits/match/route.ts`** - Record match (swipe right)

- Update visit.matched = true in database
- Frontend calls LeaderboardContract.recordMatch() directly with user's wallet
- Backend only updates database, no contract signing

**`/api/leaderboard/route.ts`** - Get top players

### 4. Frontend Components

**Authentication Flow**:

```typescript
// src/hooks/useAuth.ts
- useQuickAuth() hook wrapping sdk.quickAuth.getToken()
- Store JWT in memory/localStorage
- Fetch user data from /api/auth on mount
```

**Main App Structure**:

```
src/app/
  page.tsx → Home (routing logic)
  
src/components/
  game/
    home-screen.tsx - User's house view
      - Display visitors with avatar + message
      - Swipe interface (TinderCard or custom)
      - "Exit House" button
      
    neighborhood-screen.tsx - Visit other houses
      - Grid of houses with player avatars/ENS
      - Tap house → visit-dialog
      
    visit-dialog.tsx
      - Show homeowner avatar & address/ENS
      - Input for one-liner message
      - "Send" button
      
    avatar-creator.tsx - Pixel art editor
      - 30x50px canvas
      - 10-color palette (Halloween colors)
      - Pixel-by-pixel drawing
      - Clear button
      - "Mint Avatar" button → upload & mint flow
      
    leaderboard-screen.tsx - Top players
      
  ui/ (existing shadcn components)
```

**Key Files to Modify**:

- `src/app/app.tsx` - Replace Demo with game router
- `src/app/page.tsx` - Update metadata for Trick or TrETH
- `src/lib/utils.ts` - Update METADATA constant
- `src/types.ts` - Add game types (Player, Visit, etc.)

### 5. Pixel Art Editor Implementation

**Core Logic** (`src/components/game/avatar-creator.tsx`):

```typescript
- Use HTML5 Canvas with 30x50 grid
- State: pixels[][] array of color values
- Click handler: set pixel color
- 10-color palette: [orange, black, purple, white, green, red, yellow, brown, gray, dark-purple]
- Export as PNG: canvas.toDataURL()
- Tools: Draw (default), Erase (set to transparent)
- 8-bit pixel font styling with Press Start 2P
```

**Reach Goal Tools**: Fill bucket, undo/redo

### 6. Game Flow Logic

**First-time User**:

1. Land on HomeScreen
2. Check if has avatar (tokenId in DB)
3. If no → Show "Create Avatar" prompt
4. After minting → Enable "Exit House" button

**Visiting Flow**:

1. NeighborhoodScreen shows all players (except self)
2. Filter: only show players with minted avatars
3. Click house → Check if current user has avatar
4. If yes → VisitDialog, else → redirect to AvatarCreator
5. Submit message → API call → Show success toast

**Home Flow**:

1. Fetch visits where homeowner_fid = currentUser.fid
2. Display in card stack
3. Swipe left → Hide card (no action)
4. Swipe right → API call to /api/visits/match → Show "TrETH sent!" animation

### 7. Styling & 8-bit Theme

- Use pixel font: Add `Press Start 2P` from Google Fonts
- CSS animations for house hover effects
- Halloween color scheme: Orange (#FF6B2B), Purple (#6B2BFF), Black, Dark Green
- Pixel art icons for buttons
- Retro sound effects (optional, low priority)

### 8. Deployment Setup

**Environment Variables** (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_BASE_RPC_URL=
NEXT_PUBLIC_AVATAR_NFT_ADDRESS=
NEXT_PUBLIC_LEADERBOARD_ADDRESS=
# No PRIVATE_KEY needed - all contract calls from frontend
```

**Contract Deployment**:

1. Write comprehensive tests for both contracts
2. Deploy AvatarNFT to Base Sepolia (testnet first)
3. Deploy LeaderboardContract
4. Set up paymaster (Base Paymaster Service or skip for MVP)
5. Fund LeaderboardContract with prize pool ETH
6. Deploy to Base mainnet after testing

**Mini App Manifest**:

- Update fc:frame metadata in `page.tsx`
- Deploy to Vercel
- Test in Warpcast

## MVP Priority Order

### Phase 1 (Core Functionality)

1. ✅ Smart contracts deployed (with comprehensive tests)
2. Supabase setup
3. Quick Auth integration
4. Pixel avatar creator (basic draw only)
5. Avatar upload & mint flow
6. HomeScreen with visitor list (no swipe yet, just display)
7. NeighborhoodScreen grid
8. Visit dialog & message sending

### Phase 2 (Game Mechanics)

1. Swipe interface on HomeScreen
2. Match recording (contract + DB)
3. Leaderboard display
4. Basic 8-bit styling

### Phase 3 (Reach Goals - Time Permitting)

1. Gasless minting via paymaster
2. ENS resolution for player addresses
3. ENS text record update with avatar
4. Fill bucket & erase tools
5. Reward distribution mechanism
6. Sound effects & animations

## Key Dependencies to Add

```bash
yarn add @supabase/supabase-js
yarn add @farcaster/quick-auth
yarn add ethers # for contract interactions
yarn add canvas # for server-side image processing
yarn add react-spring # for swipe animations

## Smart Contract Development (Test-Driven)

**Setup with Foundry**:
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# In contracts/ directory
forge init --no-git trick-or-treth
cd trick-or-treth
forge install openzeppelin/openzeppelin-contracts
```

**Test Structure**:

```
contracts/
  src/
    AvatarNFT.sol
    LeaderboardContract.sol
  test/
    AvatarNFT.t.sol
    LeaderboardContract.t.sol
    Integration.t.sol
  script/
    Deploy.s.sol
  foundry.toml
```

**Test Coverage**:

- AvatarNFT: mint, tokenURI, FID mapping, access control
- LeaderboardContract: visit recording, match recording, prize distribution
- Integration tests: full game flow with mock data
- Gas optimization tests for paymaster compatibility
- Fuzz testing for edge cases

**Commands**:

```bash
forge test                    # Run all tests
forge test -vvv              # Verbose output
forge test --match-test testMint # Run specific test
forge coverage               # Coverage report
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast
```

## Critical Hackathon Notes

- **Timebox avatar editor**: Start with basic pixel click, skip fancy tools
- **Use mock data initially**: Don't wait for contracts to test UI
- **Parallel work**: Frontend team builds UI while smart contracts deploy
- **Fallbacks**: If paymaster fails, direct mint is acceptable
- **ENS as stretch**: Core game works without ENS, add at end
- **Leaderboard contract**: Can be simple mappings, no complex prize logic needed for demo

## Testing Checklist

- [x] Smart contract tests (AvatarNFT, LeaderboardContract, Integration)
- [x] Install supabase
- [x] Create & upload avatar
- [x] Mint NFT (with & without wallet)
- [ ] View neighborhood
- [ ] Visit house & send message
- [ ] Receive visit & swipe
- [ ] Leaderboard updates

## Files to Reference

- Existing Quick Auth: `src/components/actions/quick-auth.tsx`
- Provider setup: `src/app/providers.tsx`
- Wagmi config: `src/components/providers/wagmi-provider.tsx`
