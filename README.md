# 🐌 Snail Tracker

A kid-friendly web app to track snails in your garden! Perfect for families who want to observe and document the snails they encounter in their outdoor spaces.

## Features

- 📸 **Track Snails**: Create profiles for each snail with photos, names, and notes
- 📍 **Record Sightings**: Log when and where you spot each snail in your garden
- 🤖 **AI Age Estimation**: Use GPT-4 Vision to estimate snail age from photos
- 🔍 **Smart Identification**: AI-powered matching to identify which snail you've spotted
- 📱 **Mobile-First**: Optimized for mobile devices with camera capture support
- 🔒 **Secure**: Basic authentication protects your snail data

## Architecture

| Component | Technology | Hosting |
|-----------|------------|---------|
| **Frontend** | Vanilla HTML/CSS/JS | Vercel (public/ directory) |
| **Backend API** | Vercel Serverless Functions (Node.js) | Vercel |
| **Database** | Vercel Postgres with pgvector | Vercel |
| **Image Storage** | Vercel Blob | Vercel |
| **AI** | OpenAI GPT-4 Vision + Embeddings | Via backend |

## Prerequisites

- Node.js 18.x or later
- Vercel CLI (`npm i -g vercel`)
- Vercel account
- OpenAI API key
- Git

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/adstuart/snail-selfie.git
cd snail-selfie
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
BASIC_AUTH_USER=snailfamily
BASIC_AUTH_PASS=your-secure-password
OPENAI_API_KEY=sk-proj-...
POSTGRES_URL=postgres://default:...@...vercel-storage.com:5432/verceldb
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### 3. Set Up Database

Create a Vercel Postgres database:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Create Database → Postgres
3. Copy the `POSTGRES_URL` connection string to your `.env`
4. Connect to your database and run the schema:

```bash
# Using Vercel CLI
vercel env pull .env.local

# Connect to your database
psql $POSTGRES_URL

# Or run the schema file
psql $POSTGRES_URL < schema.sql
```

The schema file (`schema.sql`) creates all necessary tables:
- `snails`: Main snail profiles
- `snail_images`: Reference images for each snail
- `sightings`: Location/time records of snail sightings
- `sighting_images`: Photos attached to sightings

### 4. Set Up Vercel Blob Storage

1. In Vercel Dashboard, go to Storage → Create Database → Blob
2. Copy the `BLOB_READ_WRITE_TOKEN` to your `.env`

### 5. Get OpenAI API Key

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Create an API key from your account settings
3. Add it to your `.env` file

### 6. Run Development Server

```bash
vercel dev
```

This starts the Vercel development server at `http://localhost:3000`

### 7. Open Frontend

Open `public/index.html` in your browser or use a local server:

```bash
# Using Python
cd public
python -m http.server 8000

# Using Node.js http-server
npx http-server public -p 8000
```

Then navigate to `http://localhost:8000`

**Note**: Update the API URL in `public/js/api.js` if needed for local development.

## Production Deployment

### Deploy to Vercel (Backend + Frontend)

1. **Connect GitHub Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the root directory

2. **Configure Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add all variables from your `.env` file:
     - `BASIC_AUTH_USER`
     - `BASIC_AUTH_PASS`
     - `OPENAI_API_KEY`
     - `POSTGRES_URL`
     - `BLOB_READ_WRITE_TOKEN`

3. **Update API URL (Optional)**
   
   If needed, you can configure the API URL:
   
   **Option A: Using config.js (Recommended)**
   ```bash
   cd public
   cp config.example.js config.js
   # Edit config.js and set your Vercel URL
   ```
   
   **Option B: Edit api.js directly**
   Edit `public/js/api.js` and update the API_BASE_URL:
   
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
     ? 'http://localhost:3000'
     : 'https://YOUR-PROJECT.vercel.app'; // Replace with your Vercel URL
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at your Vercel URL (e.g., `https://snail-selfie-project.vercel.app`)

**Note**: Vercel automatically serves files from the `public/` directory at the root URL, so:
- `https://your-app.vercel.app/` → serves `public/index.html`
- `https://your-app.vercel.app/app.html` → serves `public/app.html`
- `https://your-app.vercel.app/css/styles.css` → serves `public/css/styles.css`
- `https://your-app.vercel.app/api/snails` → serverless function

## Usage

### First Time Setup

1. Navigate to your deployed frontend URL
2. Log in with the credentials you set in `BASIC_AUTH_USER` and `BASIC_AUTH_PASS`

### Adding a Snail

1. Click "Add Snail" button
2. Enter snail name (required)
3. Add species tag (default: "Garden snail")
4. Upload at least one photo (use mobile camera for best results)
5. Optionally click "Estimate Age" to use AI
6. Add any notes about the snail
7. Click "Save Snail"

### Recording a Sighting

1. Open a snail's detail page
2. Click "Add Sighting"
3. Select the garden location
4. Optionally upload photos of the sighting
5. Add notes about what the snail was doing
6. Click "Save Sighting"

### AI Features

**Age Estimation**: When adding/editing a snail, upload a photo and click "Estimate Age". The AI will analyze the snail and provide:
- Age classification (juvenile/adult/old)
- Kid-friendly explanation
- Confidence level

**Snail Identification** (Future): When uploading a sighting photo, the app can suggest which snail it might be based on visual similarity.

## Database Schema

### Snails Table
```sql
CREATE TABLE snails (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  species_tag VARCHAR(255) DEFAULT 'Garden snail',
  approx_age VARCHAR(50),
  age_explanation TEXT,
  age_confidence VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Other Tables
- `snail_images`: Reference photos for each snail
- `sightings`: Records of when/where snails were seen
- `sighting_images`: Photos of specific sightings

See `schema.sql` for complete schema.

## API Endpoints

All endpoints require Basic Auth header.

### Snails
- `GET /api/snails` - List all snails
- `GET /api/snails/:id` - Get snail detail
- `POST /api/snails` - Create new snail
- `PUT /api/snails/:id` - Update snail
- `DELETE /api/snails/:id` - Delete snail

### Sightings
- `POST /api/snails/:id/sightings` - Add sighting
- `DELETE /api/sightings/:id` - Delete sighting

### Images
- `POST /api/upload` - Upload image

### AI
- `POST /api/ai/estimate-age` - Estimate snail age
- `POST /api/ai/identify` - Find matching snails

## Security

- All API endpoints require HTTP Basic Authentication
- OpenAI API key is never exposed to the client
- Credentials stored as environment variables
- Frontend stores auth token in sessionStorage (cleared on logout)

## Technology Stack

**Frontend**:
- Vanilla HTML5/CSS3/JavaScript
- Mobile-first responsive design
- No frameworks or build process

**Backend**:
- Node.js with Vercel Serverless Functions
- Vercel Postgres with pgvector extension
- Vercel Blob storage

**AI**:
- OpenAI GPT-4o for vision/age estimation
- text-embedding-3-small for image embeddings

## Contributing

This is a personal/educational project, but suggestions and improvements are welcome!

## License

MIT

## Credits

Built with ❤️ for families who love snails!