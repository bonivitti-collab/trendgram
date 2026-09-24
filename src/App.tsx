import { useMemo, useState } from 'react';

type Category = 'all' | 'insider' | 'institutional' | 'political' | 'macro';
type Opportunity = {
  id: string;
  category: Exclude<Category, 'all'>;
  badge: string;
  asset: string;
  title: string;
  subtitle: string;
  date: string;
  source: string;
  sourceUrl: string;
  confidence: 'alta' | 'média' | 'contexto';
  evidence: string;
  thesis: string;
  whyNow: string;
  risks: string;
  tags: string[];
};

type MacroSignal = { name: string; value: string; interpretation: string; source: string; url: string };

const opportunities: Opportunity[] = [
  {
    id: 'civb', category: 'insider', badge: 'SEC · FORM 4', asset: 'CIVB', title: 'Civista Bancshares — compra do presidente', subtitle: 'Compra aberta de ações por Charles A. Parcher', date: '23/09/2026', source: 'SEC EDGAR', sourceUrl: 'https://www.sec.gov/edgar/browse/?CIK=0001075632&owner=exclude', confidence: 'média',
    evidence: 'Charles A. Parcher, presidente da Civista Bancshares, comprou 400 ações a US$ 26,75, aproximadamente US$ 10.700, em 23/09/2026. O registro deve ser confirmado no Form 4 completo e no código da transação.',
    thesis: 'É uma compra voluntária, pequena em valor absoluto, mas feita por um executivo operacional. O sinal é mais útil como ponto de partida para investigar valuation, qualidade da carteira de crédito, margem financeira e retorno sobre patrimônio.',
    whyNow: 'Bancos regionais podem se beneficiar se o ciclo de juros estabilizar e a curva favorecer a margem financeira. A oportunidade não é “comprar porque o presidente comprou”; é verificar se a compra ocorreu após queda ou perto de uma zona de desconto.',
    risks: 'O tamanho é modesto e não há confirmação de compra agrupada. Crédito, inadimplência, duration dos ativos e regulação podem superar o sinal do insider.', tags: ['CIVB', 'banco regional', 'compra executiva']
  },
  {
    id: 'gam', category: 'insider', badge: 'SEC · FORM 4', asset: 'GAM', title: 'General American Investors — compra do chairman', subtitle: 'Compra de 10.000 ações por Spencer Davidson', date: '23/09/2026', source: 'SEC EDGAR', sourceUrl: 'https://www.sec.gov/edgar/browse/?CIK=0000040545&owner=exclude', confidence: 'média',
    evidence: 'Spencer Davidson, chairman da General American Investors, comprou 10.000 ações a US$ 22,75, cerca de US$ 227.500, em 23/09/2026.',
    thesis: 'A compra é materialmente maior que uma compra simbólica e pode indicar convicção no desconto entre o preço do closed-end fund e o valor líquido dos ativos. O ponto central é medir o desconto/premium para NAV e a política de distribuição.',
    whyNow: 'Closed-end funds podem oferecer oportunidade quando o desconto ao NAV se amplia e o mercado reavalia a carteira. A compra do chairman alinha parte do capital da administração com os cotistas.',
    risks: 'A carteira continua exposta ao mercado de ações; o desconto pode permanecer por anos. Confirmar no Form 4 se foi aquisição aberta e analisar NAV, alavancagem, despesas e liquidez.', tags: ['GAM', 'closed-end fund', 'desconto ao NAV']
  },
  {
    id: 'berkshire-dhi', category: 'institutional', badge: 'BERKSHIRE · 13F', asset: 'DHI', title: 'Berkshire Hathaway — nova posição em D.R. Horton', subtitle: 'Entrada no setor de construção residencial', date: 'Filing de 14/08/2026 · posição em 30/06', source: 'SEC EDGAR', sourceUrl: 'https://www.sec.gov/Archives/edgar/data/1067983/000119312526352200/d498521d13fhr.htm', confidence: 'contexto',
    evidence: 'O 13F-HR da Berkshire Hathaway, protocolado em 14/08/2026 e referente a 30/06/2026, reportou D.R. Horton (DHI) como nova posição.',
    thesis: 'A leitura é uma preferência institucional por uma empresa de escala no housing. A tese depende de oferta estruturalmente limitada, demanda demográfica e capacidade de oferecer financiamento, mas precisa ser confrontada com juros hipotecários e margem por casa.',
    whyNow: 'Se os juros longos caírem sem recessão, construtoras podem ter melhora de acessibilidade e volume. Se o crescimento desacelerar, a mesma posição pode sofrer com cancelamentos e compressão de margem.',
    risks: 'O 13F tem defasagem de até 45 dias após o trimestre e não mostra preço ou data da compra. A Berkshire pode ter reduzido ou zerado a posição após 30/06.', tags: ['DHI', 'Berkshire', 'housing', '13F atrasado']
  },
  {
    id: 'congress-avgo', category: 'political', badge: 'STOCK ACT · HOUSE', asset: 'AVGO', title: 'Rick Allen — compra de Broadcom', subtitle: 'Compra declarada na faixa de US$ 1.001–15.000', date: 'Trade 12/08/2026 · filing 22/09/2026', source: 'House Clerk', sourceUrl: 'https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure', confidence: 'contexto',
    evidence: 'O disclosure atribuído a Rick W. Allen registra compra de AVGO em 12/08/2026, na faixa de US$ 1.001 a US$ 15.000, protocolada em 22/09/2026.',
    thesis: 'AVGO expõe o investidor a infraestrutura de semicondutores, networking e demanda de data centers. A transação é uma pista para pesquisa setorial, não uma recomendação nem prova de informação privilegiada.',
    whyNow: 'A oportunidade depende de crescimento de capex em IA, poder de precificação e conversão de fluxo de caixa. Deve ser comparada com valuation, concentração de clientes e ciclo de semicondutores.',
    risks: 'A faixa é ampla e o atraso foi de 41 dias. O ativo pode ter sido comprado por cônjuge ou conta administrada; confirmar o PDF original e a natureza da propriedade.', tags: ['AVGO', 'semicondutores', 'Congresso']
  },
  {
    id: 'congress-tsm', category: 'political', badge: 'STOCK ACT · HOUSE', asset: 'TSM', title: 'Rick Allen — compra de Taiwan Semiconductor', subtitle: 'Exposição à cadeia global de chips', date: 'Trade 12/08/2026 · filing 22/09/2026', source: 'House Clerk', sourceUrl: 'https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure', confidence: 'contexto',
    evidence: 'O mesmo disclosure registra compra de TSM na faixa de US$ 1.001 a US$ 15.000 em 12/08/2026, protocolada em 22/09/2026.',
    thesis: 'TSM é uma forma direta de acompanhar demanda por fabricação avançada e computação de IA. A oportunidade está na análise de capex, utilização de fabs, concentração geográfica e risco geopolítico.',
    whyNow: 'Capex de IA e nós avançados podem sustentar crescimento, mas o mercado já pode ter precificado parte da narrativa. A assimetria depende do preço pago e da margem de segurança.',
    risks: 'Disclosure tardio, faixa de valor imprecisa, risco Taiwan-China e volatilidade cambial. Não replicar a operação sem validar o documento.', tags: ['TSM', 'chips', 'geopolítica']
  },
  {
    id: 'macro-cycle', category: 'macro', badge: 'TOP-DOWN · EUA', asset: 'TLT · XLF · XLP · DHI', title: 'Expansão madura com inflação persistente', subtitle: 'Crescimento moderado, emprego estável e juros ainda elevados', date: 'Leitura de setembro/2026', source: 'Fed · BLS · BEA', sourceUrl: 'https://www.federalreserve.gov/monetarypolicy/fomcprojtabl20260916.htm', confidence: 'contexto',
    evidence: 'Projeções do SEP de 16/09/2026 apontam PIB de 2,3% em 2026, desemprego de 4,1%, PCE de 3,7% e fed funds de 4,1% no fim do ano. O quadro sugere expansão desacelerando, mas sem recessão imediata.',
    thesis: 'O melhor enquadramento é uma expansão madura/late-cycle: crescimento ainda positivo, mercado de trabalho resistente e inflação acima da meta. Isso favorece uma carteira barbell: duration de qualidade se a desinflação continuar, defensivos se o crescimento perder força e financeiros/valor enquanto os juros permanecerem altos.',
    whyNow: 'TLT ou Treasuries longos têm convexidade se inflação e juros caírem; XLP e XLV oferecem estabilidade de lucros; XLF pode capturar juros altos e eventual steepening; DHI é uma aposta condicional a queda das taxas hipotecárias, coerente com o movimento divulgado pela Berkshire.',
    risks: 'Inflação persistente pode manter juros altos e prejudicar duration; recessão prejudica bancos e construtoras; valuation e posicionamento podem anular a reação histórica dos setores.', tags: ['2,3% PIB', '4,1% desemprego', '3,7% PCE', '4,1% Fed funds']
  }
];

