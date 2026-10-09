import { useState, useEffect, useRef } from "react"
import { NavLink, useLocation } from "react-router-dom";
import { GraduationCapIcon } from "../Icons";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
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

  // Close the dropdown when clicking outside the header or pressing Escape.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handlePointerDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

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

  // The landing-page links/auth buttons are pointless on the login/register screens.
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      <header 
        ref={headerRef}
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
            {!isAuthPage && (
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
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-200"
                >
                  Login
                </NavLink>
              </div>
            </nav>
            )}

            {/* Mobile Menu Button */}
            {!isAuthPage && (
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-emerald-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
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
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {!isAuthPage && (
          <div
            id="mobile-menu"
            className={`
              md:hidden absolute top-full left-0 right-0 origin-top
              transition-all duration-200 ease-out
              ${mobileMenuOpen
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-2 pointer-events-none'}
            `}
          >
            <div className="bg-white border-t border-gray-100 shadow-xl">
              <nav className="px-4 py-3">
                <ul className="space-y-1">
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
                <div className="my-3 border-t border-gray-100"></div>

                {/* Auth Links */}
                <ul>
                  <li>
                    <NavLink
                      to="/login"
                      className="block px-4 py-3 bg-emerald-600 text-white text-center rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Login
                    </NavLink>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20"></div>
    </>
  )
}