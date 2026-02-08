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
  StarIcon
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
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-50 to-transparent opacity-50" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div 
              ref={heroAnim.ref}
              className={`scroll-animate fade-right ${heroAnim.isVisible ? 'is-visible' : ''}`}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <AwardIcon size="1rem" />
                Empowering Student Success
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Your Gateway to{' '}
                <span className="text-emerald-600">Scholarship</span>{' '}
                Opportunities
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                OSAS simplifies the scholarship application process for students and 
                provides administrators with powerful tools to manage and review applications efficiently.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <NavLink 
                  to="/student/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5"
                >
                  Get Started
                  <ArrowRightIcon size="1.25rem" />
                </NavLink>
                
                <a 
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                >
                  Learn More
                </a>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-10 pt-8 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">Trusted by students and institutions</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="text-emerald-500" size="1.25rem" />
                    <span className="text-gray-700 font-medium">Secure & Reliable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="text-emerald-500" size="1.25rem" />
                    <span className="text-gray-700 font-medium">Easy to Use</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Hero Image */}
            <div className={`relative scroll-animate fade-left ${heroAnim.isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: '200ms' }}>
              <div className="relative">
                {/* Main image */}
                <img 
                  src={HERO_IMAGE}
                  alt="Students at university"
                  className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                />
                
                {/* Floating card 1 */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border border-gray-100 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <GraduationCapIcon className="text-emerald-600" size="1.25rem" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">500+</div>
                      <div className="text-sm text-gray-500">Scholarships Awarded</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating card 2 */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-lg border border-gray-100 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <img src={TESTIMONIAL_AVATAR_1} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                      <img src={TESTIMONIAL_AVATAR_2} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                      <img src={TESTIMONIAL_AVATAR_3} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">1000+</span>
                      <span className="text-gray-500"> Students</span>
                    </div>
                  </div>
                </div>
              </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<ShieldIcon size="1.5rem" />}
              title="Secure Applications"
              description="Your data is protected with industry-standard security measures and encrypted communications."
              delay={0}
            />
            <FeatureCard 
              icon={<ClockIcon size="1.5rem" />}
              title="Real-time Tracking"
              description="Monitor your application status in real-time with instant notifications and updates."
              delay={100}
            />
            <FeatureCard 
              icon={<ChartIcon size="1.5rem" />}
              title="Grade Management"
              description="Track your academic performance and maintain records for scholarship eligibility."
              delay={200}
            />
            <FeatureCard 
              icon={<UsersIcon size="1.5rem" />}
              title="Admin Dashboard"
              description="Powerful tools for administrators to review, approve, and manage applications efficiently."
              delay={300}
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
            <StatCounter end={1000} suffix="+" label="Students Served" />
            <StatCounter end={50} suffix="+" label="Scholarships Available" />
            <StatCounter end={5000} suffix="+" label="Applications Processed" />
            <StatCounter end={95} suffix="%" label="Success Rate" />
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
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            <StepCard 
              number={1}
              title="Create Account"
              description="Register with your student information and create a secure account to get started."
            />
            <StepCard 
              number={2}
              title="Browse & Apply"
              description="Explore available scholarships and submit your applications with required documents."
            />
            <StepCard 
              number={3}
              title="Get Approved"
              description="Track your application status and receive notifications when decisions are made."
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
              quote="OSAS made my scholarship application process so much easier. I was able to track everything in one place!"
              name="Maria Santos"
              role="Computer Science Student"
              avatar={TESTIMONIAL_AVATAR_2}
              delay={0}
            />
            <TestimonialCard 
              quote="The real-time notifications kept me informed at every step. I received my scholarship approval within weeks!"
              name="Juan Dela Cruz"
              role="Engineering Student"
              avatar={TESTIMONIAL_AVATAR_1}
              delay={100}
            />
            <TestimonialCard 
              quote="As an admin, this system has streamlined our entire scholarship management process. Highly recommended!"
              name="Dr. Ricardo Reyes"
              role="Scholarship Coordinator"
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
              Admin Portal
            </NavLink>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}