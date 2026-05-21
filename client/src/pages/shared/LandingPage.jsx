import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { FiArrowRight, FiArrowDown, FiStar, FiShield, FiClock, FiHeart } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import './LandingPage.css';

/* ── data ── */
const features = [
  { icon: '👨‍⚕️', title: 'Find Doctors', desc: 'Search from 500+ verified specialists across every medical field', color: '#0D7377' },
  { icon: '📅', title: 'Book Instantly', desc: 'Real-time slot availability — book appointments in seconds', color: '#3B82F6' },
  { icon: '🎥', title: 'Video Consult', desc: 'HD video consultations with doctors from the comfort of your home', color: '#8B5CF6' },
  { icon: '💊', title: 'Order Medicines', desc: 'Genuine medicines delivered to your doorstep within hours', color: '#F59E0B' },
  { icon: '🧠', title: 'AI Symptom Check', desc: 'Intelligent symptom analysis with specialist recommendations', color: '#EF4444' },
  { icon: '📋', title: 'Health Records', desc: 'Securely store, access and share all your medical documents', color: '#10B981' },
];

const stats = [
  { value: '500+', label: 'Verified Doctors', icon: '👨‍⚕️' },
  { value: '50K+', label: 'Happy Patients', icon: '😊' },
  { value: '4.9', label: 'Average Rating', icon: '⭐' },
  { value: '24/7', label: 'Always Available', icon: '🕐' },
];

const specialties = [
  { icon: '❤️', name: 'Cardiology', color: '#EF4444' },
  { icon: '🧠', name: 'Neurology', color: '#8B5CF6' },
  { icon: '🦴', name: 'Orthopedics', color: '#F59E0B' },
  { icon: '👶', name: 'Pediatrics', color: '#3B82F6' },
  { icon: '🔬', name: 'Dermatology', color: '#EC4899' },
  { icon: '👁️', name: 'Ophthalmology', color: '#14B8A6' },
  { icon: '🫁', name: 'Pulmonology', color: '#6366F1' },
  { icon: '🧬', name: 'Gynecology', color: '#F43F5E' },
];

const testimonials = [
  { name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'Sehat made it incredibly easy to consult a specialist. The video call quality was crystal clear and I got my prescription within minutes!' },
  { name: 'Rahul Verma', city: 'Delhi', rating: 5, text: 'I ordered medicines through Sehat and they arrived in under 2 hours. The pharmacy service is fast, reliable, and genuinely affordable.' },
  { name: 'Anjali Patel', city: 'Bangalore', rating: 5, text: 'The AI symptom checker accurately identified my condition and recommended the right specialist. Saved me so much time and worry!' },
];

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up free in under 30 seconds — no paperwork', icon: '👤', color: '#0D7377' },
  { step: '02', title: 'Find Your Doctor', desc: 'Search by specialty, rating, location or availability', icon: '🔍', color: '#3B82F6' },
  { step: '03', title: 'Book & Consult', desc: 'Pick a slot and consult via HD video or in-person', icon: '📅', color: '#8B5CF6' },
  { step: '04', title: 'Get Better', desc: 'Receive e-prescriptions, follow-ups and continuous care', icon: '💊', color: '#22C55E' },
];

/* ── helpers ── */
function Section({ children, className = '', id }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section ref={ref} id={id} className={`${className} ${isInView ? 'in-view' : ''}`}>
      {children}
    </section>
  );
}

function ParallaxLayer({ children, speed = 0.3, className = '' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * -200]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30, mass: 0.5 });
  return <motion.div ref={ref} style={{ y: smoothY }} className={className}>{children}</motion.div>;
}

