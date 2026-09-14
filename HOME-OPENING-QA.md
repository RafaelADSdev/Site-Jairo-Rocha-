# Abertura da home — entrega local

## Versão ativa — marca 3D no cabeçalho, só símbolo gira

Esclarecimento final do usuário: remover a placa da hero, manter o nome em 3D parado no cabeçalho e girar somente o alvo vermelho. Implementado sem placa: anel/disco extrudados animados, nome com extrusão rasa da silhueta original (runs de pixels escuros, BufferGeometry) e face raster original, canvas estacionário, selo 40 anos em HTML. Arte original limitada a 186×67; não foi substituída por fonte aproximada. Nome é link à home e símbolo tem botão próprio sem aparência de botão; não há interativos aninhados.

Teste `.project/verify-brand-emblem.mjs` passou: somente uma marca no header, ausência na hero, comparação de pixels prova nome estacionário durante giro, clique/Enter/toque pausa/retoma, redução dinâmica, fallback WebGL, sem JS, menu tablet, sem overflow e outras páginas preservadas. Build de 14 páginas e teste da abertura passaram. Capturas `tmp/header-brand-1440.png` e `tmp/header-brand-375.png` inspecionadas. Detector sem achados nos componentes alterados; dourado sobre branco 5,14:1. Sem nova medição Lighthouse ou promessa de cobertura global. Relatos abaixo documentam tentativas anteriores superadas.

## Correção posterior — logo completa

Usuário pediu a composição inteira do cabeçalho em vez do símbolo isolado. Versão atual: imagem original, divisor e 40 anos dourado sobre letreiro branco extrudado, frente e verso legíveis, giro de 20 s/24 fps. Não são letras individualmente extrudadas. Botão visual removido; a própria logo recebe clique/toque/Enter para pausa. Mobile gira automaticamente com DPR reduzido; movimento reduzido e falha WebGL exibem a composição estática completa. Teste `.project/verify-brand-emblem.mjs` reescrito com RED/GREEN para essas condições; home e build também aprovados. O histórico abaixo descreve a primeira entrega, antes desta correção.

13/09/2026. Escopo: abertura, busca e integração necessária de compra no catálogo; demais seções preservadas. Sem deploy/push.

## Resultado

- Cabeçalho claro preserva logotipo original e selo. Fotografia real reutiliza acervo e créditos de `assets/litoral/README.md`.
- Destaques manuais, sem temporizador ou shader de mar; localização e natureza da mídia identificadas.
- Busca Comprar inclui novos/seminovos; Alugar usa faixas mensais; Investir abre `/litoral#investir`.
- Emblema 3D extrudado real (anel e disco), material vermelho e giro de 16 segundos, separado do nome estático. Desktop carregamento postergado quando visível; mobile por toque. Pausa, preferência reduzida, suspensão fora da tela/aba oculta, descarte de recursos e fallback SVG com retry.
- Conteúdo estático sem JS; preço desabilitado até escala dinâmica estar pronta. Aplicação dos filtros do catálogo depende de JavaScript e isso é explicitado.

## Validação

- `.project/verify-home-opening.mjs`: destaques e links, compra/locação, três larguras, campos 16px, sem JS e estados de preço — PASS.
- `.project/verify-brand-emblem.mjs`: WebGL real, alteração de pixels durante giro, pixels estáveis na pausa, visibilidade, preferência dinâmica, mobile e falha de WebGL — PASS.
- `src/lib/property-purpose.test.ts`: 4 testes, 100% linhas/branches/funções da biblioteca — PASS.
- `.project/verify.mjs`: sete páginas em 1440/390 px, sem overflow ou imagens quebradas e fluxos preservados — PASS.
- Revisão independente: teclado, destaques, menu e ausência de overflow também em 320/780/781/1024/1100 px.
- Build Astro: 14 páginas. Aviso conhecido de chunk grande persiste; nenhuma dependência nova.
- Detector Claivor: zero ocorrências no componente. Texto secundário #635b5e sobre branco: 6,59:1. Não se trata de auditoria completa WCAG ou nova medição Lighthouse.
- Capturas inspecionadas em `tmp/home-opening-{375,768,1440}.png` e `tmp/brand-emblem-front.png`.

## Limites

Emblema é recriação geométrica do símbolo, não novo arquivo oficial da marca. Perspectivas dos empreendimentos são identificadas. Preços e disponibilidade continuam sujeitos à confirmação. Não houve Blender, Imagegen ou geração de paisagem fictícia.
