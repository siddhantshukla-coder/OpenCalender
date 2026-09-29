const pageUrl = "https://summerofcode.withgoogle.com/programs/2026";

async function checkGSoC() {
  console.log("Downloading GSoC page...");

  const response = await fetch(pageUrl);
  const html = await response.text();

  // Find the main JavaScript bundle
  const match = html.match(
    /<script[^>]+src=["']([^"']*main[^"']*\.js)["']/i
  );

  if (!match) {
    throw new Error("Could not find main JavaScript bundle.");
  }

  const scriptUrl = new URL(match[1], pageUrl).href;

  console.log("Found bundle:");
  console.log(scriptUrl);

  console.log("\nDownloading bundle...");

  const scriptResponse = await fetch(scriptUrl);
  const script = await scriptResponse.text();

  console.log(`Downloaded ${script.length} characters.`);

  // Search for likely API/data references
  const keywords = [
    "/api/",
    "graphql",
    "timeline",
    "program/",
    "calendar",
    "schedule"
  ];

  console.log("\nMatches:");

  for (const keyword of keywords) {
    console.log(
      `${keyword}: ${script.includes(keyword)}`
    );
  }

  // Print URLs containing API-like paths
  const urls = script.match(
    /https?:\/\/[^"'\\\s]+/g
  ) || [];

  console.log("\nPossible API URLs:");

  for (const url of urls) {
    if (
      url.includes("api") ||
      url.includes("graphql")
    ) {
      console.log(url);
    }
  }
}

checkGSoC().catch((error) => {
  console.error(error);
  process.exit(1);
});