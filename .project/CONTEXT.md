# Contexto — Site Jairo Rocha

## O que é

Portal conceitual navegável da Jairo Rocha Imóveis, imobiliária de Recife-PE, com catálogo, páginas de empreendimento, experiência de litoral, simulador, PWA e área administrativa demonstrativa.

O portal conceitual está publicado separadamente em `https://site-jairo-rocha.vercel.app/`. O site operacional atual da empresa continua em `https://jairorocha.com.br/`.

## Estado atual

Branch `codex/takeover-audit` publicado em `origin` no mesmo repositório `RafaelADSdev/Site-Jairo-Rocha-` em 14/09/2026, com rastreamento remoto configurado. O `main` não foi alterado; a integração pode ser revisada por pull request.

Correção mais recente (13/09): a marca 3D está SOMENTE no cabeçalho da home. Símbolo vermelho extrudado gira; nome original tem extrusão rasa baseada na silhueta raster e fica fixo, com canvas renderizado uma vez/redimensionamento. Selo 40 anos fixo. Letreiro da hero e coluna removidos. Teste específico confirma nome estável durante giro, pausa/teclado/toque, fallback, sem JS, menu e 375/768/1440; build aprovado. As descrições de letreiro abaixo são histórico superado, não a versão ativa.

Correção visual posterior: a home agora gira a composição COMPLETA da logo do cabeçalho, com wordmark original e selo 40 anos, nas faces de letreiro branco fino em 3D. Botão de pausa visível removido; clique/toque/teclado na própria logo pausa ou retoma. Giro automático também no celular com limite de 24 fps/DPR reduzido; movimento reduzido mantém versão estática. Testes da marca completa e da home aprovados. Letras preservadas como imagem original aplicada ao volume, não extrudadas individualmente. Esta versão substitui o emblema isolado descrito no histórico abaixo.

Home reformulada em 13/09/2026 após aprovação: cabeçalho branco com logo original, fotografia real de Porto, destaques manuais (Litoral/Sopro/La Fleur), busca por Comprar/Alugar e link Investir no litoral. Compra agrega novos/seminovos e exclui locação. Emblema vermelho com geometria 3D extrudada e giro de 16 s, preservando wordmark estático; desktop carregado sob demanda de visibilidade/idle, mobile por toque, pausa e fallback SVG. Sem Blender ou nova dependência. Testes da abertura, WebGL real/fallback, catálogo e regressão global aprovados. Seções inferiores preservadas. Entrega apenas local.

Pesquisa de investimento do corredor Recife–Muro Alto–Porto–Carneiros–Tamandaré concluída em 13/09/2026, organizada em `research/litoral-2026-09/` e agora incorporada à área `/litoral#investir`, após aprovação do usuário. Comparação filtrável com 12 ofertas de compra, oito referências de hospedagem, divergências AirDNA/AirROI e fontes individuais. Novo simulador considera capital total, custos fixos/variáveis, limpeza, taxas e uso próprio, com três cenários hipotéticos, prejuízo explícito e equilíbrio impossível. Resultado antes de IR e financiamento; o IR universal de 15% e calibração hoteleira foram removidos da experiência ativa. Pedido de estudo copiável, sem envio ou armazenamento. 16 testes financeiros (100% de cobertura da biblioteca), E2E específico e regressão global aprovados. Entrega local, sem publicação. Próximo passo: obter extratos e documentos específicos para avaliar unidades reais; pesquisa pública não comprova retorno.

Em takeover técnico desde 2026-09-13. O remoto `RafaelADSdev/Site-Jairo-Rocha-` foi conectado como `origin` e o trabalho está no branch `codex/takeover-audit`, baseado em `origin/main`; o branch local histórico `master` foi preservado.

O projeto compila 14 páginas estáticas e a verificação E2E passa em desktop (1440 px) e mobile (390 px), cobrindo catálogo, filtros, estado vazio, galeria, abas de mídia, simulador, assistente guiada, formulário administrativo demonstrativo e menu mobile.

