
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) throw new Error("Failed to load tasks");

      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage("Backend connect hot nahi. Backend server check kar.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a task title.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          status: "pending",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add task");
      }

      setTitle("");
      setDescription("");
      setMessage("Task added successfully!");
      await fetchTasks();
    } catch (error) {
      setMessage(error.message || "Error adding task.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (task) => {
    const nextStatus =
      task.status === "pending"
        ? "in-progress"
        : task.status === "in-progress"
        ? "completed"
        : "pending";

    try {
      const response = await fetch(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) throw new Error("Update failed");

      setMessage("Task status updated!");
      await fetchTasks();
    } catch (error) {
      setMessage("Could not update task.");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      setMessage("Task deleted successfully!");
      await fetchTasks();
    } catch (error) {
      setMessage("Could not delete task.");
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">PLAN · TRACK · COMPLETE</p>
          <h1>My Task Manager</h1>
          <p className="subtitle">
            Organize your work, one task at a time.
          </p>
        </div>
        <div className="task-count">
          <strong>{tasks.length}</strong>
          <span>Total tasks</span>
        </div>
      </header>

      <main className="layout">
        <section className="panel form-panel">
          <h2>Add a new task</h2>
          <p className="muted">Enter the details below.</p>

          <form onSubmit={addTask}>
            <label htmlFor="title">Task title *</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete project report"
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some details..."
              rows="4"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Adding..." : "+ Add Task"}
            </button>
          </form>
          {message && <p className="message">{message}</p>}
        </section>

        <section className="panel tasks-panel">
          <div className="tasks-heading">
            <div>
              <h2>Your tasks</h2>
              <p className="muted">Manage your daily progress.</p>
            </div>
            <button className="refresh" onClick={fetchTasks} type="button">
              Refresh
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="empty">
              <span className="empty-icon">✓</span>
              <h3>No tasks yet</h3>
              <p>Add your first task using the form.</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article className="task-card" key={task._id}>
                  <div className="task-info">
                    <h3>{task.title}</h3>
                    <p>{task.description || "No description provided."}</p>
                    <span className={`status ${task.status}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button
                      className="status-button"
                      onClick={() => updateStatus(task)}
                      type="button"
                    >
                      Change status
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => deleteTask(task._id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>My Task Manager · MERN Stack Project</footer>
    </div>
  );
}

export default App;
