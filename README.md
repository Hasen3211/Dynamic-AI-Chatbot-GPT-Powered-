# 🤖 NeuraChat

### Dynamic AI Chatbot — GPT powered • RAG • NLP • Memory

<p align="center">
  <strong>A modern, intelligent conversational AI assistant built with Python, Flask, Generative AI, RAG and NLP.</strong>
</p>

<p align="center">

<a href="https://dynamic-ai-chatbot-gpt-powered.onrender.com">
<img src="https://img.shields.io/badge/🚀%20LIVE%20DEMO-NeuraChat-success?style=for-the-badge" alt="Live Demo">
</a>

<a href="https://github.com/Hasen3211/Dynamic-AI-Chatbot-GPT-Powered-">
<img src="https://img.shields.io/badge/GitHub-Source%20Code-black?style=for-the-badge&logo=github" alt="GitHub">
</a>

</p>

<p align="center">

<img src="https://img.shields.io/badge/Python-3.x-blue?style=flat-square&logo=python">
<img src="https://img.shields.io/badge/Flask-Web%20Framework-black?style=flat-square&logo=flask">
<img src="https://img.shields.io/badge/Generative-AI-purple?style=flat-square">
<img src="https://img.shields.io/badge/RAG-Enabled-orange?style=flat-square">
<img src="https://img.shields.io/badge/Render-Deployed-46E3B7?style=flat-square&logo=render">
</p>

---

## 🚀 Live Application

### 👉 [OPEN NEURACHAT](https://dynamic-ai-chatbot-gpt-powered.onrender.com)

> **Try the chatbot directly in your browser.**

> ℹ️ **Deployment Note:** The application is hosted on a free cloud instance. After inactivity, the service may sleep, so the first request can take a little longer while the server wakes up.

---

# 🌟 Project Overview

**NeuraChat** is a full-stack **GPT-powered conversational AI application** designed to provide intelligent, context-aware and interactive conversations through a modern web interface.

The system combines:

* 🧠 Large Language Models
* 📚 Retrieval-Augmented Generation
* 💬 Conversation Memory
* 🎯 Intent Detection
* 😊 Sentiment Analysis
* 🏷️ Named Entity Recognition
* 🌐 Web Search
* 📊 Analytics
* 🛡️ Fallback Handling

The project is built with a modular architecture so that individual AI and NLP components can be developed, maintained and extended independently.

---

# ✨ Key Features

| Feature                    | What It Does                                                   |
| -------------------------- | -------------------------------------------------------------- |
| 🧠 **GPT-Powered Chat**    | Generates natural-language conversational responses            |
| 📚 **RAG**                 | Retrieves relevant information from custom knowledge documents |
| 💬 **Conversation Memory** | Maintains recent conversation context                          |
| 🎯 **Intent Detection**    | Identifies the user's likely intent                            |
| 😊 **Sentiment Analysis**  | Determines the sentiment of incoming messages                  |
| 🏷️ **NER**                | Extracts useful named entities                                 |
| 🌐 **Web Search**          | Supports external information retrieval                        |
| 📊 **Analytics**           | Provides interaction-level analytics functionality             |
| 🛡️ **Fallback System**    | Keeps basic responses available during API limitations         |
| 🎨 **Modern UI**           | Responsive ChatGPT-inspired interface                          |
| ☁️ **Cloud Deployment**    | Publicly accessible through Render                             |

---

# 🧠 AI Architecture

```text
                         ┌───────────────────────┐
                         │      NEURACHAT UI     │
                         │    HTML • CSS • JS    │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │     FLASK SERVER      │
                         │        app.py         │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │     API ROUTES        │
                         │      routes.py        │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │     CHATBOT CORE      │
                         │      chatbot.py       │
                         └───────────┬───────────┘
                                     │
               ┌─────────────────────┼─────────────────────┐
               │                     │                     │
               ▼                     ▼                     ▼
        ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
        │     LLM     │       │     RAG     │       │   MEMORY    │
        │   llm.py    │       │  Retriever  │       │  memory.py  │
        └──────┬──────┘       └──────┬──────┘       └─────────────┘
               │                     │
               ▼                     ▼
        ┌─────────────┐       ┌─────────────────┐
        │ Groq / GPT  │       │ Knowledge Base  │
        │    Model    │       │    Documents    │
        └─────────────┘       └─────────────────┘

                    Additional AI/NLP Layer
                    ┌───────────────────────┐
                    │ Intent Detection      │
                    │ Sentiment Analysis    │
                    │ Named Entity Recog.   │
                    │ Web Search            │
                    │ Analytics             │
                    └───────────────────────┘
```

---

# 🔄 How NeuraChat Works

```text
👤 User
   │
   ▼
💬 Chat Interface
   │
   ▼
🌐 Flask API
   │
   ▼
🧩 Message Processing
   │
   ├── 🎯 Intent Detection
   ├── 😊 Sentiment Analysis
   ├── 🏷️ Entity Recognition
   └── 💬 Conversation Memory
   │
   ▼
📚 RAG Retrieval
   │
   ▼
🧠 LLM Processing
   │
   ▼
🤖 Generated Response
   │
   ▼
💬 NeuraChat Interface
```

