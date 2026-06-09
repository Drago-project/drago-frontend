import React, { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            direction: "rtl",
            fontFamily: "Inter, Arial, sans-serif",
            background: "#fff7ed",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "18px" }}>⚠️</div>
          <h2 style={{ color: "#7c2d12", fontSize: "28px", margin: "0 0 12px" }}>
            حدث خطأ غير متوقع.
          </h2>
          <p style={{ color: "#7c5b45", fontSize: "16px", margin: "0 0 24px" }}>
            يرجى إعادة تحميل الصفحة للمحاولة مرة أخرى.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              background: "#f97316",
              color: "white",
              border: "none",
              borderRadius: "18px",
              padding: "14px 28px",
              fontSize: "18px",
              fontWeight: "950",
              cursor: "pointer",
              boxShadow: "0 14px 28px rgba(249, 115, 22, 0.2)",
            }}
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
