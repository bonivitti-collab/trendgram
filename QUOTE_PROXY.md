# Market quote proxy

The static GitHub Pages build can fetch BTC directly from Binance, but Yahoo Finance blocks browser requests for SPX, NDX, IBOV and EURUSD. The `api/quote.ts` function is a Vercel-compatible serverless proxy for those four symbols.

To enable all quotes:

1. Deploy this repository to Vercel (the `api/quote.ts` function is detected automatically).
2. Set `VITE_QUOTE_API_BASE_URL` to the deployed origin, for example `https://your-project.vercel.app`.
3. Rebuild and deploy the frontend with that variable.

The frontend must never display a stale fallback: if the proxy cannot return a valid quote, the asset remains `indisponível`.
