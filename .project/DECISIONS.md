# Decisões Técnicas — Site Jairo Rocha

## 2026-09-13 — Correção explícita: marca no cabeçalho, giro somente do símbolo

**Contexto:** a interpretação anterior estava errada: o usuário não queria um letreiro duplicado na hero nem o nome girando.
**Decisão:** substituir a marca da home no próprio cabeçalho por símbolo volumétrico giratório e nome original com profundidade fixa; manter selo 40 anos estático. Remover a instância na hero e sua coluna. Demais cabeçalhos preservados.
**Consequências:** esta decisão substitui as duas anteriores sobre a composição da marca. Não redesenhar tipografia com fonte aproximada nem animar o nome.

## 2026-09-13 — Logo completa substitui emblema isolado

**Contexto:** usuário mostrou a composição do cabeçalho e pediu essa marca inteira girando, removendo a pílula de pausa.
**Decisão:** usar a arte original raster no letreiro extrudado branco com selo 40 anos, frente/verso legíveis; interação sem botão visual, pela área da própria logo. Manter redução de movimento e fallback.
**Consequências:** preserva fidelidade da tipografia existente; a placa tem volume real, mas as letras não são extrudadas individualmente. Fonte raster original limita a resolução. Substitui a decisão anterior de animar apenas o símbolo.

## 2026-09-13 — Home manual e símbolo de marca 3D progressivo

**Contexto:** usuário aprovou reorganização da abertura/busca e pediu logo em 3D girando.
**Decisão:** manter wordmark oficial estático em cabeçalho branco; emblema circular vermelho recriado em geometria extrudada Three.js (dependência existente), com SVG inicial. Giro lento no desktop, ativação no celular, pausa e preferência reduzida. Remover carrossel automático e shader de mar da home ativa; destaques manuais e fotografia real já licenciada. Comprar passa a categoria agregada `venda` no catálogo.
**Alternativas:** girar o nome completo no cabeçalho; vídeo de logo; Blender/GLB; continuar incluindo aluguel na busca genérica de compra.
**Consequências:** identidade sempre legível, movimento controlável e sem mídia/dependência nova. WebGL opcional; busca do catálogo ainda requer JavaScript para aplicar filtros. Layout das demais páginas preservado.

## 2026-09-13 — Evidências e cálculo do investidor separados

**Contexto:** incorporar a pesquisa aprovada sem transformar preço pedido, diária anunciada ou estatística municipal em promessa de retorno.
**Decisão:** dados tipados de evidência separados do motor financeiro puro e da interface Astro. Premissas editáveis, capital total, caixa antes de IR/dívida, fonte/data por oferta. Filtro de praia não altera hipóteses de diária/ocupação. Sem backend, cópia local do pedido de estudo.
**Alternativas:** reutilizar calibração hoteleira e IR universal do simulador anterior; preencher retorno automaticamente por anúncio; prometer desempenho com estimativas agregadas.
**Consequências:** transparência e testes completos do cálculo, sem dependência nova; rentabilidade individual exige extratos, custos e documentação da unidade. Modelos legados não são executados na área nova.

## 2026-09-13 — Litoral real, planejamento transparente e vídeo offline

**Contexto:** transformar a página em experiência de temporada; usuário corrigiu o briefing para praias locais já listadas e fotos reais.
**Decisão:** quatro fotos vinculadas aos quatro destinos, fontes/licenças preservadas; Leaflet/OSM sob demanda com fallback e rotas externas; cenários explicitamente hipotéticos; Remotion renderizado para MP4 horizontal/vertical sem React no navegador.
**Alternativas:** imagens IA (descartadas por pedido do usuário), mapa pago com chave, player React/Remotion em runtime, falsa disponibilidade (não adotada).
**Consequências:** página leve antes das interações e edição reproduzível; mapa depende de terceiros, fotos não garantem condições atuais, reservas reais exigem catálogo/integração futuros.

## 2026-09-13 — Interiores em corte documentados e independentes do bloco

**Contexto:** o usuário pediu mais áreas detalhadas com planta e imagem de qualidade, além de explicações do que está vendo. As plantas comerciais não fornecem todas as cotas executivas.

**Decisão:** gerar via Blender MCP duas cenas individuais (tipos 01 e 03), organizadas por ambiente/material, usando plantas das páginas 35 e 39 e perspectivas oficiais de dormitório, estar e gourmet. Não inventar layouts de áreas de lazer sem planta suficiente. Mostrar fontes e limites no painel do site; teto omitido e paredes rebaixadas são cortes de visualização.

**Alternativas:** um GLB único com todas as cenas; áreas adicionais sem respaldo; aguardar projeto executivo para qualquer representação comercial.

**Consequências:** mais detalhe sem transferir todos os modelos na abertura. Geometria comprimida com Draco (1,05 MB/940 KB), exportação restrita à cena ativa e decoder local sem CDN externo. As dimensões, decoração e especificações continuam ilustrativas. Aumenta o acervo versionado, preservando o `.blend` editável e script de reprodução.


## 2026-09-13 — Preservar os dois históricos durante o takeover

**Contexto:** o repositório local tinha um branch `master` com documentação histórica, enquanto o GitHub fornecido tinha um branch `main` não relacionado com o site implementado.

**Decisão:** preservar o `master` e criar `codex/takeover-audit` a partir de `origin/main`, mantendo o trabalho de takeover isolado e reversível.

**Alternativas:** resetar o branch local para o remoto; mesclar imediatamente históricos não relacionados.

**Consequências:** nenhum histórico foi perdido. A integração final e o destino do branch serão decididos depois da revisão do usuário.

---