Astro foi atualizado de 5.18.2 para 7.3.2. O audit de dependências passou de 3 vulnerabilidades (1 crítica, 1 alta, 1 baixa) para 0.

A página do Sopro agora tem comparação visual das tipologias térrea e superior baseada nas plantas do book oficial, imagens WebP responsivas e experiência 3D guiada e resiliente. O 3D abre focado no bloco completo, oferece vistas específicas de exterior, térreo e superior, progresso real, navegação por teclado, tela cheia, retry e fallback. Em uma navegação mobile completa, as imagens selecionadas pelo navegador somaram aproximadamente 0,98 MB contra 12,58 MB do conjunto original referenciado, redução aproximada de 92%. O Lighthouse específico da página marcou 100 em Acessibilidade e 100 em Boas Práticas.

O Blender MCP foi habilitado no Blender 5.2 e usado para reconstruir o bloco como uma representação comercial fiel ao material disponível: quatro unidades, quatro piscinas privativas, varandas, escadas externas com patamares e portas de chegada, fachadas envidraçadas, interiores simplificados e paisagismo tropical. A versão web passou de aproximadamente 3,3 MB, 1.519 meshes e 62 mil triângulos para 2,1 MB, 326 meshes e cerca de 6,8 mil triângulos. O `.blend`, o GLB e o script gerador foram preservados no projeto para evolução reproduzível. Como o book não fornece todas as cotas executivas, as proporções não cotadas continuam explicitamente conceituais.

Lighthouse mobile da home, antes das otimizações de performance: Performance 74, Acessibilidade 100, Boas Práticas 100 e SEO 63. O SEO baixo é esperado enquanto a apresentação permanecer com `noindex,nofollow`. O principal gargalo é LCP de laboratório em 8,5 s, associado à hero/carrossel e à entrega de imagens sem o CDN esperado.

A experiência Sopro ganhou dois interiores em corte gerados exclusivamente pelo Blender MCP: uma unidade térrea tipo 01 e uma superior tipo 03. Dormitório, closet, estar, banheiro, varanda gourmet, piscinas e garden têm mobiliário e materiais detalhados. A interface separa três cenas sob demanda e explica os pontos selecionados com referências oficiais, planta e página do book. Os interiores são interpretações comerciais, com cobertura omitida e paredes selecionadas rebaixadas; medidas, objetos e acabamentos não constituem especificação executiva. Fontes, limites e reprodução estão em `assets/blender/README.md`; fonte editável em `assets/blender/sopro-ambientes.blend`. Os GLBs internos usam Draco e decoder local: aproximadamente 1,05 MB e 940 KB, contendo somente a cena correspondente.

## Próximos passos

### Litoral — entrega local em 2026-09-13

`/litoral` agora tem quatro destinos existentes (Porto de Galinhas, Muro Alto, Praia dos Carneiros e Tamandaré), atlas Leaflet/OSM sob demanda, marcadores aproximados e rotas Google Maps saindo do aeroporto do Recife. O planejador adapta perfil, noites, orçamento hipotético, checklist e roteiro, com fallback para cópia manual. Não consulta disponibilidade nem efetua reservas.

A pedido expresso do usuário, todas as imagens novas entregues são fotografias reais dos quatro destinos, com autoria/fonte/licença em `assets/litoral/README.md` e na página. Rascunhos IA estão fora da entrega pública. Vinte WebPs responsivos e dois filmes Remotion H.264 de 22 s (horizontal/vertical), com legendas e reprodução manual, integrados. React/Remotion apenas na produção offline do filme. Simulador anterior substituído pela experiência documentada do investidor. Build, testes unitários e E2E específicos/globais passaram; relatórios em `LITORAL-QA.md` e `research/litoral-2026-09/IMPLEMENTACAO-QA.md`. Rodada não publicada.

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

2026-09-14
