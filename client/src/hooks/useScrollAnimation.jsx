import { useEffect, useRef, useState } from 'react';

/**
 * useScrollAnimation Hook
 * Uses Intersection Observer to detect when elements enter the viewport
 * for triggering CSS animations
 * 
 * @param {Object} options - Intersection Observer options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection
 * @param {boolean} options.triggerOnce - Only trigger animation once
 * @returns {Object} - { ref, isVisible }
 * 
 * Usage:
 * const { ref, isVisible } = useScrollAnimation();
 * <div ref={ref} className={`scroll-animate fade-up ${isVisible ? 'is-visible' : ''}`}>
 */
const useScrollAnimation = ({
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
} = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

/**
 * useScrollAnimations Hook (Plural)
 * For animating multiple elements with staggered delays
 * 
 * @param {number} count - Number of elements to track
 * @param {Object} options - Intersection Observer options
 * @returns {Array} - Array of { ref, isVisible } objects
 * 
 * Usage:
 * const animations = useScrollAnimations(3);
 * {items.map((item, i) => (
 *   <div ref={animations[i].ref} className={animations[i].isVisible ? 'is-visible' : ''}>
 * ))}
 */
export const useScrollAnimations = (count, options = {}) => {
  return Array.from({ length: count }, () => useScrollAnimation(options));
};

/**
 * useCountUp Hook
 * Animates a number counting up when visible
 * 
 * @param {number} end - Target number
 * @param {number} duration - Animation duration in ms
 * @param {Object} scrollOptions - Scroll animation options
 * @returns {Object} - { ref, count, isVisible }
 */
export const useCountUp = (end, duration = 2000, scrollOptions = {}) => {
  const { ref, isVisible } = useScrollAnimation(scrollOptions);
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime = null;
    const startValue = 0;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(easeOutQuart * (end - startValue) + startValue);
      
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return { ref, count, isVisible };
};

export default useScrollAnimation;
