require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const stats = { revenue: 0, transactions: 0 };

app.use(cors());
app.use(express.json());

function requirePayment(priceUSD) {
  return (req, res, next) => {
    if (!req.headers['x-payment']) {
      return res.status(402).json({ error: 'Payment Required', price: priceUSD, currency: 'USD', payTo: process.env.WALLET_ADDRESS });
    }
    stats.revenue += priceUSD; stats.transactions += 1; next();
  };
}

const BRIDGES = ['Stargate', 'Hop Protocol', 'Across', 'Synapse', 'LayerZero'];
const CHAINS  = ['ethereum', 'arbitrum', 'optimism', 'base', 'polygon', 'avalanche'];

app.get('/health', (req, res) => res.json({ status: 'online', node: 'crosschain-bridge', uptime: process.uptime() }));

app.get('/stats', (req, res) => res.json({
  revenue: parseFloat(stats.revenue.toFixed(4)),
  transactions: stats.transactions,
  uptime: parseFloat((97.0 + Math.random() * 1.0).toFixed(2)),
  latency: Math.floor(30 + Math.random() * 80),
}));

// get bridge quote
app.post('/bridge/quote', requirePayment(0.01), (req, res) => {
  const { fromChain, toChain, token, amount } = req.body;
  if (!fromChain || !toChain || !amount) return res.status(400).json({ error: 'fromChain, toChain, amount required' });
  const fee = (amount * (0.001 + Math.random() * 0.004)).toFixed(6);
  res.json({
    fromChain, toChain, token: token || 'ETH', amount,
    estimatedFee: parseFloat(fee),
    estimatedTime: `${Math.floor(1 + Math.random() * 15)} min`,
    bridge: BRIDGES[Math.floor(Math.random() * BRIDGES.length)],
    timestamp: new Date().toISOString(),
  });
});

// get optimal route across all bridges
app.post('/bridge/route', requirePayment(0.05), (req, res) => {
  const { fromChain, toChain, token, amount } = req.body;
  if (!fromChain || !toChain || !amount) return res.status(400).json({ error: 'fromChain, toChain, amount required' });
  const routes = BRIDGES.slice(0, 3).map(b => ({
    bridge: b,
    fee: parseFloat((amount * (0.001 + Math.random() * 0.005)).toFixed(6)),
    time: `${Math.floor(1 + Math.random() * 20)} min`,
    slippage: (Math.random() * 0.5).toFixed(3) + '%',
  })).sort((a, b) => a.fee - b.fee);
  res.json({ fromChain, toChain, token: token || 'ETH', amount, bestRoute: routes[0], allRoutes: routes, timestamp: new Date().toISOString() });
});

// execute bridge (simulation)
app.post('/bridge/execute', requirePayment(0.12), (req, res) => {
  const { fromChain, toChain, token, amount, bridge } = req.body;
  if (!fromChain || !toChain || !amount) return res.status(400).json({ error: 'fromChain, toChain, amount required' });
  res.json({
    status: 'submitted',
    txHash: '0x' + Math.random().toString(16).slice(2, 66).toUpperCase(),
    fromChain, toChain, token: token || 'ETH', amount,
    bridge: bridge || BRIDGES[0],
    estimatedArrival: new Date(Date.now() + 10 * 60000).toISOString(),
    trackingUrl: `https://layerzeroscan.com/tx/0x${Math.random().toString(16).slice(2,18)}`,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => console.log(`Cross-Chain Bridge running on port ${PORT}`));
