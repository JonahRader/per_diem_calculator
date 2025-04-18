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

    // Log the full response for debugging
    console.log('Full GSA API Response:', JSON.stringify(data, null, 2));
    console.log('Response structure:', {
      hasRates: !!data.rates,
      ratesLength: data.rates?.length,
      firstRate: data.rates?.[0],
      mieValue: data.rates?.[0]?.rate?.[0]?.mie,
      mealsValue: data.rates?.[0]?.rate?.[0]?.meals
    });

    // Return the data in a properly formatted JSON response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),  // Return the complete data object
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

