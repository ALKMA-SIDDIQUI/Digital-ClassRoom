import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F6F8FF] p-6 text-slate-800">
          <div className="max-w-md w-full rounded-2xl bg-white p-6 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-2xl font-bold">
              ⚠️
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
              <p className="mt-1 text-xs text-slate-500 break-words">
                {this.state.error?.message || "An unexpected error occurred while loading this view."}
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="rounded-xl bg-[#315BFF] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 transition cursor-pointer"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
