const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : `http://localhost:3000`);

export const minikitConfig = {
  accountAssociation: {
    // this will be added in step 5
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "Trick or TrETH",
    subtitle: "Put on your best costume and visit your neighbors!",
    description:
      "A Halloween social activity where you create pixel avatars, visit neighbors, and go trick or trething!",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["halloween", "social", "game", "pixel", "avatars"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Put on your best costume and visit your neighbors!",
    ogTitle: "Trick or TrETH",
    ogDescription:
      "A Halloween social activity where you create pixel avatars, visit neighbors, and go trick or trething!",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