---

# 📚 Retrieval-Augmented Generation

NeuraChat includes a **Retrieval-Augmented Generation (RAG)** pipeline.

Instead of relying entirely on the language model, the system can retrieve relevant information from its own knowledge base.

### Knowledge Base

```text
rag/
│
└── documents/
    ├── chatbot_faq.txt
    ├── company_info.txt
    └── technical_knowledge.txt
```

### RAG Pipeline

```text
User Question
      │
      ▼
Question Processing
      │
      ▼
Document Retrieval
      │
      ▼
Similarity Matching
      │
      ▼
Relevant Context
      │
      ▼
LLM + Retrieved Context
      │
      ▼
Final Response
```

The retrieval layer uses **TF-IDF-based embeddings and cosine similarity** to identify relevant content.

---

# 💬 Conversation Memory

NeuraChat supports recent conversation context.

This allows the chatbot to understand follow-up questions without requiring the user to repeat the complete previous conversation.

Conversation history is handled through:

```text
data/chat_history.json
```

The system also controls the amount of retained conversation context through its configuration.

---

# 🎯 Intent Detection

The intent module helps identify what the user is trying to accomplish.

Examples include:

```text
Greeting
Information Request
Technical Question
General Conversation
Other User Queries
```

This provides additional context for chatbot response processing.

---

# 😊 Sentiment Analysis

NeuraChat analyzes the sentiment of incoming messages.

Possible sentiment categories include:

```text
😊 Positive
😐 Neutral
😞 Negative
```

This allows the system to understand not only **what** the user is asking, but also the general tone of the message.

---

# 🏷️ Named Entity Recognition

The NER component identifies useful entities from user messages.

Examples:

```text
👤 People
🏢 Organizations
📍 Locations
💻 Technologies
🔎 Other Named Entities
```

This information can be used by other chatbot components during processing.

---

# 🌐 Web Search

NeuraChat includes a web-search component that can be used when external information retrieval is required.

This extends the chatbot beyond the information stored inside the local knowledge base.

---

# 📊 Analytics

The analytics module provides functionality for collecting and analyzing chatbot interaction information.

This creates a foundation for future dashboards and deeper usage analytics.

---

# 🛡️ Fallback Handling

The application includes fallback handling for situations where external AI services are unavailable.

This helps maintain basic chatbot functionality during:

* API quota limitations
* Temporary service issues
* Network problems
* External model availability issues

---

# 🎨 User Interface

NeuraChat uses a modern conversational interface designed to provide a professional user experience.

### UI Highlights

* ✨ Clean modern design
* 💬 ChatGPT-inspired conversation layout
* 🧭 Sidebar navigation
* 🆕 New Chat functionality
* 🕘 Recent Chats
* 🟢 AI System Online indicator
* 📱 Responsive interface
* ⚡ Interactive JavaScript
* 🎨 Professional typography and styling

### Application Branding

```text
NeuraChat
AI Assistant

AI System Online
Ready to assist

Powered by GPT + RAG
```

---

# 📁 Project Structure

```text
Dynamic-AI-Chatbot-GPT-Powered-
│
├── backend/
│   ├── __init__.py
│   ├── analytics.py
│   ├── chatbot.py
│   ├── intent.py
│   ├── llm.py
│   ├── memory.py
│   ├── ner.py
│   ├── routes.py
│   ├── sentiment.py
│   └── web_search.py
│
├── data/
│   └── chat_history.json
│
├── rag/
│   ├── documents/
│   │   ├── chatbot_faq.txt
│   │   ├── company_info.txt
│   │   └── technical_knowledge.txt
│   │
│   ├── embeddings.py
│   ├── ingest.py
│   └── retriever.py
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── app.js
│
├── templates/
│   └── index.html
│
├── app.py
├── config.py
├── requirements.txt
├── .gitignore
└── README.md
```

---

# 🛠️ Technology Stack

### 💻 Programming & Backend

* Python
* Flask
* Gunicorn
* REST API

### 🤖 Generative AI

* Groq API
* `openai/gpt-oss-120b`
* Hugging Face
* Large Language Models
* Prompt Engineering

### 📚 RAG & NLP

* Retrieval-Augmented Generation
* TF-IDF
* Cosine Similarity
* Intent Detection
* Sentiment Analysis
* Named Entity Recognition

### 📊 Data & ML

* NumPy
* Pandas
* Scikit-learn

### 🎨 Frontend

* HTML5
* CSS3
* JavaScript
* Responsive Web Design

### ☁️ Deployment

* Git
* GitHub
* Render
* Gunicorn
* Environment Variables

---

# ⚙️ Environment Configuration

Create a local `.env` file:

```env
HF_TOKEN=your_huggingface_token
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_secret_key
```

## 🔐 Security

**Never commit API keys or `.env` files to GitHub.**

