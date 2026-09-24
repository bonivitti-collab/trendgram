import { useMemo, useState } from 'react';

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
  sentiment: 'bullish' | 'bearish' | 'neutral';
  tag: string;
  market: string;
};

const feed: Opportunity[] = [
  {
    id: 'spx-gaps',
    symbol: 'SPX',
    assetClass: 'SP500',
    title: 'Distorção de retorno em SPX',
    subtitle: 'Pullback curto com proteção no VWAP',
    direction: 'long',
    setup: 'Breakout de estrutura no 15m e reentrada no valor de tendência mensal',
    thesis: 'O índice está preservando a tendência de alta em data de forte liquidez. O pullback foi limitado e a estrutura de longo prazo continua intacta.',
    why: 'Quando o índice retoma o nível de referência após distensão de volatilidade, o risco tende a cair e a recompensa aumenta.',
    how: 'Entre na confirmação do fechamento acima do nível de rejeição + 1 desvio. Não force posição antes do teste.',
    entry: 5565,
    stop: 5538,
    target: 5631,
    riskPercent: 0.8,
    winRate: 63,
    profitFactor: 2.4,
    allocation: 18,
    sentiment: 'bullish',
    tag: 'Trend',
    market: 'US Market'
  },
  {
    id: 'ndx-beta',
    symbol: 'NDX',
    assetClass: 'NASDAQ100',
    title: 'Beta positiva em QQQ',
    subtitle: 'Reentrada no suporte de alta',
    direction: 'long',
    setup: 'Estrutura de alta intacta com curto retracement de 0.618 da onda recente',
    thesis: 'A dinâmica de crescimento segue liderando o mercado; a correção foi construtiva e sem quebra de tendência.',
    why: 'A regressão do índice para o suporte de tendência reduz o risco de falha e aproxima a entrada das melhores médias comparativas.',
    how: 'Entre na confirmação de fechamento acima do ponto de pivô intradiário e mantenha stop na base do suporte.',
    entry: 488.4,
    stop: 484.6,
    target: 495.2,
    riskPercent: 1.0,
    winRate: 66,
    profitFactor: 2.6,
    allocation: 16,
    sentiment: 'bullish',
    tag: 'Momentum',
    market: 'US Growth'
  },
  {
    id: 'b3-ibov',
    symbol: '^BVSP',
    assetClass: 'B3',
    title: 'Arbitragem entre fluxo e preço',
    subtitle: 'Break do topo de liquidez com reteste estrutural',
    direction: 'long',
    setup: 'Reteste de cisão com ação de preço acima da media de 20 períodos e volume crescente',
    thesis: 'O mercado local continua respondendo a indicadores macro positivos. O nível de antes do rompimento se torna área de suporte.',
    why: 'Volume e estrutura apontam continuidade. Quando o preço retorna ao nível rompido, a reação é quase sempre mais forte.',
    how: 'Entre no reteste do nível rompido com stop abaixo do ponto de confirmação. O alvo mínimo é 2x o risco.',
    entry: 118950,
    stop: 117860,
    target: 121640,
    riskPercent: 1.2,
    winRate: 58,
    profitFactor: 2.2,
    allocation: 20,
    sentiment: 'bullish',
    tag: 'Structure',
    market: 'Brazil'
  },
  {
    id: 'btc-spot',
    symbol: 'BTC',
    assetClass: 'Cripto',
    title: 'Distorção de volatilidade em BTC',
    subtitle: 'Compra no suporte de tendência com sprint de liquidez',
    direction: 'long',
    setup: 'Ação de preço acima da média móvel de 50 e queda de volatilidade antes de expansão',
    thesis: 'A estrutura de alta continua intacta: a compressão de volatilidade precede expansão forte em BTC.',
    why: 'Mercados cripto costumam responder mais rapidamente quando a volatilidade se comprime e o preço reage ao suporte de tendência.',
    how: 'Entre no fechamento acima do suporte e deixe stop abaixo da base com risco definido. O alvo equivale a 2R.',
    entry: 63480,
    stop: 62110,
    target: 64840,
    riskPercent: 1.5,
    winRate: 61,
    profitFactor: 2.7,
    allocation: 22,
    sentiment: 'bullish',
    tag: 'Volatility',
    market: 'Crypto'
  },
  {
    id: 'eurusd',
    symbol: 'EURUSD',
    assetClass: 'Forex',
    title: 'Reversão estrutural no EURUSD',
    subtitle: 'Corte de liquidez com retorno ao valor médio',
    direction: 'short',
    setup: 'A partir do topo de expansão, preço retornou para o ponto de equilíbrio da tendência recente',
    thesis: 'O mercado mostrou rejeição no topo e agora sugere retorno ao valor médio do impulso recente.',
    why: 'Uma vez que o rompimento falha e o preço retorna ao nível de prior resistance, a tendência tende a inverter ou pausas seguir uma correção.',
    how: 'Entre em confirmação de fechamento abaixo da zona de liquidez com stop acima do alto de rejeição.',
    entry: 1.1018,
    stop: 1.1076,
    target: 1.0914,
    riskPercent: 0.9,
    winRate: 64,
    profitFactor: 2.3,
    allocation: 12,
    sentiment: 'bearish',
    tag: 'Mean Reversion',
    market: 'FX'
  }
];

