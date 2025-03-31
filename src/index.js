
import React from "react";
import ReactDOM from "react-dom";
import "./index.css"; // import the CSS file
import PerDiemCalculator from "./PerDiemCalculator"; // import the PerDiemCalculator component

// Rendering the PerDiemCalculator component into the root div of index.html
ReactDOM.render(
  <React.StrictMode>
    <PerDiemCalculator />
  </React.StrictMode>,
  document.getElementById("root")
);
