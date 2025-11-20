import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RetrievalQAChain } from "langchain/chains";
import { embedDocs, getMatchScore, getGaps } from "./ingest.js";

let qaChain;
let matchScore = 0;
let strengths = [];
let gaps = [];
let resumeSkills = [];
let jdSkills = [];

export const initAgent = async (resumePath, jdPath) => {
  const result = await embedDocs(resumePath, jdPath);
  const vectorStore = result.vectorStore;
  resumeSkills = result.resumeSkills;
  jdSkills = result.jdSkills;

  // Match, strengths
  matchScore = getMatchScore(resumeSkills, jdSkills);
  strengths = resumeSkills.filter(skill => jdSkills.includes(skill));
  gaps = getGaps(resumeSkills, jdSkills);

  // QA setup
  const retriever = vectorStore.asRetriever();
  const model = new ChatGoogleGenerativeAI({
    temperature: 0,
    model: "gemini-2.5-pro"
  });
  qaChain = RetrievalQAChain.fromLLM(model, retriever);
};

export const askAgent = async (question) => {
  if (!qaChain) throw new Error("Agent not initialized.");
  const res = await qaChain.call({ query: question });
  return res.text;
};

export const getAnalysis = () => ({
  matchScore,
  strengths,
  gaps,
  resumeSkills,
  jdSkills,
});

