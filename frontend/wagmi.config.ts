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
          84532: "0xBf6E80f79a6138f2f022901D94c57dc67f9F394A",
        },
        LeaderboardContract: {
          84532: "0x7840680678170447f08D1a03Edc1744BFDdf4cb9",
        },
      },
    }),
  ],
});
