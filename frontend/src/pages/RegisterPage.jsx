import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { registerUser } from "../api/auth"

export default function RegisterPage() {
  const [name,     setName]     = useState("")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  const navigate = useNavigate()

   const handleSubmit = async (e) => {
    e.preventDefault()     
    setError("")          
    setLoading(true)      

    try {
      await registerUser({ name, email, password })
      navigate("/login")
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed"
      setError(msg)
    } finally {
      setLoading(false)   
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "80px auto", padding: "0 20px" }}>
      <h2 style={{ marginBottom: "24px" }}>Create account</h2>

      <form onSubmit={handleSubmit}>

        <div style={{ marginBottom: "16px" }}>
          <label>Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

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
          <p style={{ color: "red", marginBottom: "12px" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px", cursor: "pointer" }}
        >
          {loading ? "Creating account..." : "Register"}
        </button>

      </form>

       <p style={{ textAlign: "center", marginTop: "16px" }}>
        Already have an account?{" "}
        <Link to="/login">Sign in</Link>
      </p>

    </div>
  )
}

