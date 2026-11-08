
import { useEffect, useState } from "react";

const API = "http://localhost:9000";

function ProjectBacklog({ projectId, refreshKey, onEditStory }) {
  const [stories, setStories] = useState([]);
  const [message, setMessage] = useState("");

  const loadStories = async () => {
    if (!projectId) {
      setStories([]);
      return;
    }

    try {
      const response = await fetch(
        `${API}/projects/${projectId}/stories`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not load stories.");
        return;
      }

      setStories(data);
      setMessage("");
    } catch {
      setMessage("Unable to connect to server.");
    }
  };

  useEffect(() => {
    loadStories();
  }, [projectId, refreshKey]);

  const handleDelete = async (storyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user story?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/stories/${storyId}`, {
        method: "DELETE"
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        loadStories();
      }
    } catch {
      setMessage("Unable to connect to server.");
    }
  };

  if (!projectId) {
    return <p>Select a project to view its backlog.</p>;
  }

  return (
    <section>
      <h2>Project Backlog</h2>

      <button onClick={loadStories}>Refresh Backlog</button>

      {message && <p role="status">{message}</p>}

      {stories.length === 0 ? (
        <p>No user stories found for this project.</p>
      ) : (
        stories.map(story => (
          <div
            key={story._id}
            style={{
              border: "1px solid gray",
              padding: "12px",
              margin: "12px 0"
            }}
          >
            <h3>{story.title}</h3>

            <p><strong>Description:</strong> {story.description}</p>
            <p><strong>Priority:</strong> {story.priority}</p>
            <p><strong>Status:</strong> {story.status}</p>

            <p>
              <strong>Assigned To:</strong>{" "}
              {story.assigned_user
                ? `${story.assigned_user.full_name} (@${story.assigned_user.username})`
                : "Unassigned"}
            </p>

            <button onClick={() => onEditStory(story)}>
              Edit
            </button>

            {" "}

            <button onClick={() => handleDelete(story._id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </section>
  );
}

export default ProjectBacklog;