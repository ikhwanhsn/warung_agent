# Warung Agent — Documentation

Vite + React documentation site for the **Warung Agent** monorepo.

## Contents

- **Welcome** — monorepo layout and quick start
- **AI Agent UI** — `ai-agent/` (Vite, React, Privy, Solana, warung mode)
- **API** — package overview and `POST /warung/*` mock commerce
- **Changelog** & **Community** — project notes and internal links

## Tech stack

| Layer | Technology |
| ----- | ---------- |
| Build | Vite, TypeScript |
| UI | React, Tailwind CSS, shadcn-ui |
| Routing | React Router |

## Run locally

```bash
cd docs
npm install
npm run dev
```

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

Deploy the `dist/` output to any static host (see `vercel.json` for SPA rewrites).

## License

Match the license of your monorepo (e.g. MIT).
