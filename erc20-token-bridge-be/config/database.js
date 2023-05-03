const mongoose = require("mongoose");

const dbName = "bridge";
const connectionString = `mongodb://localhost:27017/${dbName}`;

module.exports = async function (app) {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Database connected.");

    mongoose.connection.on("error", (err) => {
      console.log("Database error.");
      console.log(err);
    });
  } catch (err) {
    console.error("Error connecting to database.");
    process.exit(1);
  }
};