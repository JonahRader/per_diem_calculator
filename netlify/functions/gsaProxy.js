import fetch from 'node-fetch';

exports.handler = async function(event, context) {
  // Get parameters from query string
  const { city, state, zip, year } = event.queryStringParameters;

  // Define the GSA API endpoint based on the provided parameters
  let apiUrl = `https://api.gsa.gov/travel/perdiem/v2/rates/city/${city}/state/${state}/year/${year}`;

  // If a ZIP code is provided, use it to form the URL
  if (zip) {
    apiUrl = `https://api.gsa.gov/travel/perdiem/v2/rates/zip/${zip}/year/${year}`;
  }

  try {
    // Fetch data from the GSA API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-API-KEY': process.env.GSA_API_KEY, // Use the GSA API key stored in environment variables
      }
    });

    // Parse the response JSON
    const data = await response.json();

    // Return the data in a properly formatted JSON response
    return {
      statusCode: 200,
      body: JSON.stringify({
        rates: data.rates // Assuming the 'rates' field contains the necessary information
      }),
    };
  } catch (error) {
    console.error("Error fetching data:", error);

    // Return an error response in case of a failure
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch data from GSA API" }),
    };
  }
};

