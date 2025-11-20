
import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import { initAgent, askAgent, getAnalysis } from "./agent.js";

dotenv.config();
  console.log("api key",process.env.GOOGLE_API_KEY);
const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

// Multer setup for two files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use original name, or you could distinguish by fieldname
    cb(null, file.fieldname + path.extname(file.originalname).toLowerCase());
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".txt"];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error("Only PDF or TXT files allowed!"));
    }
    cb(null, true);
  },
});

// File upload endpoint for resume and jobdesc
app.post("/upload", upload.fields([
  { name: "resume", maxCount: 1 },
  { name: "jobdesc", maxCount: 1 }
]), async (req, res) => {
  try {
    const resumePath = req.files["resume"][0].path;
    const jdPath = req.files["jobdesc"][0].path;
    await initAgent(resumePath, jdPath); // will embed, extract, and setup RAG
    res.json({ message: "Files uploaded and processed successfully!" });
  } catch (e) {
    res.status(500).json({ error: "Failed to process files", detail: e.message });
  }
});

// Analysis endpoint (match score, strengths, gaps)
app.get("/analyze", (req, res) => {
  res.json(getAnalysis());
});

// RAG chat endpoint
app.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).send("No question provided");
  try {
    const answer = await askAgent(question);
    res.json({ answer });
  } catch (err) {
    console.error("❌ Ask error:", err);
    res.status(500).send("Error answering question");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
