const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/Project03");

const database = mongoose.connection;
database.on("error", console.error.bind(console, "connection error:"));
database.once("open", () => {
  console.log("Connected to MongoDB");
});

module.exports = database;
