import type { VercelRequest, VercelResponse } from '@vercel/node';

const symbols: Record<string, string> = {
  SPX: '^GSPC',
  NDX: '^NDX',
  IBOV: '^BVSP',
  EURUSD: 'EURUSD=X'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const symbol = String(req.query.symbol ?? '').toUpperCase();
  const ticker = symbols[symbol];
  if (!ticker) return res.status(400).json({ error: 'Unsupported symbol' });

  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1m`, { headers: { Accept: 'application/json' } });
    if (!response.ok) return res.status(response.status).json({ error: `Market data provider returned ${response.status}` });
    const payload = await response.json();
    const result = payload?.chart?.result?.[0];
    const value = Number(result?.meta?.regularMarketPrice);
    if (!Number.isFinite(value) || value <= 0) return res.status(502).json({ error: 'Quote unavailable' });
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ symbol, price: value, updatedAt: new Date().toISOString(), source: 'Yahoo Finance' });
  } catch {
    return res.status(502).json({ error: 'Quote provider unavailable' });
  }
}
