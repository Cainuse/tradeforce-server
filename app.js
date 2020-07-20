const express = require("express");

const app = express();

const mongoose = require("mongoose");

const bodyParser = require("body-parser");

var cors = require("cors");

require("dotenv/config");

const PORT = process.env.PORT || 5000;

// Middlewares - A mechanism to run a function when an endpoint is hit

// Everytime we go through any route, an authentication function is triggered
// app.use(auth);

// Import Routes
const postsRoute = require("./routes/postings");
const usersRoute = require("./routes/users");
const offeringsRoute = require("./routes/offerings");
const notificationsRoute = require("./routes/notifications");

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use("/api/postings", postsRoute);
app.use("/api/users", usersRoute);
app.use("/api/notifications", notificationsRoute);
app.use("/api/offerings", offeringsRoute);

// Routes
app.get("/", (req, res) => {
  res.send("REST API for Tradeforce");
});

mongoose.set("useFindAndModify", false);
// Connect to DB
// User: testUser
// Pass: test123
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to DB!");
  }
);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
