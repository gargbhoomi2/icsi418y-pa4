
import { useEffect, useState } from "react";

const API_URL = "http://localhost:9000";

function ProjectsList({ refreshKey = 0 }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    async function loadProjects() {
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/projects`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not load projects.");
            }

            setProjects(data);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProjects();
    }, [refreshKey]);

    return (
        <section>
            <h2>Projects</h2>

            <button type="button" onClick={loadProjects}>
                Refresh Projects
            </button>

            {loading && <p>Loading projects...</p>}
            {message && <p role="alert">{message}</p>}

            {!loading && !message && projects.length === 0 && (
                <p>No projects have been created yet.</p>
            )}

            {projects.map((project) => (
                <article
                    key={project._id}
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "12px",
                        margin: "12px 0"
                    }}
                >
                    <h3>{project.name}</h3>

                    <p>
                        <strong>Description:</strong>{" "}
                        {project.description}
                    </p>

                    <p>
                        <strong>Status:</strong> {project.status}
                    </p>

                    <p>
                        <strong>Project Lead:</strong>{" "}
                        {project.project_lead
                            ? `${project.project_lead.full_name} (@${project.project_lead.username})`
                            : "Lead information unavailable"}
                    </p>
                </article>
            ))}
        </section>
    );
}

export default ProjectsList;
