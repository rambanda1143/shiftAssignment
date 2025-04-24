const { MongoClient } = require("mongodb");

// MongoDB connection URL
const url = "mongodb://localhost:27017"; // Change this if MongoDB is hosted elsewhere
const client = new MongoClient(url);

async function connectDB() {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db("node_assignment"); // Return the database instance
}

// Correctly export the function
module.exports = connectDB;
