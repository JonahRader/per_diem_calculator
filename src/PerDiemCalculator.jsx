import React, { useState } from "react";
import chcLogo from "./chc-logo.png";

const PerDiemCalculator = () => {
  const [jobLocation, setJobLocation] = useState({ city: "", state: "", zip: "" });
  const [currentRate, setCurrentRate] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fiscalYear = "2025";

  const fetchCurrentRates = async () => {
    setLoading(true);
    setError(null);
    setCurrentRate(null);

    let proxyUrl = "";
    if (jobLocation.zip) {
      proxyUrl = `/.netlify/functions/gsaProxy?zip=${jobLocation.zip}&year=${fiscalYear}`;
    } else if (jobLocation.city && jobLocation.state) {
      proxyUrl = `/.netlify/functions/gsaProxy?city=${jobLocation.city}&state=${jobLocation.state}&year=${fiscalYear}`;
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
        const currentMonth = new Date().getMonth() + 1;
        const matchingRate = rates.find((rate) => parseInt(rate.month) === currentMonth);
        if (!matchingRate) {
          setError(`No data found for the current month (${currentMonth}).`);
        } else {
          setCurrentRate(matchingRate);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
    }
    setLoading(false);
  };

  const formatCurrency = (value) => `$${parseFloat(value).toFixed(2)}`;

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
            onChange={(e) => setJobLocation({ ...jobLocation, state: e.target.value.toUpperCase() })}
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
      </div>

      <button onClick={fetchCurrentRates} style={{ padding: "10px 20px", cursor: "pointer" }}>
        Fetch Current GSA Rates
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
          <p><strong>For Month {currentRate.month}:</strong></p>
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
