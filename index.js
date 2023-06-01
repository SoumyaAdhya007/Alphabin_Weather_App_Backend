const express = require("express");
const cors = require("cors");
const colors = require("colors");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT;
const { connection } = require("./Config/db");
const { APIRouter } = require("./Routers/api.router");
app.use(cors());
app.use(express.json());

// Mount the APIRouter to handle API routes under the '/api' prefix
app.use("/api", APIRouter);

// Start the server and listen on the specified port
app.listen(PORT, async () => {
  try {
    await connection;
    console.log("Connected to MongoDB".bgCyan);
  } catch (error) {}
  console.log(`Server is running on ${PORT}`.underline.yellow);
});
