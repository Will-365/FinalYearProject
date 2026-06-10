import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { 
  Recycle, 
  Leaf, 
  Users, 
  TrendingUp, 
  Award,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Star,
  Target,
  Heart,
  Globe,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1766849306046-5e750cc0d51a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXN0ZSUyMG1hbmFnZW1lbnQlMjByZWN5Y2xpbmclMjB0cnVja3xlbnwxfHx8fDE3Njg5MTA0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Smart Waste Collection',
    subtitle: 'Optimized routes and scheduled pickups'
  },
  {
    url: 'https://images.unsplash.com/photo-1749805339958-4b1d0f16423d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHJlY3ljbGluZyUyMGVudmlyb25tZW50fGVufDF8fHx8MTc2ODkxMDQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Circular Economy',
    subtitle: 'Transform waste into valuable resources'
  },
  {
    url: 'https://images.unsplash.com/photo-1758599668299-beebedfabf7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBjbGVhbmluZyUyMHZvbHVudGVlcnN8ZW58MXx8fHwxNzY4OTEwNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Community Engagement',
    subtitle: 'Building a cleaner Rwanda together'
  },
  {
    url: 'https://images.unsplash.com/photo-1593947594304-28d926c7ce06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGNpdHklMjBncmVlbnxlbnwxfHx8fDE3Njg4MTY1NjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
    image: '👨🏾',
    rating: 5,
    text: 'Green Care has transformed how we manage waste in our community. The app makes scheduling pickups so easy, and I love earning rewards for recycling!'
  },
  {
    name: 'Marie Uwase',
    role: 'Business Owner',
    image: '👩🏾',
    rating: 5,
    text: 'As a business owner, the comprehensive waste management system helps us stay compliant while reducing our environmental footprint. Highly recommended!'
  },
  {
    name: 'Patrick Nkusi',
    role: 'Collector',
    image: '👨🏾‍💼',
    rating: 5,
    text: 'The mobile collector app has made my job so much easier. Route optimization saves time and fuel, and the digital tracking keeps everything organized.'
  }
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '2M kg', label: 'Waste Recycled' },
  { value: '98%', label: 'Customer Satisfaction' },
  { value: '1,200+', label: 'Trees Planted' }
];

export function LandingPage({ onGetStarted }: LandingPageProps) {
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
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
              <div className={`p-2 rounded-lg transition-colors ${
                scrolled ? 'bg-green-600' : 'bg-white'
              }`}>
                <Recycle className={`h-7 w-7 ${scrolled ? 'text-white' : 'text-green-600'}`} />
              </div>
              <div>
                <h1 className={`font-bold text-xl transition-colors ${
                  scrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  Green Care
                </h1>
                <p className={`text-xs transition-colors ${
                  scrolled ? 'text-gray-600' : 'text-green-100'
                }`}>
                  Rwanda
                </p>
              </div>
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
                onClick={onGetStarted}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Get Started
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

      {/* Hero Section */}
      <section id="hero" className="relative h-screen overflow-hidden">
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
            >
              <img
                src={heroImages[currentImageIndex].url}
                alt={heroImages[currentImageIndex].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <motion.div
                key={`content-${currentImageIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Badge className="mb-4 bg-green-600 text-white border-0 text-sm px-4 py-1">
                  Sustainable Waste Management
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  {heroImages[currentImageIndex].title}
                </h1>
                <p className="text-xl md:text-2xl text-green-100 mb-8">
                  {heroImages[currentImageIndex].subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={onGetStarted}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6"
                  >
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={() => scrollToSection('vision')}
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-6"
                  >
                    Learn More
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
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
                    className={`h-2 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'w-8 bg-white' 
                        : 'w-2 bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prevImage}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-green-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-green-100 text-green-800 border-0">Our Vision</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              A Cleaner, Greener Rwanda
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We envision a Rwanda where waste is not a problem but an opportunity. 
              Through innovation and community engagement, we're building a sustainable 
              circular economy for future generations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                      <item.icon className="h-7 w-7 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-green-100 text-green-800 border-0">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform brings together cutting-edge technology 
              and user-friendly design to make waste management effortless.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group hover:bg-green-600 transition-colors">
                  <feature.icon className="h-10 w-10 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Explore All Features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-green-600 text-white border-0">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied users who are making a difference in their communities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{testimonial.image}</div>
                      <div>
                        <div className="font-bold">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join Green Care Rwanda today and be part of the solution for a cleaner, 
              greener future.
            </p>
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-white text-green-600 hover:bg-green-50 text-lg px-8 py-6"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Recycle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Green Care</h3>
                  <p className="text-sm text-gray-400">Rwanda</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Revolutionizing waste management for a sustainable future.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('hero')} className="block text-gray-400 hover:text-white transition-colors">Home</button>
                <button onClick={() => scrollToSection('vision')} className="block text-gray-400 hover:text-white transition-colors">Vision</button>
                <button onClick={() => scrollToSection('features')} className="block text-gray-400 hover:text-white transition-colors">Features</button>
                <button onClick={() => scrollToSection('testimonials')} className="block text-gray-400 hover:text-white transition-colors">Testimonials</button>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">Contact Us</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>info@greencare.rw</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>+250 788 123 456</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>Kigali, Rwanda</span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex gap-3">
                <button className="bg-gray-800 hover:bg-green-600 p-3 rounded-lg transition-colors">
                  <Facebook className="h-5 w-5" />
                </button>
                <button className="bg-gray-800 hover:bg-green-600 p-3 rounded-lg transition-colors">
                  <Twitter className="h-5 w-5" />
                </button>
                <button className="bg-gray-800 hover:bg-green-600 p-3 rounded-lg transition-colors">
                  <Instagram className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 Green Care Rwanda Ltd. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
              <button className="hover:text-white transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
