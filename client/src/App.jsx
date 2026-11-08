
import { useState } from "react";
import CreateProject from "./CreateProject";
import ProjectsList from "./ProjectsList";
import ManageMemberships from "./ManageMemberships";

function App() {
  const [mode, setMode] = useState("signup");
  const [refreshKey, setRefreshKey] = useState(0);

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
      const response = await fetch("http://localhost:9000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
    } catch (error) {
      setMessage("Unable to connect to server.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:9000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Unable to connect to server.");
    }
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

      <CreateProject
        onProjectCreated={() => setRefreshKey((previous) => previous + 1)}
      />

      <hr />

      <ProjectsList refreshKey={refreshKey} />

      <hr />

      <ManageMemberships refreshKey={refreshKey} />
    </div>
  );
}

export default App;
