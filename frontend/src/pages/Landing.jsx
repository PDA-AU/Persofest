import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, Star, Trophy } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({ total_participants: 0 });
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    setIsVisible(true);
    fetchStats();
    fetchLeaderboard();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/leaderboard`);
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorative elements - hidden on mobile for cleaner look */}
      <div className="hidden md:block absolute top-20 right-10 w-32 h-32 bg-accent border-4 border-black rotate-12 -z-0 animate-float" />
      <div className="hidden md:block absolute bottom-40 left-10 w-24 h-24 bg-secondary border-4 border-black -rotate-6 -z-0 animate-float-delayed" />
      <div className="hidden md:block absolute top-1/2 right-1/4 w-16 h-16 bg-primary border-4 border-black rotate-45 -z-0 animate-float-slow" />

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6 border-b-4 border-black bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <img src="/persofest.png" alt="PERSOFEST'26" className="h-10 md:h-14 w-auto" />
            <span className="font-heading text-lg md:text-2xl tracking-tight">
              PERSOFEST'26
            </span>
          </div>

          <nav className="flex gap-2 md:gap-4 justify-center">
            <Link
              to="/login"
              className="btn-brutal-outline px-3 py-2 text-xs md:px-4 md:text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-brutal-primary px-3 py-2 text-xs md:px-4 md:text-sm"
            >
              Register
            </Link>
          </nav>

        </div>
      </header>


      {/* Hero Section */}
      <section className="relative z-10 px-4 md:px-8 py-10 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-5 md:space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-block animate-bounce-subtle">
                <span className="badge-brutal bg-accent text-xs md:text-sm">Registration Open</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-none">
                Join the
                <span className="block text-primary">Biggest</span>
                <span className="block">Event of 2026</span>
              </h1>
              <p className="font-body text-sm md:text-lg max-w-md leading-relaxed">
                Be part of something extraordinary. Register now for PERSOFEST'26 and experience an unforgettable celebration of innovation, creativity, and talent.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
                <Link
                  to="/register"
                  className="btn-brutal-primary inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base"
                  data-testid="hero-register-button"
                >
                  Get Started
                  <ArrowRight size={18} strokeWidth={2.5} className="md:w-5 md:h-5" />
                </Link>
                <Link
                  to="/login"
                  className="btn-brutal-outline inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base"
                  data-testid="hero-login-button"
                >
                  Already Registered?
                </Link>
              </div>
            </div>

            {/* Right Content - Feature Cards with staggered animation */}
            <div className="space-y-4 md:space-y-4 mt-6 md:mt-0">
              <div 
                className={`card-brutal-interactive bg-primary p-5 md:p-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
                style={{ transitionDelay: '200ms' }}
              >
                <Calendar size={28} className="text-black mb-3 md:w-8 md:h-8" strokeWidth={2.5} />
                <h3 className="font-heading text-lg md:text-xl mb-2">Coming Soon</h3>
                <p className="font-body text-xs md:text-sm">Mark your calendars for the biggest fest of the year.</p>
              </div>
              <div 
                className={`card-brutal-interactive bg-accent p-5 md:p-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
                style={{ transitionDelay: '400ms' }}
              >
                <Users size={28} className="text-black mb-3 md:w-8 md:h-8" strokeWidth={2.5} />
                <h3 className="font-heading text-lg md:text-xl mb-2">{stats.total_participants}+ Participants</h3>
                <p className="font-body text-xs md:text-sm">Join hundreds of talented students from all departments.</p>
              </div>
              <div 
                className={`card-brutal-interactive bg-secondary text-white p-5 md:p-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
                style={{ transitionDelay: '600ms' }}
              >
                <Star size={28} className="text-white mb-3 md:w-8 md:h-8" strokeWidth={2.5} />
                <h3 className="font-heading text-lg md:text-xl mb-2">10+ Departments</h3>
                <p className="font-body text-xs md:text-sm">Representing every corner of technical excellence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      {leaderboard.length > 0 && (
        <section className="relative z-10 px-4 md:px-8 py-8 md:py-12 bg-accent border-y-4 border-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 mb-3">
                <Trophy size={32} className="text-primary" strokeWidth={2.5} />
                <h2 className="font-heading text-2xl md:text-4xl">Top Referrers</h2>
              </div>
              <p className="font-body text-xs md:text-sm">Our community builders leading the way!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4 max-w-5xl mx-auto">
              {leaderboard.map((user, index) => (
                <div 
                  key={user.register_number}
                  className={`card-brutal p-4 md:p-5 text-center transition-all duration-300 hover:shadow-brutal-lg ${
                    index === 0 ? 'bg-primary md:col-span-5 md:row-start-1' : 'bg-white'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`font-heading ${index === 0 ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'} mb-2`}>
                    #{index + 1}
                  </div>
                  <p className={`font-body font-bold ${index === 0 ? 'text-sm md:text-base' : 'text-xs md:text-sm'} truncate mb-1`}>
                    {user.name}
                  </p>
                  <p className={`font-body ${index === 0 ? 'text-xs md:text-sm' : 'text-[10px] md:text-xs'} text-gray-600 truncate mb-2`}>
                    {user.register_number}
                  </p>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 bg-secondary text-white border-2 border-black ${
                    index === 0 ? 'text-xs md:text-sm' : 'text-[10px] md:text-xs'
                  }`}>
                    <Users size={index === 0 ? 14 : 12} strokeWidth={2.5} />
                    <span className="font-bold">{user.referral_count} referrals</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Marquee Banner */}
      <div className="relative z-10 border-y-4 border-black bg-black text-white py-3 md:py-4 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="font-heading text-sm md:text-xl mx-6 md:mx-8">
              PERSOFEST'26 • REGISTER NOW • LIMITED SPOTS •
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 p-4 md:p-6 border-t-4 border-black bg-surface">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-body text-xs md:text-sm">
            © 2026 PERSOFEST'26. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        @media (min-width: 768px) {
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
