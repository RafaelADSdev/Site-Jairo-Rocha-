---
name: Jairo Rocha Imóveis
description: Caderno de arquitetura pernambucana, mockup editorial navegável.
colors:
  red: "#e4141a"
  red-dark: "#b70f14"
  red-deep: "#8a0403"
  gold: "#b3923f"
  gold-ink: "#856a24"
  gold-soft: "#d4bc6a"
  ink: "#1a1a1a"
  muted: "#5c5c5c"
  paper: "#f7f6f4"
  line: "#e6e2dc"
  night: "#161616"
  sand: "#f3ead0"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(44px, 4.4vw, 68px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "38px"
    fontWeight: 500
    lineHeight: 1.15
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "15px"
    lineHeight: 1.6
rounded:
  field: "4px"
  button: "5px"
  photo: "7px"
  search: "8px"
  dialog: "14px"
spacing:
  section: "88px"
  section-mobile: "55px"
  property-gap: "28px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "16px 24px"
  button-primary-hover:
    backgroundColor: "{colors.red-dark}"
  button-cream:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.night}"
    rounded: "{rounded.button}"
    padding: "16px 24px"
---

# Design System: Jairo Rocha Imóveis

## Overview

**Creative North Star: "Caderno de arquitetura pernambucana"**

Sistema extraído do mockup Astro nesta implementação. Preserva a direção da semente: fotografia ampla, composição de revista de arquitetura, navegação simples e busca em papel branco. As cores seguem os materiais oficiais da Jairo Rocha: vermelho do alvo `#e4141a`, preto do fundo da marca, branco do logotipo e ouro do selo de 40 anos `#b3923f`. O vermelho identifica ações e seleção; o preto profundo cobre litoral, simulador e atendimento; o ouro reserva-se ao aniversário e a acentos sobre fundo escuro.

Contrato: hero fotográfica com título branco e detalhe vermelho, busca ancorada na borda inferior, imóveis sem excesso de contêineres, continuidade tipográfica nas páginas internas e navegação clara no mobile. O selo dourado de 40 anos compõe a identidade. IA, materiais ausentes, gestão e simulação permanecem identificados como demonstrações.

A semente considerou revista de arquitetura, catálogo de construtora, guia de bairros, exposição fotográfica, atlas costeiro, caderno de arquitetura pernambucana e editorial de interiores; foi adotada a sexta direção. Cerâmica, fermentação, revista Movida, estante de couro, ebru e contador nixie foram descartados pela menor clareza para busca imobiliária. Características incorporadas: estados claros, contraste, escala fotográfica, sequência editorial e precisão numérica.

## Colors

O frontmatter registra as propriedades de `src/styles/global.css`, extraídas do alvo e do selo de 40 anos e da agenda institucional em vermelho. Vermelho `#e4141a` e sua variação escura `#b70f14` sinalizam ações e seleção. O campo institucional `#8a0403` aparece como profundidade. Papel, branco, tinta próxima ao preto e divisórias compostam a base. Superfícies escuras usam preto `#161616`, não verde. O selo no cabeçalho claro usa ouro mais denso `#856a24` para contraste; sobre fotografia usa `#d4bc6a`. Foco global usa o vermelho da marca. Fotografias têm overlays escuros com leve vinho para leitura do texto branco.

## Typography

Manrope é a fonte efetiva, carregada localmente via Fontsource nos pesos 400–800. Georgia aparece em itálico no litoral e no aniversário. DM Sans 400 está importada, mas não tem papel visual aplicado.

Hero: clamp do frontmatter, com ajustes de 57px até 1100px, 43px até 780px e 38px até 480px; acima de 1600px, 74px. Seções: 38px, reduzidos para 32px/30px no mobile. Cartões: 21px e peso 600 no desktop. Corpo global: 15px/1.6; descrições e metadados locais usam 10–14px. Não promover metadados pequenos a padrão para novos textos longos. Descrição de imóvel limitada a 65ch. Resultados financeiros usam algarismos tabulares.

## Layout

Contêiner central de `min(1280px, calc(100% - 112px))`; margens laterais de 32px até 1100px e 20px até 780px. Seções têm 88px verticais, com 55px no mobile e variações locais. Hero: 735px no desktop, 660px até 780px, 620px até 480px e 800px acima de 1600px. Busca sobreposta em -74px no desktop e -25px no mobile.

Imóveis em três colunas, duas até 780px e uma até 480px. Formulário de busca horizontal vira duas colunas, com localização e envio em largura total. Detalhe, litoral e simulador tornam-se verticais até 780px; contato deixa de ser sticky. Administração possui sidebar de 215px no desktop; no mobile ela fica oculta e a tabela vira cartões com rótulos. Rodapé passa de quatro para duas colunas. Menu móvel abre verticalmente sob cabeçalho de 80px.

## Elevation & Depth

Cartões de imóveis são planos, com fotografia e divisória no preço. Profundidade fica concentrada na busca (`0 14px 35px #24352b0c`), atendimento flutuante (`0 7px 25px #76101724`) e chat (`0 15px 65px #0003`). Diálogos usam backdrop escurecido com blur de 3px. Movimento, foco e breakpoints estão no sidecar `.impeccable/design.json`.

## Shapes

Raios pequenos em botões, campos e fotografias, 7–8px em superfícies principais e 14px no chat. Ícones de ação e favoritos circulares. Atendimento flutuante em cápsula no desktop e círculo compacto no mobile. A composição se organiza por espaços e divisórias, sem contêiner em torno de cada texto.

## Components

- **Botões:** vermelho/branco, 16px × 24px, raio 5px; hover escurece e desloca -2px. Variante areia sobre verde. Links editoriais usam sublinhado e seta.
- **Campos e busca:** rótulos persistentes, branco e borda fina. Categorias usam radios com linha vermelha selecionada. Foco global de 3px, offset de 5px; a busca possui tratamento local.
- **Imóvel:** foto de 252px no desktop, selo, favorito, localização, título, quartos/vagas e preço. Hover amplia foto em 1.035. Favorito usa `aria-pressed`.
- **Navegação:** transparente sobre a home, clara nas internas. Disclosure móvel e link de pular conteúdo visível ao foco.
- **Mídia:** miniaturas, lightbox com anterior/seguinte e abas selecionáveis. Vídeo público La Fleur carrega após clique; books e tours exibem material a fornecer.
- **Atendimento:** diálogo nativo com sugestões e respostas guiadas locais; não implica IA conectada ou envio à equipe.
- **Simulador:** formulário e resumo verde, valores atualizados e aviso ilustrativo. Destino/tipologia identificam cenário; premissas editáveis determinam cálculo.
- **Admin:** lista e formulário demonstrativos com feedback, sem autenticação, persistência ou publicação.

## Do's and Don'ts

- **Do** preservar identidade, selo e fotografias do catálogo público.
- **Do** manter foco visível, acesso móvel e `prefers-reduced-motion`.
- **Do** identificar dados ilustrativos, materiais ausentes e limites funcionais no contexto.
- **Don't** inventar fotografias de empreendimentos, disponibilidade confirmada, rentabilidade garantida ou métricas comerciais.
- **Don't** apresentar backend, IA, autenticação, PWA ou Meta como prontos.
- **Don't** apagar a hierarquia editorial ao estender páginas internas.
