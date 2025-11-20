# Architecture Documentation

## High-Level Overview

- **Frontend**
  - React.js SPA
  - File upload UI, Match insights, RAG chat window

- **Backend**
  - Node.js, Express.js
  - File upload (Multer), PDF parsing (pdfjs), REST API for candidate/JD data

- **AI/RAG Layer**
  - LangChain pipeline for embedding extraction and retrieval
  - Google Gemini LLM (semantic search + conversational chat)

- **Vector Store**
  - In-memory (easily replaceable with Pinecone, Chroma, etc.)

## Data Flow Diagram

1. User uploads resume/JD
2. Backend parses and extracts text
3. LangChain generates embeddings, stores in vector db
4. Match algorithm calculates % fit, strengths/gaps
5. Frontend displays insights; chat queries use RAG for context-aware answers

## Extensibility

- Swap vector db for persistent store
- Integrate additional LLMs and retrieval tools
- Add authentication, role-based access


