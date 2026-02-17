const DashboardCard = ({ title, value }) => {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        flex: "1",
        minWidth: "200px"
      }}
    >
      <h4 style={{ marginBottom: "10px", color: "#555" }}>{title}</h4>
      <h2 style={{ margin: 0 }}>{value}</h2>
    </div>
  );
};

export default DashboardCard;
