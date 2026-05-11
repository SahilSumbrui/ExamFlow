import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from '../api/axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found');
      return;
    }

    API.get(`/auth/verify/${token}`)
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully!');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((err) => {
        console.error(err);
        setStatus('error');
        setMessage(err.response?.data?.message || 'Invalid or expired verification link');
      });
  }, [token, navigate]);

  return (
    <div style={{
      color: "white",
      textAlign: "center",
      marginTop: "100px",
      fontFamily: "sans-serif"
    }}>
      {status === 'verifying' && (
        <>
          <div style={{
            width: "50px",
            height: "50px",
            border: "4px solid #6366f1",
            borderTop: "4px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }} />
          <h2>Verifying your email...</h2>
          <p style={{ color: "#94a3b8" }}>Please wait while we verify your email address</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>✅</div>
          <h2 style={{ color: "#10b981" }}>Email Verified!</h2>
          <p style={{ color: "#94a3b8" }}>Your email has been verified successfully.</p>
          <p style={{ color: "#94a3b8", marginTop: "10px" }}>Redirecting to login in 3 seconds...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>❌</div>
          <h2 style={{ color: "#ef4444" }}>Verification Failed</h2>
          <p style={{ color: "#94a3b8", marginBottom: "20px" }}>{message}</p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Back to Login
          </button>
        </>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;