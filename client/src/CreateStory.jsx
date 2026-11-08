
import { useEffect, useState } from "react";

const API = "http://localhost:9000";

function CreateStory({ projectId, onStoryCreated }) {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assigned_user_id: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!projectId) return;

    fetch(`${API}/projects/${projectId}/members`)
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(() => setMessage("Could not load project members."));
  }, [projectId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${API}/projects/${projectId}/stories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            assigned_user_id: form.assigned_user_id || null
          })
        }
      );

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setForm({
          title: "",
          description: "",
          priority: "Medium",
          assigned_user_id: ""
        });
        onStoryCreated?.();
      }
    } catch {
      setMessage("Unable to connect to server.");
    }
  };

  if (!projectId) return null;

  return (
    <section>
      <h2>Create User Story</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Story Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <br /><br />

        <textarea
          name="description"
          placeholder="As a user, I want to... so that..."
          value={form.description}
          onChange={handleChange}
          required
        />

        <br /><br />

        <label>Priority: </label>
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <br /><br />

        <label>Assign To: </label>
        <select
          name="assigned_user_id"
          value={form.assigned_user_id}
          onChange={handleChange}
        >
          <option value="">Unassigned</option>
          {members.map(member => (
            <option key={member._id} value={member._id}>
              {member.full_name} (@{member.username})
            </option>
          ))}
        </select>

        <br /><br />

        <button type="submit">Create Story</button>
      </form>

      {message && <p role="status">{message}</p>}
    </section>
  );
}

export default CreateStory;