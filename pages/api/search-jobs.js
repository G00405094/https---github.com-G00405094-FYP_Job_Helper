const API_URL = "https://findwork.dev/api/jobs/";

export default async function handler(req, res) {
  const { query, location } = req.query;

  const API_KEY = process.env.FINDWORK_API_KEY;

  // Check if API key is available
  if (!API_KEY) {
    return res
      .status(500)
      .json({ error: "API key is missing. Please set it in .env.local." });
  }

  try {
    // Construct query parameters
    const url = new URL(API_URL);
    url.searchParams.append("search", query);
    url.searchParams.append("location", location);
    

    // Make API request using fetch
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Return only the results array if it exists
    if (data && data.results) {
      res.status(200).json(data.results);
    } else {
      res.status(404).json({ message: "No jobs found for the given criteria." });
    }
  } catch (error) {
    console.error("Error fetching jobs from Findwork API:", error.message);
    res.status(500).json({ error: "Failed to fetch job data." });
  }
}
