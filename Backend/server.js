const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

// mongodb connection
const database = require("./database");

//define middleware
app.use(bodyParser.json());

//define routes
app.use(userRoutes);
app.use(postRoutes);

//sever connection
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server Listen on Port ${PORT}`);
});
