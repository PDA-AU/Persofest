import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, User, Mail, Phone, Building, GraduationCap, Lock, Gift } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    register_number: '',
    email: '',
    phone_number: '',
    department: '',
    year_of_study: '',
    password: '',
    confirmPassword: '',
    referral_code: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [deptRes, yearRes] = await Promise.all([
        axios.get(`${API_URL}/api/departments`),
        axios.get(`${API_URL}/api/years`)
      ]);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setYears(Array.isArray(yearRes.data) ? yearRes.data : []);

    } catch (err) {
      console.error('Failed to fetch options:', err);
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.register_number.trim()) newErrors.register_number = 'Register number is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone_number.trim()) {
        newErrors.phone_number = 'Phone number is required';
      } else if (formData.phone_number.length < 10) {
        newErrors.phone_number = 'Phone number must be at least 10 digits';
      }
    } else if (currentStep === 2) {
      if (!formData.department) newErrors.department = 'Department is required';
      if (!formData.year_of_study) newErrors.year_of_study = 'Year of study is required';
    } else if (currentStep === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    setError('');

    try {
      
      const payload = {
        name: formData.name,
        register_number: formData.register_number.toUpperCase(),
        email: formData.email,
        phone_number: formData.phone_number,
        department: formData.department,
        year_of_study: formData.year_of_study,
        password: formData.password,
      };

      // Add referral code only if provided
      if (formData.referral_code && formData.referral_code.trim()) {
        payload.referral_code = formData.referral_code.toUpperCase();
      }

      await axios.post(`${API_URL}/api/auth/register`, payload);

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal Info', icon: User },
    { num: 2, label: 'Academic', icon: Building },
    { num: 3, label: 'Security', icon: Lock },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-brutal bg-accent p-8 text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 bg-white border-4 border-black mx-auto mb-4 flex items-center justify-center">
            <Check size={40} className="text-black" strokeWidth={3} />
          </div>
          <h2 className="font-heading text-2xl mb-2">Registration Successful!</h2>
          <p className="font-body text-sm mb-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-accent border-4 border-black rotate-12 -z-0" />
      <div className="absolute bottom-20 left-10 w-20 h-20 bg-secondary border-4 border-black -rotate-6 -z-0" />

      {/* Header */}
      <header className="relative z-10 p-4 border-b-4 border-black bg-surface">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <img src="/persofest.png" alt="PERSOFEST'26" className="h-8 md:h-12 w-auto" />
            <span className="font-heading text-sm md:text-lg tracking-tight">PERSOFEST'26</span>
          </Link>
          <Link to="/login" className="btn-brutal-outline px-4 py-2 text-xs" data-testid="login-link">
            Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-4 md:p-8 max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl md:text-4xl mb-2">Register Now</h1>
          <p className="font-body text-sm text-gray-600">Join PERSOFEST'26 in 3 easy steps</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8 gap-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="flex items-center">
                <div
                  className={`step-indicator w-12 h-12 border-4 border-black flex items-center justify-center font-heading text-sm transition-all ${
                    step > s.num
                      ? 'bg-accent completed'
                      : step === s.num
                      ? 'bg-primary active shadow-brutal'
                      : 'bg-white'
                  }`}
                  data-testid={`step-indicator-${s.num}`}
                >
                  {step > s.num ? <Check size={20} strokeWidth={3} /> : <Icon size={20} strokeWidth={2.5} />}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-1 border-y-2 border-black mx-1 ${step > s.num ? 'bg-accent' : 'bg-white'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="card-brutal p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 border-2 border-black bg-primary text-black font-body text-sm animate-shake" data-testid="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-5 page-transition">
                <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
                  <User size={24} strokeWidth={2.5} />
                  Personal Information
                </h2>

                <div>
                  <label className="label-brutal">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input-brutal pl-10 ${errors.name ? 'border-primary' : ''}`}
                      placeholder="Enter your full name"
                      data-testid="input-name"
                    />
                  </div>
                  {errors.name && <p className="text-primary text-xs mt-1 font-bold">{errors.name}</p>}
                </div>

                <div>
                  <label className="label-brutal">Register Number</label>
                  <input
                    type="text"
                    name="register_number"
                    value={formData.register_number}
                    onChange={handleChange}
                    className={`input-brutal uppercase ${errors.register_number ? 'border-primary' : ''}`}
                    placeholder="e.g., 2026AIML001"
                    data-testid="input-register-number"
                  />
                  {errors.register_number && <p className="text-primary text-xs mt-1 font-bold">{errors.register_number}</p>}
                </div>

                <div>
                  <label className="label-brutal">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-brutal pl-10 ${errors.email ? 'border-primary' : ''}`}
                      placeholder="your.email@example.com"
                      data-testid="input-email"
                    />
                  </div>
                  {errors.email && <p className="text-primary text-xs mt-1 font-bold">{errors.email}</p>}
                </div>

                <div>
                  <label className="label-brutal">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className={`input-brutal pl-10 ${errors.phone_number ? 'border-primary' : ''}`}
                      placeholder="Enter your phone number"
                      data-testid="input-phone"
                    />
                  </div>
                  {errors.phone_number && <p className="text-primary text-xs mt-1 font-bold">{errors.phone_number}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Academic Information */}
            {step === 2 && (
              <div className="space-y-5 page-transition">
                <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
                  <Building size={24} strokeWidth={2.5} />
                  Academic Information
                </h2>

                <div>
                  <label className="label-brutal">Department</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={18} />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`select-brutal pl-10 ${errors.department ? 'border-primary' : ''}`}
                      data-testid="select-department"
                    >
                      <option value="">Select your department</option>
                      {Array.isArray(departments) && departments.map(dept => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                  </div>
                  {errors.department && <p className="text-primary text-xs mt-1 font-bold">{errors.department}</p>}
                </div>

                <div>
                  <label className="label-brutal">Year of Study</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={18} />
                    <select
                      name="year_of_study"
                      value={formData.year_of_study}
                      onChange={handleChange}
                      className={`select-brutal pl-10 ${errors.year_of_study ? 'border-primary' : ''}`}
                      data-testid="select-year"
                    >
                      <option value="">Select your year</option>
                      {Array.isArray(years) && years.map(year => (
                        <option key={year.value} value={year.value}>{year.label}</option>
                      ))}
                    </select>
                  </div>
                  {errors.year_of_study && <p className="text-primary text-xs mt-1 font-bold">{errors.year_of_study}</p>}
                </div>

                <div>
                  <label className="label-brutal">Referral Code (Optional)</label>
                  <div className="relative">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="referral_code"
                      value={formData.referral_code}
                      onChange={handleChange}
                      className="input-brutal pl-10 uppercase"
                      placeholder="Enter referral code"
                      maxLength={5}
                      data-testid="input-referral-code"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Have a referral code? Enter it here!</p>
                </div>
              </div>
            )}

            {/* Step 3: Security */}
            {step === 3 && (
              <div className="space-y-5 page-transition">
                <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
                  <Lock size={24} strokeWidth={2.5} />
                  Set Your Password
                </h2>

                <div>
                  <label className="label-brutal">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-brutal pl-10 pr-12 ${errors.password ? 'border-primary' : ''}`}
                      placeholder="Create a password"
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
                  {errors.password && <p className="text-primary text-xs mt-1 font-bold">{errors.password}</p>}
                </div>

                <div>
                  <label className="label-brutal">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input-brutal pl-10 ${errors.confirmPassword ? 'border-primary' : ''}`}
                      placeholder="Confirm your password"
                      data-testid="input-confirm-password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-primary text-xs mt-1 font-bold">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 gap-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-brutal-outline flex items-center gap-2"
                  data-testid="back-button"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              ) : (
                <Link to="/" className="btn-brutal-outline flex items-center gap-2" data-testid="cancel-button">
                  <ArrowLeft size={18} />
                  Cancel
                </Link>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-brutal-primary flex items-center gap-2"
                  data-testid="next-button"
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-brutal-primary flex items-center gap-2 disabled:opacity-50"
                  data-testid="submit-button"
                >
                  {loading ? 'Registering...' : 'Register'}
                  {!loading && <Check size={18} />}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register;
