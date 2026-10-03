import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Star, MessageSquare, CheckCircle, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import './LandingPage.css';

// Custom hook for scroll animations
function useIntersectionObserver(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) observer.unobserve(currentElement);
    };
  }, [options]);

  return [elementRef, isVisible];
}

const LandingPage = () => {
  const [heroRef, heroVisible] = useIntersectionObserver();
  const [statsRef, statsVisible] = useIntersectionObserver();
  const [featuresRef, featuresVisible] = useIntersectionObserver();
  const [ctaRef, ctaVisible] = useIntersectionObserver();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Lumina" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Lumina</span>
          </div>
          <div className="nav-links">
            <Link to="/freelancers">Find Talent</Link>
            <Link to="/projects">Find Work</Link>
            <a href="#pricing-plans">Plans & Pricing</a>
            <Link to="/about">Why Us</Link>
          </div>
          <div className="nav-actions">
            <Link to="/RoleSelect?mode=login"><Button variant="ghost">Log In</Button></Link>
            <Link to="/RoleSelect?mode=register"><Button variant="primary">Sign Up</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-container">
          <div className={`hero-content scroll-animate ${heroVisible ? 'visible' : ''}`}>
            <Badge variant="primary" className="hero-badge">New: AI Talent Matching</Badge>
            <h1>Hire the Best Talent or Build Your Freelance Career</h1>
            <p>Join the world's most premium marketplace connecting top-tier freelance professionals with ambitious forward-thinking companies.</p>
            <div className="hero-buttons">
              <Link to="/RoleSelect?mode=register"><Button variant="primary" size="lg">Get Started Now</Button></Link>
              <Link to="/freelancers"><Button variant="outline" size="lg">Explore Marketplace</Button></Link>
            </div>
          </div>
          <div className={`hero-image scroll-animate delay-1 ${heroVisible ? 'visible' : ''}`}>
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Team Collaboration" className="main-image" />
            <div className="floating-card stat-card">
               <Star className="text-yellow-400" size={24} color="#facc15" fill="#facc15"/>
               <div>
                 <h4>4.9/5 Average Rating</h4>
                 <span>From 10k+ clients</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" ref={statsRef}>
        <div className={`stats-container scroll-animate ${statsVisible ? 'visible' : ''}`}>
          <div className="stat-item">
            <h2>10K+</h2>
            <p>Verified Freelancers</p>
          </div>
          <div className="stat-item">
            <h2>5,000+</h2>
            <p>Completed Projects</p>
          </div>
          <div className="stat-item">
            <h2>150+</h2>
            <p>Skill Categories</p>
          </div>
          <div className="stat-item">
            <h2>99%</h2>
            <p>Client Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features-section" ref={featuresRef}>
        <div className={`section-header scroll-animate ${featuresVisible ? 'visible' : ''}`}>
          <h2>Why Choose Lumina?</h2>
          <p>Everything you need to hire, manage, and scale your remote team.</p>
        </div>
        <div className={`features-grid scroll-animate delay-1 ${featuresVisible ? 'visible' : ''}`}>
          <Card hover>
            <Shield className="feature-icon text-primary" size={32} />
            <h3>Verified Professionals</h3>
            <p>Every freelancer passes our rigorous screening process before joining.</p>
          </Card>
          <Card hover>
            <CheckCircle className="feature-icon text-success" size={32} />
            <h3>Secure Payments</h3>
            <p>Escrow protection guarantees you only pay for approved work.</p>
          </Card>
          <Card hover>
            <MessageSquare className="feature-icon text-accent" size={32} />
            <h3>Live Messaging</h3>
            <p>Collaborate in real-time with integrated chat and file sharing.</p>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-plans" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Badge variant="primary">Flexible Pricing</Badge>
          <h2 style={{ fontSize: 32, marginTop: 16, fontWeight: 800, color: '#fff' }}>Simple, Transparent Plans</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 540, margin: '12px auto 0' }}>Select a plan to start your 1st month free trial. Cancel anytime.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {/* Basic Plan */}
          <Card hover style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 20, margin: '0 0 8px 0', color: '#fff' }}>Basic</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginBottom: 24 }}>Essential tools to get started</p>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 24 }}>$0 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>/ mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5, color: 'var(--text-secondary)' }}>
              <li>✓ Submit up to 5 bids/month</li>
              <li>✓ Standard escrow security</li>
              <li>✓ Direct client messaging</li>
            </ul>
            <Link to="/RoleSelect?mode=register" style={{ marginTop: 'auto' }}>
              <Button variant="outline" style={{ width: '100%' }}>Get Started Free</Button>
            </Link>
          </Card>

          {/* Pro Plan */}
          <Card hover style={{ padding: 32, display: 'flex', flexDirection: 'column', border: '2px solid var(--primary)', position: 'relative', background: 'rgba(99,91,255,.05)', overflow: 'visible' }}>
            <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: 99, background: 'linear-gradient(90deg,#635bff,#2fd8ee)', color: '#fff', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Most Popular</span>
            <h3 style={{ fontSize: 20, margin: '0 0 8px 0', color: '#fff' }}>Professional</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginBottom: 24 }}>Unlock premium reach & AI matching</p>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 24 }}>$19 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>/ mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5, color: 'var(--text-secondary)' }}>
              <li>✓ <strong>1st Month Free Trial</strong></li>
              <li>✓ Unlimited bid & project postings</li>
              <li>✓ Verified Pro badge & search priority</li>
              <li>✓ 24/7 dedicated support</li>
            </ul>
            <Link to="/RoleSelect?mode=register" style={{ marginTop: 'auto' }}>
              <Button variant="primary" style={{ width: '100%' }}>Start 1 Month Free</Button>
            </Link>
          </Card>

          {/* Enterprise Plan */}
          <Card hover style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 20, margin: '0 0 8px 0', color: '#fff' }}>Enterprise</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginBottom: 24 }}>For power users & company teams</p>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 24 }}>$49 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>/ mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5, color: 'var(--text-secondary)' }}>
              <li>✓ Zero platform transaction fees</li>
              <li>✓ Custom branding & header logo</li>
              <li>✓ Dedicated hiring manager</li>
            </ul>
            <Link to="/RoleSelect?mode=register" style={{ marginTop: 'auto' }}>
              <Button variant="outline" style={{ width: '100%' }}>Contact Sales</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section" ref={ctaRef}>
        <div className={`cta-container scroll-animate ${ctaVisible ? 'visible' : ''}`}>
          <h2>Ready to elevate your work?</h2>
          <p>Join thousands of businesses and freelancers building the future of work.</p>
          <Link to="/RoleSelect?mode=register"><Button variant="gradient" size="lg">Join Lumina Today</Button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'white' }}>
              <Sparkles size={28} color="white" />
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Lumina</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '300px' }}>The premium destination for the world's top talent and best companies.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>For Clients</h4>
              <a href="/">How to Hire</a>
              <a href="/">Talent Marketplace</a>
              <a href="/">Project Catalog</a>
            </div>
            <div>
              <h4>For Freelancers</h4>
              <a href="/">How to Find Work</a>
              <a href="/">Create Profile</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="/">About Us</a>
              <a href="/">Careers</a>
              <a href="/">Contact Support</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Lumina. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
