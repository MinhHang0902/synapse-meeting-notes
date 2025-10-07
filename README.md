# 🧠 Smart Meeting Notes AI
## Transform your meetings into structured, actionable intelligence powered by speech recognition and generative AI.

**Smart Meeting Notes AI** is an intelligent meeting-assistant platform that leverages **speech recognition** and **generative AI** to transform raw meeting conversations into **structured knowledge** — including **transcripts, key summaries, decisions, and actionable insights**.

---

## 🪄 What is Smart Meeting Notes AI?

It’s designed for **teams, developers, and organizations** that need to turn long discussions into **clear, searchable, and shareable insights** — instantly.  
By combining **ASR (Automatic Speech Recognition)** and **LLM-based summarization**, this project automates the entire meeting documentation workflow — from recording to summary generation.

> From hours of talking to seconds of understanding.

---

## 🧩 How It Works

```mermaid
flowchart TD
A[🎙️ Audio Upload / Live Record] --> B[🧠 Speech-to-Text (OpenAI Whisper)]
B --> C[📝 LLM Summarization (GPT Models)]
C --> D[🔍 Insight Extraction (Topics, Decisions, Action Items)]
D --> E[💾 Database Storage + API Access]
E --> F[📊 Dashboard View / Data Export]
```

*(Optional: add a short GIF or YouTube demo here)*  
🎥 **Demo:** [Coming soon — YouTube walkthrough](#)

---

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

---

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

---

## 👥 Contributor Expectations

We welcome contributions! Please follow these standards:
- Open an **issue** first before submitting a feature or bug fix.
- Fork the repository, then submit a **pull request** from your branch.
- Use **conventional commits** and clear PR titles.
- Keep commits **squashed** and atomic when possible.
- Follow the existing **code style** (Prettier + ESLint).

> All contributions must pass automated checks before merging.  
If you’re unsure where to start, check out the `good first issue` tag.

---

## 🐛 Known Issues

- 🔸 Real-time transcription latency may vary with large files  
- 🔸 Speaker diarization not yet implemented  
- 🔸 Summaries may require manual correction for long multi-speaker meetings  

We’re actively improving accuracy and scalability — feedback is welcome!

---

## 💰 Support the Project

Building intelligent tools takes time and passion.  
If you find **Smart Meeting Notes AI** helpful, please consider supporting its development ❤️

[☕ **Buy Me a Coffee**](https://www.buymeacoffee.com/yourname)  
or simply ⭐ **star this repository** to show your support!

---

## 📄 License
MIT License © 2025 — Smart Meeting Notes AI

---

## 🧠 Author
**Le Minh Hang**  
Full-stack Developer | AI Product Builder  
[GitHub](https://github.com/<yourname>) • [LinkedIn](https://linkedin.com/in/<your-link>)
