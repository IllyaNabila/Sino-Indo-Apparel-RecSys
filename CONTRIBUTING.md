# Contributing to Sino-Indo Apparel RecSys

Thank you for contributing! This project uses a **Fork & Pull Request** workflow targeting the `main` branch.

## 1. Fork & Clone
1. Click **Fork** at the top-right of this repository on GitHub.
2. Clone your fork locally and add the upstream remote:
   ```bash
   git clone https://github.com/<your-username>/Sino-Indo-Apparel-RecSys.git
   cd Sino-Indo-Apparel-RecSys
   git remote add upstream https://github.com/IllyaNabila/Sino-Indo-Apparel-RecSys.git
   ```

## 2. Local Environment Setup
This repository has three services. Copy each `.env.example` and fill in your own local/dev credentials (MongoDB, Gemini API key, etc.):

### A. Front-end (`front-end/`, port `3000`)
```bash
cd front-end
cp .env.example .env.local
npm install
npm run dev
```

### B. Socket.IO Chat Server (`front-end/server/`, port `5000`)
```bash
cd front-end/server
cp .env.example .env
npm install
node index.js
```

### C. AI Service (`ai_service/`, port `8000`)
```bash
cd ai_service
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
bash run.sh
```

## 3. Create a Branch & Make Changes
Always branch off the latest `main`:
```bash
git checkout main
git pull upstream main
git checkout -b feat/your-feature-name
```

Run tests and linting before committing (in `front-end/`):
```bash
npm test
npm run lint
```

## 4. Open a Pull Request
1. Push your branch to **your fork**:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a **Pull Request** on GitHub from your fork's branch into `IllyaNabila/Sino-Indo-Apparel-RecSys` → **`main`**.
3. Describe what your PR changes and how you tested it. Never commit `.env` or `.env.local` files.
