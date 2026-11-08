
import { useEffect, useState } from "react";

const API = "http://localhost:9000";

function EditStory({ story, members, onCancel, onStoryUpdated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    assigned_user_id: ""
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!story) return;

    setForm({
      title: story.title,
      description: story.description,
      priority: story.priority,
      status: story.status,
      assigned_user_id: story.assigned_user_id || ""
    });
  }, [story]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/stories/${story._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          assigned_user_id: form.assigned_user_id || null
        })
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        onStoryUpdated?.();
      }
    } catch {
      setMessage("Unable to connect to server.");
    }
  };

  if (!story) return null;

  return (
    <section>
      <h2>Edit User Story</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <br /><br />

        <textarea
          name="description"
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

        <label>Status: </label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        <br /><br />

        <label>Assigned To: </label>
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

        <button type="submit">Save Changes</button>
        {" "}
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>

      {message && <p role="status">{message}</p>}
    </section>
  );
}

export default EditStory;