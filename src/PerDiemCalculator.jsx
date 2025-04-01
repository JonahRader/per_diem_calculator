import React, { useState } from "react";
import chcLogo from "./chc-logo.png";

const PerDiemCalculator = () => {
  const [jobLocation, setJobLocation] = useState({ city: "", state: "", zip: "" });
  const [startDate, setStartDate] = useState(""); // Stores the date as a string
  const [currentRate, setCurrentRate] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // This will hold month names as strings (short format, Jan, Feb, etc.)
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Function to format the currency
  const formatCurrency = (value) => {
    if (isNaN(value)) return "$0.00";  // Handle any invalid value
    return `$${parseFloat(value).toFixed(2)}`;
  };

  // Function to fetch per diem rates
  const fetchCurrentRates = async () => {
    // Ensure a start date is provided
    if (!startDate) {
      setError("Please provide a start date.");
      return;
    }

    // Parse the start date to extract month and year
    const dateObj = new Date(startDate);
    const month = monthNames[dateObj.getMonth()]; // Get the abbreviated month name (Jan, Feb, etc.)
    const year = dateObj.getFullYear(); // Extract the year from the start date as a number

    setLoading(true);
    setError(null);
    setCurrentRate(null);

    let proxyUrl = "";
    if (jobLocation.zip) {
      proxyUrl = `/.netlify/functions/gsaProxy?zip=${jobLocation.zip}&year=${year}&month=${month}`;
    } else if (jobLocation.city && jobLocation.state) {
      proxyUrl = `/.netlify/functions/gsaProxy?city=${jobLocation.city}&state=${jobLocation.state}&year=${year}&month=${month}`;
    } else {
      setError("Please provide either a ZIP code or both city and state.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(proxyUrl);
      const result = await response.json();
      const rates = result?.rates;

      if (!rates || rates.length === 0) {
        setError("No data found for this location/year.");
      } else {
        // Extract matching rate for the selected month
        const matchedRate = rates[0]?.rate?.find((rate) => {
          return rate.months.month.some((monthObj) => monthObj.short === month);
        });

        if (matchedRate) {
          setCurrentRate(matchedRate);
        } else {
          setError(`No data found for the selected month (${month}).`);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <header style={{ textAlign: "center", marginBottom: "20px" }}>
        <img src={chcLogo} alt="CHC Logo" style={{ maxWidth: "200px", height: "auto" }} />
        <h2>📍 Per Diem Calculator</h2>
      </header>

      <div style={{ marginBottom: "20px" }}>
        <div>
          <label>City</label>
          <input
            type="text"
            value={jobLocation.city}
            onChange={(e) => setJobLocation({ ...jobLocation, city: e.target.value })}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>State (2-letter)</label>
          <input
            type="text"
            value={jobLocation.state}
            onChange={(e) =>
              setJobLocation({ ...jobLocation, state: e.target.value.toUpperCase() })
            }
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>ZIP Code (Optional)</label>
          <input
            type="text"
            value={jobLocation.zip}
            onChange={(e) => setJobLocation({ ...jobLocation, zip: e.target.value })}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: "48%" }}>
            <label>Month</label>
            <input
              type="month"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
          </div>

          <div style={{ width: "48%" }}>
            <label>Year</label>
            <input
              type="text"
              value={new Date(startDate).getFullYear()}
              onChange={(e) => setStartDate(`${new Date().getMonth() + 1}-${e.target.value}`)}
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
          </div>
        </div>
      </div>

      <button onClick={fetchCurrentRates} style={{ padding: "10px 20px", cursor: "pointer" }}>
        Fetch GSA Rates
      </button>

      {loading && <p>Loading...</p>}
      {currentRate && (
        <div
          style={{
            marginTop: "20px",
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <p>
            <strong>For Month {startDate.substring(5, 7)} ({startDate.substring(0, 4)}):</strong>
          </p>
          <p>🏠 Housing (Daily): {formatCurrency(currentRate.value)}</p>
          <p>🍽️ M&IE (Daily): {formatCurrency(currentRate.meals)}</p>
          <p>
            💰 Total Weekly:{" "}
            {formatCurrency(
              (parseFloat(currentRate.value) + parseFloat(currentRate.meals)) * 7
            )}
          </p>
        </div>
      )}
      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}
    </div>
  );
};

export default PerDiemCalculator;

