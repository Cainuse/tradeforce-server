const express = require("express");

const app = express();

const mongooese = require("mongoose");

const bodyParser = require("body-parser");

require("dotenv/config");

// Middlewares - A mechanism to run a function when an endpoint is hit

// Everytime we go through any route, an authentication function is triggered
// app.use(auth);

// Import Routes
const postsRoute = require("./routes/postings");
const usersRoute = require("./routes/users");

app.use(bodyParser.json);
app.use("/postings", postsRoute);
app.use("/users", usersRoute);
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
app.listen(3000);