/* ── component ── */
export default function LandingPage() {
  const { t } = useTranslation();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo"><span className="logo-pulse">🏥</span><span>Sehat</span></div>
          <div className="landing-nav-links">
            <a href="#features">{t('nav.features')}</a>
            <a href="#specialties">{t('nav.specialties')}</a>
            <a href="#how">{t('nav.howItWorks')}</a>
            <a href="#testimonials">{t('nav.reviews')}</a>
          </div>
          <div className="landing-nav-actions">
            <LanguageSwitcher />
            <Link to="/login" className="btn btn-ghost btn-sm">{t('nav.signIn')}</Link>
            <Link to="/register" className="btn btn-primary btn-sm">{t('nav.getStarted')} <FiArrowRight size={14} /></Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero" ref={heroRef}>
        {/* Parallax background layers */}
        <motion.div className="hero-bg-layer" style={{ y: bgY }}>
          <div className="hero-gradient-orb orb-1" style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }} />
          <div className="hero-gradient-orb orb-2" style={{ transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)` }} />
          <div className="hero-gradient-orb orb-3" style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }} />
          <div className="hero-grid-pattern" />
        </motion.div>

        {/* Floating medical icons — parallax at different speeds */}
        <div className="hero-floating-icons">
          <motion.span className="float-icon fi-1" style={{ y: useTransform(scrollYProgress, [0, 1], [0, -80]), x: mousePos.x * 0.6 }}>🩺</motion.span>
          <motion.span className="float-icon fi-2" style={{ y: useTransform(scrollYProgress, [0, 1], [0, -120]), x: mousePos.x * -0.4 }}>💊</motion.span>
          <motion.span className="float-icon fi-3" style={{ y: useTransform(scrollYProgress, [0, 1], [0, -60]), x: mousePos.x * 0.3 }}>❤️</motion.span>
          <motion.span className="float-icon fi-4" style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]), x: mousePos.x * -0.5 }}>🧬</motion.span>
          <motion.span className="float-icon fi-5" style={{ y: useTransform(scrollYProgress, [0, 1], [0, -70]), x: mousePos.x * 0.4 }}>🔬</motion.span>
        </div>

        <motion.div className="hero-content" style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}>
          <motion.div className="hero-text" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div className="hero-badge" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              <FiShield size={14} /> {t('hero.badge')}
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}>
              {t('hero.title1')}<br />
              <span className="hero-gradient-text">{t('hero.title2')}</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              {t('hero.subtitle')}
            </motion.p>

            <motion.div className="hero-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Link to="/register" className="btn btn-primary btn-xl hero-cta-btn">
                {t('hero.ctaStart')} <FiArrowRight size={18} />
              </Link>
              <a href="#features" className="btn btn-glass btn-xl">
                {t('hero.ctaExplore')} <FiArrowDown size={16} />
              </a>
            </motion.div>

            <motion.div className="hero-trust-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <div className="trust-avatars">
                {['PS','RV','AP','MK','NG'].map((initials, i) => (
                  <img key={i} src={`https://ui-avatars.com/api/?name=${initials}&background=0D7377&color=fff&size=36`} alt="" className="trust-avatar" style={{ zIndex: 5 - i }} />
                ))}
              </div>
              <div className="trust-text">
                <div className="trust-stars">★★★★★</div>
                <span>{t('hero.trustedBy')}</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="hero-visual" initial={{ opacity: 0, x: 80, rotateY: -10 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 0.9, delay: 0.5 }}>
            <div className="hero-card-3d" style={{ transform: `perspective(1000px) rotateY(${mousePos.x * 0.15}deg) rotateX(${mousePos.y * -0.1}deg)` }}>
              <div className="hero-card main-card">
                <div className="hero-card-header">
                  <img src="https://ui-avatars.com/api/?name=Dr+Rajesh+Sharma&background=0D7377&color=fff&size=64" alt="Doctor" className="hero-doctor-img" />
                  <div>
                    <div className="hero-doctor-name">Dr. Rajesh Sharma</div>
                    <div className="hero-doctor-specialty">General Medicine · 12y exp</div>
                    <div className="hero-stars">★★★★★ <span>4.9</span></div>
                  </div>
                </div>
                <div className="hero-card-slots">
                  <span className="slot-pill">9:00 AM</span>
                  <span className="slot-pill">11:00 AM</span>
                  <span className="slot-pill active-slot">2:00 PM</span>
                  <span className="slot-pill">4:30 PM</span>
                </div>
                <div className="hero-card-price">
                  <span className="card-label">Consultation Fee</span>
                  <span className="card-price">₹500</span>
                </div>
                <Link to="/register" className="btn btn-primary w-full">Book Appointment →</Link>
              </div>

              {/* Floating micro-cards */}
              <motion.div className="hero-float-card float-card-1" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <span className="float-emoji">✅</span>
                <div><div className="float-title">Appointment Confirmed</div><div className="float-sub">Today at 2:00 PM</div></div>
              </motion.div>

              <motion.div className="hero-float-card float-card-2" animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
                <span className="float-emoji">💊</span>
                <div><div className="float-title">Medicine Delivered</div><div className="float-sub">Within 2 hours</div></div>
              </motion.div>

              <motion.div className="hero-float-card float-card-3" animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
                <span className="float-emoji">🎥</span>
                <div><div className="float-title">Video Call Ready</div><div className="float-sub">Join in 5 min</div></div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div className="scroll-indicator" animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <FiArrowDown size={20} />
        </motion.div>
      </section>

      {/* ── Stats (Parallax) ── */}
      <Section className="stats-section">
        <ParallaxLayer speed={0.15}>
          <div className="stats-inner">
            {stats.map((s, i) => (
              <motion.div key={i} className="stat-item" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} viewport={{ once: true }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </ParallaxLayer>
      </Section>

      {/* ── Features (Parallax stagger) ── */}
      <Section className="features-section" id="features">
        <div className="section-container">
          <ParallaxLayer speed={0.1}>
            <motion.div className="section-header" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="section-badge">Everything You Need</div>
              <h2>Complete Healthcare<br />at Your Fingertips</h2>
              <p>From finding the right doctor to managing your health records — Sehat covers your entire healthcare journey.</p>
            </motion.div>
          </ParallaxLayer>
          <div className="features-grid">
            {features.map((f, i) => (
              <motion.div key={i} className="feature-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.5 }} viewport={{ once: true }} whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(13,115,119,0.12)' }}>
                <div className="feature-icon-wrap" style={{ '--fc': f.color }}><span>{f.icon}</span></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="feature-arrow">→</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Specialties (Parallax) ── */}
      <Section className="specialties-section" id="specialties">
        <div className="section-container">
          <ParallaxLayer speed={0.12}>
            <motion.div className="section-header" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <div className="section-badge">Medical Specialties</div>
              <h2>Find the Right Specialist</h2>
              <p>Browse from a wide range of medical specialties and find the perfect doctor for your needs.</p>
            </motion.div>
          </ParallaxLayer>
          <div className="specialties-grid">
            {specialties.map((s, i) => (
              <motion.div key={i} className="specialty-card" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }} viewport={{ once: true }} whileHover={{ scale: 1.06, boxShadow: `0 12px 30px ${s.color}22` }}>
                <div className="specialty-icon-ring" style={{ '--sc': s.color }}><span>{s.icon}</span></div>
                <span className="specialty-name">{s.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── How It Works (Parallax) ── */}
      <Section className="how-section" id="how">
        <div className="section-container">
          <ParallaxLayer speed={0.1}>
            <motion.div className="section-header" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <div className="section-badge">Simple Process</div>
              <h2>How Sehat Works</h2>
              <p>Getting quality healthcare has never been this easy.</p>
            </motion.div>
          </ParallaxLayer>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <motion.div key={i} className="step-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.5 }} viewport={{ once: true }}>
                <div className="step-number" style={{ '--stepc': s.color }}>{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < steps.length - 1 && <div className="step-connector" />}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Testimonials (Parallax) ── */}
      <Section className="testimonials-section" id="testimonials">
        <div className="section-container">
          <ParallaxLayer speed={0.1}>
            <motion.div className="section-header" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <div className="section-badge">Patient Stories</div>
              <h2>What Our Patients Say</h2>
              <p>Real experiences from real people who trust Sehat.</p>
            </motion.div>
          </ParallaxLayer>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <motion.div key={i} className="testimonial-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12, duration: 0.5 }} viewport={{ once: true }} whileHover={{ y: -6 }}>
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
                <div className="testimonial-author">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=0D7377&color=fff&size=44`} alt={t.name} className="testimonial-avatar" />
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-city">{t.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA (Parallax) ── */}
      <Section className="cta-section">
        <div className="cta-bg-shapes">
          <div className="cta-orb cta-orb-1" />
          <div className="cta-orb cta-orb-2" />
        </div>
        <ParallaxLayer speed={0.15}>
          <div className="cta-inner">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <FiHeart size={40} className="cta-icon" />
              <h2>Start Your Healthcare Journey Today</h2>
              <p>Join 50,000+ patients who trust Sehat for their healthcare needs.<br />It's free to get started.</p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-accent btn-xl">Register as Patient <FiArrowRight /></Link>
                <Link to="/register?role=DOCTOR" className="btn btn-glass-white btn-xl">Join as Doctor</Link>
              </div>
            </motion.div>
          </div>
        </ParallaxLayer>
      </Section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="landing-logo"><span>🏥</span><span>Sehat</span></div>
            <p>Making quality healthcare accessible to everyone, everywhere.</p>
            <div className="footer-badges">
              <span><FiShield size={14}/> HIPAA Compliant</span>
              <span><FiStar size={14}/> 4.9★ Rated</span>
              <span><FiClock size={14}/> 24/7 Support</span>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-col"><h4>Platform</h4><a href="#features">Features</a><a href="#specialties">Specialties</a><Link to="/login">Sign In</Link><Link to="/register">Register</Link></div>
            <div className="footer-col"><h4>For Patients</h4><a href="#features">Find Doctors</a><a href="#how">How It Works</a><a href="#testimonials">Reviews</a></div>
            <div className="footer-col"><h4>For Doctors</h4><Link to="/register?role=DOCTOR">Join Sehat</Link><a href="#features">Practice Online</a><a href="#features">Grow Your Practice</a></div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Sehat Healthcare. All rights reserved. Made with ❤️ in India.</p>
        </div>
      </footer>
    </div>
  );
}
