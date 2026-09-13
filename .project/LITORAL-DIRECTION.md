# Viva o litoral — direction and copy

## Intent and art direction

A visitor opens the page on a phone while choosing a weekend away. The page should turn inspiration into a saved trip brief, not impersonate a booking engine.
Physical reference: a red travel folio with wide photographic postcards and a working coastal atlas. Preserve Jairo's existing Manrope and red brand; deepen red to burgundy for the travel chapter. White reading surfaces, burgundy identity surfaces, turquoise in photography/map water. No generic beige editorial template, no animated content hidden before JS.
Tokens: ink #321e27, burgundy #651d32, accent #ed1020 (existing brand), paper #ffffff, soft #f5f1f3; semantic OKLCH equivalents set in CSS. Body >=16px, touch controls>=44px. Main action: build a trip brief. Secondary: map/routes, optional film, existing illustrative investment simulator.

## Approved implementation copy (agent review, not client commercial approval)

- Hero h1: Seu próximo capítulo tem mar.
- Hero subclaim: Escolha uma praia, imagine a estadia e monte um roteiro pelo litoral pernambucano. Do fim de semana a dois aos dias de férias em família.
- Primary CTA: Montar minha temporada.
- Secondary CTA: Explorar o mapa.
- Hero disclosure: Praias reais. Possibilidades para imaginar. Conheça as fotografias.
- Map h2: Uma costa. Diferentes jeitos de ficar.
- Map intro: Toque em um destino para conhecer o ritmo da praia e montar seu caminho saindo do Recife.
- Trip h2: Como seriam os seus dias por aqui?
- Trip intro: Escolha com quem vai, quantas noites quer ficar e uma diária hipotética. O cenário muda com você.
- Trip result note: Exercício de planejamento, não cotação. Não há consulta de disponibilidade. Diárias, taxas, capacidade e comodidades devem ser confirmadas para cada imóvel.
- Film h2: Dê play nos próximos dias.
- Film note: Fotografias reais do litoral pernambucano, em um filme criado com Remotion. Roteiro ilustrativo, não é oferta de hospedagem.
- Investor section: Está pensando em investir também? (existing simulator retained, assumptions illustrative).
- CTA brief: Copiar meu plano / Ver rota no Google Maps. Neither sends a lead or makes a reservation.

## Functional plan

Four real coastal destinations, one live Leaflet map loaded on request with OSM attribution and fallback destination lists. Approximate destination centers, not property addresses. Route links open Google Maps for actual driving directions; any in-page connecting line is schematic, not road geometry.
Stay profiles: casal, familia, amigos; budgets are explicit editable hypotheses, no market return claims. Suggestions adapt to the number of nights; not timed tour inventory. Date-independent nights planner avoids fake booking availability. Preserve existing investment calculations unchanged and clearly separate from travel budget.
Actual Remotion landscape/portrait exports; no autoplay, no runtime React needed on the site. Content and native video controls work with reduced motion; poster fallback when playback fails. New assets in public/images/litoral-experience with provenance in assets/litoral/README.md.

## User correction — real local beaches only

The user explicitly superseded the initial ImageGen request: use the four beaches already listed and real photography. All final page and film assets are photographs of Porto de Galinhas, Muro Alto, Praia dos Carneiros and Tamandaré, individually matched to their Wikimedia Commons records. No AI imagery is shipped. Superseded drafts are outside public/ in ignored temporary storage. The original photographs and their authors, licenses and sources are preserved; resizing and motion crops do not depict a different place. Accommodation profiles remain planning suggestions, not photos or listings of bookable properties.

## Optional external skill discovery

Official https://github.com/remotion-dev/skills found during routing. No skill installed; direct official Remotion docs plus the installed design/testing skills cover this implementation. A dedicated Remotion skill can be adopted later if the owner wants a recurring video-production workflow.
