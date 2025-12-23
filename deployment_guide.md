# Deploying to Render (Backend) and Vercel (Frontend)

## 1. Preparation
### Backend
- Ensure your `package.json` in `backend/` has:
  ```json
  "scripts": {
    "start": "node server.js"
  }
  ```
- **Environment Variables** (You will add these in Render dashboard):
  - `PORT`: `3030` (or leave default and update code)
  - `DATABASE`: Your MongoDB connection string.
  - `DATABASE_PASSWORD`: Your DB password.
  - `SECRET_KEY`: Your JWT secret.

### Frontend
- Update `frontend/src/lib/axios.js` to point to the **production backend URL** instead of localhost.
  - *Best Practice*: Use an environment variable like `VITE_API_URL`.
- Update `frontend/src/pages/HouseDetails.jsx` to generate links with the **production frontend URL**.

---

## 2. GitHub Push
You were failing because you likely haven't committed yet or branch name didn't match.
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## 3. Deploy Backend (Render)
1.  Create account on [render.com](https://render.com).
2.  New + -> **Web Service**.
3.  Connect your GitHub repo.
4.  **Root Directory**: `backend` (Important!)
5.  **Build Command**: `npm install`
6.  **Start Command**: `node server.js`
7.  Add Environment Variables in key/value section.

## 4. Deploy Frontend (Vercel)
1.  Create account on [vercel.com](https://vercel.com).
2.  Add New -> Project -> Select GitHub repo.
3.  **Root Directory**: Edit -> Select `frontend`.
4.  **Environment Variables**:
    - `VITE_API_URL`: `https://your-render-backend-url.onrender.com/api`
5.  Deploy.

## 5. Final Configuration
- Once Backend is live, copy its URL.
- Go to Vercel -> Settings -> Environment Variables -> Add `VITE_API_URL`.
- Redeploy Frontend if needed.
- Update Backend `cors` in `server.js` to allow the Vercel domain (e.g., `https://rental-forms.vercel.app`).
