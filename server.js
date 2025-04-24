const express = require("express");
const connectDB = require("./db");
const axios = require("axios");

const app = express();
app.use(express.json()); // Middleware to parse JSON

let db;
connectDB().then(database => db = database); // Connect to MongoDB

// **Step 4: Load users into the DB**
app.get("/load", async (req, res) => {
    try {
        // Fetch users, posts, and comments from JSONPlaceholder
        const users = (await axios.get("https://jsonplaceholder.typicode.com/users")).data;
        const posts = (await axios.get("https://jsonplaceholder.typicode.com/posts")).data;
        const comments = (await axios.get("https://jsonplaceholder.typicode.com/comments")).data;

        // Assign posts and comments to users
        users.forEach(user => {
            user.posts = posts.filter(post => post.userId === user.id).map(post => ({
                ...post,
                comments: comments.filter(comment => comment.postId === post.id),
            }));
        });

        await db.collection("users").insertMany(users);
        res.status(200).send(); // Return empty response with status 200
    } catch (error) {
        res.status(500).json({ error: "Error loading data" });
    }
});

// **Step 5: Delete all users**
app.delete("/users", async (req, res) => {
    try {
        await db.collection("users").deleteMany({});
        res.status(200).json({ message: "All users deleted" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting users" });
    }
});

// **Step 6: Delete a specific user**
app.delete("/users/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const result = await db.collection("users").deleteOne({ id: userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting user" });
    }
});

// **Step 7: Get user details with posts and comments**
app.get("/users/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const user = await db.collection("users").findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Error retrieving user" });
    }
});

// **Step 8: Add a new user**
app.put("/users", async (req, res) => {
    const newUser = req.body;
    try {
        // Check if user already exists
        const existingUser = await db.collection("users").findOne({ id: newUser.id });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }
        await db.collection("users").insertOne(newUser);
        res.status(201).json({ message: "User added", link: `/users/${newUser.id}` });
    } catch (error) {
        res.status(500).json({ error: "Error adding user" });
    }
});

// **Step 9: Start the Server**
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
