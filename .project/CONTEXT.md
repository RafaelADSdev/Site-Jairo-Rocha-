# Contexto — Site Jairo Rocha

## O que é

Portal conceitual navegável da Jairo Rocha Imóveis, imobiliária de Recife-PE, com catálogo, páginas de empreendimento, experiência de litoral, simulador, PWA e área administrativa demonstrativa.

O portal conceitual está publicado separadamente em `https://site-jairo-rocha.vercel.app/`. O site operacional atual da empresa continua em `https://jairorocha.com.br/`.

## Estado atual

Em takeover técnico desde 2026-09-13. O remoto `RafaelADSdev/Site-Jairo-Rocha-` foi conectado como `origin` e o trabalho está no branch `codex/takeover-audit`, baseado em `origin/main`; o branch local histórico `master` foi preservado.

O projeto compila 14 páginas estáticas e a verificação E2E passa em desktop (1440 px) e mobile (390 px), cobrindo catálogo, filtros, estado vazio, galeria, abas de mídia, simulador, assistente guiada, formulário administrativo demonstrativo e menu mobile.

Astro foi atualizado de 5.18.2 para 7.3.2. O audit de dependências passou de 3 vulnerabilidades (1 crítica, 1 alta, 1 baixa) para 0.

A página do Sopro agora tem comparação visual das tipologias térrea e superior baseada nas plantas do book oficial, imagens WebP responsivas e experiência 3D resiliente com capa, carregamento sob demanda, retry e fallback. Em uma navegação mobile completa, as imagens selecionadas pelo navegador somaram aproximadamente 0,98 MB contra 12,58 MB do conjunto original referenciado, redução aproximada de 92%. O Lighthouse específico da página marcou 100 em Acessibilidade e 100 em Boas Práticas.

Lighthouse mobile da home, antes das otimizações de performance: Performance 74, Acessibilidade 100, Boas Práticas 100 e SEO 63. O SEO baixo é esperado enquanto a apresentação permanecer com `noindex,nofollow`. O principal gargalo é LCP de laboratório em 8,5 s, associado à hero/carrossel e à entrega de imagens sem o CDN esperado.

## Próximos passos

- [ ] Decidir se o portal conceitual substituirá `jairorocha.com.br`, coexistirá com ele ou continuará apenas como apresentação.
- [ ] Escolher a hospedagem definitiva: Vercel ou Netlify. A função `sized()` otimiza imagens apenas no Netlify, enquanto a publicação atual está na Vercel.
- [ ] Otimizar LCP da home e imagens responsivas; o Lighthouse estimou cerca de 720 KiB de economia na home mobile.
- [ ] Fazer uma rodada de performance global: o Lighthouse mobile de laboratório da página Sopro ainda marcou Performance 64 e LCP 9,4 s no servidor de desenvolvimento, apesar da redução do peso das imagens.
- [ ] Alinhar cabeçalhos de cache e segurança à hospedagem escolhida; `netlify.toml` não governa a publicação atual na Vercel.
- [ ] Definir fonte real do catálogo e destino dos leads antes de implementar backend, autenticação, IA ou administração persistente.
- [ ] Validar com a empresa preços, disponibilidade, autorização de mídia, simulação e dados do Sopro.
- [ ] Decidir quais ajustes visuais e de conteúdo entram na próxima rodada.

## Stack

- Astro 7.3.2, TypeScript em componentes/scripts e saída estática
- `<model-viewer>` 4.3.1 e Three.js 0.183.0, carregados dinamicamente na experiência 3D do Sopro
- Manrope e DM Sans via Fontsource
- Playwright para verificação E2E
- PWA própria com manifesto e service worker
- Publicação conceitual atual na Vercel; configuração de cache existente para Netlify

## Última atualização

2026-09-13
