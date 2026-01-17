# Quick Deployment Guide

## Prerequisites
- Vercel account
- GitHub account  
- OpenAI API key

## Step 1: Deploy to Vercel (7 minutes)

1. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Set Environment Variables**
   In Vercel project settings → Environment Variables, add:
   ```
   BASIC_AUTH_USER=snailfamily
   BASIC_AUTH_PASS=your-secure-password
   OPENAI_API_KEY=sk-proj-your-key
   POSTGRES_URL=postgres://...
   BLOB_READ_WRITE_TOKEN=vercel_blob_...
   ```

3. **Set up Vercel Postgres**
   - In Vercel, go to Storage → Create → Postgres
   - Copy the `POSTGRES_URL` and add to environment variables
   - Open the database console and run `schema.sql`

4. **Set up Vercel Blob**
   - In Vercel, go to Storage → Create → Blob
   - Copy the `BLOB_READ_WRITE_TOKEN` and add to environment variables

5. **Deploy**
   - Click "Deploy"
   - Note your deployment URL (e.g., `https://snail-selfie-project.vercel.app`)

## Step 2: Configure Frontend (Optional - 1 minute)

1. **Configure API URL (if needed)**
   ```bash
   cd public
   cp config.example.js config.js
   # Edit config.js and set apiBaseUrl to your Vercel URL
   ```

2. **Access Your App**
   - Your app will be available at your Vercel URL (e.g., `https://snail-selfie-project.vercel.app`)
   - Vercel automatically serves files from `public/` directory at the root
   - Login with your credentials

**Note**: Vercel serves the frontend and backend from the same domain:
- `https://snail-selfie-project.vercel.app/` → `public/index.html`
- `https://snail-selfie-project.vercel.app/app.html` → `public/app.html`
- `https://snail-selfie-project.vercel.app/api/snails` → serverless function

## Troubleshooting

### Frontend can't connect to backend
- Check that the API URL in `config.js` or `api.js` matches your Vercel deployment
- Check browser console for CORS errors
- Verify all environment variables are set in Vercel
- Note: If using default config, the frontend should auto-detect the API URL

### Database errors
- Make sure you ran the `schema.sql` script
- Verify `POSTGRES_URL` is correct
- Check Vercel logs for specific error messages

### Image upload fails
- Verify `BLOB_READ_WRITE_TOKEN` is set
- Check file size (Vercel Blob has limits on free tier)

### AI features not working
- Verify `OPENAI_API_KEY` is valid and has credits
- Check Vercel function logs for API errors
- Ensure the API key has access to GPT-4o and embeddings

## Cost Estimates

- **Vercel Free Tier**: Sufficient for personal use
- **Vercel Postgres**: Free tier includes 256 MB, 60 hours compute/month
- **Vercel Blob**: Free tier includes 500 MB storage, 1 GB bandwidth/month  
- **OpenAI API**: ~$0.01-0.10 per snail age estimation, embeddings are very cheap

## Local Development

```bash
# Install dependencies
npm install

# Create .env from example
cp .env.example .env
# Edit .env with your credentials

# Start backend
vercel dev

# Open frontend (in another terminal)
cd public
python -m http.server 8000
# or: npx http-server -p 8000

# Visit http://localhost:8000
```
