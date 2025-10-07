# 🧠 Smart Meeting Notes AI
## Transform your meetings into structured, actionable intelligence powered by speech recognition and generative AI.

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


## 👥 Contributor Expectations

We welcome contributions! Please follow these standards:
- Open an **issue** first before submitting a feature or bug fix.
- Fork the repository, then submit a **pull request** from your branch.
- Use **conventional commits** and clear PR titles.
- Keep commits **squashed** and atomic when possible.
- Follow the existing **code style** (Prettier + ESLint).

> All contributions must pass automated checks before merging.  
If you’re unsure where to start, check out the `good first issue` tag.


## 🐛 Known Issues

- 🔸 Real-time transcription latency may vary with large files  
- 🔸 Speaker diarization not yet implemented  
- 🔸 Summaries may require manual correction for long multi-speaker meetings  

We’re actively improving accuracy and scalability — feedback is welcome!


## 💰 Support the Project

Building intelligent tools takes time and passion.  
If you find **Smart Meeting Notes AI** helpful, please consider supporting its development ❤️

[☕ **Buy Me a Coffee**](https://www.buymeacoffee.com/yourname)  
or simply ⭐ **star this repository** to show your support!


## 📄 License
MIT License © 2025 — Smart Meeting Notes AI


## 🧠 Authors
**Le Minh Hang, Phan Thuy Ngan, Pham Hong Phong**  
Frontend Developer | Frontend Developer | AI Product Builder  
Made with ❤️ by the Synapse Team


