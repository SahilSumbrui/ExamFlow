import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      alert("No token found ❌");
      return;
    }

    axios
      .get(`http://localhost:5000/api/auth/verify/${token}`)
      .then((res) => {
        alert("Email Verified ✅");
      })
      .catch((err) => {
        console.error(err);
        alert("Invalid or expired link ❌");
      });
  }, [token]);

  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
      <h2>Verifying your email...</h2>
    </div>
  );
};

export default VerifyEmail;