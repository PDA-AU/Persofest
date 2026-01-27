import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Zap, Eye, EyeOff, ArrowRight, User, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    register_number: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.register_number || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData.register_number, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-accent border-4 border-black rotate-12 -z-0" />
      <div className="absolute bottom-20 left-20 w-28 h-28 bg-primary border-4 border-black -rotate-6 -z-0" />
      <div className="absolute top-1/3 left-10 w-16 h-16 bg-secondary border-4 border-black rotate-45 -z-0" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Zap size={40} className="text-primary" strokeWidth={3} />
            <span className="font-heading text-2xl">PERSOFEST'26</span>
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl mb-2">Welcome Back</h1>
          <p className="font-body text-sm text-gray-600">Sign in to access your profile</p>
        </div>

        {/* Login Card */}
        <div className="card-brutal p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 border-2 border-black bg-primary text-black font-body text-sm animate-shake" data-testid="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-brutal">Register Number</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  name="register_number"
                  value={formData.register_number}
                  onChange={handleChange}
                  className="input-brutal pl-10 uppercase"
                  placeholder="Enter your register number"
                  data-testid="input-register-number"
                />
              </div>
            </div>

            <div>
              <label className="label-brutal">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-brutal pl-10 pr-12"
                  placeholder="Enter your password"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brutal-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-50"
              data-testid="login-button"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-secondary hover:underline"
                data-testid="register-link"
              >
                Register Now
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link to="/" className="btn-brutal-ghost text-xs" data-testid="home-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
