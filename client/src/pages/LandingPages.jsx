import { NavLink } from "react-router-dom";
import { Navbar, Footer } from "../components/shared/components";
import useScrollAnimation, { useCountUp } from "../hooks/useScrollAnimation";
import { 
  ShieldIcon, 
  ClockIcon, 
  ChartIcon, 
  UsersIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
  GraduationCapIcon,
  AwardIcon,
  FileTextIcon,
  StarIcon,
  ClipboardIcon,
  SearchIcon
} from "../components/shared/Icons";

// Placeholder images from Unsplash
const HERO_IMAGE = "https://tse4.mm.bing.net/th/id/OIP.cseeid5aHXwHcMgpYt3YlAHaCv?rs=1&pid=ImgDetMain&o=7&rm=3";
const TESTIMONIAL_AVATAR_1 = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";
const TESTIMONIAL_AVATAR_2 = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80";
const TESTIMONIAL_AVATAR_3 = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80";

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay }) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={ref}
      className={`
        bg-white rounded-xl p-6 border border-gray-100 shadow-sm
        hover:shadow-lg hover:-translate-y-1 transition-all duration-300
        scroll-animate fade-up ${isVisible ? 'is-visible' : ''}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

// Stat Counter Component
const StatCounter = ({ end, suffix = '', label }) => {
  const { ref, count } = useCountUp(end, 2000);
  
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {count}{suffix}
      </div>
      <div className="text-emerald-100 font-medium">{label}</div>
    </div>
  );
};

// Step Card Component
const StepCard = ({ number, title, description, isLast }) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={ref}
      className={`
        relative flex flex-col items-center text-center
        scroll-animate fade-up ${isVisible ? 'is-visible' : ''}
      `}
      style={{ transitionDelay: `${number * 150}ms` }}
    >
      {/* Connector line */}
      {!isLast && (
        <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-emerald-200" />
      )}
      
      {/* Step number */}
      <div className="relative z-10 w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
        {number}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm max-w-xs">{description}</p>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ quote, name, role, avatar, delay }) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={ref}
      className={`
        bg-white rounded-xl p-6 shadow-sm border border-gray-100
        hover:shadow-md transition-all duration-300
        scroll-animate fade-up ${isVisible ? 'is-visible' : ''}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Stars */}
      <div className="flex gap-1 text-amber-400 mb-4">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} size="1rem" />
        ))}
      </div>
      
      <p className="text-gray-600 mb-6 italic">"{quote}"</p>
      
      <div className="flex items-center gap-3">
        <img 
          src={avatar} 
          alt={name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{role}</div>
        </div>
      </div>
    </div>
  );
};

