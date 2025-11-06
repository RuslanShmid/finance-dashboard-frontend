import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Finance Dashboard</h1>
        <div className="user-info">
          <span className="user-name">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="user-email">{user?.email}</span>
        </div>
        <button onClick={signOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
      <div className="dashboard-content">
        <p>Welcome to your finance dashboard!</p>
      </div>
    </div>
  );
};

