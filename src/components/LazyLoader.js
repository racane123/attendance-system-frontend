import React, { Suspense } from 'react';

// Loading component for lazy-loaded components
const LoadingFallback = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
    <span className="text-gray-600">{message}</span>
  </div>
);

// Error boundary for lazy-loaded components
class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Component failed to load</div>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy loader wrapper component
const LazyLoader = ({ 
  component: LazyComponent, 
  fallback = <LoadingFallback />,
  errorFallback = null 
}) => {
  return (
    <LazyErrorBoundary>
      <Suspense fallback={fallback}>
        <LazyComponent />
      </Suspense>
    </LazyErrorBoundary>
  );
};

export default LazyLoader;
export { LoadingFallback, LazyErrorBoundary }; 