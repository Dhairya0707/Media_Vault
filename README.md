# Media Vault — Production-Grade Asset Infrastructure

> A minimalist, high-performance media storage and management interface designed for developers who need a private "S3-style" vault for rapid asset deployment and live URL management.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-API-orange?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

## Overview

Media Vault solves the fragmentation problem in personal asset management. Instead of digging through cloud console UIs or dealing with complex S3 bucket policies for simple image hosting, this system provides a streamlined, secure, and developer-first interface for asset lifecycle management. It leverages Cloudinary's robust CDN infrastructure while abstracting the complexity behind a sleek, terminal-inspired dashboard.

Designed for high-speed workflows, Media Vault allows engineers to upload, inspect, and deploy assets to production environments with sub-second latency and zero configuration overhead once the environment is bootstrapped.

## Key Features

- **Auth-Gated Access**: 4-digit security protocol (PIN-based) using a custom `AuthGate` component to prevent unauthorized access to the asset management layer.
- **Unified Asset Inspector**: Real-time metadata extraction (dimensions, format, byte size) and immediate URL acquisition for streamlined developer workflows.
- **Multi-Mode Visualization**: Context-aware switching between detailed list views and asset-heavy grid layouts, optimized for different screen densities.
- **Direct Stream Uploads**: Server-side proxying of multipart form data directly to Cloudinary's API, ensuring client-side API keys are never exposed.
- **Soft Deletion & Permanent Termination**: Integrated deletion flow with confirmation protocols to manage asset lifecycle directly from the UI.

## Architecture

Media Vault is built on a **Serverless Proxy Architecture** using Next.js 15.

- **Request Flow**: Client requests are authenticated via a session-based gate. API interactions (Upload, Fetch, Delete) are proxied through Next.js Route Handlers (Server Components) to provide a secure bridge to the Cloudinary SDK.
- **Data Layer**: Stateless application design. The "Source of Truth" is the Cloudinary Search API, allowing the application to be highly portable and require no local database.
- **Key Design Patterns**:
  - **Proxy Pattern**: Securely handles API secrets on the server.
  - **HOC/Wrapper Pattern**: Uses `AuthGate` to wrap the entire application tree for global authentication state management.
  - **Atomic Component Design**: Highly modular UI components (AssetRow, DetailDrawer, MetaRow) for maintainability.

## Tech Stack

| Category      | Technology              | Why Chosen                                                                     |
| :------------ | :---------------------- | :----------------------------------------------------------------------------- |
| **Framework** | Next.js 15 (App Router) | Unified SSR/CSR capabilities and high-performance Route Handlers.              |
| **Language**  | TypeScript              | Type safety for API responses and complex asset metadata structures.           |
| **Styling**   | Tailwind CSS            | Rapid prototyping of a "Glassmorphism" terminal UI with minimal CSS footprint. |
| **Storage**   | Cloudinary              | Industry-standard CDN, automatic image optimization, and robust Search API.    |
| **Icons**     | Lucide React            | Consistent, lightweight SVG iconography.                                       |

## Setup Guide

### Step 1 — Cloudinary Account & Credentials

Cloudinary is the storage backend. You need a free account and your API credentials.

