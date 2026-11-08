
import { useEffect, useState } from "react";
import CreateProject from "./CreateProject";
import ProjectsList from "./ProjectsList";
import ManageMemberships from "./ManageMemberships";
import CreateStory from "./CreateStory";
import ProjectBacklog from "./ProjectBacklog";
import EditStory from "./EditStory";

const API = "http://localhost:9000";

function App() {
  const [mode, setMode] = useState("signup");
  const [refreshKey, setRefreshKey] = useState(0);
  const [storyRefreshKey, setStoryRefreshKey] = useState(0);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [members, setMembers] = useState([]);
  const [editingStory, setEditingStory] = useState(null);

  const [signupData, setSignupData] = useState({
    f_name: "",
    l_name: "",
    username: "",
    password: ""
  });

  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData)
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setSignupData({
          f_name: "",
          l_name: "",
          username: "",
          password: ""
        });
      }
    } catch {
      setMessage("Unable to connect to server.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();
      setMessage(data.message);
    } catch {
      setMessage("Unable to connect to server.");
    }
  };

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch(`${API}/projects`);
        const data = await response.json();

        if (response.ok) {
          setProjects(data);

          // Clear selection if the selected project no longer exists
          if (
            selectedProjectId &&
            !data.some(
              project => project._id === selectedProjectId
            )
          ) {
            setSelectedProjectId("");
            setEditingStory(null);
          }
        }
      } catch (error) {
        console.error("Could not load projects:", error);
      }
    };

    loadProjects();
  }, [refreshKey]);

  // Load members of the selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setMembers([]);
      return;
    }

    fetch(`${API}/projects/${selectedProjectId}/members`)
      .then(res => res.json())
      .then(data => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setMembers([]));
  }, [selectedProjectId]);

  const handleProjectCreated = () => {
    setRefreshKey(previous => previous + 1);
  };

  const handleStoryCreated = () => {
    setStoryRefreshKey(previous => previous + 1);
  };

  const handleStoryUpdated = () => {
    setEditingStory(null);
    setStoryRefreshKey(previous => previous + 1);
  };

  const handleProjectChange = (e) => {
    setSelectedProjectId(e.target.value);
    setEditingStory(null);
  };

  return (
    <div>
      <h1>Login and Signup</h1>

      <button
        onClick={() => {
          setMode("signup");
          setMessage("");
        }}
      >
        Signup
      </button>

      <button
        onClick={() => {
          setMode("login");
          setMessage("");
        }}
      >
        Login
      </button>

      {mode === "signup" ? (
        <form onSubmit={handleSignup}>
          <h2>Signup</h2>

          <input
            name="f_name"
            placeholder="First Name"
            value={signupData.f_name}
            onChange={handleSignupChange}
            required
          />

          <input
            name="l_name"
            placeholder="Last Name"
            value={signupData.l_name}
            onChange={handleSignupChange}
            required
          />

          <input
            name="username"
            placeholder="Username"
            value={signupData.username}
            onChange={handleSignupChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={signupData.password}
            onChange={handleSignupChange}
            required
          />

          <button type="submit">Create Account</button>
        </form>
      ) : (
        <form onSubmit={handleLogin}>
          <h2>Login</h2>

          <input
            name="username"
            placeholder="Username"
            value={loginData.username}
            onChange={handleLoginChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleLoginChange}
            required
          />

          <button type="submit">Login</button>
        </form>
      )}

      {message && <p role="status">{message}</p>}

      <hr />

      <h1>Project Management</h1>

      <CreateProject onProjectCreated={handleProjectCreated} />

      <hr />

      <ProjectsList refreshKey={refreshKey} />

      <hr />

      <ManageMemberships refreshKey={refreshKey} />

      <hr />

      <h1>User Stories</h1>

      <label>Select Project: </label>

      <select
        value={selectedProjectId}
        onChange={handleProjectChange}
      >
        <option value="">Choose a project</option>

        {projects.map(project => (
          <option key={project._id} value={project._id}>
            {project.name}
          </option>
        ))}
      </select>

      {selectedProjectId && (
        <>
          <CreateStory
            projectId={selectedProjectId}
            onStoryCreated={handleStoryCreated}
          />

          <hr />

          {editingStory ? (
            <EditStory
              story={editingStory}
              members={members}
              onCancel={() => setEditingStory(null)}
              onStoryUpdated={handleStoryUpdated}
            />
          ) : (
            <ProjectBacklog
              projectId={selectedProjectId}
              refreshKey={storyRefreshKey}
              onEditStory={setEditingStory}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;