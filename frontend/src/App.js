import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Sidebar from './components/Sidebar';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Auth Context
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Configure axios
axios.defaults.baseURL = API_URL;

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axios.get('/api/profile/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (registerNumber, password) => {
    const response = await axios.post('/api/auth/login', {
      register_number: registerNumber,
      password: password
    });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setToken(access_token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card-brutal p-8 animate-pulse">
          <h2 className="font-heading text-xl">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, fetchProfile }}>
      <Router>
        <div className="min-h-screen bg-background">
          {user && (
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          )}
          <main className={user ? 'lg:ml-64 transition-all duration-300' : ''}>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
              <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
              <Route 
                path="/dashboard" 
                element={user ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/admin" 
                element={user?.is_admin === 1 ? <AdminDashboard /> : <Navigate to="/dashboard" />} 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
