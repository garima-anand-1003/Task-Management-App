import { useState } from "react"
import { createTask, updateTask } from "../api/tasks"


export default function TaskForm({ task, onSuccess, onClose }) {

  const [title,       setTitle]       = useState(task?.title       || "")
  const [description, setDescription] = useState(task?.description || "")
  const [status,      setStatus]      = useState(task?.status      || "Pending")
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let res

      if (task) {
        res = await updateTask(task.id, { title, description, status })
      } else {
        res = await createTask({ title, description, status })
      }

      onSuccess(res.data)  
    } catch (err) {
      console.log("ERROR:", err.response?.data);

  const msg =
    typeof err.response?.data?.detail === "string"? err.response.data.detail
      : JSON.stringify(err.response?.data) || "Something went wrong";

    setError(msg);
    } finally {
      setLoading(false)
    }
}

return (
    
     <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}
    >
     
      
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "white", borderRadius: "12px", padding: "24px", width: "90%", maxWidth: "440px" }}
      >

        <h3 style={{ marginBottom: "16px" }}>
          {task ? "Edit Task" : "Create Task"}
        </h3>

        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
            <label>Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }}
            />
            </div>

            <div style={{ marginBottom: "16px" }}>
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>

          {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: "10px", background: "#1D9E75", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              {loading ? "Saving..." : task ? "Save Changes" : "Create Task"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "10px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
