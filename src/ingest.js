
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// PDF text extractor
const loadPdfText = async (path) => {
  const dataBuffer = fs.readFileSync(path);
  const uint8Array = new Uint8Array(dataBuffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    text += pageText + "\n";
  }
  return text;
};

const loadText = async (path) => {
  if (path.endsWith(".pdf")) return await loadPdfText(path);
  return fs.readFileSync(path, "utf8");
};

// Simple rule-based skills extractor, can be improved using LLM
function extractSkills(text) {
  // All unique lowercase words likely to be skills (very rough, demo only)
  const skillsKeywords = [
    'react', 'node', 'express', 'typescript', 'mongodb', 'sql', 'postgresql',
    'javascript', 'python', 'aws', 'azure', 'docker', 'kubernetes', 'redis',
    'api', 'backend', 'frontend', 'microservices', 'cloud', 'git', 'ci/cd',
    'html', 'css', 'rest', 'graphql', 'json', 'linux'
  ];
  const found = [];
  for (const skill of skillsKeywords) {
    if (text.toLowerCase().includes(skill)) found.push(skill);
  }
  return Array.from(new Set(found));
}

// Main function: reads, chunks, embeds both docs, and extracts skills
export const embedDocs = async (resumePath, jdPath) => {
  const resumeText = await loadText(resumePath);
  const jdText = await loadText(jdPath);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 200,
  });

  // Tag docs with metadata for interpretability
  const resumeDocs = (await splitter.createDocuments([resumeText]))
    .map(doc => ({ ...doc, metadata: { ...doc.metadata, source: "resume" } }));

  const jdDocs = (await splitter.createDocuments([jdText]))
    .map(doc => ({ ...doc, metadata: { ...doc.metadata, source: "jobdesc" } }));

  const allDocs = [...resumeDocs, ...jdDocs];

  const vectorStore = await MemoryVectorStore.fromDocuments(
    allDocs,
    new GoogleGenerativeAIEmbeddings({ model: "text-embedding-004"})
  );

  console.log("api key",process.env.GOOGLE_API_KEY);
  
  // Skill extraction for both
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jdText);

  return {
    vectorStore,
    resumeText,
    jdText,
    resumeSkills,
    jdSkills,
  };
};

// Match score: % of JD skills found in Resume
export function getMatchScore(resumeSkills, jdSkills) {
  if (!jdSkills.length) return 0;
  const overlap = jdSkills.filter(skill => resumeSkills.includes(skill));
  return Math.round((overlap.length / jdSkills.length) * 100);
}

// Gaps = JD skills not in Resume
export function getGaps(resumeSkills, jdSkills) {
  return jdSkills.filter(skill => !resumeSkills.includes(skill));
}