const macroSignals: MacroSignal[] = [
  { name: 'PIB real', value: '2,3% projetado para 2026', interpretation: 'Expansão ainda positiva, porém moderada.', source: 'Federal Reserve SEP', url: 'https://www.federalreserve.gov/monetarypolicy/fomcprojtabl20260916.htm' },
  { name: 'Desemprego', value: '4,1%', interpretation: 'Mercado de trabalho resiliente, sem sinal isolado de recessão.', source: 'BLS / Fed', url: 'https://www.bls.gov/eag/eag.us.htm' },
  { name: 'PCE', value: '3,7% projetado', interpretation: 'Inflação acima da meta limita cortes agressivos.', source: 'Federal Reserve SEP', url: 'https://www.federalreserve.gov/monetarypolicy/files/fomcprojtabl20260916.pdf' },
  { name: 'Fed funds', value: '4,1% no fim de 2026', interpretation: 'Juros ainda restritivos; favorecem caixa e qualidade.', source: 'Federal Reserve SEP', url: 'https://www.federalreserve.gov/monetarypolicy/fomcprojtabl20260916.htm' }
];

const categories: { id: Category; label: string }[] = [{ id: 'all', label: 'Todos' }, { id: 'insider', label: 'Insiders' }, { id: 'institutional', label: 'Grandes investidores' }, { id: 'political', label: 'Políticos' }, { id: 'macro', label: 'Macro' }];
function convictionLabel(value: Opportunity['confidence']) { return value === 'alta' ? 'Convicção alta' : value === 'média' ? 'Convicção média' : 'Contexto'; }

