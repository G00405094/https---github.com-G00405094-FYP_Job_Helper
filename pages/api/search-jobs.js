import axios from "axios";

const API_URL = "https://findwork.dev/api/jobs/";

export default async function handler(req, res) {
  const { query, location } = req.query;

  const API_KEY = process.env.FINDWORK_API_KEY;

  if (!API_KEY) {
    return res
      .status(500)
      .json({ error: "API key is missing. Please set it in .env.local." });
  }

  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Token ${API_KEY}`,
      },
      params: {
        search: query,
        location: location,
        remote: false, // Add if remote filter is needed
        limit: 5, // Limit results to 5 most relevant jobs
      },
    });

    if (response.data && response.data.results) {
      res.status(200).json(response.data.results); // Return only the results array
    } else {
      res.status(404).json({ message: "No jobs found for the given criteria." });
    }
  } catch (error) {
    console.error("Error fetching jobs from Findwork API:", error.message);
    res.status(500).json({ error: "Failed to fetch job data." });
  }
}