## 2026-09-13 — Atualizar Astro para a linha corrigida

**Contexto:** Astro 5.18.2 trouxe, no audit atual, vulnerabilidades transitivas e diretas, incluindo uma crítica. A correção disponível exigia mudança de versão principal.

**Decisão:** atualizar para Astro 7.3.2 e validar build estático, audit de dependências e todos os fluxos E2E.

**Alternativas:** manter Astro 5 e aceitar o risco; adiar a migração até a definição de produção.

**Consequências:** o projeto passa a exigir Node.js 22.12 ou superior. O build continua gerando as mesmas 14 páginas e o audit passou a 0 vulnerabilidades.

---

## 2026-09-13 — Manter `noindex` enquanto o portal for uma apresentação

**Contexto:** `jairorocha.com.br` continua operacional e a publicação na Vercel é descrita no próprio projeto como conceito visual com dados a confirmar.

**Decisão:** não remover `noindex,nofollow` nesta etapa.

**Alternativas:** liberar indexação imediatamente e competir com o site oficial; retirar a publicação conceitual do ar.

**Consequências:** a nota de SEO permanece baixa no Lighthouse, mas evita indexar uma prévia e criar conteúdo duplicado. A decisão deve ser revista quando houver domínio e estratégia de lançamento definidos.

---

## 2026-09-13 — Carregar a experiência 3D do Sopro somente após intenção do usuário

**Contexto:** o modelo GLB tem aproximadamente 3,3 MB e a biblioteca de visualização adiciona cerca de 1 MB de JavaScript minificado. Carregar ambos na abertura penalizaria visitantes que não usam o recurso e uma falha de WebGL/rede deixaria apenas uma área vazia.

**Decisão:** versionar `@google/model-viewer` 4.3.1 e `three` 0.183.0 no projeto, importar o componente dinamicamente após o clique na capa e só então solicitar o GLB. A interface possui estados explícitos de capa, loading, pronto e erro, com retry e link para a implantação como fallback.

**Alternativas:** carregar o visualizador e o GLB na abertura; depender de script externo via CDN; remover o 3D.

**Consequências:** o 3D continua disponível, mas seu custo só é pago por quem demonstra interesse. O bundle lazy ainda é grande e deve permanecer isolado do carregamento inicial; as versões ficam fixadas e precisam de atualização deliberada.

---

## 2026-09-13 — Gerar imagens responsivas do Sopro dentro do projeto

**Contexto:** a estratégia genérica de imagens depende do Image CDN da Netlify, mas a prévia atual está na Vercel e a hospedagem definitiva ainda não foi escolhida. A página do Sopro entregava arquivos grandes também em telas pequenas.

**Decisão:** gerar variantes WebP em 480, 768 e 1280 px, além da largura nativa quando aplicável, e centralizar `srcset`, `sizes`, lazy-loading e prioridade no componente `SoproImage.astro`.

**Alternativas:** aguardar a definição da hospedagem; usar apenas uma imagem WebP por posição; contratar um serviço externo de transformação.

**Consequências:** a otimização funciona em qualquer hospedagem estática. O repositório cresce com os derivados, mas uma navegação mobile completa da página passou a selecionar aproximadamente 0,98 MB de imagens contra 12,58 MB do conjunto original referenciado.

---

## 2026-09-13 — Não alterar a geometria do Sopro sem Blender MCP ou fonte arquitetônica oficial

**Contexto:** o usuário pediu que qualquer trabalho no Blender seja feito via MCP. O Blender MCP não está disponível nesta sessão e o `.blend` existente foi gerado por script com medidas inferidas, não importado de um projeto executivo confirmado.

**Decisão:** preservar a geometria atual e melhorar a experiência por código no site. O GLB passou a ser enquadrado por coordenadas medidas, com vistas guiadas para bloco, térreo e superior. Uma reconstrução geométrica futura dependerá do Blender MCP ou de um arquivo arquitetônico oficial, como SKP, RVT, IFC, DWG ou modelo equivalente.

**Alternativas:** usar o Blender local fora do MCP; editar a geometria por outro processo não solicitado; apresentar o modelo atual sem explicar seus limites.

**Consequências:** a experiência ficou muito mais legível sem inventar arquitetura. O modelo continua sendo uma representação comercial conceitual e a própria interface declara que dimensões e acabamentos exigem confirmação.

---

## 2026-09-13 — Reconstruir o bloco comercial do Sopro via Blender MCP

**Contexto:** o GLB anterior reunia três estudos desconectados em 1.519 meshes e aproximadamente 62 mil triângulos. O book oficial confirma a composição de quatro unidades, as áreas e os principais elementos arquitetônicos, mas não contém todas as cotas executivas.

**Decisão:** usar exclusivamente o Blender MCP para construir uma nova versão organizada do bloco, baseada nas plantas e perspectivas oficiais. A cena representa duas unidades térreas e duas superiores, quatro piscinas privativas, varandas, escadas externas, vidro, materiais terrosos e paisagismo. A versão anterior foi mantida intacta, e a página passou a apontar explicitamente para `sopro-v2.glb`.

**Alternativas:** continuar usando o modelo fragmentado; editar o `.blend` fora do MCP; aguardar indefinidamente um arquivo executivo.

**Consequências:** após completar a circulação vertical com patamares, portas laterais e guarda-corpos, o arquivo web ficou em aproximadamente 2,1 MB, 326 meshes e cerca de 6,8 mil triângulos — ainda muito abaixo do original de 3,3 MB, 1.519 meshes e 62 mil triângulos. O resultado é uma representação comercial, não um modelo executivo; dimensões não cotadas precisam ser confirmadas antes de uso técnico.
