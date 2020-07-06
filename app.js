const express = require("express");

const app = express();

const mongooese = require("mongoose");

const bodyParser = require("body-parser");

var cors = require("cors");

require("dotenv/config");

// Middlewares - A mechanism to run a function when an endpoint is hit

// Everytime we go through any route, an authentication function is triggered
// app.use(auth);

// Import Routes
const postsRoute = require("./routes/postings");
const usersRoute = require("./routes/users");

app.use(cors());
app.use(bodyParser.json());
app.use("/api/postings", postsRoute);
app.use("/api/users", usersRoute);
// Routes
app.get("/", (req, res) => {
  res.send("We are on home.");
});

// Connect to DB
// User: testUser
// Pass: test123
mongooese.connect(process.env.DB_CONNECTION, () => {
  console.log("Connected to DB!");
});

// Start the server
app.set('port', 3001);
app.listen(3001);
