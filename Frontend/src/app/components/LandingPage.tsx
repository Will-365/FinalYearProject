import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Recycle,
  Shield, BadgeCheck, ChevronRight, Menu, X, Facebook, Twitter, Instagram,
  ArrowRight, BarChart2, Truck, Leaf, MapPin, TreePine, Star, Trophy, Users,
  TrendingUp, Award, CheckCircle2, Target, Heart, Globe, ChevronLeft,
  Mail, Phone, ShoppingBag
} from 'lucide-react';
import { GreenCareLogo } from '@/app/components/ui/GreenCareLogo';
import { motion, AnimatePresence } from 'motion/react';

// Local images
import buyImg from '@/images/buy.png';
import collectImg from '@/images/collect.png';
import processImg from '@/images/process.png';
import truckImg from '@/images/truck.png';

interface LandingPageProps {
  onGetStarted: () => void;
  onShopClick?: () => void;
  onBuyerClick?: () => void;
}

const heroImages = [
  {
    url: truckImg,
    title: 'Smart Waste Collection',
    subtitle: 'Optimized routes and scheduled pickups'
  },
  {
    url: processImg,
    title: 'Circular Economy',
    subtitle: 'Transform waste into valuable resources'
  },
  {
    url: collectImg,
    title: 'Community Engagement',
    subtitle: 'Building a cleaner Rwanda together'
  },
  {
    url: buyImg,
    title: 'Sustainable Future',
    subtitle: 'Green cities for future generations'
  }
];

const features = [
  {
    icon: Recycle,
    title: 'Smart Collection',
    description: 'AI-powered route optimization for efficient waste pickup'
  },
  {
    icon: Award,
    title: 'Rewards System',
    description: 'Earn points for recycling and redeem exciting rewards'
  },
  {
    icon: Users,
    title: 'Community Hub',
    description: 'Connect with neighbors for environmental initiatives'
  },
  {
    icon: TrendingUp,
    title: 'Analytics',
    description: 'Track your environmental impact with detailed insights'
  }
];

const testimonials = [
  {
    name: 'Jean Mutabazi',
    role: 'Resident, Kigali',
    rating: 5,
    text: 'Green Care has transformed how we manage waste in our community. The app makes scheduling pickups so easy, and I love earning rewards for recycling!'
  },
  {
    name: 'Marie Uwase',
    role: 'Business Owner',
    rating: 5,
    text: 'As a business owner, the comprehensive waste management system helps us stay compliant while reducing our environmental footprint. Highly recommended!'
  },
  {
    name: 'Patrick Nkusi',
    role: 'Collector',
    rating: 5,
    text: 'The mobile collector app has made my job so much easier. Route optimization saves time and fuel, and the digital tracking keeps everything organized.'
  }
];

