// frontend/src/pages/UserManagement.jsx
import { useState, useEffect } from 'react';
import { getAllUsers, deleteUser } from '../api/admin';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch users as soon as the admin loads this page
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        // Built-in browser confirmation dialog to prevent accidental clicks
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
            return;
        }
        
        try {
            await deleteUser(id);
            // Immediately remove the user from the local React state so the table updates without refreshing the page
            setUsers(users.filter(user => user.id !== id));
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to delete user");
        }
    };

    if (loading) return <div style={{ padding: "20px" }}>Loading users...</div>;

    return (
        <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Admin Panel: User Management</h2>
                <a href="/dashboard" style={{ textDecoration: "none", color: "blue" }}>&larr; Back to Dashboard</a>
            </div>
            
            {error && <p style={{ color: "red", backgroundColor: "#ffe6e6", padding: "10px" }}>{error}</p>}
            
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", border: "1px solid #ddd" }}>
                <thead style={{ backgroundColor: "#f4f4f4" }}>
                    <tr>
                        <th style={{ padding: "12px", borderBottom: "1px solid #ddd", textAlign: "left" }}>ID</th>
                        <th style={{ padding: "12px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Name</th>
                        <th style={{ padding: "12px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Email</th>
                        <th style={{ padding: "12px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Role</th>
                        <th style={{ padding: "12px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ padding: "12px", textAlign: "center" }}>No users found.</td>
                        </tr>
                    ) : (
                        users.map(user => (
                            <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "12px" }}>{user.id}</td>
                                <td style={{ padding: "12px" }}>{user.name}</td>
                                <td style={{ padding: "12px" }}>{user.email}</td>
                                <td style={{ padding: "12px" }}>
                                    <span style={{ 
                                        padding: "4px 8px", 
                                        borderRadius: "4px", 
                                        backgroundColor: user.role === 'admin' ? '#d4edda' : '#e2e3e5',
                                        color: user.role === 'admin' ? '#155724' : '#383d41',
                                        fontSize: "0.85em"
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: "12px" }}>
                                    <button 
                                        onClick={() => handleDelete(user.id)}
                                        style={{ 
                                            backgroundColor: "#dc3545", 
                                            color: "white", 
                                            border: "none", 
                                            padding: "6px 12px", 
                                            borderRadius: "4px",
                                            cursor: "pointer" 
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}