1. Go to [cloudinary.com](https://cloudinary.com/) and create a free account.
2. After signing up, navigate to your **Cloudinary Dashboard** — you'll land here automatically.
3. In the top-left you'll see your **Product Environment** panel. Copy the three values:

   | Value | Where to find it |
   | :--- | :--- |
   | `Cloud Name` | Displayed prominently at the top of the dashboard |
   | `API Key` | Listed under **API Keys** section |
   | `API Secret` | Listed under **API Keys** section (click the eye icon to reveal) |

   > [!CAUTION]
   > Your `API Secret` grants full write/delete access to your Cloudinary account. Never expose it client-side or commit it to version control.

4. *(Optional)* — Go to **Settings → Upload** and verify that **Unsigned uploading** is disabled. All uploads in this project are signed server-side, so this is not required.

---

### Step 2 — Clone & Configure

```bash
# 1. Clone the repository
git clone https://github.com/your-username/media-vault.git
cd media-vault

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env.local
```

Now open `.env.local` and fill in your values:

```env
# From your Cloudinary Dashboard
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# The folder name inside Cloudinary where assets will be stored.
# This will be auto-created on your first upload.
CLOUDINARY_FOLDER=media-vault

# 4-digit PIN to lock access to your vault
NEXT_PUBLIC_APP_PIN=1234
```

> [!NOTE]
> `CLOUDINARY_FOLDER` can be any name you want (e.g. `my-assets`, `portfolio`, `projects`). If the folder doesn't exist in Cloudinary yet, it will be created automatically on your first upload.

---

### Step 3 — Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be prompted for your PIN (the value you set in `NEXT_PUBLIC_APP_PIN`). After authentication, you can upload assets and get live CDN URLs immediately.

---

### Step 4 — Deploy to Vercel (Production)

> [!IMPORTANT]
> Vercel is the recommended hosting platform. Next.js Route Handlers are deployed as Vercel Serverless Functions, keeping your Cloudinary API secret secure on the server.

**Option A — Deploy via Vercel CLI (fastest)**

```bash
# Install the CLI if you haven't already
npm i -g vercel

# Authenticate and deploy from your project root
vercel

# Follow the prompts. When asked about environment variables,
# add each key from your .env.local one by one.
```

**Option B — Deploy via Vercel Dashboard (recommended for most users)**

1. Push your code to a GitHub repository:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Before clicking **Deploy**, expand the **"Environment Variables"** section and add all four keys:

   | Key | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your cloud name |
   | `CLOUDINARY_API_KEY` | Your API key |
   | `CLOUDINARY_API_SECRET` | Your API secret |
   | `CLOUDINARY_FOLDER` | Your folder name (e.g. `media-vault`) |
   | `NEXT_PUBLIC_APP_PIN` | Your 4-digit PIN |

5. Click **Deploy**. Vercel will build and host the application. Your vault will be live at a `*.vercel.app` URL.

> [!TIP]
> To use a **custom domain**, go to your project on the Vercel dashboard → **Settings → Domains** and add your domain. Vercel handles SSL automatically.

---

## API Reference

| Method | Endpoint      | Description                        | Auth Required |
| :----- | :------------ | :--------------------------------- | :------------ |
| `POST` | `/api/upload` | Streams file to Cloudinary         | Yes (UI Gate) |
| `GET`  | `/api/media`  | Fetches assets from defined folder | Yes (UI Gate) |
| `POST` | `/api/delete` | Terminates asset by `public_id`    | Yes (UI Gate) |

## Environment Variables (.env.example)

```env
# Cloudinary Dashboard Credentials
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=   # Found on Dashboard
CLOUDINARY_API_KEY=                  # Found on API Keys page
CLOUDINARY_API_SECRET=               # Keep this secret!

# Application Settings
CLOUDINARY_FOLDER=media-vault         # Target folder for all uploads
NEXT_PUBLIC_APP_PIN=8253              # 4-digit security PIN
```

## Engineering Decisions

- **Why Cloudinary over S3?**: Chose Cloudinary for the built-in image optimization and transformations. S3 would require a separate Lambda/CloudFront setup for on-the-fly resizing, which adds unnecessary complexity for a vault focused on images.
- **Search API for State Management**: Instead of a database (MongoDB/Prisma), the app uses Cloudinary's Search API. This ensures the UI is always perfectly synced with the actual storage, eliminating "ghost assets" and reducing infrastructure costs to zero.
- **Stream-based Uploads**: Implemented `cloudinary.uploader.upload_stream` to handle file uploads in memory. This avoids writing temporary files to the serverless filesystem, which is often restricted or slow in production environments like Vercel.
- **PIN-based Auth**: Decided on a lightweight 4-digit PIN gate instead of a full OAuth/Clerk integration to maintain the "instant access" feel of a personal tool while still providing a sufficient barrier against casual unauthorized access.

## Roadmap

- [ ] Batch selection and bulk actions (Move, Delete).
- [ ] On-the-fly image transformation editor (Resize, Crop).
- [ ] Multi-folder support with breadcrumb navigation.
- [ ] Support for video asset preview and playback.
