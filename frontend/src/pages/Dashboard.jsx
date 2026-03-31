import { useState, useEffect } from "react"
import { useAuth } from "../context/useAuth"
import { getTasks, deleteTask } from "../api/tasks"
import TaskForm from "../components/TaskForm"
import { Link } from "react-router-dom"

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [activeFilter, setActiveFilter] = useState("All")

  // EXTRACT user (for RBAC) alongside logout
  const { user, logout } = useAuth()

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const res = await getTasks()
      // If the backend returns the array directly, it's just res.
      // If it wraps it in an object, it's res.data. Adjust if your getTasks() returns data directly.
      setTasks(res.data || res) 
    } catch {
      setError("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const handleFormSuccess = (savedTask) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === savedTask.id ? savedTask : t))
    } else {
      setTasks([...tasks, savedTask])
    }
    setShowForm(false)
    setEditingTask(null)
  }

  const handleEdit = (task) => {
    setEditingTask(task)    
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteTask(id)
      setTasks(tasks.filter(t => t.id !== id))
      setDeletingId(null)   // close confirmation
    } catch (err) {
      // Improved error message to handle backend 403 Forbidden errors
      alert(err.response?.data?.detail || "Delete failed. You may not have permission.")
      setDeletingId(null)
    }
  }

  const total      = tasks.length
  const pending    = tasks.filter(t => t.status === "Pending").length
  const inProgress = tasks.filter(t => t.status === "In Progress").length
  const completed  = tasks.filter(t => t.status === "Completed").length

  const visibleTasks = activeFilter === "All"
    ? tasks
    : tasks.filter(t => t.status === activeFilter)

  if (loading) return <p style={{ padding: "40px" }}>Loading tasks...</p>
  if (error)   return <p style={{ padding: "40px", color: "red" }}>{error}</p>

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px 20px" }}>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", alignItems: "center" }}>
        <h2>TaskFlow</h2>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {/* RBAC CHECK: Show Admin Panel link only to admins */}
          {user?.role === "admin" && (
            <Link to="/admin/users" style={{ color: "#1D9E75", textDecoration: "none", fontWeight: "600" }}>
              ⚙️ Manage Users
            </Link>
          )}
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* RBAC CHECK: Show a banner so the admin knows they are seeing global tasks */}
      {user?.role === "admin" && (
        <div style={{ marginBottom: "20px", padding: "10px", background: "#d4edda", color: "#155724", borderRadius: "8px", fontSize: "14px" }}>
          <strong>Admin Privilege Active:</strong> Viewing global tasks.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Total",       value: total,      color: "#555"    },
          { label: "Pending",     value: pending,    color: "#BA7517" },
          { label: "In Progress", value: inProgress, color: "#185FA5" },
           { label: "Completed",   value: completed,  color: "#1D9E75" },
        ].map(stat => (
          <div key={stat.label}
            style={{ padding: "12px", background: "#f5f5f5", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "500", color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "11px", color: "#888" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3>{user?.role === "admin" ? "All System Tasks" : "My Tasks"}</h3>
        <button onClick={() => { setEditingTask(null); setShowForm(true) }}>
          + New Task
        </button>
         </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["All", "Pending", "In Progress", "Completed"].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: "4px 12px",
              borderRadius: "20px",
              border: "1px solid #ccc",
              background: activeFilter === f ? "#1D9E75" : "white",
              color:      activeFilter === f ? "white"    : "#555",
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
        </div>

      {visibleTasks.length === 0 ? (
        <p style={{ color: "#999", textAlign: "center", padding: "40px 0" }}>
          No tasks yet. Click "+ New Task" to create one.
        </p>
      ) : (
        visibleTasks.map(task => (
          <div key={task.id}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px", border: "1px solid #eee",
              borderRadius: "8px", marginBottom: "8px",
            }}>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
                {task.title}
                {/* RBAC CHECK: Show the owner ID if the user is an admin */}
                {user?.role === "admin" && (
                  <span style={{ fontSize: "10px", background: "#eee", padding: "2px 6px", borderRadius: "4px", color: "#666" }}>
                    Owner ID: {task.owner_id || task.user_id}
                  </span>
                )}
              </div>
              {task.description && (
                 <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                  {task.description}
                </div>
              )}
            </div>

            <span style={{
              fontSize: "11px", padding: "3px 8px", borderRadius: "10px",
              background:
                task.status === "Completed"  ? "#E1F5EE" :
                task.status === "In Progress" ? "#E6F1FB" : "#FAEEDA",
              color:
                task.status === "Completed"  ? "#085041" :
                task.status === "In Progress" ? "#0C447C" : "#633806",
            }}>
              {task.status}
            </span>

            {/* Note: In a strict system, you might hide Edit/Delete for tasks the user doesn't own. 
                But since Admins CAN edit/delete everything, and standard users only see their own tasks, 
                we can leave these buttons visible. The backend will block any hacking attempts. */}
            <button 
              onClick={() => handleEdit(task)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
            >✎</button>

            <button
              onClick={() => setDeletingId(task.id)}
              style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
            >✕</button>

          </div>
        ))
      )}

      {deletingId && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "white",borderRadius: "12px", padding: "24px", maxWidth: "320px", width: "90%" }}>
            <p style={{ marginBottom: "16px", fontWeight: "500" }}>
              Delete this task permanently?
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleDelete(deletingId)}
                style={{ flex: 1, background: "#E24B4A", color: "white", padding: "8px", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                Yes, delete
              </button>
              <button
                onClick={() => setDeletingId(null)}
                style={{ flex: 1, padding: "8px", cursor: "pointer", border: "1px solid #ccc", background: "white", borderRadius: "6px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <TaskForm
          task={editingTask}
          onSuccess={handleFormSuccess}
          onClose={() => { setShowForm(false); setEditingTask(null) }}
        />
      )}

    </div>
  )
}