import axios from "axios";

const API_URL = "https://findwork.dev/api/jobs/";
const API_KEY = "9b0687045f313bb5cd1ff9720ea420d0dfa78ea9"; // Replace with your actual API key

export const fetchJobs = async (searchTerm, location, isRemote) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Token ${API_KEY}`,
      },
      params: {
        search: searchTerm,
        location: location,
        remote: isRemote,
        limit: 10,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};
