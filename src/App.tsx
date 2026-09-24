import { useMemo, useState } from 'react';

type Category = 'all' | 'insider' | 'institutional' | 'political' | 'macro';
type Opportunity = {
  id: string;
  category: Exclude<Category, 'all'>;
  badge: string;
  title: string;
  subtitle: string;
  date: string;
  source: string;
  sourceUrl: string;
  status: 'verificar' | 'documentado';
  conviction: 'alta' | 'média' | 'contexto';
  evidence: string;
  explanation: string;
  risks: string;
  tags: string[];
};

type MacroSignal = { name: string; reading: string; bias: 'positivo' | 'neutro' | 'negativo'; source: string; sourceUrl: string };

const opportunities: Opportunity[] = [
  {
    id: 'insider-radar', category: 'insider', badge: 'SEC · FORM 4', title: 'Compras de insiders', subtitle: 'Radar de compras voluntárias em mercado aberto', date: 'Últimos 30 dias', source: 'SEC EDGAR', sourceUrl: 'https://www.sec.gov/edgar/searchedgar/companysearch', status: 'verificar', conviction: 'média',
    evidence: 'O Form 4 é o documento oficial para consultar compras e vendas de diretores, executivos e acionistas sujeitos à Seção 16.',
    explanation: 'Uma compra relevante com dinheiro próprio pode indicar que a administração considera o preço atrativo. O sinal fica mais forte quando há compras agrupadas, valor material e ausência de plano automático.',
    risks: 'O filing pode representar exercício de opção, concessão ou operação planejada. Confirmar o código da transação, as notas e o valor efetivamente pago antes de considerar qualquer tese.', tags: ['insiders', 'Form 4', 'cluster']
  },
  {
    id: 'institutional-radar', category: 'institutional', badge: 'SEC · 13F', title: 'Movimentos de grandes investidores', subtitle: 'Novas posições, aumentos e reduções divulgados em filings', date: 'Último filing disponível', source: 'SEC EDGAR', sourceUrl: 'https://www.sec.gov/edgar/searchedgar/companysearch', status: 'verificar', conviction: 'contexto',
    evidence: 'O Form 13F-HR mostra posições de gestores institucionais reportáveis ao fim do trimestre, após a divulgação oficial.',
    explanation: 'Uma nova posição ou aumento expressivo pode revelar uma preferência de longo prazo e ajudar a mapear setores com acumulação institucional.',
    risks: 'O 13F é atrasado, não mostra toda a carteira, shorts ou a data exata da compra. Nunca tratar uma posição divulgada como ordem atual.', tags: ['13F', 'institucional', 'defasagem']
  },
  {
    id: 'political-radar', category: 'political', badge: 'STOCK ACT', title: 'Transações de congressistas', subtitle: 'Periodic Transaction Reports da Câmara e do Senado', date: 'Últimos 30 dias', source: 'House Clerk / Senate eFD', sourceUrl: 'https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure', status: 'verificar', conviction: 'contexto',
    evidence: 'A Câmara e o Senado publicam disclosures oficiais exigidos pelo STOCK Act, incluindo ativo, data e faixa de valor.',
    explanation: 'Concentração de compras em um setor pode justificar uma investigação adicional, especialmente quando há relação com comissões e legislação relevante.',
    risks: 'A divulgação pode ocorrer semanas depois, os valores são faixas e a operação pode ser de cônjuge ou gestor independente. Não é evidência de informação privilegiada.', tags: ['Congresso', 'STOCK Act', 'disclosure']
  },
  {
    id: 'macro-cycle', category: 'macro', badge: 'TOP-DOWN', title: 'Ciclo macroeconômico dos EUA', subtitle: 'Leitura conjunta de juros, emprego, inflação e crescimento', date: 'Atualizar com os últimos releases', source: 'Fed · BLS · BEA · Census', sourceUrl: 'https://www.federalreserve.gov/data.htm', status: 'verificar', conviction: 'contexto',
    evidence: 'A análise deve combinar dados antecedentes, atividade, mercado de trabalho, inflação e condições financeiras — nunca um único indicador.',
    explanation: 'Em desaceleração sem recessão, qualidade, duration e setores defensivos tendem a merecer atenção. Em re-aceleração, cíclicos e small caps podem reagir melhor; em inflação persistente, ativos reais e proteção contra inflação ganham relevância.',
    risks: 'Indicadores são revisados, o mercado antecipa decisões e a mesma leitura pode afetar ativos de modo diferente conforme valuation e posicionamento.', tags: ['juros', 'emprego', 'inflação', 'PIB']
  }
];