const categories = ['all', 'SP500', 'NASDAQ100', 'B3', 'Cripto', 'Forex'] as const;

type Category = (typeof categories)[number];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

function getRiskMetrics(capital: number, riskPercent: number, opportunity: Opportunity) {
  const riskAmount = capital * (riskPercent / 100);
  const stopDistance = Math.abs(opportunity.entry - opportunity.stop);
  const positionUnits = stopDistance > 0 ? riskAmount / stopDistance : 0;
  const expectedGain = Math.abs(opportunity.target - opportunity.entry) * positionUnits;

  return {
    riskAmount,
    stopDistance,
    positionUnits,
    expectedGain,
    riskReward: Math.abs((opportunity.target - opportunity.entry) / (opportunity.entry - opportunity.stop))
  };
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [capital, setCapital] = useState(25000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [selectedId, setSelectedId] = useState(feed[0].id);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const visibleOpportunities = useMemo(() => {
    if (activeCategory === 'all') return feed;
    return feed.filter((opportunity) => opportunity.assetClass === activeCategory);
  }, [activeCategory]);

  const selectedOpportunity =
    visibleOpportunities.find((item) => item.id === selectedId) ?? visibleOpportunities[0] ?? feed[0];

  const tradeMetrics = useMemo(
    () => getRiskMetrics(capital, riskPercent, selectedOpportunity),
    [capital, riskPercent, selectedOpportunity]
  );

  const handleLike = (id: string) => {
    setLiked((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">T</div>
          <div>
            <p className="eyebrow">laboratory</p>
            <h1>trendgram</h1>
          </div>
        </div>

        <div className="header-actions">
          <button className="ghost-button">Buscar</button>
          <button className="primary-button">+ Nova</button>
        </div>
      </header>

      <main className="content-grid">
        <section className="feed-panel">
          <div className="feed-header">
            <div>
              <p className="eyebrow">feed</p>
              <h2>Oportunidades</h2>
            </div>
            <span className="live-pill">live</span>
          </div>

          <div className="filters" aria-label="Filtros por mercado">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={category === activeCategory ? 'filter active' : 'filter'}
                onClick={() => setActiveCategory(category)}
              >
                {category === 'all' ? 'Todos' : category}
              </button>
            ))}
          </div>

          <div className="stream">
            {visibleOpportunities.map((opportunity) => (
              <article
                key={opportunity.id}
                className={selectedOpportunity.id === opportunity.id ? 'post selected' : 'post'}
                onClick={() => setSelectedId(opportunity.id)}
              >
                <div className="post-topline">
                  <div className="avatar" aria-label={`Ativo ${opportunity.symbol}`}>
                    {opportunity.symbol.slice(0, 2)}
                  </div>
                  <div className="post-meta">
                    <div className="line-1">
                      <strong>{opportunity.symbol}</strong>
                      <span className="tag">{opportunity.tag}</span>
                    </div>
                    <span className="market-name">{opportunity.market}</span>
                  </div>
                  <button
                    type="button"
                    className={liked[opportunity.id] ? 'like-button liked' : 'like-button'}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleLike(opportunity.id);
                    }}
                    aria-label="Curtir oportunidade"
                  >
                    ♥
                  </button>
                </div>

                <div className="post-copy">
                  <h3>{opportunity.title}</h3>
                  <p>{opportunity.subtitle}</p>
                </div>

                <div className="trade-strip">
                  <span>Entry {opportunity.entry}</span>
                  <span>TP {opportunity.target}</span>
                  <span>SL {opportunity.stop}</span>
                </div>

                <div className="mini-stats">
                  <div>
                    <small>RR</small>
                    <strong>2:1</strong>
                  </div>
                  <div>
                    <small>Win</small>
                    <strong>{opportunity.winRate}%</strong>
                  </div>
                  <div>
                    <small>PF</small>
                    <strong>{opportunity.profitFactor.toFixed(1)}x</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="insight-panel">
          <div className="insight-header-card">
            <div className="badge-row">
              <span className="status-dot" />
              <span>{selectedOpportunity.assetClass}</span>
            </div>
            <h2>{selectedOpportunity.symbol}</h2>
            <p>{selectedOpportunity.setup}</p>
          </div>

          <div className="score-card">
            <div>
              <span>Probabilidade</span>
              <strong>{selectedOpportunity.winRate}%</strong>
            </div>
            <div>
              <span>Profit Factor</span>
              <strong>{selectedOpportunity.profitFactor.toFixed(1)}x</strong>
            </div>
            <div>
              <span>Alocação</span>
              <strong>{selectedOpportunity.allocation}%</strong>
            </div>
          </div>

          <div className="section-block">
            <p className="eyebrow">explicação</p>
            <h3>O que é</h3>
            <p>{selectedOpportunity.thesis}</p>
          </div>

          <div className="section-block">
            <p className="eyebrow">porque</p>
            <h3>Por que faz sentido</h3>
            <p>{selectedOpportunity.why}</p>
          </div>

          <div className="section-block">
            <p className="eyebrow">montagem</p>
            <h3>Como operar</h3>
            <p>{selectedOpportunity.how}</p>
          </div>

          <div className="calculator">
            <div className="calculator-header">
              <p className="eyebrow">simulador</p>
              <h3>Capital alocado</h3>
            </div>

            <label className="input-group">
              <span>Capital</span>
              <input
                type="number"
                value={capital}
                min={1000}
                step={500}
                onChange={(event) => setCapital(Number(event.target.value || 0))}
              />
            </label>

            <label className="input-group">
              <span>Risco por operação</span>
              <input
                type="range"
                min={0.25}
                max={3}
                step={0.25}
                value={riskPercent}
                onChange={(event) => setRiskPercent(Number(event.target.value))}
              />
              <strong>{riskPercent.toFixed(2)}%</strong>
            </label>

            <div className="trade-output">
              <div>
                <span>Entrada</span>
                <strong>{selectedOpportunity.entry}</strong>
              </div>
              <div>
                <span>TP</span>
                <strong>{selectedOpportunity.target}</strong>
              </div>
              <div>
                <span>SL</span>
                <strong>{selectedOpportunity.stop}</strong>
              </div>
            </div>

            <div className="risk-summary">
              <div>
                <span>Risco</span>
                <strong>{formatCurrency(tradeMetrics.riskAmount)}</strong>
              </div>
              <div>
                <span>Posição</span>
                <strong>{tradeMetrics.positionUnits.toFixed(2)} unidades</strong>
              </div>
              <div>
                <span>Lucro alvo</span>
                <strong>{formatCurrency(tradeMetrics.expectedGain)}</strong>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
