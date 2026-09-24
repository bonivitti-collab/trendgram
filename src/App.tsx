import { useEffect, useMemo, useState } from 'react';

type AssetClass = 'SP500' | 'NASDAQ100' | 'B3' | 'Cripto' | 'Forex';

type Opportunity = {
  id: string;
  symbol: string;
  assetClass: AssetClass;
  title: string;
  subtitle: string;
  direction: 'long' | 'short';
  setup: string;
  thesis: string;
  why: string;
  how: string;
  entry: number;
  stop: number;
  target: number;
  riskPercent: number;
  winRate: number;
  profitFactor: number;
  allocation: number;
  tag: string;
  market: string;
  live?: boolean;
  updatedAt?: string;
};

type QuoteConfig = {
  id: string;
  yahoo: string;
  assetClass: AssetClass;
  symbol: string;
  market: string;
  direction: 'long' | 'short';
  title: string;
  subtitle: string;
  setup: string;
  thesis: string;
  why: string;
  how: string;
  riskPercent: number;
  winRate: number;
  profitFactor: number;
  allocation: number;
  tag: string;
};

const quoteConfigs: QuoteConfig[] = [
  { id: 'spx-gaps', yahoo: '^GSPC', symbol: 'SPX', assetClass: 'SP500', market: 'US Market', direction: 'long', title: 'Distorção de retorno em SPX', subtitle: 'Pullback curto com proteção no VWAP', setup: 'Preço real do índice com entrada calculada pela estrutura de tendência', thesis: 'A leitura usa a cotação atual do S&P 500 e recalcula a faixa operacional a cada atualização.', why: 'O preço de entrada deixa de ser estático e acompanha o mercado consultado.', how: 'Aguarde confirmação da estrutura antes de operar. Níveis são educacionais e não recomendação financeira.', riskPercent: .8, winRate: 63, profitFactor: 2.4, allocation: 18, tag: 'Trend' },
  { id: 'ndx-beta', yahoo: '^NDX', symbol: 'NDX', assetClass: 'NASDAQ100', market: 'US Growth', direction: 'long', title: 'Beta positiva em QQQ', subtitle: 'Reentrada no suporte de alta', setup: 'Preço real do Nasdaq 100 com alvo e proteção derivados do último preço', thesis: 'A dinâmica é recalculada com o preço atual do índice.', why: 'A atualização automática reduz a defasagem dos níveis exibidos.', how: 'Use o nível apenas como estudo e confirme a liquidez na sua corretora.', riskPercent: 1, winRate: 66, profitFactor: 2.6, allocation: 16, tag: 'Momentum' },
  { id: 'b3-ibov', yahoo: '^BVSP', symbol: '^BVSP', assetClass: 'B3', market: 'Brazil', direction: 'long', title: 'Arbitragem entre fluxo e preço', subtitle: 'Break do topo de liquidez com reteste estrutural', setup: 'Cotação real do Ibovespa com níveis calculados automaticamente', thesis: 'O mercado local passa a refletir o último preço disponível na fonte pública.', why: 'A entrada, o stop e o alvo são recalculados quando o preço é atualizado.', how: 'Confirme o book e o horário do mercado antes de qualquer decisão.', riskPercent: 1.2, winRate: 58, profitFactor: 2.2, allocation: 20, tag: 'Structure' },
  { id: 'btc-spot', yahoo: 'BTC-USD', symbol: 'BTC', assetClass: 'Cripto', market: 'Crypto', direction: 'long', title: 'Distorção de volatilidade em BTC', subtitle: 'Compra no suporte de tendência com sprint de liquidez', setup: 'Cotação real do BTC/USD, atualizada automaticamente', thesis: 'O preço vem de uma cotação pública e os níveis são recalculados a partir dela.', why: 'A cotação atual substitui o valor de demonstração que existia no app.', how: 'Não trate os níveis calculados como sinal garantido. Valide a estratégia antes de usar capital real.', riskPercent: 1.5, winRate: 61, profitFactor: 2.7, allocation: 22, tag: 'Volatility' },
  { id: 'eurusd', yahoo: 'EURUSD=X', symbol: 'EURUSD', assetClass: 'Forex', market: 'FX', direction: 'short', title: 'Reversão estrutural no EURUSD', subtitle: 'Corte de liquidez com retorno ao valor médio', setup: 'Cotação real do EUR/USD com entrada e proteção calculadas', thesis: 'O último preço público é usado para recalcular a oportunidade.', why: 'Os níveis deixam de depender de valores antigos gravados no código.', how: 'Forex exige fonte de execução e spread da corretora para validar a entrada.', riskPercent: .9, winRate: 64, profitFactor: 2.3, allocation: 12, tag: 'Mean Reversion' }
];

