import { useState, useEffect } from "react"
import { useAuth } from "../context/useAuth"
import { getTasks, deleteTask } from "../api/tasks"
import TaskForm from "../components/TaskForm"

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [activeFilter, setActiveFilter] = useState("All")

  const { logout } = useAuth()

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
         setLoading(true)
      const res = await getTasks()
      setTasks(res.data)
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
    } catch {
      alert("Delete failed")
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

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
        <h2>TaskFlow</h2>
        <button onClick={logout}>Logout</button>
      </div>

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
        <h3>My Tasks</h3>
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
              <div style={{ fontWeight: "500" }}>{task.title}</div>
              {task.description && (
                 <div style={{ fontSize: "12px", color: "#888" }}>
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

            <button onClick={() => handleEdit(task)}>✎</button>

            <button
              onClick={() => setDeletingId(task.id)}
              style={{ color: "red" }}
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
                style={{ flex: 1, padding: "8px", cursor: "pointer" }}
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