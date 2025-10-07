# 🧠 Smart Meeting Notes AI

**Smart Meeting Notes AI** is an intelligent meeting-assistant platform that leverages **speech recognition** and **generative AI** to transform raw meeting conversations into **structured knowledge** — including **transcripts, key summaries, decisions, and actionable insights**.


## 🪄 What is Smart Meeting Notes AI?

In modern organizations, meetings generate valuable information — yet much of it gets lost in manual note-taking and fragmented communication. **Smart Meeting Notes AI** eliminates this bottleneck by automating the entire documentation process.
Managers or team leads can simply upload an existing transcript, import an audio recording, or record meetings directly on the platform. The system then uses **speech recognition (Whisper)** and **generative AI (GPT models)** to translate, analyze, and convert raw discussions into structured, standardized reports — including **Meeting Summary**, **Key Decisions**, and **Action Items.**

Beyond summarization, the platform integrates with tools like **Trello** and **Slack**, allowing teams to seamlessly synchronize assigned tasks and track progress after each meeting. Designed for companies and enterprises, it also supports **role-based access control** to ensure data privacy, internal compliance, and team-level collaboration.

> From hours of talking to seconds of understanding.


## 🧩 How It Works

Watch the short demo below to see how Smart Meeting Notes AI transcribes, summarizes, and generates insights in real time.
🎥 **Demo:** [Smart Meeting Notes AI: A solution](#)


## 🚀 Installation & Usage (End Users)

If you want to use **Smart Meeting Notes AI** as an application:

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<yourname>/smart-meeting-ai.git
cd smart-meeting-ai
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Add environment configuration
Create a `.env` file based on `.env.example`:
```
OPENAI_API_KEY=...
DATABASE_URL=...
JWT_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### 4️⃣ Start the development server
```bash
npm run dev
```

Then visit `http://localhost:3000` to use the web interface.  
Upload meeting audio, view transcripts, and generate summaries in real time.


## 🧰 Installation & Setup (Contributors)

If you’d like to contribute to development:

### 1️⃣ Clone and install
```bash
git clone https://github.com/<yourname>/smart-meeting-ai.git
cd smart-meeting-ai
npm install
```

### 2️⃣ Database migration
```bash
npx prisma migrate dev
```

### 3️⃣ Run backend (NestJS)
```bash
npm run start:dev
```

### 4️⃣ Run frontend (Next.js)
```bash
npm run dev
```

You’re now ready to develop locally with hot reloads for both API and UI.


## 🤝 Contributor Expectations

Our vision is for Smart Meeting Notes AI to become the universal intelligent layer for enterprise meeting automation — adaptable to any collaboration or productivity ecosystem.
Whether your organization manages workflows through Slack, Trello, Notion, Microsoft Teams, or a custom internal platform, Smart Meeting Notes AI aims to integrate seamlessly to make every meeting actionable, searchable, and intelligent.

> We actively welcome community contributions!
If your company or project uses a platform not yet supported, consider building an adapter or integration module for it.


## 📄 License
MIT License © 2025 — Smart Meeting Notes AI


## 🧠 Authors
Built with passion by Le Minh Hang, Phan Thuy Ngan, and Pham Hong Phong 
Frontend Developers & AI Product Builders at Synapse Team 💡

