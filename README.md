🧠 IncidentMind
AI-Powered Incident Response Platform
<div align="center">

Reduce Mean Time to Resolution (MTTR) using AI-powered investigation, semantic search, and human-in-the-loop approvals.

<br>
















🌐 Live Demo

[https://YOUR-VERCEL-URL.vercel.app](https://incident-mind-web.vercel.app/dashboard)

</div>
🚀 Why IncidentMind?

When production incidents occur, engineers waste valuable time switching between dashboards, logs, documentation, and previous incident reports.

IncidentMind centralizes this entire workflow.

It investigates incidents using AI agents, retrieves similar historical incidents through semantic search, generates explainable recommendations, and ensures that every critical action is approved by a human before execution.

The result is faster incident resolution, better operational visibility, and safer AI-assisted decision making.

✨ Features
🤖 AI Investigation
AI-powered incident analysis
Root cause reasoning
Explainable recommendations
AI-generated summaries
🔍 Semantic Search (Qdrant)
Finds similar historical incidents
Retrieves relevant runbooks
Context-aware recommendations
Vector similarity search
🧠 Multi-Agent Workflow (Mastra)
Incident Analysis Agent
Recommendation Agent
Summary Agent
Context orchestration
Structured AI pipeline
🛡 AI Safety (Enkrypt AI)
Prompt validation
Output moderation
Prompt injection protection
Safer AI interactions
👨‍💻 Human-in-the-Loop
AI suggests actions
Engineers approve or reject recommendations
Complete approval history
Transparent decision making
📊 Analytics Dashboard
Incident trends
MTTR metrics
Service health overview
Resolution analytics
📚 Knowledge Base
Historical incidents
AI-generated summaries
Runbooks
Semantic search
🖼 Application Preview
Dashboard

<img width="1349" height="631" alt="image" src="https://github.com/user-attachments/assets/825368d1-a7b3-4e7d-b2d0-93b89973b7ca" />

Incident Details

<img width="1349" height="637" alt="image" src="https://github.com/user-attachments/assets/13ca3aa5-9579-4221-b1e0-6e43e63c23ba" />


Knowledge Base

<img width="1349" height="634" alt="image" src="https://github.com/user-attachments/assets/c6382986-5ccd-4dcc-bce1-e2e38f6cee6c" />


Analytics

<img width="1349" height="630" alt="image" src="https://github.com/user-attachments/assets/9faf43db-050b-4c5a-bf5c-2730e6c93a3c" />

🏗 Architecture
               Production Alert
                      │
                      ▼
             AI Investigation (Mastra)
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
 Historical Search          AI Reasoning
      (Qdrant)                 (LLM)
          │                       │
          └───────────┬───────────┘
                      ▼
        Explainable Recommendation
                      │
                      ▼
          Human Approval Workflow
               Approve / Reject
                      │
                      ▼
          Timeline + Incident History
🧠 AI Workflow
Production alert is received.
Mastra agents investigate the incident.
Qdrant retrieves semantically similar incidents and runbooks.
AI generates recommendations with explanations.
Enkrypt AI validates prompts and responses.
Engineer reviews AI suggestions.
Approved actions are recorded in the incident timeline.
⚙ Tech Stack
Category	Technologies
Frontend	Next.js, React, TypeScript
Styling	Tailwind CSS
Backend	Next.js API Routes
ORM	Prisma
Database	PostgreSQL
AI Framework	Mastra
Vector Database	Qdrant
AI Safety	Enkrypt AI
Deployment	Vercel
📂 Project Structure
IncidentMind
│
├── apps
│   ├── web
│   └── mastra
│
├── packages
│   ├── shared
│   └── ui
│
├── docs
└── prisma
🚀 Running Locally
git clone https://github.com/YOUR_USERNAME/IncidentMind.git

cd IncidentMind

pnpm install

pnpm dev
🔮 Future Improvements
Slack integration
Microsoft Teams integration
PagerDuty integration
Kubernetes incident support
Predictive incident detection
Automated remediation
Multi-tenant support
AI evaluation dashboard
👩‍💻 Author

Krishangee Tayal

Computer Science Engineering Student
Interested in AI, Machine Learning, and Building Developer Tools.

⭐ Support

If you found this project interesting, consider giving it a ⭐ Star.
