const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connection } = require("./Config/db");
const app = express();
const PORT = process.env.PORT;
app.listen(PORT, async () => {
  try {
    await connection;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error.message);
  }
  console.log(`Server is running on ${PORT}`);
});
