// @ts-nocheck
import { Agent } from "@xmtp/agent-sdk";
import { getTestUrl } from "@xmtp/agent-sdk/debug";

process.loadEnvFile(".env");

// 2. Spin up the agent
const agent = await Agent.createFromEnv({
  env: "dev", // or 'production' for base app
});

// 3. Respond to text messages
agent.on("text", async (ctx) => {
  await ctx.sendText("Hello from my XMTP Agent! 👋");
});

// 4. Log when we're ready
agent.on("start", () => {
  console.log(`We are online: ${getTestUrl(agent.client)}`);
});

await agent.start();
