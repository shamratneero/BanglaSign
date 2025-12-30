import DashboardLayout from "./DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <h1>Welcome to Project Tango</h1>
      <p>This is your dashboard shell.</p>

      <div className="cardGrid">
        <div className="card">Stat A</div>
        <div className="card">Stat B</div>
        <div className="card">Stat C</div>
      </div>
    </DashboardLayout>
  );
}
