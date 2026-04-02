import { useState } from 'react';
import {  Link,useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading,  setLoading]  = useState(false)

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid email or password"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // 1. Define your public Client ID (Do NOT put your Client Secret here)
    const clientId = "813051988558-lfv72484roes65nvn14s58k6vfborr33.apps.googleusercontent.com"; 
    const redirectUri = "http://localhost:5173/auth/callback";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
    window.location.href = googleAuthUrl;
   };

  return (
    <div style={{ maxWidth: "400px", margin: "80px auto", padding: "0 20px" }}>
      <h2 style={{ marginBottom: "24px" }}>Welcome back</h2>

      <form onSubmit={handleSubmit}>

        <div style={{ marginBottom: "16px" }}>
          <label>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

         <div style={{ marginBottom: "16px" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        {error && (
          <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>
        )}

        <button
        type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px", cursor: "pointer" }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

      </form>

      <hr style={{ margin: "20px 0" }} />
     
      <button 
          onClick={handleGoogleLogin}
          style={{ 
              width: "100%", 
              padding: "10px", 
              backgroundColor: "#4285F4", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer"
          }}
      >
        Sign in with Google
     </button>

      <p style={{ textAlign: "center", marginTop: "16px" }}>
        No account yet?{" "}
        <Link to="/register">Register</Link>
      </p>

    </div>
  )
}






 