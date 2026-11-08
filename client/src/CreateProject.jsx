
import { useEffect, useState } from "react";

const API = "http://localhost:9000";

function CreateProject({ onProjectCreated }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "Planning",
    project_lead_id: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setMessage("Could not load registered users."));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setForm({
          name: "",
          description: "",
          status: "Planning",
          project_lead_id: ""
        });
        onProjectCreated?.();
      }
    } catch {
      setMessage("Unable to connect to server.");
    }
  };

  return (
    <section>
      <h2>Create Project</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Project Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <br /><br />

        <textarea
          name="description"
          placeholder="Project Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <br /><br />

        <label>Status: </label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>

        <br /><br />

        <label>Project Lead: </label>
        <select
          name="project_lead_id"
          value={form.project_lead_id}
          onChange={handleChange}
          required
        >
          <option value="">Select a registered user</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user.full_name} (@{user.username})
            </option>
          ))}
        </select>

        <br /><br />

        <button type="submit">Create Project</button>
      </form>

      {message && <p role="status">{message}</p>}
    </section>
  );
}

export default CreateProject;