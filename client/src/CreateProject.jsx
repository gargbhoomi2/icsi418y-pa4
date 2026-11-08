
import { useEffect, useState } from "react";

const API_URL = "http://localhost:9000";

function CreateProject({ onProjectCreated }) {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Planning");
    const [projectLeadId, setProjectLeadId] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadUsers() {
            try {
                const response = await fetch(`${API_URL}/users`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Could not load users.");
                }

                setUsers(data);
            } catch (error) {
                setMessage(error.message);
            }
        }

        loadUsers();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");

        if (!name.trim() || !description.trim() || !projectLeadId) {
            setMessage("Please complete all required fields.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/projects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    description,
                    status,
                    project_lead_id: projectLeadId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not create project.");
            }

            setMessage("Project created successfully!");
            setName("");
            setDescription("");
            setStatus("Planning");
            setProjectLeadId("");

            if (onProjectCreated) {
                onProjectCreated();
            }
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section>
            <h2>Create Project</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="project-name">Name *</label>
                    <input
                        id="project-name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="project-description">Description *</label>
                    <textarea
                        id="project-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="project-status">Status *</label>
                    <select
                        id="project-status"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        required
                    >
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="project-lead">Project Lead *</label>
                    <select
                        id="project-lead"
                        value={projectLeadId}
                        onChange={(event) => setProjectLeadId(event.target.value)}
                        required
                    >
                        <option value="">Select a registered user</option>
                        {users.map((user) => (
                            <option key={user._id} value={user._id}>
                                {user.full_name} (@{user.username})
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Project"}
                </button>
            </form>

            {message && <p role="status">{message}</p>}
        </section>
    );
}

export default CreateProject;
