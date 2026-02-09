# Internship Tracker - Vercel Deployment Guide

## Prerequisites

1. Install Vercel CLI: `npm i -g vercel`
2. Sign up for a free account at https://vercel.com
3. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas

## Deployment Steps

### Step 1: Deploy the Backend (Server)

```bash
cd server
vercel
```

**During deployment, you'll be asked:**

- Set up and deploy? → **Yes**
- Which scope? → **Select your account**
- Link to existing project? → **No**
- Project name? → **internship-tracker-api** (or your preferred name)
- Directory? → **./** (press Enter)
- Override settings? → **No**

**Set environment variables:**

```bash
vercel env add MONGODB_URI
```

Paste your MongoDB Atlas connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/internship-tracker`)

**Deploy to production:**

```bash
vercel --prod
```

**Save the deployment URL** (e.g., `https://internship-tracker-api.vercel.app`)

---

### Step 2: Update Frontend API Configuration

Edit `internship_tracker/src/lib/api.ts` and update the base URL to your deployed backend URL.

---

### Step 3: Deploy the Frontend

```bash
cd ../internship_tracker
vercel
```

**During deployment:**

- Set up and deploy? → **Yes**
- Which scope? → **Select your account**
- Link to existing project? → **No**
- Project name? → **internship-tracker** (or your preferred name)
- Directory? → **./** (press Enter)
- Override settings? → **Yes**
  - Build Command? → **npm run build**
  - Output Directory? → **dist**
  - Development Command? → **npm run dev**

**Deploy to production:**

```bash
vercel --prod
```

---

## Alternative: Deploy via Vercel Dashboard

### Backend:

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure:
   - **Root Directory:** `server`
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - **MONGODB_URI:** Your MongoDB connection string
5. Click Deploy

### Frontend:

1. Go to https://vercel.com/new
2. Import your Git repository again (new project)
3. Configure:
   - **Root Directory:** `internship_tracker`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click Deploy

---

## MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user (Database Access)
4. Whitelist all IPs (Network Access) → Add `0.0.0.0/0`
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

---

## Post-Deployment

After both deployments are complete:

1. Update the frontend's API base URL to point to your backend URL
2. Test all functionality
3. Your app will be live at the Vercel URL!

**Custom Domain (Optional):**

- Go to your project settings in Vercel
- Navigate to "Domains"
- Add your custom domain