export default function App() {
  const [category, setCategory] = useState<Category>('all');
  const [selectedId, setSelectedId] = useState(opportunities[0].id);
  const visible = useMemo(() => category === 'all' ? opportunities : opportunities.filter((item) => item.category === category), [category]);
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0] ?? opportunities[0];

  return <div className="app-shell">
    <header className="topbar"><div className="brand-wrap"><img className="brand-logo" src={`${import.meta.env.BASE_URL}logo.svg`} alt="Trendgram" /></div><div className="update-clock"><span className="update-label">RADAR DE EVIDÊNCIAS</span><strong>TOP-DOWN</strong><span className="countdown">PESQUISA</span></div></header>
    <main className="content-grid"><section className="feed-panel"><div className="feed-header"><div><p className="eyebrow">research feed</p><h2>Oportunidades encontradas</h2></div><span className="live-pill">FONTES OFICIAIS</span></div><div className="quote-status"><span className="status-dot" />Evidências específicas · sem cotação ao vivo</div><div className="filters">{categories.map((item) => <button key={item.id} type="button" className={item.id === category ? 'filter active' : 'filter'} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div><div className="stream">{visible.map((item) => <article key={item.id} className={selected.id === item.id ? 'post selected' : 'post'} onClick={() => setSelectedId(item.id)}><div className="post-topline"><div className="avatar">{item.asset.slice(0, 2)}</div><div className="post-meta"><div className="line-1"><strong>{item.asset}</strong><span className="tag">{convictionLabel(item.confidence)}</span></div><span className="market-name">{item.badge} · {item.date}</span></div></div><div className="post-copy"><h3>{item.title}</h3><p>{item.subtitle}</p></div><div className="trade-strip"><span>Tipo<br /><strong>{item.category === 'macro' ? 'Ciclo' : 'Evento'}</strong></span><span>Confiança<br /><strong>{convictionLabel(item.confidence)}</strong></span><span>Fonte<br /><strong>Primária</strong></span></div><div className="mini-stats">{item.tags.slice(0, 3).map((tag) => <div key={tag}><small>TAG</small><strong>{tag}</strong></div>)}</div></article>)}</div></section><aside className="insight-panel"><div className="insight-header-card"><div className="badge-row"><span className="status-dot" /><span>{selected.badge}</span></div><h2>{selected.asset}</h2><p>{selected.title}</p></div><div className="score-card"><div><span>Confiança</span><strong>{convictionLabel(selected.confidence)}</strong></div><div><span>Data</span><strong>{selected.date}</strong></div><div><span>Tipo</span><strong>{selected.category}</strong></div></div><div className="section-block"><p className="eyebrow">evidência</p><h3>O que foi encontrado</h3><p>{selected.evidence}</p></div><div className="section-block"><p className="eyebrow">tese</p><h3>Por que pode ser oportunidade</h3><p>{selected.thesis}</p></div><div className="section-block"><p className="eyebrow">momento</p><h3>Por que agora</h3><p>{selected.whyNow}</p></div><div className="section-block"><p className="eyebrow">risco</p><h3>O que pode invalidar</h3><p>{selected.risks}</p></div><div className="calculator"><p className="eyebrow">fonte primária</p><h3>Verificação obrigatória</h3><p>O resultado é uma hipótese de pesquisa. Abra o documento, confirme o código da transação, a data e as notas antes de usar a informação.</p><a className="primary-button source-link" href={selected.sourceUrl} target="_blank" rel="noreferrer">Abrir {selected.source}</a></div></aside></main><section className="macro-panel"><div className="feed-header"><div><p className="eyebrow">macro dashboard</p><h2>Checklist top-down dos EUA</h2></div><span className="tag">dados com defasagem</span></div><div className="macro-grid">{macroSignals.map((signal) => <a className="macro-card" href={signal.url} target="_blank" rel="noreferrer" key={signal.name}><span>{signal.name}</span><strong>{signal.value}</strong><small>{signal.interpretation}</small><em>{signal.source}</em></a>)}</div><p className="disclaimer">Não é recomendação de compra ou venda. Form 13F e disclosures políticos são atrasados; Form 4 precisa ser lido com suas notas. As oportunidades acima são pontos de partida para diligência, não sinais automáticos.</p></section>
  </div>;
}
