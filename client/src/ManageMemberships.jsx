
import { useEffect, useState } from "react";

const API_URL = "http://localhost:9000";

function ManageMemberships({ refreshKey = 0 }) {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [members, setMembers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function readResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Request failed.");
        }

        return data;
    }

    async function loadProjectsAndUsers() {
        try {
            const [projectResponse, userResponse] = await Promise.all([
                fetch(`${API_URL}/projects`),
                fetch(`${API_URL}/users`)
            ]);

            const [projectData, userData] = await Promise.all([
                readResponse(projectResponse),
                readResponse(userResponse)
            ]);

            setProjects(projectData);
            setUsers(userData);

            if (
                selectedProjectId &&
                !projectData.some(
                    (project) => project._id === selectedProjectId
                )
            ) {
                setSelectedProjectId("");
                setMembers([]);
            }
        } catch (error) {
            setMessage(error.message);
        }
    }

    async function loadMembers(projectId) {
        if (!projectId) {
            setMembers([]);
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/projects/${projectId}/members`
            );
            const data = await readResponse(response);
            setMembers(data);
        } catch (error) {
            setMessage(error.message);
        }
    }

    useEffect(() => {
        loadProjectsAndUsers();
    }, [refreshKey]);

    useEffect(() => {
        loadMembers(selectedProjectId);
        setSelectedUserId("");
    }, [selectedProjectId]);

    async function addMember() {
        if (!selectedProjectId || !selectedUserId) {
            setMessage("Select a project and a user first.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/projects/${selectedProjectId}/members`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: selectedUserId
                    })
                }
            );

            const data = await readResponse(response);
            setMessage(data.message);
            setSelectedUserId("");
            await loadMembers(selectedProjectId);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function removeMember(userId) {
        if (!selectedProjectId) return;

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/projects/${selectedProjectId}/members/${userId}`,
                { method: "DELETE" }
            );

            const data = await readResponse(response);
            setMessage(data.message);
            await loadMembers(selectedProjectId);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    const availableUsers = users.filter(
        (user) => !members.some((member) => member._id === user._id)
    );

    return (
        <section>
            <h2>Manage Project Memberships</h2>

            <div>
                <label htmlFor="membership-project">
                    Select Project
                </label>

                <select
                    id="membership-project"
                    value={selectedProjectId}
                    onChange={(event) => setSelectedProjectId(event.target.value)}
                >
                    <option value="">Choose a project</option>

                    {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                            {project.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedProjectId && (
                <>
                    <h3>Current Members</h3>

                    {members.length === 0 ? (
                        <p>No members found for this project.</p>
                    ) : (
                        <ul>
                            {members.map((member) => (
                                <li key={member._id}>
                                    {member.full_name} (@{member.username})

                                    {member.is_project_lead ? (
                                        <strong> — Project Lead (cannot remove)</strong>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => removeMember(member._id)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3>Add a Member</h3>

                    <div>
                        <label htmlFor="membership-user">
                            Registered User
                        </label>

                        <select
                            id="membership-user"
                            value={selectedUserId}
                            onChange={(event) => setSelectedUserId(event.target.value)}
                        >
                            <option value="">Choose a user</option>

                            {availableUsers.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.full_name} (@{user.username})
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={addMember}
                            disabled={loading || !selectedUserId}
                        >
                            {loading ? "Please wait..." : "Add Member"}
                        </button>
                    </div>

                    {availableUsers.length === 0 && (
                        <p>All registered users are already members.</p>
                    )}
                </>
            )}

            {message && <p role="status">{message}</p>}
        </section>
    );
}

export default ManageMemberships;
