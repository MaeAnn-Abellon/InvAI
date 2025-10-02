import React from "react";
import sLogo from "../../assets/sLogo.png"; // adjust the path if needed

const sectionStyle = {
  backgroundColor: "white",
  padding: "20px",
  marginBottom: "24px",
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "white",
  padding: "16px 24px",
  borderBottom: "1px solid #ddd",
};

const logoStyle = {
  height: "40px",
  marginRight: "12px",
};

const titleStyle = {
  fontSize: "1.25rem",
  fontWeight: "bold",
  color: "#333",
};

const buttonStyle = {
  marginLeft: "10px",
  backgroundColor: "#1e40af",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer",
};

const statBox = {
  backgroundColor: "#e0ecff",
  padding: "16px",
  borderRadius: "10px",
  textAlign: "center",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "12px",
};

const thStyle = {
  padding: "10px",
  borderBottom: "1px solid #ccc",
  textAlign: "left",
  backgroundColor: "#f1f5f9",
  fontWeight: "600",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #ccc",
  textAlign: "left",
};

const AdminDashboardPage = () => {
  return (
    <div style={{ fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f8f9fc" }}>
      {/* Header Bar */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={sLogo} alt="Logo" style={logoStyle} />
          <span style={titleStyle}>SmartStock Admin Dashboard</span>
        </div>
        <div>
          <button style={buttonStyle}>Settings</button>
          <button style={buttonStyle}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "24px" }}>
        {/* Welcome Section */}
        <section style={{ ...sectionStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Welcome, Admin!</h1>
            <p>Here's an overview of the SmartStock system.</p>
          </div>
          <img src={sLogo} alt="Logo" style={{ height: "120px" }} />
        </section>

        {/* Quick Stats */}
        <section
          style={{
            ...sectionStyle,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {["Total Supplies", "Out-of-Stock Items", "Most Voted Item", "AI Prediction Summary"].map((title, i) => (
            <div key={i} style={statBox}>
              <h2>{title}</h2>
              <p>[Dynamic Data Here]</p>
            </div>
          ))}
        </section>

        {/* AI Notifications */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>AI Notifications</h2>
          <ul style={{ paddingLeft: "20px", color: "#333" }}>
            <li>Low stock alert: Printer Ink</li>
            <li>Anomaly detected: Sudden spike in alcohol usage</li>
          </ul>
        </section>

        {/* Inventory Management */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Inventory Management</h2>
          <div>
            {["View All Supplies", "Add New Item", "Edit / Delete Items", "Mark as Replenished", "Upload CSV"].map(
              (text, i) => (
                <button key={i} style={{ ...buttonStyle, margin: "6px" }}>
                  {text}
                </button>
              )
            )}
          </div>
        </section>

        {/* AI Prediction & Anomaly Detection */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>AI Predictions & Anomalies</h2>
          <div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Item</th>
                  <th style={thStyle}>Predicted Need</th>
                  <th style={thStyle}>Confidence</th>
                  <th style={thStyle}>Anomaly Flag</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Whiteboard Marker</td>
                  <td style={tdStyle}>45 units</td>
                  <td style={tdStyle}>92%</td>
                  <td style={tdStyle}>Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Voting Results */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Voting Results</h2>
          <div style={{ marginBottom: "12px" }}>
            <label>Filter by department:</label>
            <select style={{ marginLeft: "8px", padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}>
              <option>All</option>
              <option>IT</option>
              <option>Science</option>
              <option>HR</option>
            </select>
          </div>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Extension Cord – 123 votes</li>
            <li>Ethernet Cable – 97 votes</li>
            <li>Alcohol – 80 votes</li>
          </ul>
        </section>

        {/* User Management */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>User Management</h2>
          <div>
            {["View Users", "Assign Roles", "Suspend/Delete"].map((btn, i) => (
              <button key={i} style={{ ...buttonStyle, margin: "6px" }}>
                {btn}
              </button>
            ))}
          </div>
        </section>

        {/* Reports Section */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Reports & Logs</h2>
          <div>
            <button style={{ ...buttonStyle, backgroundColor: "#374151", margin: "6px" }}>Generate CSV Report</button>
            <button style={{ ...buttonStyle, backgroundColor: "#4b5563", margin: "6px" }}>Export as PDF</button>
            <p style={{ fontSize: "0.875rem", color: "#555" }}>Recent Activity Logs: [To be integrated]</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