The project uses `.gitignore` to prevent environment files and secrets from being tracked.

For cloud deployment, configure environment variables directly inside the hosting platform.

---

# 💻 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Hasen3211/Dynamic-AI-Chatbot-GPT-Powered-.git
```

### 2. Enter the project

```bash
cd Dynamic-AI-Chatbot-GPT-Powered-
```

### 3. Create virtual environment

```bash
python -m venv venv
```

### 4. Activate virtual environment

**Windows**

```bash
venv\Scripts\activate
```

**macOS / Linux**

```bash
source venv/bin/activate
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

### 6. Configure environment variables

Create `.env` and add your API credentials.

### 7. Run the application

```bash
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

---

# ☁️ Deployment

NeuraChat is deployed using **Render**.

### Build Command

```bash
pip install -r requirements.txt
```

### Start Command

```bash
gunicorn app:app
```

### Deployment Architecture

```text
GitHub
   │
   ▼
Render
   │
   ▼
Install Dependencies
   │
   ▼
Gunicorn
   │
   ▼
Flask
   │
   ▼
NeuraChat 🚀
```

### 🌐 Live URL

**https://dynamic-ai-chatbot-gpt-powered.onrender.com**

---

# 🧪 Example Questions

Try asking NeuraChat:

```text
What is Artificial Intelligence?
```

```text
Explain Machine Learning in simple terms.
```

```text
What is RAG?
```

```text
What is Python?
```

```text
What is a REST API?
```

```text
Explain how Retrieval-Augmented Generation works.
```

```text
Tell me about your technical capabilities.
```

You can also continue with follow-up questions to test the conversation-memory functionality.

---

# 📈 Project Highlights

| Area                   | Implementation                       |
| ---------------------- | ------------------------------------ |
| 🤖 Generative AI       | GPT-powered conversational responses |
| 📚 Knowledge Retrieval | RAG with custom documents            |
| 🧠 Context             | Conversation memory                  |
| 🎯 NLP                 | Intent detection                     |
| 😊 NLP                 | Sentiment analysis                   |
| 🏷️ NLP                | Named Entity Recognition             |
| 🌐 Search              | Web information retrieval            |
| 🎨 UI                  | Responsive modern chatbot interface  |
| 🧩 Architecture        | Modular Python backend               |
| ☁️ Deployment          | Render + Gunicorn                    |
| 🔐 Security            | Environment-based secrets            |

---

# 🚀 Future Enhancements

Planned possibilities include:

* 🔐 User authentication
* 👥 Multi-user conversations
* 💾 Database-backed chat history
* 📄 PDF and document upload
* 📚 Advanced document RAG
* 🎙️ Voice input
* 🔊 Voice output
* 🖼️ Multimodal image understanding
* 📊 Advanced analytics dashboard
* ⚡ Streaming LLM responses
* 🌍 Multilingual conversations
* 🧠 Advanced personalization

---

# 🎓 Skills Demonstrated

This project demonstrates practical knowledge of:

```text
Python
Flask
REST APIs
Generative AI
Large Language Models
Prompt Engineering
RAG
NLP
Machine Learning
Scikit-learn
TF-IDF
Cosine Similarity
Conversation Memory
Intent Detection
Sentiment Analysis
Named Entity Recognition
JavaScript
HTML
CSS
Git
GitHub
Cloud Deployment
Render
Environment Variables
```

---

# 🔗 Project Links

| Resource                 | Link                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------- |
| 🚀 **Live Application**  | [NeuraChat](https://dynamic-ai-chatbot-gpt-powered.onrender.com)                   |
| 💻 **GitHub Repository** | [Dynamic AI Chatbot](https://github.com/Hasen3211/Dynamic-AI-Chatbot-GPT-Powered-) |
| 👤 **GitHub Profile**    | [Hasen3211](https://github.com/Hasen3211)                                          |
| 🔗 **LinkedIn**          | [Hasen Basha](https://www.linkedin.com/in/hasen-basha-a90a84280/)                  |

---

# 👨‍💻 Developer

## Hasen Basha

**B.Tech — Computer Science & Engineering (Data Science)**

Interested in:

* 🤖 Generative AI
* 📊 Data Science
* 🧠 Machine Learning
* 🔍 NLP
* 💻 Software Development
* ☁️ AI Application Deployment

### Connect With Me

**GitHub:**
https://github.com/Hasen3211

**LinkedIn:**
https://www.linkedin.com/in/hasen-basha-a90a84280/

---

# ⭐ Show Your Support

If you found this project interesting:

⭐ Star the repository
🍴 Fork the project
💻 Explore the source code
🚀 Try the live application

---

<p align="center">

# 🤖 NeuraChat

### Dynamic AI Chatbot — GPT + RAG + NLP + Memory

Built with ❤️ using **Python • Flask • Generative AI • RAG • JavaScript**

<br>

🚀 **Live Demo**

### https://dynamic-ai-chatbot-gpt-powered.onrender.com

</p>

---

<p align="center">

**Made with ❤️ by Hasen Basha**

</p>
