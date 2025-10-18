import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [],
  plugins: [
    foundry({
      project: "../contracts",
      deployments: {
        AvatarNFT: {
          // 84532: "0xBf6E80f79a6138f2f022901D94c57dc67f9F394A",
          84532: "0x3859f1Bd04C1Dd9Df9cd37C0bA4756e0EA24AEfd", // new one with multiple mints
        },
        LeaderboardContract: {
          // 84532: "0x7840680678170447f08D1a03Edc1744BFDdf4cb9",
          84532: "0x12104e09e35e1319b1Bc19b3dBb487bE59D08c8c", // new one with fundPrizePool for all
        },
      },
    }),
  ],
});
