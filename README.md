# x402 Service Mesh — 7 Node APIs

Each folder is a standalone Express.js service deployable to Render or Hugging Face Spaces.

## Nodes

| # | Name | Folder | Routes | Price |
|---|------|--------|--------|-------|
| 1 | Identity Validator | `identity-validator/` | `POST /score/credit`, `POST /score/wallet-risk` | $0.05–$0.08 |
| 2 | Context Refinery | `context-refinery/` | `POST /refine/docs\|news\|signal\|financial` | $0.02–$0.04 |
| 3 | Yield & Gas Oracle | `yield-gas-oracle/` | `GET /yield`, `GET /gas` | $0.03–$0.04 |
| 4 | Portfolio Analyzer | `portfolio-analyzer/` | `POST /analyze/basic\|detailed\|full` | $0.05–$0.18 |
| 5 | Token Launch Vetter | `token-launch-vetter/` | `POST /vet/quick\|standard\|full` | $0.04–$0.18 |
| 6 | MEV Shield Sentinel | `mev-shield-sentinel/` | `POST /mev/detect\|simulate\|protect` | $0.03–$0.15 |
| 7 | Cross-Chain Bridge | `crosschain-bridge/` | `POST /bridge/quote\|route\|execute` | $0.01–$0.12 |

Every node also exposes:
- `GET /health` — status check (no payment required)
- `GET /stats` — returns `{ revenue, transactions, uptime, latency }` (read by dashboard)

## Deploy to Render (one node at a time)

1. Push each folder as its own GitHub repo (or use a monorepo)
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New Web Service**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — click **Deploy**
5. Set the `WALLET_ADDRESS` env var to your wallet in Render's dashboard
6. Copy the live URL and paste into the dashboard's `NODES` config

## Keep nodes alive (avoid Render cold starts)

Use [cron-job.org](https://cron-job.org) — free cron service:
1. Create a new cron job for each node
2. URL: `https://your-node.onrender.com/health`
3. Interval: every 10 minutes
4. Done — nodes stay warm 24/7

## Environment Variables

```
PORT=3000                          # set automatically by Render
WALLET_ADDRESS=0xYourWallet        # your payment receiving wallet
NODE_ENV=production
```

## x402 Payment Flow

1. Client calls a paid route (e.g. `POST /score/credit`)
2. Node returns `402 Payment Required` with price + wallet
3. Client sends payment, retries with `x-payment` header containing proof
4. Node verifies proof → serves response → increments `/stats`

> **TODO**: Replace the placeholder payment verification in each node's
> `requirePayment()` function with real x402 SDK verification once your
> x402 setup is confirmed working.

## Local Development

```bash
cd identity-validator
cp .env.example .env
# edit .env with your wallet address
npm install
npm run dev
```
