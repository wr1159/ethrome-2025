const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : `http://localhost:3000`);

export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjQ2NTU0NiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDVCRDA2NEFlNUYxMUMwNzgxQUQyMjU2OEQzMWNDQzYzOEREMkNmY2IifQ",
    payload: "eyJkb21haW4iOiJ0cmljay1vci10cmV0aC52ZXJjZWwuYXBwIn0",
    signature:
      "1lSoXXA16NWfXOPrD6rct3JSfATLG8l93GASY86PSlIeHLKauRnT31BEoLmBC/hzn0DYs/xqXHFsCBFQWRTyxxs=",
  },
  miniapp: {
    version: "1",
    name: "Trick or TrETH",
    subtitle: "Put on your best costume!",
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
    tagline: "Put on your best costume!",
    ogTitle: "Trick or TrETH",
    ogDescription: "Put on your best costume and go trick or trething!",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