const categories = ['all', 'SP500', 'NASDAQ100', 'B3', 'Cripto', 'Forex'] as const;
type Category = (typeof categories)[number];
const fallbackPrices: Record<string, number> = { '^GSPC': 5565, '^NDX': 488.4, '^BVSP': 118950, 'BTC-USD': 63480, 'EURUSD=X': 1.1018 };

function makeOpportunity(config: QuoteConfig, price: number, updatedAt?: string): Opportunity {
  const long = config.direction === 'long';
  return { id: config.id, symbol: config.symbol, assetClass: config.assetClass, title: config.title, subtitle: config.subtitle, direction: config.direction, setup: config.setup, thesis: config.thesis, why: config.why, how: config.how, entry: price, stop: long ? price * .98 : price * 1.01, target: long ? price * 1.04 : price * .982, riskPercent: config.riskPercent, winRate: config.winRate, profitFactor: config.profitFactor, allocation: config.allocation, tag: config.tag, market: config.market, live: Boolean(updatedAt), updatedAt };
}

async function fetchQuote(config: QuoteConfig): Promise<{ price: number; updatedAt: string } | null> {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(config.yahoo)}?range=1d&interval=1m`);
    if (!response.ok) throw new Error('Quote request failed');
    const payload = await response.json();
    const result = payload?.chart?.result?.[0];
    const closes: unknown[] = result?.indicators?.quote?.[0]?.close ?? [];
    const latestClose = [...closes].reverse().find((value): value is number => typeof value === 'number' && Number.isFinite(value));
    const price = Number(result?.meta?.regularMarketPrice ?? latestClose);
    if (!Number.isFinite(price) || price <= 0) throw new Error('Invalid quote');
    return { price, updatedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}

function formatCurrency(value: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value); }
function formatPrice(value: number) { return value >= 1000 ? value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : value.toLocaleString('pt-BR', { maximumFractionDigits: 4 }); }
function getRiskMetrics(capital: number, riskPercent: number, opportunity: Opportunity) { const riskAmount = capital * riskPercent / 100; const distance = Math.abs(opportunity.entry - opportunity.stop); const positionUnits = distance ? riskAmount / distance : 0; return { riskAmount, positionUnits, expectedGain: Math.abs(opportunity.target - opportunity.entry) * positionUnits }; }
function getNextUpdate() { const next = new Date(); next.setHours(19, 0, 0, 0); if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1); return next; }
function formatCountdown(ms: number) { const seconds = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(seconds / 3600).toString().padStart(2, '0')}:${Math.floor(seconds % 3600 / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`; }

