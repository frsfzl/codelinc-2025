# AI Avatar Mobile App with Voice API and RAG Knowledge Base

## Project Overview
Our project is an AI-powered **mobile voice avatar** that users can interact with to get real-time answers and generate **actionable plans** based on a large knowledge base. It combines:

- **Voice Interaction**: Users speak naturally to the avatar through their mobile device.
- **RAG (Retrieval-Augmented Generation)**: The AI references a folder of PDF documents to provide accurate, context-aware responses.
- **Plan Generation**: The AI can create step-by-step plans tailored to the user's request or context.

This app is designed for **mobile users**, enabling **interactive AI guidance on-the-go**.

---

## Features

1. **Voice Interaction**
   - Users talk to the AI avatar using their mobile device microphone.
   - Avatar can answer questions, clarify concepts, or generate plans.

2. **PDF Knowledge Integration (RAG)**
   - Upload or pre-load a folder of PDFs on the backend.
   - System ingests PDFs into a **vector database**.
   - Queries are answered using **retrieved content** to ensure factual and contextual accuracy.

3. **Actionable Plan Generation**
   - Users can request structured plans (e.g., project steps, learning paths, operational guides).
   - AI produces clear, step-by-step recommendations.

4. **Mobile-Friendly Responses**
   - Responses appear as text and/or speech.
   - Optional visual guides or structured cards for better readability on mobile.

---

## Tech Stack

- **Mobile Frontend**: React Native + Expo
  - Expo makes setup and testing fast on both iOS and Android
  - Expo Speech & Audio modules for TTS and STT
- **Voice Interface**: VAPI for speech-to-text and text-to-speech
- **Backend / AI**: 
  - OpenAI GPT-5 / Claude / LLM of choice
  - Vector database for RAG (Weaviate, Pinecone, or FAISS)
  - PDF ingestion and embedding pipeline
- **Deployment**: 
  - Node.js / Express backend (or serverless functions)
  - Expo Go for hackathon demo
  - Optional Docker setup for reproducibility

---

## Workflow

1. User speaks to the avatar → **VAPI converts voice to text**.
2. Query sent to backend → **RAG retrieves relevant content from PDFs**.
3. LLM processes the retrieved info → **generates response or actionable plan**.
4. Response sent back → **VAPI converts text to speech** for mobile playback.
5. User receives answer or plan via **voice and text**, optimized for mobile display.

---

## Example Use Cases

- **Project Guidance**: "How should I plan my hackathon project using the provided resources?"
- **Learning Path**: "Create a study plan for understanding the new tech stack."
- **Quick Answers**: "Summarize the key points from the PDF about company policy."

---

## MVP Priorities for Hackathon

1. Voice-to-text and text-to-voice working reliably on mobile.
2. RAG system retrieving relevant content from PDFs.
3. Simple UI showing text response and optional card-based structured plans.
4. Smooth end-to-end interaction: Speak → AI responds → Mobile playback.

---