const macroSignals: MacroSignal[] = [
  { name: 'Política monetária', reading: 'Consultar decisão, projeções e ata mais recentes', bias: 'neutro', source: 'Federal Reserve', sourceUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm' },
  { name: 'Inflação', reading: 'CPI e PCE; observar tendência e núcleo', bias: 'neutro', source: 'BLS / BEA', sourceUrl: 'https://www.bls.gov/cpi/ · https://www.bea.gov/data/personal-consumption-expenditures-price-index' },
  { name: 'Mercado de trabalho', reading: 'Payroll, desemprego e pedidos de seguro', bias: 'neutro', source: 'BLS / DOL', sourceUrl: 'https://www.bls.gov/news.release/empsit.toc.htm' },
  { name: 'Atividade', reading: 'PIB, vendas, produção e housing', bias: 'neutro', source: 'BEA / Census', sourceUrl: 'https://www.bea.gov/news/glance · https://www.census.gov/economic-indicators/' }
];

const categories: { id: Category; label: string }[] = [
  { id: 'all', label: 'Todos' }, { id: 'insider', label: 'Insiders' }, { id: 'institutional', label: 'Grandes investidores' }, { id: 'political', label: 'Políticos' }, { id: 'macro', label: 'Macro' }
];

function convictionLabel(value: Opportunity['conviction']) { return value === 'alta' ? 'Convicção alta' : value === 'média' ? 'Convicção média' : 'Contexto'; }

export default function App() {
  const [category, setCategory] = useState<Category>('all');
  const [selectedId, setSelectedId] = useState(opportunities[0].id);
  const visible = useMemo(() => category === 'all' ? opportunities : opportunities.filter((item) => item.category === category), [category]);
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0] ?? opportunities[0];

  return <div className="app-shell">
    <header className="topbar"><div className="brand-wrap"><img className="brand-logo" src={`${import.meta.env.BASE_URL}logo.svg`} alt="Trendgram" /></div><div className="update-clock"><span className="update-label">RADAR DE EVIDÊNCIAS</span><strong>TOP-DOWN</strong><span className="countdown">PESQUISA</span></div></header>
    <main className="content-grid"><section className="feed-panel"><div className="feed-header"><div><p className="eyebrow">research feed</p><h2>Oportunidades fundamentadas</h2></div><span className="live-pill">FONTES OFICIAIS</span></div><div className="quote-status"><span className="status-dot" />Sem cotação ao vivo · análise baseada em documentos e contexto</div><div className="filters" aria-label="Filtros de pesquisa">{categories.map((item) => <button key={item.id} type="button" className={item.id === category ? 'filter active' : 'filter'} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div><div className="stream">{visible.map((item) => <article key={item.id} className={selected.id === item.id ? 'post selected' : 'post'} onClick={() => setSelectedId(item.id)}><div className="post-topline"><div className="avatar">{item.category === 'macro' ? 'M' : item.category === 'political' ? 'US' : item.category === 'institutional' ? '13' : 'F4'}</div><div className="post-meta"><div className="line-1"><strong>{item.badge}</strong><span className="tag">{item.status}</span></div><span className="market-name">{item.date} · {item.source}</span></div></div><div className="post-copy"><h3>{item.title}</h3><p>{item.subtitle}</p></div><div className="trade-strip"><span>Evidência<br /><strong>{item.category === 'macro' ? 'Ciclo' : 'Documento'}</strong></span><span>Convicção<br /><strong>{convictionLabel(item.conviction)}</strong></span><span>Fonte<br /><strong>Oficial</strong></span></div><div className="mini-stats">{item.tags.map((tag) => <div key={tag}><small>TAG</small><strong>{tag}</strong></div>)}</div></article>)}</div></section><aside className="insight-panel"><div className="insight-header-card"><div className="badge-row"><span className="status-dot" /><span>{selected.badge}</span></div><h2>{selected.title}</h2><p>{selected.subtitle}</p></div><div className="score-card"><div><span>Status</span><strong>{selected.status}</strong></div><div><span>Convicção</span><strong>{selected.conviction}</strong></div><div><span>Data</span><strong>{selected.date}</strong></div></div><div className="section-block"><p className="eyebrow">evidência</p><h3>O que foi encontrado</h3><p>{selected.evidence}</p></div><div className="section-block"><p className="eyebrow">interpretação</p><h3>Por que pode ser oportunidade</h3><p>{selected.explanation}</p></div><div className="section-block"><p className="eyebrow">riscos</p><h3>O que confirmar</h3><p>{selected.risks}</p></div><div className="calculator"><p className="eyebrow">fonte primária</p><h3>Ver documento oficial</h3><p className="section-note">A análise não substitui a leitura do documento original. Dados de 13F e disclosures políticos podem ter atraso.</p><a className="primary-button source-link" href={selected.sourceUrl} target="_blank" rel="noreferrer">Abrir {selected.source}</a></div></aside></main><section className="macro-panel"><div className="feed-header"><div><p className="eyebrow">macro dashboard</p><h2>Checklist top-down dos EUA</h2></div><span className="tag">sem sinal automático</span></div><div className="macro-grid">{macroSignals.map((signal) => <a className="macro-card" href={signal.sourceUrl} target="_blank" rel="noreferrer" key={signal.name}><span>{signal.name}</span><strong>{signal.reading}</strong><small>{signal.source} · {signal.bias}</small></a>)}</div><p className="disclaimer">O Trendgram apresenta hipóteses de pesquisa, não recomendações de compra ou venda. Toda oportunidade precisa de confirmação no filing oficial, data de divulgação, liquidez, valuation e risco.</p></section>
  </div>;
}
