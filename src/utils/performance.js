// Performance optimization utilities

// Debounce function to limit function calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function to limit function calls
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Preload critical resources
export const preloadResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Prefetch non-critical resources
export const prefetchResource = (href) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  
  // Send to analytics if available
  if (window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: name,
      value: Math.round(end - start)
    });
  }
  
  return result;
};

// Async performance measurement
export const measureAsyncPerformance = async (name, fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  
  // Send to analytics if available
  if (window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: name,
      value: Math.round(end - start)
    });
  }
  
  return result;
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    };
  }
  return null;
};

// Image optimization
export const optimizeImage = (src, width, quality = 0.8) => {
  // Add image optimization parameters
  const url = new URL(src, window.location.origin);
  url.searchParams.set('w', width);
  url.searchParams.set('q', quality);
  return url.toString();
};

// Lazy load images
export const lazyLoadImage = (imgElement, src) => {
  const observer = createIntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  observer.observe(imgElement);
};

// Cache management
export const clearOldCaches = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      name !== 'attendance-checker-v1.0.0'
    );
    
    await Promise.all(
      oldCaches.map(name => caches.delete(name))
    );
  }
};

// Bundle size monitoring
export const getBundleSize = () => {
  const scripts = document.querySelectorAll('script[src]');
  let totalSize = 0;
  
  scripts.forEach(script => {
    const src = script.src;
    if (src.includes('static/js/')) {
      // This is a rough estimate
      totalSize += 100; // KB estimate
    }
  });
  
  return totalSize;
};

// Performance budget checking
export const checkPerformanceBudget = () => {
  const metrics = {
    bundleSize: getBundleSize(),
    memoryUsage: getMemoryUsage(),
    loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
  };
  
  const budget = {
    bundleSize: 500, // KB
    memoryUsage: 50, // MB
    loadTime: 3000 // ms
  };
  
  const violations = [];
  
  if (metrics.bundleSize > budget.bundleSize) {
    violations.push(`Bundle size (${metrics.bundleSize}KB) exceeds budget (${budget.bundleSize}KB)`);
  }
  
  if (metrics.memoryUsage && metrics.memoryUsage.used > budget.memoryUsage * 1024 * 1024) {
    violations.push(`Memory usage (${Math.round(metrics.memoryUsage.used / 1024 / 1024)}MB) exceeds budget (${budget.memoryUsage}MB)`);
  }
  
  if (metrics.loadTime > budget.loadTime) {
    violations.push(`Load time (${metrics.loadTime}ms) exceeds budget (${budget.loadTime}ms)`);
  }
  
  return {
    metrics,
    budget,
    violations,
    isWithinBudget: violations.length === 0
  };
};

// Critical CSS inlining
export const inlineCriticalCSS = () => {
  // This would be implemented based on your build process
  // For now, we'll just log that it should be done
  console.log('Critical CSS should be inlined during build process');
};

// Service Worker performance monitoring
export const monitorServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'PERFORMANCE') {
        console.log('Service Worker Performance:', event.data.metrics);
      }
    });
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  // Monitor memory usage
  setInterval(() => {
    const memory = getMemoryUsage();
    if (memory && memory.used > 100 * 1024 * 1024) { // 100MB
      console.warn('High memory usage detected:', memory);
    }
  }, 30000); // Check every 30 seconds
  
  // Monitor performance budget
  window.addEventListener('load', () => {
    setTimeout(() => {
      const budgetCheck = checkPerformanceBudget();
      if (!budgetCheck.isWithinBudget) {
        console.warn('Performance budget violations:', budgetCheck.violations);
      }
    }, 1000);
  });
  
  // Monitor service worker
  monitorServiceWorker();
}; 