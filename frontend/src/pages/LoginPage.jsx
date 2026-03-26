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

      <p style={{ textAlign: "center", marginTop: "16px" }}>
        No account yet?{" "}
        <Link to="/register">Register</Link>
      </p>

    </div>
  )
}






 