export default function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => quoteConfigs.map((item) => makeOpportunity(item, fallbackPrices[item.yahoo])));
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [capital, setCapital] = useState(25000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [selectedId, setSelectedId] = useState('spx-gaps');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [nextUpdate, setNextUpdate] = useState(getNextUpdate);
  const [now, setNow] = useState(Date.now());

  const refreshQuotes = async () => {
    setLoading(true);
    const results = await Promise.all(quoteConfigs.map(fetchQuote));
    setOpportunities(quoteConfigs.map((config, index) => makeOpportunity(config, results[index]?.price ?? fallbackPrices[config.yahoo], results[index]?.updatedAt)));
    const latest = results.find((result): result is { price: number; updatedAt: string } => result !== null);
    if (latest) setLastUpdated(latest.updatedAt);
    setLoading(false);
  };

  useEffect(() => { void refreshQuotes(); const timer = window.setInterval(() => void refreshQuotes(), 60000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { const timer = window.setInterval(() => { const current = Date.now(); setNow(current); if (current >= nextUpdate.getTime()) setNextUpdate(getNextUpdate()); }, 1000); return () => window.clearInterval(timer); }, [nextUpdate]);

  const visible = useMemo(() => activeCategory === 'all' ? opportunities : opportunities.filter((item) => item.assetClass === activeCategory), [activeCategory, opportunities]);
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0] ?? opportunities[0];
  const metrics = useMemo(() => getRiskMetrics(capital, riskPercent, selected), [capital, riskPercent, selected]);
  const updatedLabel = lastUpdated ? new Date(lastUpdated).toLocaleTimeString('pt-BR') : 'aguardando';

  return <div className="app-shell">
    <header className="topbar"><div className="brand-wrap"><img className="brand-logo" src={`${import.meta.env.BASE_URL}logo.svg`} alt="Trendgram" /></div><div className="update-clock"><span className="update-label">PRÓXIMA VARREDURA</span><strong>19:00</strong><span className="countdown">{formatCountdown(nextUpdate.getTime() - now)}</span></div></header>
    <main className="content-grid"><section className="feed-panel"><div className="feed-header"><div><p className="eyebrow">feed</p><h2>Oportunidades</h2></div><span className="live-pill">LIVE</span></div><div className="quote-status"><span className={loading ? 'status-dot loading' : 'status-dot'} />{loading ? 'Atualizando cotações...' : `Cotações reais · ${updatedLabel}`}</div><div className="filters">{categories.map((category) => <button key={category} type="button" className={category === activeCategory ? 'filter active' : 'filter'} onClick={() => setActiveCategory(category)}>{category === 'all' ? 'Todos' : category}</button>)}</div><div className="stream">{visible.map((item) => <article key={item.id} className={selected.id === item.id ? 'post selected' : 'post'} onClick={() => setSelectedId(item.id)}><div className="post-topline"><div className="avatar">{item.symbol.slice(0, 2)}</div><div className="post-meta"><div className="line-1"><strong>{item.symbol}</strong><span className="tag">{item.tag}</span></div><span className="market-name">{item.market}{item.live ? ' · ao vivo' : ' · fallback'}</span></div><button type="button" className={liked[item.id] ? 'like-button liked' : 'like-button'} onClick={(event) => { event.stopPropagation(); setLiked((current) => ({ ...current, [item.id]: !current[item.id] })); }}>♥</button></div><div className="post-copy"><h3>{item.title}</h3><p>{item.subtitle}</p></div><div className="trade-strip"><span>Entrada {formatPrice(item.entry)}</span><span>TP {formatPrice(item.target)}</span><span>SL {formatPrice(item.stop)}</span></div><div className="mini-stats"><div><small>RR</small><strong>2:1</strong></div><div><small>Win</small><strong>{item.winRate}%</strong></div><div><small>PF</small><strong>{item.profitFactor.toFixed(1)}x</strong></div></div></article>)}</div></section><aside className="insight-panel"><div className="insight-header-card"><div className="badge-row"><span className="status-dot" /><span>{selected.assetClass}</span></div><h2>{selected.symbol}</h2><p>{selected.setup}</p></div><div className="score-card"><div><span>Probabilidade</span><strong>{selected.winRate}%</strong></div><div><span>Profit Factor</span><strong>{selected.profitFactor.toFixed(1)}x</strong></div><div><span>Alocação</span><strong>{selected.allocation}%</strong></div></div><div className="section-block"><p className="eyebrow">explicação</p><h3>O que é</h3><p>{selected.thesis}</p></div><div className="section-block"><p className="eyebrow">porque</p><h3>Por que faz sentido</h3><p>{selected.why}</p></div><div className="section-block"><p className="eyebrow">montagem</p><h3>Como operar</h3><p>{selected.how}</p></div><div className="calculator"><p className="eyebrow">simulador</p><h3>Capital alocado</h3><label className="input-group"><span>Capital</span><input type="number" value={capital} min={1000} step={500} onChange={(event) => setCapital(Number(event.target.value || 0))} /></label><label className="input-group"><span>Risco por operação</span><input type="range" min={.25} max={3} step={.25} value={riskPercent} onChange={(event) => setRiskPercent(Number(event.target.value))} /><strong>{riskPercent.toFixed(2)}%</strong></label><div className="trade-output"><div><span>Entrada</span><strong>{formatPrice(selected.entry)}</strong></div><div><span>TP</span><strong>{formatPrice(selected.target)}</strong></div><div><span>SL</span><strong>{formatPrice(selected.stop)}</strong></div></div><div className="risk-summary"><div><span>Risco</span><strong>{formatCurrency(metrics.riskAmount)}</strong></div><div><span>Posição</span><strong>{metrics.positionUnits.toFixed(2)} unidades</strong></div><div><span>Lucro alvo</span><strong>{formatCurrency(metrics.expectedGain)}</strong></div></div></div></aside></main>
  </div>;
}
