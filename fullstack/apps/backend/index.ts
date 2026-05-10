import express from "express";

const app = express();
const PORT = process.env.PORT

app.get("/", (req, res) => {
  res.json({ message: "Hello from API" });
});

app.listen(PORT, () => {
  console.log("API running on http://localhost:3001");
});
