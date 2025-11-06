import { useAuth } from './contexts/AuthContext';
import { SignIn } from './components/SignIn';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  console.log('App component rendering...')
  const { isAuthenticated, isLoading } = useAuth();
  console.log('App state:', { isAuthenticated, isLoading })

  if (isLoading) {
    console.log('App: Showing loading screen')
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  console.log('App: Showing', isAuthenticated ? 'Dashboard' : 'SignIn')
  return isAuthenticated ? <Dashboard /> : <SignIn />;
}

export default App
