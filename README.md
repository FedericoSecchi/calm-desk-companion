# Calmo - Desk Companion

A Progressive Web App (PWA) for healthy habits while working at your computer. Take care of your posture and well-being while working, without pain.

## 🚀 Live Demo

The app is deployed on GitHub Pages: [View Live](https://federicosecchi.github.io/calm-desk-companion/)

## 🛠️ Technologies

This project is built with:

- **Vite** - Build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Vite PWA Plugin** - Progressive Web App support
- **Supabase** - Authentication and backend services

## 📦 Getting Started

### Prerequisites

- Node.js 20+ (recommended: use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or bun
- Supabase project (for authentication)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get these values:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings → API**
4. Copy the following:
   - **"Project URL"** → Use for `VITE_SUPABASE_URL`
   - **"anon public" key** → Use for `VITE_SUPABASE_ANON_KEY`

**Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### Supabase Dashboard Configuration

Before using authentication, configure the following in your Supabase project:

#### 1. Enable Email Authentication
- Go to **Authentication → Providers**
- Ensure **Email** provider is enabled
- Configure email templates if needed

#### 2. Enable Google OAuth (Optional)
- Go to **Authentication → Providers**
- Enable **Google** provider
- Click **Configure** and add:
  - **Client ID** (from Google Cloud Console)
  - **Client Secret** (from Google Cloud Console)
- **Important:** The redirect URL in Google Cloud Console must match:
  - For local dev: `http://localhost:5173/auth/callback`
  - For production: `https://federicosecchi.github.io/calm-desk-companion/auth/callback`

#### 3. Configure Redirect URLs in Supabase
- Go to **Authentication → URL Configuration**
- Add to **Redirect URLs** (one per line):
  ```
  http://localhost:5173/auth/callback
  https://federicosecchi.github.io/calm-desk-companion/auth/callback
  ```
- **Site URL** should be set to your production URL:
  ```
  https://federicosecchi.github.io/calm-desk-companion
  ```

#### 4. Set Up Profiles Table
The app expects a `profiles` table with the following structure. Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Important Notes:**
- The `id` column references `auth.users(id)` - this is automatically set by Supabase
- The app will automatically create a profile row when a user signs in for the first time
- RLS policies ensure users can only access their own profile
- The `ON DELETE CASCADE` ensures profiles are deleted when users are deleted

### Installation

```sh
# Clone the repository
git clone https://github.com/FedericoSecchi/calm-desk-companion.git

# Navigate to the project directory
cd calm-desk-companion

# Install dependencies
npm install

# Create .env.local file with your Supabase credentials
# (See Environment Variables section above)

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Build

```sh
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 📱 PWA Features

- **Installable** - Can be installed on desktop and mobile devices
- **Offline Support** - Service worker caches assets for offline use
- **App-like Experience** - Standalone display mode

## 🚢 Deployment

This project is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch.

### Manual Deployment

1. Build the project: `npm run build`
2. The `dist` folder contains the production-ready files
3. GitHub Actions will automatically deploy on push to `main`

### GitHub Pages Setup

1. Go to repository Settings > Pages
2. Source should be set to "GitHub Actions"
3. The workflow will automatically deploy on each push to `main`

## 📝 Development

### Project Structure

```
calm-desk-companion/
├── public/          # Static assets
├── src/
│   ├── components/  # React components
│   ├── pages/      # Page components
│   ├── layouts/    # Layout components
│   ├── hooks/      # Custom React hooks
│   └── lib/        # Utilities
└── dist/           # Build output (generated)
```

## 📄 License

This project is private and proprietary.
