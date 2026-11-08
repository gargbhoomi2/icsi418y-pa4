
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = 9000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

let usersCollection;
let projectsCollection;
let projectMembershipsCollection;

// Connect to MongoDB
async function connectDB() {
    await client.connect();

    const db = client.db("login_signup");

    usersCollection = db.collection("users");
    projectsCollection = db.collection("Projects");
    projectMembershipsCollection =
        db.collection("ProjectMemberships");

    // Prevent duplicate usernames
    await usersCollection.createIndex(
        { username: 1 },
        { unique: true }
    );

    // Prevent the same user joining the same project twice
    await projectMembershipsCollection.createIndex(
        { project_id: 1, user_id: 1 },
        { unique: true }
    );

    console.log("Connected to MongoDB!");
}

// Validate MongoDB ObjectId strings
function isValidId(id) {
    return typeof id === "string" &&
        /^[a-fA-F0-9]{24}$/.test(id);
}

// Format a user's name
function getFullName(user) {
    return [user.f_name, user.l_name]
        .filter(Boolean)
        .join(" ");
}

// Test route
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

// =========================
// PA2: SIGNUP
// =========================
app.post("/signup", async (req, res) => {
    try {
        const { f_name, l_name, username, password } = req.body;

        if (
            !f_name?.trim() ||
            !l_name?.trim() ||
            !username?.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "All signup fields are required."
            });
        }

        const existingUser = await usersCollection.findOne({
            username: username.trim()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists."
            });
        }

        await usersCollection.insertOne({
            f_name: f_name.trim(),
            l_name: l_name.trim(),
            username: username.trim(),
            password
        });

        res.status(201).json({
            message: "User created successfully."
        });
    } catch (error) {
        console.error("Signup error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username already exists."
            });
        }

        res.status(500).json({
            message: "Server or database error."
        });
    }
});

// =========================
// PA2: LOGIN
// =========================
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required."
            });
        }

        const user = await usersCollection.findOne({ username });

        if (!user) {
            return res.status(401).json({
                message: "Username does not exist."
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Incorrect password."
            });
        }

        res.status(200).json({
            message: "Login successful."
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server or database error."
        });
    }
});

// =========================
// PA3: GET REGISTERED USERS
// Used for lead/member dropdowns
// =========================
app.get("/users", async (req, res) => {
    try {
        const users = await usersCollection.find(
            {},
            {
                projection: {
                    f_name: 1,
                    l_name: 1,
                    username: 1
                }
            }
        ).toArray();

        res.json(users.map(user => ({
            _id: user._id,
            f_name: user.f_name,
            l_name: user.l_name,
            username: user.username,
            full_name: getFullName(user)
        })));
    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Could not retrieve users."
        });
    }
});

// =========================
// PA3: CREATE PROJECT
// =========================
app.post("/projects", async (req, res) => {
    let insertedProjectId;

    try {
        const { name, description, status, project_lead_id } =
            req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof description !== "string" ||
            !description.trim() ||
            !status ||
            !project_lead_id
        ) {
            return res.status(400).json({
                message:
                    "Name, description, status, and project lead are required."
            });
        }

        if (!["Planning", "Active", "Completed"].includes(status)) {
            return res.status(400).json({
                message:
                    "Status must be Planning, Active, or Completed."
            });
        }

        if (!isValidId(project_lead_id)) {
            return res.status(400).json({
                message: "Invalid project lead ID."
            });
        }

        const lead = await usersCollection.findOne({
            _id: new ObjectId(project_lead_id)
        });

        if (!lead) {
            return res.status(404).json({
                message: "Project lead does not exist."
            });
        }

        const project = {
            name: name.trim(),
            description: description.trim(),
            status,
            project_lead_id: lead._id
        };

        const result = await projectsCollection.insertOne(project);
        insertedProjectId = result.insertedId;

        // Automatically make the project lead a member
        await projectMembershipsCollection.insertOne({
            project_id: insertedProjectId,
            user_id: lead._id
        });

        res.status(201).json({
            message: "Project created successfully.",
            project: {
                ...project,
                _id: insertedProjectId,
                project_lead: {
                    _id: lead._id,
                    full_name: getFullName(lead),
                    username: lead.username
                }
            }
        });
    } catch (error) {
        console.error("Create project error:", error);

        // Avoid leaving a project behind if lead membership fails
        if (insertedProjectId) {
            try {
                await projectsCollection.deleteOne({
                    _id: insertedProjectId
                });
            } catch (cleanupError) {
                console.error("Project cleanup error:", cleanupError);
            }
        }

        res.status(500).json({
            message: "Could not create project."
        });
    }
});

