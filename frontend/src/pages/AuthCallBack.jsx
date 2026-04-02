import { useEffect, useState , useRef} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    
    const hasFetched = useRef(false);
     
    useEffect(() => {
        const code = searchParams.get('code');
        
        if (!code) {
            navigate('/login');
            return; // Stop running any further code
        }

        if (code && !hasFetched.current) {
            hasFetched.current = true; // Ensure we only fetch once
            // Send the code to the exact FastAPI endpoint you just wrote
            axios.post('http://localhost:8000/users/auth/google', 
                { code: code },
                { withCredentials: true } // IMPORTANT: This tells Axios to accept the HttpOnly refresh cookie!
            )
            .then((response) => {
                // Grab the access token from FastAPI's response
                const jwt = response.data.access_token;
                
                // Store it in localStorage just like a normal login
                localStorage.setItem('access_token', jwt);
                
                window.location.href = '/dashboard'; //Force a hard page reload 
            })
            .catch((err) => {
                console.error("Google Auth Error:", err);
                setError("Failed to log in with Google. Please try again.");
                setTimeout(() => navigate('/login'), 3000);
            });
        } 
    }, [navigate, searchParams]);

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h2>{error ? "Authentication Failed" : "Authenticating with Google..."}</h2>
            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <p>Please wait while we log you in. You will be redirected shortly.</p>
            )}
        </div>
    );
}