export function LandingPages() {
  const heroAnim = useScrollAnimation({ threshold: 0.1 });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section id="home" className="relative min-h-[80vh] sm:min-h-[75vh] md:min-h-[70vh] lg:min-h-[65vh] overflow-hidden">
        {/* Responsive background image */}
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/45"
          style={{ backdropFilter: 'blur(2px)' }}
        />
        {/* Responsive object-position overrides */}
        <style>{`
          @media (max-width: 639px) {
            #home img { object-position: center 18% !important; }
          }
          @media (min-width: 640px) and (max-width: 1023px) {
            #home img { object-position: center 28% !important; }
          }
          @media (min-width: 1024px) {
            #home img { object-position: center 35% !important; }
          }
        `}</style>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
            {/* Left Content */}
            <div 
              ref={heroAnim.ref}
              className={`scroll-animate fade-right ${heroAnim.isVisible ? 'is-visible' : ''}`}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <AwardIcon size="1rem" />
                Empowering Student Success
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Your Gateway to{' '}
                <span className="text-emerald-200">Scholarship</span>{' '}
                Opportunities
              </h1>
              
              <p className="text-lg text-gray-200 mb-8 max-w-lg">
                OSAS is a scholarship management system that lets students browse, apply, and track 
                scholarship applications — while giving administrators powerful tools to manage 
                scholarships, review applications, and monitor student progress.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <NavLink 
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  Get Started
                  <ArrowRightIcon size="1.25rem" />
                </NavLink>
                
                <a 
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/90 text-gray-800 rounded-lg font-semibold border border-white/20 hover:border-emerald-300 hover:text-emerald-300 transition-all backdrop-blur-sm"
                >
                  Learn More
                </a>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-10 pt-8 border-t border-white/20">
                <p className="text-sm text-gray-300 mb-3">Trusted by students and institutions</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="text-emerald-300" size="1.25rem" />
                    <span className="text-white/80 font-medium">Secure & Reliable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="text-emerald-300" size="1.25rem" />
                    <span className="text-white/80 font-medium">Easy to Use</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Content */}
            <div className={`relative scroll-animate fade-left ${heroAnim.isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: '200ms' }}>
              {/* Empty — hero image now serves as full background */}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES SECTION
          ============================================ */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-600">
              Our comprehensive platform provides all the tools necessary for efficient 
              scholarship management and application tracking.
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<SearchIcon size="1.5rem" />}
              title="Browse Scholarships"
              description="Explore available scholarships with details on amounts, slots, deadlines, and requirements."
              delay={0}
            />
            <FeatureCard 
              icon={<FileTextIcon size="1.5rem" />}
              title="Apply with Documents"
              description="Submit scholarship applications with required documents like COE, TOR, and COR."
              delay={100}
            />
            <FeatureCard 
              icon={<ClockIcon size="1.5rem" />}
              title="Track Applications"
              description="Monitor your pending and past applications with real-time status updates."
              delay={200}
            />
            <FeatureCard 
              icon={<ChartIcon size="1.5rem" />}
              title="View Academic Grades"
              description="Check your grades and academic performance to see scholarship eligibility."
              delay={300}
            />
            <FeatureCard 
              icon={<ClipboardIcon size="1.5rem" />}
              title="Manage Scholarships"
              description="Admins can create and manage scholarship programs with amounts, slots, and deadlines."
              delay={400}
            />
            <FeatureCard 
              icon={<CheckCircleIcon size="1.5rem" />}
              title="Review Applications"
              description="Admins can review, approve, or reject student applications from a unified dashboard."
              delay={500}
            />
            <FeatureCard 
              icon={<ShieldIcon size="1.5rem" />}
              title="Admin User Management"
              description="Manage admin accounts and student records with role-based access control."
              delay={600}
            />
            <FeatureCard 
              icon={<ChartIcon size="1.5rem" />}
              title="Generate Reports"
              description="Generate and download reports on applications, approvals, and system activity."
              delay={700}
            />
          </div>
        </div>
      </section>

      {/* ============================================
          STATISTICS SECTION
          ============================================ */}
      <section id="about" className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter end={250} suffix="+" label="Students Registered" />
            <StatCounter end={12} suffix="+" label="Active Scholarships" />
            <StatCounter end={180} suffix="+" label="Applications Processed" />
            <StatCounter end={85} suffix="%" label="Approval Rate" />
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS SECTION
          ============================================ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Steps to Get Started
            </h2>
            <p className="text-gray-600">
              Follow these easy steps to apply for scholarships and track your applications.
            </p>
          </div>
          
          {/* Steps */}
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard 
              number={1}
              title="Register & Login"
              description="Create a student account or log in to access the student portal."
            />
            <StepCard 
              number={2}
              title="Browse Scholarships"
              description="Explore available scholarships and view details like amounts, slots, and deadlines."
            />
            <StepCard 
              number={3}
              title="Apply with Documents"
              description="Submit your application with required documents such as COE, TOR, or COR."
            />
            <StepCard 
              number={4}
              title="Track & Get Reviewed"
              description="Track your application status. Admins review and approve or reject applications."
              isLast
            />
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS SECTION
          ============================================ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Students Say
            </h2>
            <p className="text-gray-600">
              Hear from students who have successfully used our platform.
            </p>
          </div>
          
          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="I was able to browse all available scholarships and apply directly with my documents. The tracking feature helped me know exactly where my application stood."
              name="Maria Santos"
              role="BS Computer Science Student"
              avatar={TESTIMONIAL_AVATAR_2}
              delay={0}
            />
            <TestimonialCard 
              quote="The grade viewing feature let me check my academic standing before applying. I could see which scholarships I qualified for based on my grades."
              name="Juan Dela Cruz"
              role="BS Engineering Student"
              avatar={TESTIMONIAL_AVATAR_1}
              delay={100}
            />
            <TestimonialCard 
              quote="Managing scholarship programs and reviewing student applications is now much faster. The dashboard gives me a clear overview of everything at a glance."
              name="Dr. Ricardo Reyes"
              role="Scholarship Program Administrator"
              avatar={TESTIMONIAL_AVATAR_3}
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section id="contact" className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students who have successfully received scholarships through our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink 
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <FileTextIcon size="1.25rem" />
              Apply Now
            </NavLink>
            
            <NavLink 
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-400 transition-all border border-emerald-400"
            >
              Login
            </NavLink>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}