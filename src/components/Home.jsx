import React, { useState, useEffect } from 'react';
import '../styles/Home.css';

const Home = ({ isAuthenticated, onNavigate }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [formError, setFormError] = useState(null);

  React.useEffect(() => {
    document.documentElement.className = 'dark';
  }, []);

  // Toggle navigation menu
  const toggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  // Toggle theme and update document class
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.className = newTheme;
  };

  // Handle join room form submission
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setFormError('Invite code is required');
      return;
    }
    setFormError(null);
    console.log('Joining Zone with code:', inviteCode);
    // Implement actual join room logic here
  };

  // Handle newsletter form submission
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    setFormError(null);
    console.log('Subscribing with email:', email);
    setEmail('');
    // Implement actual newsletter subscription logic here
  };

  // Close nav on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isNavOpen) {
        setIsNavOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isNavOpen]);

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'John Smith',
      role: 'Tech Geek',
      text: 'StreamMate makes movie nights with friends seamless and fun!',
    },
    {
      id: 2,
      name: 'Emily Johnson',
      role: 'Romantic Viewer',
      text: 'Perfect for long-distance movie dates. StreamMate brings us closer.',
    },
  ];


  return (
    <div className={`page-container ${theme}`}>
      <header className="site-header" role="banner">
        <div className="header-container">
          <div className="logo" role="img" aria-label="Stream Mate Logo">
            Stream Mate
          </div>
          <button
            className="hamburger-button"
            aria-label="Toggle navigation"
            aria-expanded={isNavOpen}
            onClick={toggleNav}
          >
            <span className="hamburger-icon"></span>
          </button>
          <nav className={`nav-links ${isNavOpen ? 'open' : ''}`} role="navigation">
            <a href="/" className="nav-link" aria-current="page">
              Home
            </a>
            <a href="/profile" className="nav-link">
              Profile
            </a>
            <a href="/login" className="nav-link">
              Login
            </a>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </nav>
        </div>
      </header>

      <main className="home-container" role="main">
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-title">
            Welcome to Stream Mate
          </h1>
          <p className="hero-subtitle">
            Your ultimate platform for streaming and social movie experiences. Connect, watch, and share with friends in real-time.
          </p>
          <div className="hero-buttons">
            <a href="/rooms" className="cta-button">
              Browse Rooms
            </a>
            <a href="/movies" className="secondary-button">
              Explore Movies
            </a>
          </div>
        </section>


        <section className="about-project" aria-labelledby="about-project-title">
          <h2 id="about-project-title" className="section-title">
            About Project
          </h2>
          <p className="section-text">
            Stream Mate is a social movie streaming platform that allows users to connect, watch, and share movies in real-time with friends and family. It features synchronized playback, chat, trivia games, and more to enhance the shared viewing experience.
          </p>
        </section>

        <section className="join-room" aria-labelledby="join-room-title">
          <h2 id="join-room-title" className="section-title">
            Join a Zone
          </h2>
          <p className="section-text">
            Connect with friends and watch movies together in real-time. Enter an invite code or browse available rooms.
          </p>
          <form className="join-room-form" onSubmit={handleJoinRoom}>
            <input
              type="text"
              className="join-Zone-input"
              placeholder="Enter invite code"
              aria-label="Invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <button type="submit" className="join-room-button">
              Join Room
            </button>
            {formError && <p className="error-message" role="alert">{formError}</p>}
          </form>
          <a href="/rooms" className="browse-rooms-button">
            Browse Public Zones
          </a>
        </section>

        <section id="faq" className="section faq" aria-labelledby="faq-title">
          <div className="container">
            <h2 id="faq-title" className="section-title">
              Frequently Asked Questions
            </h2>
            <div className="faq-container">
              {[
                {
                  question: 'How does StreamMate work?',
                  answer: 'StreamMate lets you create or join virtual rooms for real-time movie watching with synced playback, trivia, and chat.',
                },
                {
                  question: 'Is StreamMate free to use?',
                  answer: 'Yes, with a free tier for core features. Premium plans offer more functionality.',
                },
                {
                  question: 'What devices are supported?',
                  answer: 'StreamMate works on desktops, tablets, and mobiles via modern web browsers.',
                },
                {
                  question: 'Can I watch movies internationally?',
                  answer: 'Yes, StreamMate supports global watch parties with perfect sync.',
                },
              ].map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3 className="faq-question">{faq.question}</h3>
                  <p className="faq-answer">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section newsletter" aria-labelledby="newsletter-title">
          <div className="container">
            <h2 id="newsletter-title" className="section-title">
              Stay Updated
            </h2>
            <p className="newsletter-text">
              Subscribe for the latest updates, features, and movie night tips.
            </p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email for newsletter"
              />
              <button type="submit" className="button login-button">
                Subscribe
              </button>
              {formError && <p className="error-message" role="alert">{formError}</p>}
            </form>
          </div>
        </section>

        <section id="cta" className="section cta" aria-labelledby="cta-title">
          <div className="container">
            <h2 id="cta-title" className="cta-title">
              Ready to Start Your Movie Night?
            </h2>
            <p className="cta-text">
              Join StreamMate today for unforgettable movie experiences with friends.
            </p>
            <div className="hero-buttons">
              <button
                className="cta-button light"
                onClick={() => onNavigate(isAuthenticated ? 'Zones' : 'login')}
                aria-label="Sign up or go to rooms"
              >
                Sign Up Now
              </button>
              <a href="#features" className="secondary-button">
                Explore Features
              </a>
            </div>
          </div>
        </section>

        <section className="testimonials" aria-labelledby="testimonials-title">
          <h2 id="testimonials-title" className="section-title">
            What Our Users Say
          </h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="testimonial-card"
                tabIndex="0"
                role="article"
                aria-label={`Testimonial by ${testimonial.name}`}
              >
                <p className="testimonial-text">"{testimonial.text}"</p>
                <p className="testimonial-name">{testimonial.name}</p>
                <p className="testimonial-role">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <h3 className="footer-title">StreamMate</h3>
              <p className="footer-text">
                Bringing friends together through shared movie experiences since 2025.
              </p>
              <div className="social-icons">
                {[
                  {
                    platform: 'Twitter',
                    url: 'https://twitter.com/streammate',
                    icon: (
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.708.87 3.214 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    ),
                  },
                  {
                    platform: 'Facebook',
                    url: 'https://facebook.com/streammate',
                    icon: (
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.95 3.63 9.06 8.37 9.84v-6.95H7.92v-2.89h2.49V9.76c0-2.46 1.46-3.81 3.7-3.81 1.07 0 2.19.19 2.19.19v2.41h-1.23c-1.21 0-1.59.75-1.59 1.52v1.83h2.7l-.43 2.89h-2.27v6.95c4.74-.78 8.37-4.89 8.37-9.84 0-5.5-4.46-9.96-9.96-9.96z" />
                      </svg>
                    ),
                  },
                  {
                    platform: 'Instagram',
                    url: 'https://instagram.com/streammate',
                    icon: (
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 3.22 8.07 7.44 8.79v-6.21H7.35v-2.58h2.13v-2.07c0-2.19 1.3-3.39 3.29-3.39.93 0 1.95.17 1.95.17v2.15h-1.1c-1.08 0-1.41.67-1.41 1.36v1.63h2.4l-.38 2.58h-2.02v6.21c4.22-.7 7.44-4.38 7.44-8.79 0-5.5-4.46-9.96-9.96-9.96z" />
                      </svg>
                    ),
                  },
                ].map((social) => (
                  <button
                    key={social.platform}
                    onClick={() => window.open(social.url, '_blank', 'noopener,noreferrer')}
                    className="social-icon"
                    aria-label={`Follow us on ${social.platform}`}
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="footer-section">
              <h3 className="footer-title">Explore</h3>
              <ul className="footer-links">
                <li><a href="#features" className="footer-link">Features</a></li>
                <li><a href="#testimonials" className="footer-link">Testimonials</a></li>
                <li><a href="#faq" className="footer-link">FAQ</a></li>
                <li><a href="#cta" className="footer-link">Join Now</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3 className="footer-title">Support</h3>
              <ul className="footer-links">
                <li><a href="/help" className="footer-link">Help Center</a></li>
                <li><a href="/privacy" className="footer-link">Privacy Policy</a></li>
                <li><a href="/terms" className="footer-link">Terms of Service</a></li>
                <li><a href="/contact" className="footer-link">Contact Us</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3 className="footer-title">Contact</h3>
              <p className="footer-text">Email: support@streammate.com</p>
              <p className="footer-text">Phone: (123) 456-7890</p>
              <p className="footer-text">Address: 123 Movie St, Cinema City, USA</p>
            </div>
          </div>
          <div className="copyright">
            <p>© 2025 StreamMate. All rights reserved.</p>
          </div>
          <button
            className="back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
          >
            Back to Top
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Home;