// =========================
// PA3: LIST PROJECTS
// Include lead details instead of only the ObjectId
// =========================
app.get("/projects", async (req, res) => {
    try {
        const projects = await projectsCollection.find({}).toArray();

        const results = await Promise.all(
            projects.map(async project => {
                const lead = await usersCollection.findOne({
                    _id: project.project_lead_id
                });

                return {
                    ...project,
                    project_lead: lead ? {
                        _id: lead._id,
                        full_name: getFullName(lead),
                        username: lead.username
                    } : null
                };
            })
        );

        res.json(results);
    } catch (error) {
        console.error("List projects error:", error);

        res.status(500).json({
            message: "Could not retrieve projects."
        });
    }
});

// =========================
// PA3: LIST PROJECT MEMBERS
// =========================
app.get("/projects/:projectId/members", async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!isValidId(projectId)) {
            return res.status(400).json({
                message: "Invalid project ID."
            });
        }

        const project = await projectsCollection.findOne({
            _id: new ObjectId(projectId)
        });

        if (!project) {
            return res.status(404).json({
                message: "Project does not exist."
            });
        }

        const memberships = await projectMembershipsCollection
            .find({ project_id: project._id })
            .toArray();

        const members = await Promise.all(
            memberships.map(async membership => {
                const user = await usersCollection.findOne({
                    _id: membership.user_id
                });

                if (!user) return null;

                return {
                    _id: user._id,
                    f_name: user.f_name,
                    l_name: user.l_name,
                    full_name: getFullName(user),
                    username: user.username,
                    is_project_lead:
                        user._id.toString() ===
                        project.project_lead_id.toString()
                };
            })
        );

        res.json(members.filter(Boolean));
    } catch (error) {
        console.error("List members error:", error);

        res.status(500).json({
            message: "Could not retrieve project members."
        });
    }
});

// =========================
// PA3: ADD PROJECT MEMBER
// =========================
app.post("/projects/:projectId/members", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { user_id } = req.body;

        if (!isValidId(projectId) || !isValidId(user_id)) {
            return res.status(400).json({
                message: "Invalid project ID or user ID."
            });
        }

        const project = await projectsCollection.findOne({
            _id: new ObjectId(projectId)
        });

        if (!project) {
            return res.status(404).json({
                message: "Project does not exist."
            });
        }

        const user = await usersCollection.findOne({
            _id: new ObjectId(user_id)
        });

        if (!user) {
            return res.status(404).json({
                message: "User does not exist."
            });
        }

        const existingMembership =
            await projectMembershipsCollection.findOne({
                project_id: project._id,
                user_id: user._id
            });

        if (existingMembership) {
            return res.status(409).json({
                message: "This user is already a project member."
            });
        }

        await projectMembershipsCollection.insertOne({
            project_id: project._id,
            user_id: user._id
        });

        res.status(201).json({
            message: "Member added successfully."
        });
    } catch (error) {
        console.error("Add member error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This user is already a project member."
            });
        }

        res.status(500).json({
            message: "Could not add project member."
        });
    }
});

// =========================
// PA3: REMOVE PROJECT MEMBER
// The project lead cannot be removed
// =========================
app.delete(
    "/projects/:projectId/members/:userId",
    async (req, res) => {
        try {
            const { projectId, userId } = req.params;

            if (!isValidId(projectId) || !isValidId(userId)) {
                return res.status(400).json({
                    message: "Invalid project ID or user ID."
                });
            }

            const project = await projectsCollection.findOne({
                _id: new ObjectId(projectId)
            });

            if (!project) {
                return res.status(404).json({
                    message: "Project does not exist."
                });
            }

            if (
                project.project_lead_id.toString() === userId
            ) {
                return res.status(400).json({
                    message: "The project lead cannot be removed."
                });
            }

            const result = await projectMembershipsCollection.deleteOne({
                project_id: project._id,
                user_id: new ObjectId(userId)
            });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    message: "Project membership does not exist."
                });
            }

            res.json({
                message: "Member removed successfully."
            });
        } catch (error) {
            console.error("Remove member error:", error);

            res.status(500).json({
                message: "Could not remove project member."
            });
        }
    }
);

// Start the server only after MongoDB connects
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error("Failed to start server:", error);
        process.exit(1);
    });
