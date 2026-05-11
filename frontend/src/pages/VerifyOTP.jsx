import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/auth/verify-otp", { email, otp });
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");

    try {
      await API.post("/auth/resend-otp", { email });
      setTimeLeft(300);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!email) return null;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "40px",
        maxWidth: "400px",
        width: "100%",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
      }}>
        <h1 style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: "#0f172a",
          marginBottom: "8px",
          textAlign: "center"
        }}>
          Verify Your Email
        </h1>
        <p style={{
          color: "#64748b",
          textAlign: "center",
          marginBottom: "24px",
          fontSize: "14px"
        }}>
          Enter the 6-digit OTP sent to {email}
        </p>

        {success && (
          <div style={{
            background: "#d1fae5",
            border: "1px solid #6ee7b7",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "20px",
            color: "#065f46",
            textAlign: "center"
          }}>
            ✓ Email verified successfully! Redirecting...
          </div>
        )}

        {error && (
          <div style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "20px",
            color: "#991b1b",
            textAlign: "center",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#0f172a",
              fontWeight: "500"
            }}>
              Enter OTP
            </label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "24px",
                textAlign: "center",
                letterSpacing: "8px",
                fontWeight: "bold",
                boxSizing: "border-box",
                transition: "border-color 0.3s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              disabled={loading || success}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success || otp.length !== 6}
            style={{
              width: "100%",
              padding: "12px",
              background: loading || success || otp.length !== 6 ? "#cbd5e1" : "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: loading || success || otp.length !== 6 ? "not-allowed" : "pointer",
              transition: "background 0.3s",
              marginBottom: "16px"
            }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div style={{
          textAlign: "center",
          marginBottom: "16px"
        }}>
          <p style={{
            color: "#64748b",
            fontSize: "14px",
            margin: "0 0 8px 0"
          }}>
            OTP expires in: <strong style={{ color: timeLeft < 60 ? "#ef4444" : "#667eea" }}>
              {formatTime(timeLeft)}
            </strong>
          </p>
        </div>

        <button
          onClick={handleResend}
          disabled={!canResend || loading}
          style={{
            width: "100%",
            padding: "12px",
            background: canResend && !loading ? "#f3f4f6" : "#e5e7eb",
            color: canResend && !loading ? "#667eea" : "#9ca3af",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: canResend && !loading ? "pointer" : "not-allowed",
            transition: "all 0.3s"
          }}
        >
          {canResend ? "Resend OTP" : "Resend OTP"}
        </button>

        <p style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "12px",
          marginTop: "16px"
        }}>
          Didn't receive the OTP? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
