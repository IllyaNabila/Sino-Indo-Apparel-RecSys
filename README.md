

# Sino-Indo Apparel Recommendation System (RecSys)

An intelligent B2B recommendation engine designed to streamline apparel sourcing between **Chinese manufacturers** and **Indonesian importers**. The system leverages Natural Language Processing (NLP) and personalized preference matching to facilitate efficient trade and partnership discovery.

## 🚀 Project Overview

Trade between China and Indonesia in the apparel sector often faces challenges in matching specific manufacturing capabilities with local market demands. This RecSys provides a solution by:

* **Natural Language Search:** Allowing importers to find suppliers using descriptive terms (e.g., "Organic cotton t-shirts under $15 from China").
* **Intelligent Matching:** Using AI to rank suppliers based on relevance, verified status, and business alignment.
* **Cross-Border Integration:** Specifically tuned for the "Sino-Indo" trade corridor, accounting for regional specialties and MOQs.

## ✨ Key Features

* **AI-Powered Chat Interface:** A conversational UI for sourcing queries with real-time "typing" indicators and smart suggestions.
* **Dual-Layer NLP Parsing:** * **Gemini AI Layer:** For complex semantic understanding and intent classification.
* **Rule-Based Fallback:** To ensure high availability and reliable keyword matching.


* **Personalized Recommendations:** Tailored picks based on business profiles (FR-17).
* **B2B Verified Partners:** Identification of verified manufacturers and importers with specialized metrics (Response Time, Employees, etc.).
* **Fault-Tolerant Architecture:** Robust `try–catch–finally` error handling with "Relevance Guards" to filter out-of-domain queries.

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, Shadcn/UI.
* **Backend:** Node.js (Next.js API Routes), Axios.
* **AI/ML Integration:** Google Gemini API (Generative AI), Custom NLP Utility.
* **Communication:** Socket.io (for real-time business chat capabilities).
* **API Architecture:** Parallel processing with `Promise.all` for high-performance batch data fetching.

## 📁 Repository Structure

```text
├── components/          # React components (Chat interface, Search cards, Modals)
├── context/             # Business and Socket context providers
├── app/
│   ├── api/             # Backend API routes (recommend, nlp, product batching)
│   └── search/          # Main RecSys UI page
├── lib/                 # Utility functions and shared helpers
└── public/              # Static assets and placeholders

```

## ⚙️ Setup & Installation

1. **Clone the Repository**
```bash
git clone https://github.com/IllyaNabila/Sino-Indo-Apparel-RecSys.git
cd Sino-Indo-Apparel-RecSys
git checkout latest

```


2. **Install Dependencies**
```bash
npm install

```


3. **Environment Variables**
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_AI_URL=your_python_fastapi_url # if applicable

```


4. **Run Development Server**
```bash
npm run dev

```



## 🛡️ Error Handling logic

The system follows a strict **"Graceful Degradation"** strategy:

* **Semantic Filter:** Junk queries (e.g., asking for food or jokes) are intercepted at the API layer via intent classification.
* **Parallel Resilience:** If real-time ratings fail, the system renders product details without crashing (Partial Rendering).
* **Interaction Blocking:** The UI disables inputs while the AI is "thinking" to prevent race conditions.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

## 👥 Contributors

* **Illya Nabila** - *Lead Developer & Final Year Student*

---

*Note: This repository is part of a academic project into intelligent B2B recommendation systems for international apparel trade.*
