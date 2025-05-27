import React from "react";
import "./index.css"; // Import the CSS

function CorrelationTable({ rawData, processData, computeCorrelations }) {
  const processed = processData(rawData);
  const correlations = computeCorrelations(processed);

  return (
    <div className="correlation-container">
      <table className="correlation-table">
        <thead>
          <tr>
            <th>Variable Pair</th>
            <th>Correlation</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(correlations).map(([label, value]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{value.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CorrelationTable;