export function LandingPage({ onGetStarted, onShopClick, onBuyerClick }: LandingPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-[80px]">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-[#0a1a0f]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
              <GreenCareLogo size="md" variant={scrolled ? 'light' : 'dark'} showTagline />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('hero')}
                className={`font-medium transition-colors hover:text-green-600 ${
                  scrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('vision')}
                className={`font-medium transition-colors hover:text-green-600 ${
                  scrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                Vision
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className={`font-medium transition-colors hover:text-green-600 ${
                  scrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className={`font-medium transition-colors hover:text-green-600 ${
                  scrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                Testimonials
              </button>
              <Button 
                onClick={onShopClick}
                variant="outline"
                className={`border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors bg-transparent ${scrolled ? '' : 'border-white text-white hover:bg-white hover:text-green-600'}`}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Eco Shop
              </Button>
              <Button 
                onClick={onGetStarted}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden transition-colors ${
                scrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
            >
              <div className="px-4 py-4 space-y-3">
                <button
                  onClick={() => scrollToSection('hero')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection('vision')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Vision
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Testimonials
                </button>
                <Button 
                  onClick={onGetStarted}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section — image slider only */}
      <section id="hero" className="relative h-[65vh] min-h-[400px] max-h-[600px] overflow-hidden" style={{ backgroundColor: '#0a1a0f' }}>
        <style>{`
          .hero-gradient-overlay {
            background: linear-gradient(to top right, rgba(10, 26, 15, 0.85), transparent);
          }
          .hero-badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: var(--gc-green-light);
            display: inline-block;
            animation: hero-pulse 2s infinite;
          }
          @keyframes hero-pulse {
            0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--gc-green-light-rgb), 0.4); }
            50% { opacity: 0.7; transform: scale(1.3); box-shadow: 0 0 0 4px rgba(var(--gc-green-light-rgb), 0); }
          }
          .hero-nav-btn {
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            cursor: pointer;
            transition: all 0.25s ease;
            padding: 0;
          }
          .hero-nav-btn:hover {
            background: rgba(255,255,255,0.18);
          }
          .hero-dot {
            height: 8px;
            border-radius: 9999px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 0;
          }
          .hero-dot-active {
            width: 32px;
            background: var(--gc-green-light);
          }
          .hero-dot-inactive {
            width: 8px;
            background: rgba(255,255,255,0.3);
          }
          .hero-dot-inactive:hover {
            background: rgba(255,255,255,0.5);
          }
          .hero-economy-gradient {
            background: linear-gradient(to right, var(--gc-green-light), var(--gc-green));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}</style>
        {/* Background Image Slider */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
              style={{ backgroundColor: '#0a1a0f' }}
            >
              <img
                src={heroImages[currentImageIndex].url}
                alt={heroImages[currentImageIndex].title}
                className="w-full h-full object-cover object-[center_30%]"
                loading="eager"
              />
              <div className="absolute inset-0 hero-gradient-overlay" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`hero-dot ${index === currentImageIndex ? 'hero-dot-active' : 'hero-dot-inactive'}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prevImage}
                  className="hero-nav-btn"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="hero-nav-btn"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section
        id="vision"
        className="vision-section"
        style={{ background: '#f7f9f7' }}
      >
        <style>{`
          .vision-section {
            content-visibility: auto;
            contain-intrinsic-size: auto 600px;
          }
          .vision-header {
            text-align: center;
            margin-bottom: 48px;
          }
          .vision-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            max-width: 1100px;
            margin: 48px auto 0;
          }
          .vision-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 32px 28px;
            transition: border-color 0.2s ease;
          }
          .vision-card:hover {
            border-color: var(--gc-green);
          }
          .vision-card-title {
            font-size: 1rem;
            font-weight: 700;
            color: var(--gc-dark);
            margin-top: 20px;
            margin-bottom: 10px;
          }
          .vision-card-body {
            font-size: 0.9rem;
            color: #6b7280;
            line-height: 1.65;
          }
          @media (max-width: 767px) {
            .vision-header {
              text-align: left;
            }
            .vision-header p {
              margin-left: 0 !important;
              margin-right: 0 !important;
            }
            .vision-cards {
              grid-template-columns: 1fr;
              margin-top: 32px;
            }
          }
        `}</style>
        <div
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(var(--gc-green-rgb),0.06) 0%, transparent 70%)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: '48px 0' }}>
            <div className="vision-header">
              <div
                style={{
                  color: 'var(--gc-green)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontWeight: 700,
                  marginBottom: '16px'
                }}
              >
                Our Vision
              </div>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 800,
                  color: 'var(--gc-dark)',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  marginBottom: '20px'
                }}
              >
                A Cleaner, <span style={{ borderBottom: '3px solid var(--gc-green-light)', borderRadius: '2px', paddingBottom: '2px' }}>Greener</span> Rwanda
              </h2>
              <p
                style={{
                  color: '#4b5563',
                  fontSize: '1.05rem',
                  lineHeight: 1.75,
                  maxWidth: '560px',
                  margin: '0 auto'
                }}
              >
                We envision a Rwanda where waste is not a problem but an opportunity.
                Through innovation and community engagement, we're building a sustainable
                circular economy for future generations.
              </p>
            </div>

            <div className="vision-cards">
              {[
                {
                  icon: Target,
                  title: 'Our Mission',
                  description: 'To revolutionize waste management in Rwanda through technology, making it efficient, accessible, and rewarding for everyone.'
                },
                {
                  icon: Heart,
                  title: 'Our Values',
                  description: 'Sustainability, innovation, community engagement, and environmental stewardship guide everything we do.'
                },
                {
                  icon: Globe,
                  title: 'Our Impact',
                  description: 'Creating jobs, reducing pollution, and building a circular economy that benefits both people and planet.'
                }
              ].map((item, index) => (
                <div key={index} className="vision-card">
                  <item.icon style={{ width: '28px', height: '28px', color: 'var(--gc-green)' }} strokeWidth={1.5} />
                  <h3 className="vision-card-title">{item.title}</h3>
                  <p className="vision-card-body">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="features-section"
        style={{ background: 'var(--gc-dark)', padding: '48px 0' }}
      >
        <style>{`
          .features-section {
            content-visibility: auto;
            contain-intrinsic-size: auto 700px;
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1px;
            margin-top: 48px;
          }
          .features-cell {
            background: rgba(255,255,255,0.03);
            padding: 36px 32px;
            transition: background 0.2s ease;
          }
          .features-cell:hover {
            background: rgba(var(--gc-green-light-rgb),0.06);
          }
          .features-title {
            font-size: 1.05rem;
            font-weight: 700;
            color: #ffffff;
            margin-top: 20px;
            margin-bottom: 8px;
          }
          .features-desc {
            font-size: 0.875rem;
            color: rgba(255,255,255,0.5);
            line-height: 1.65;
          }
          .features-btn {
            background: transparent;
            border: 1px solid rgba(var(--gc-green-light-rgb),0.4);
            color: var(--gc-green-light);
            padding: 12px 28px;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            letter-spacing: 0.04em;
            cursor: pointer;
            transition: all 0.25s ease;
          }
          .features-btn:hover {
            background: rgba(var(--gc-green-light-rgb),0.08);
            border-color: var(--gc-green-light);
          }
          @media (max-width: 767px) {
            .features-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }}>
          <div
            style={{
              color: 'var(--gc-green-light)',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 700,
              marginBottom: '16px'
            }}
          >
            Features
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.875rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              maxWidth: '500px',
              marginBottom: '16px'
            }}
          >
            Everything You Need
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '1rem',
              lineHeight: 1.7,
              maxWidth: '420px'
            }}
          >
            Our comprehensive platform brings together cutting-edge technology
            and user-friendly design to make waste management effortless.
          </p>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="features-cell">
                <feature.icon style={{ width: '24px', height: '24px', color: 'var(--gc-green-light)' }} strokeWidth={1.5} />
                <h3 className="features-title">{feature.title}</h3>
                <p className="features-desc">{feature.description}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <button
              onClick={onGetStarted}
              className="features-btn"
            >
              Explore All Features →
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="testimonials-section"
        style={{ background: '#f7f9f7' }}
      >
        <style>{`
          .testimonials-section {
            content-visibility: auto;
            contain-intrinsic-size: auto 600px;
          }
          .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-top: 56px;
          }
          .testimonial-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 32px 28px;
            transition: border-color 0.2s ease;
          }
          .testimonial-card:hover {
            border-color: var(--gc-green);
          }
          .testimonial-quote {
            position: relative;
            font-style: normal;
            font-size: 0.925rem;
            line-height: 1.75;
            color: #374151;
            margin: 0;
          }
          .testimonial-quote::before {
            content: '"';
            font-size: 4rem;
            color: rgba(var(--gc-green-rgb),0.15);
            line-height: 0;
            position: absolute;
            top: 8px;
            left: -4px;
            font-family: Georgia, serif;
          }
          .testimonial-divider {
            border-top: 1px solid #f3f4f6;
            padding-top: 20px;
            margin-top: 20px;
          }
          .testimonial-avatar-row {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          @media (max-width: 767px) {
            .testimonials-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
        <div
          style={{
            background: 'radial-gradient(ellipse 50% 50% at 50% 100%, rgba(var(--gc-green-rgb),0.05) 0%, transparent 70%)'
          }}
        >
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  color: 'var(--gc-green)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontWeight: 700,
                  marginBottom: '16px'
                }}
              >
                Testimonials
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)',
                  fontWeight: 800,
                  color: 'var(--gc-dark)',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  marginBottom: '16px'
                }}
              >
                What Our Users Say
              </h2>
            </div>

            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div style={{ color: 'var(--gc-green)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    {'★'.repeat(testimonial.rating)}
                  </div>
                  <p className="testimonial-quote">{testimonial.text}</p>
                  <div className="testimonial-divider">
                    <div className="testimonial-avatar-row">
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          color: 'var(--gc-green)',
                          background: 'rgba(22, 163, 74, 0.1)'
                        }}
                      >
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gc-dark)' }}>
                          {testimonial.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.775rem',
                            color: '#9ca3af',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em'
                          }}
                        >
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="cta-section"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '48px 24px'
        }}
      >
        <style>{`
          .cta-section {
            content-visibility: auto;
            contain-intrinsic-size: auto 400px;
            background: linear-gradient(135deg, #0a1a0f 0%, #14532d 50%, #0a1a0f 100%);
          }
          .cta-noise::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
            pointer-events: none;
            z-index: 0;
          }
          .cta-glow-top {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle 400px at 85% 20%, rgba(var(--gc-green-light-rgb),0.12) 0%, transparent 70%);
            pointer-events: none;
            z-index: 0;
          }
          .cta-glow-bottom {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle 300px at 15% 80%, rgba(var(--gc-green-rgb),0.08) 0%, transparent 70%);
            pointer-events: none;
            z-index: 0;
          }
          .cta-gradient-text {
            background: linear-gradient(90deg, var(--gc-green-light), var(--gc-green));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .cta-btn {
            background: var(--gc-green-light);
            color: #0a1a0f;
            padding: 15px 36px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 0.95rem;
            letter-spacing: 0.02em;
            border: none;
            cursor: pointer;
            transition: background 0.2s ease, box-shadow 0.2s ease;
          }
          .cta-btn:hover {
            background: #86efac;
            box-shadow: 0 0 24px rgba(var(--gc-green-light-rgb),0.35);
          }
          @media (max-width: 767px) {
            .cta-btn {
              width: 100%;
            }
          }
        `}</style>
        <div className="cta-noise" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <div className="cta-glow-top" />
          <div className="cta-glow-bottom" />
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '16px'
            }}
          >
            Ready to Make<br />a <span className="cta-gradient-text">Difference</span>?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              maxWidth: '480px',
              margin: '16px auto 32px'
            }}
          >
            Join Green Care Rwanda today and be part of the solution for a cleaner,
            greener future.
          </p>
          <button
            onClick={onGetStarted}
            className="cta-btn"
          >
            Start Your Journey →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="footer"
        style={{ background: 'var(--gc-dark)', borderTop: '1px solid rgba(var(--gc-green-light-rgb),0.12)' }}
      >
        <style>{`
          .footer {
            content-visibility: auto;
            contain-intrinsic-size: auto 300px;
          }
          .footer-grid {
            display: grid;
            grid-template-columns: 1.25fr 1fr 1fr 1fr;
            gap: 48px;
            max-width: 1100px;
            margin: 0 auto;
            padding: 64px 16px 0;
          }
          .footer-heading {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-weight: 700;
            color: rgba(255,255,255,0.35);
            margin-bottom: 20px;
          }
          .footer-link {
            font-size: 0.875rem;
            color: rgba(255,255,255,0.6);
            line-height: 2.2;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            text-align: left;
            transition: color 0.15s ease;
          }
          .footer-link:hover {
            color: var(--gc-green-light);
          }
          .footer-contact-row {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 12px;
            font-size: 0.875rem;
            color: rgba(255,255,255,0.6);
          }
          .footer-social-icon {
            color: rgba(255,255,255,0.45);
            transition: color 0.15s ease;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
          }
          .footer-social-icon:hover {
            color: var(--gc-green-light);
          }
          .footer-bottom {
            border-top: 1px solid rgba(255,255,255,0.07);
            padding: 24px 16px;
            max-width: 1100px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer-legal-link {
            font-size: 0.8rem;
            color: rgba(255,255,255,0.3);
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            transition: color 0.15s ease;
          }
          .footer-legal-link:hover {
            color: rgba(255,255,255,0.6);
          }
          @media (max-width: 767px) {
            .footer-grid {
              grid-template-columns: 1fr 1fr;
              padding-top: 48px;
            }
            .footer-bottom {
              flex-direction: column;
              text-align: center;
              gap: 12px;
            }
          }
          @media (max-width: 479px) {
            .footer-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
        <div className="footer-grid">
          {/* Company Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <img src="/src/images/greencare-icon.png" alt="GreenCare Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>GreenCare</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Rwanda</div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: '220px' }}>
              Revolutionizing waste management for a sustainable future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div className="footer-heading">Quick Links</div>
            <div>
              <button onClick={() => scrollToSection('hero')} className="footer-link" style={{ display: 'block' }}>Home</button>
              <button onClick={() => scrollToSection('vision')} className="footer-link" style={{ display: 'block' }}>Vision</button>
              <button onClick={() => scrollToSection('features')} className="footer-link" style={{ display: 'block' }}>Features</button>
              <button onClick={() => scrollToSection('testimonials')} className="footer-link" style={{ display: 'block' }}>Testimonials</button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="footer-heading">Contact Us</div>
            <div className="footer-contact-row">
              <Mail style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.35)', flexShrink: 0, marginTop: '3px' }} strokeWidth={1.5} />
              <span>info@greencare.rw</span>
            </div>
            <div className="footer-contact-row">
              <Phone style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.35)', flexShrink: 0, marginTop: '3px' }} strokeWidth={1.5} />
              <span>+250 788 123 456</span>
            </div>
            <div className="footer-contact-row">
              <MapPin style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.35)', flexShrink: 0, marginTop: '3px' }} strokeWidth={1.5} />
              <span>Kigali, Rwanda</span>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <div className="footer-heading">Follow Us</div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <button className="footer-social-icon">
                <Facebook style={{ width: '20px', height: '20px' }} strokeWidth={1.5} />
              </button>
              <button className="footer-social-icon">
                <Twitter style={{ width: '20px', height: '20px' }} strokeWidth={1.5} />
              </button>
              <button className="footer-social-icon">
                <Instagram style={{ width: '20px', height: '20px' }} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
            © 2026 Green Care Rwanda Ltd. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="footer-legal-link">Privacy Policy</button>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>·</span>
            <button className="footer-legal-link">Terms of Service</button>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>·</span>
            <button className="footer-legal-link">Cookie Policy</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
