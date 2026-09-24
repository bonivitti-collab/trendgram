# Trendgram

Aplicativo PWA em React + Vite para análise de distorções e arbitragem estatística em ativos globais.

## Stack
- React
- TypeScript
- Vite
- PWA via `vite-plugin-pwa`

## Dados gratuitos
- Forex: Frankfurter API
- Cripto: CoinGecko API
- Índices EUA e B3: endpoints públicos do Yahoo Finance / APIs públicas de mercado

## Rodar localmente
1. `npm install`
2. `npm run dev`
3. Acesse `http://localhost:5173`

## Build
- `npm run build`

## Observação
Este MVP usa dados e oportunidades em seed data para entregar a experiência visual e a lógica de montagem da operação com RR 2:1. Em uma próxima etapa, a app pode consumir APIs públicas em tempo real e montar o feed dinâmico.
