import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Test from "./models/Test.js";

dotenv.config();

connectDB();

const app = express();
app.get("/test", async (req, res) => {
  const data = await Test.create({
    name: "IntellMeet Working",
  });

  res.json(data);
});
app.get("/", (req, res) => {
  res.send("Backend Working");
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});