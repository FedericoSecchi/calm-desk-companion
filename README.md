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

## 📦 Getting Started

### Prerequisites

- Node.js 20+ (recommended: use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or bun

### Installation

```sh
# Clone the repository
git clone https://github.com/FedericoSecchi/calm-desk-companion.git

# Navigate to the project directory
cd calm-desk-companion

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

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
