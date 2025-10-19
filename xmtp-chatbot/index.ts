import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { BulkUsersByAddressResponse } from "@neynar/nodejs-sdk/build/api/models";
import { Agent, IdentifierKind } from "@xmtp/agent-sdk";
import { getTestUrl } from "@xmtp/agent-sdk/debug";

process.loadEnvFile(".env");
// Create resolver instance (uses web3.bio under the hood)
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY,
});
const client = new NeynarAPIClient(config);
const FRONTEND_URL = "https://trick-or-treth.vercel.app";

// 2. Spin up the agent
const agent = await Agent.createFromEnv({
  env: "dev", // or 'production' for base app
});

// 3. Respond to text messages
agent.on("text", async (ctx) => {
  const message = ctx.message.content.trim().toLowerCase();

  if (message === "/start") {
    await ctx.sendText(`🚀 Trick or TrETH Mini App:`);
    await ctx.sendText(`${FRONTEND_URL}`);
    return;
  }

  if (message === "/viewall") {
    const members = await ctx.conversation.members();

    // map all members to their address
    const memberAddresses = members.map((member) => {
      return member.accountIdentifiers.find(
        (id) => id.identifierKind === IdentifierKind.Ethereum
      )?.identifier;
    });
    const filteredMembersAddresses = memberAddresses.filter(
      (member) => member !== "0x022bdbfe8e2da93d4153563e77b409805fa34a5f"
    );

    // [key: string]: Array<User>;
    let nenynarUsers: BulkUsersByAddressResponse;
    try {
      nenynarUsers = await client.fetchBulkUsersByEthOrSolAddress({
        addresses: filteredMembersAddresses,
      });
    } catch (error) {
      console.error(error);
      await ctx.sendText("Error resolving fids");
      return;
    }
    const resolvedFids = Object.values(nenynarUsers)
      .flat()
      .map((user) => user.fid);
    const filteredResolvedFids = resolvedFids.filter((fid) => fid !== 0);
    console.log(filteredResolvedFids);

    await ctx.sendText(`🎃 View everyone's frames:`);
    for (const fid of filteredResolvedFids) {
      await ctx.sendText(`${FRONTEND_URL}/frame/${fid}`);
    }
    return;
  }

  // For any other message, show available commands
  await ctx.sendText(`Available commands:
/start - Open the Trick or TrETH mini app
/viewall - View all player frames in this chat`);
});

// 4. Log when we're ready
agent.on("start", () => {
  console.log(`We are online: ${getTestUrl(agent.client)}`);
});

await agent.start();
