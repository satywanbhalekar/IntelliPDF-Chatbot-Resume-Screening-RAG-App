# IntelliPDF Chatbot – Resume Screening RAG App

A full-stack AI-powered resume screening tool. Upload a **resume** and **job description** (PDF or TXT), get instant match insights with strengths/gaps, and interactively chat with the candidate’s data using Retrieval-Augmented Generation (RAG).

## Features

- Upload resume & JD (PDF/TXT)
- Extract, embed, and semantic search with LangChain + Google Gemini
- Match score (% fit), strengths, gaps, and skill highlights
- RAG-powered chat: Ask questions about the candidate
- Modern React.js frontend with user-friendly UI

## Tech Stack

- Node.js, Express.js (Backend REST API)
- React.js (Frontend)
- LangChain + Google Gemini (LLM, Embeddings)
- In-memory vector store (can swap for Pinecone, Chroma, etc.)
- Multer (file upload), pdfjs (PDF parsing)

## Getting Started

### 1. Clone and Install
git clone https://github.com/satywanbhalekar/IntelliPDF-Chatbot-Resume-Screening-RAG-App.git
cd IntelliPDF-Chatbot-Resume-Screening-RAG-App
npm install
cd backend
npm install
npm start
### 3. Start the Frontend

cd pdf-chat-frontend
npm install
npm start



## Usage

1. Upload a resume and job description (PDF/TXT).
2. View instant match insights, strengths, and gaps.
3. Use RAG chat to interact with candidate data.

## Contributing

Feel free to fork, suggest improvements, or raise issues.

## License
