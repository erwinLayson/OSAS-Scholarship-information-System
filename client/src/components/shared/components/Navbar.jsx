import { useState, useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom";
import { GraduationCapIcon } from "../Icons";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect for navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header 
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3' 
            : 'bg-white py-4'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <NavLink 
              to='/home' 
              className="flex items-center gap-2 group"
            >
              <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <GraduationCapIcon className="text-emerald-600" size="1.5rem" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                OSAS<span className="text-emerald-600">.</span>
              </span>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {/* Nav Links */}
              <ul className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      onClick={(e) => scrollToSection(e, link.href)}
                      className="text-gray-600 hover:text-emerald-600 font-medium transition-colors relative group"
                    >
                      {link.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                    </a>
                  </li>
                ))}
              </ul>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <NavLink 
                  to="/login" 
                  className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  Admin Login
                </NavLink>
                <NavLink 
                  to="/student/login" 
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-200"
                >
                  Student Portal
                </NavLink>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-emerald-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`
          fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300
          ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Slide-in */}
      <aside 
        className={`
          fixed top-0 right-0 h-full w-72 bg-white z-50 md:hidden
          transform transition-transform duration-300 ease-out shadow-2xl
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="text-lg font-bold text-gray-900">Menu</span>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Nav Links */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="block px-4 py-3 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="my-6 border-t border-gray-100"></div>

            {/* Auth Links */}
            <ul className="space-y-2">
              <li>
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => `
                    block px-4 py-3 rounded-lg font-medium transition-colors
                    ${isActive 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                    }
                  `}
                >
                  Admin Login
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/student/login" 
                  className="block px-4 py-3 bg-emerald-600 text-white text-center rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  Student Portal
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              © 2026 OSAS System
            </p>
          </div>
        </div>
      </aside>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20"></div>
    </>
  )
}