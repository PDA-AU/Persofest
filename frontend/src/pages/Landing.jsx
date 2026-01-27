import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Calendar, Users, Star } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-accent border-4 border-black rotate-12 -z-0" />
      <div className="absolute bottom-40 left-10 w-24 h-24 bg-secondary border-4 border-black -rotate-6 -z-0" />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-primary border-4 border-black rotate-45 -z-0" />

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6 border-b-4 border-black bg-surface">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap size={32} className="text-primary" strokeWidth={3} />
            <span className="font-heading text-xl md:text-2xl tracking-tight">PERSOFEST'26</span>
          </div>
          <nav className="flex gap-2 md:gap-4">
            <Link
              to="/login"
              className="btn-brutal-outline px-4 py-2 text-xs md:text-sm"
              data-testid="login-nav-button"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-brutal-primary px-4 py-2 text-xs md:text-sm"
              data-testid="register-nav-button"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 page-transition">
              <div className="inline-block">
                <span className="badge-brutal bg-accent">Registration Open</span>
              </div>
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-none">
                Join the
                <span className="block text-primary">Biggest</span>
                <span className="block">Event of 2026</span>
              </h1>
              <p className="font-body text-base md:text-lg max-w-md leading-relaxed">
                Be part of something extraordinary. Register now for PERSOFEST'26 and experience an unforgettable celebration of innovation, creativity, and talent.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="btn-brutal-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-base"
                  data-testid="hero-register-button"
                >
                  Get Started
                  <ArrowRight size={20} strokeWidth={2.5} />
                </Link>
                <Link
                  to="/login"
                  className="btn-brutal-outline inline-flex items-center justify-center gap-2 px-8 py-4 text-base"
                  data-testid="hero-login-button"
                >
                  Already Registered?
                </Link>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="space-y-4">
              <div className="card-brutal-interactive bg-primary stagger-item" style={{ animationDelay: '0.1s' }}>
                <Calendar size={32} className="text-black mb-3" strokeWidth={2.5} />
                <h3 className="font-heading text-xl mb-2">Coming Soon</h3>
                <p className="font-body text-sm">Mark your calendars for the biggest fest of the year.</p>
              </div>
              <div className="card-brutal-interactive bg-accent stagger-item" style={{ animationDelay: '0.2s' }}>
                <Users size={32} className="text-black mb-3" strokeWidth={2.5} />
                <h3 className="font-heading text-xl mb-2">500+ Participants</h3>
                <p className="font-body text-sm">Join hundreds of talented students from all departments.</p>
              </div>
              <div className="card-brutal-interactive bg-secondary text-white stagger-item" style={{ animationDelay: '0.3s' }}>
                <Star size={32} className="text-white mb-3" strokeWidth={2.5} />
                <h3 className="font-heading text-xl mb-2">10+ Departments</h3>
                <p className="font-body text-sm">Representing every corner of technical excellence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Banner */}
      <div className="relative z-10 border-y-4 border-black bg-black text-white py-4 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="font-heading text-lg md:text-xl mx-8">
              PERSOFEST'26 • REGISTER NOW • LIMITED SPOTS •
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 p-6 border-t-4 border-black bg-surface">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-body text-sm">
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
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;
