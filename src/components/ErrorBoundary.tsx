
import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Optionally log errorInfo to an error reporting service
    // e.g., Sentry
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary Caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Optionally reload page or rerender component
    // window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#181b20]">
          <h2 className="text-2xl font-bold mb-2 text-red-500">Something went wrong.</h2>
          <p className="text-gray-300 mb-4">
            <span className="font-semibold">Error:</span>{' '}
            {this.state.error?.message || "An error has occurred."}
          </p>
          <button
            className="px-4 py-2 bg-blue-600 rounded text-white font-bold hover:bg-blue-700"
            onClick={this.handleRetry}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
