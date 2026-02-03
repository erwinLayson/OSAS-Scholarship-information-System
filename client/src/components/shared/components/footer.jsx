import { NavLink } from "react-router-dom";
import { 
  GraduationCapIcon, 
  MailIcon, 
  PhoneIcon, 
  MapPinIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedInIcon,
  InstagramIcon
} from "../Icons";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const resources = [
    { name: 'Student Portal', to: '/student/login' },
    { name: 'Admin Portal', to: '/login' },
    { name: 'Apply Now', to: '/applicant/register' },
    { name: 'FAQ', href: '#' },
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: About */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <GraduationCapIcon className="text-white" size="1.25rem" />
              </div>
              <span className="text-xl font-bold text-white">
                OSAS<span className="text-emerald-500">.</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Office of Student Affairs and Services - Scholarship Application System. 
              Empowering students through accessible scholarship opportunities.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon size="1.25rem" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon size="1.25rem" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon size="1.25rem" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon size="1.25rem" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.name}>
                  {link.to ? (
                    <NavLink 
                      to={link.to}
                      className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                    >
                      {link.name}
                    </NavLink>
                  ) : (
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPinIcon className="text-emerald-500 flex-shrink-0 mt-0.5" size="1.25rem" />
                <span className="text-gray-400 text-sm">
                  123 University Avenue,<br />
                  Campus City, PH 12345
                </span>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="text-emerald-500 flex-shrink-0" size="1.25rem" />
                <a href="tel:+639123456789" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                  +63 912 345 6789
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MailIcon className="text-emerald-500 flex-shrink-0" size="1.25rem" />
                <a href="mailto:osas@university.edu" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                  osas@university.edu
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} OSAS System. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}