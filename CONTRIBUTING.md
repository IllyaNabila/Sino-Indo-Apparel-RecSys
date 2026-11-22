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

## 2. Database Setup (MongoDB)
Collections are created automatically by Mongoose — no manual migrations are needed. Use your own development database:

1. **Create a database** (choose one):
   - **MongoDB Atlas (Recommended):** Create a free **M0** cluster at [mongodb.com](https://www.mongodb.com/), add a database user, and allow your IP under **Network Access**.
   - **Local MongoDB:** Run MongoDB locally at `mongodb://localhost:27017/test`.
2. **Use the `test` database name** in `MONGO_URI` (e.g. `.../test?retryWrites=true&w=majority`), as `ai_service/app/db.py` connects to `client["test"]`.
3. **Set `MONGO_URI`** in both `front-end/.env.local` and `ai_service/.env`.
4. **Verify connection & seed an admin user** (after installing `front-end` dependencies):
   ```bash
   cd front-end
   npm run test:db      # verifies MongoDB connection
   npm run seed:admin   # creates admin user from ADMIN_EMAIL / ADMIN_PASSWORD
   ```
   Optionally verify the AI service connection:
   ```bash
   cd ai_service
   python -m app.db
   ```

## 3. Local Environment Setup
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

## 4. Create a Branch & Make Changes
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

## 5. Open a Pull Request
1. Push your branch to **your fork**:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a **Pull Request** on GitHub from your fork's branch into `IllyaNabila/Sino-Indo-Apparel-RecSys` → **`main`**.
3. Describe what your PR changes and how you tested it. Never commit `.env` or `.env.local` files.
