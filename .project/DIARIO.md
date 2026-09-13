# Diário — Site Jairo Rocha

## 2026-09-13 18:07

**Foco:** corrigir a circulação das escadas externas no novo modelo 3D do Sopro.

**Feito:**

- Confirmado visualmente que as escadas terminavam contra paredes superiores inteiras, sem patamar nem porta de chegada.
- Revisitadas a planta superior e as perspectivas do book oficial; elas confirmam o acesso externo, mas não fornecem cotas completas.
- Mantida a reconstrução exclusivamente pelo Blender MCP conectado ao Blender 5.2.1, com telemetria detalhada desligada.
- Divididas as duas paredes laterais superiores para criar vãos de acesso, portas envidraçadas, molduras e puxadores.
- Acrescentados patamares contínuos entre o último degrau e cada porta, guarda-corpos de proteção e corrimãos nos dois lados das escadas.
- Regenerados `sopro-v2.blend` e `public/models/sopro-v2.glb`; a versão corrigida tem aproximadamente 2,1 MB, 326 meshes e cerca de 6,8 mil triângulos.
- Adicionado versionamento à URL do GLB para impedir que o navegador reutilize a versão anterior em cache.
- Validado o render do Blender, o carregamento `ready` no navegador, o build das 14 rotas e o audit com 0 vulnerabilidades.

**Próximos passos:**

- Validar visualmente a circulação corrigida com o usuário.
- Substituir proporções aproximadas por cotas executivas se a empresa fornecer o projeto arquitetônico.

**Bloqueios / dúvidas:**

- Nenhum para a representação comercial; cotas executivas continuam indisponíveis no book.

---

## 2026-09-13 17:59

**Foco:** reconstruir e integrar um bloco 3D melhor do Sopro usando o Blender MCP.

**Feito:**

- Controlado o Blender 5.2, habilitado o add-on `MCP for Blender` e iniciado o servidor local na porta 9876.
- Desabilitada a telemetria detalhada do add-on antes da reconstrução; permanecem apenas contagens mínimas anônimas declaradas pelo próprio complemento.
- Aberto e auditado o `.blend` anterior pelo MCP: 1.537 objetos e 26 materiais, com três estudos desconectados.
- Revisados o book oficial de 46 páginas, as plantas e os renders do empreendimento para derivar a composição e a linguagem visual permitidas pelas fontes.
- Criado `scripts/blender_sopro_block_v2.py`, que gera uma cena organizada com quatro unidades, quatro piscinas, escadas externas, vidro, interiores simplificados, materiais e paisagismo tropical.
- Salvos `sopro-v2.blend` e `public/models/sopro-v2.glb`; a versão web tem aproximadamente 1,9 MB, 288 meshes e cerca de 5,8 mil triângulos.
- Integrada a v2 à página com texto de peso atualizado e novos presets de câmera.
- Validado no navegador local o carregamento real, o estado `ready`, a fachada inicial e as vistas de térreo e superior; build das 14 rotas concluído.

**Próximos passos:**

- Validar visualmente com o cliente e, se houver, substituir aproximações por cotas ou modelo executivo oficial.
- Fazer a próxima rodada de performance global e definir a hospedagem definitiva.

**Bloqueios / dúvidas:**

- O book não fornece todas as cotas executivas; o modelo continua corretamente identificado como representação comercial conceitual.

---

## 2026-09-13 17:30

**Foco:** preparar a reconstrução fiel do modelo 3D do Sopro pelo Blender MCP.

**Feito:**

- Confirmado que a experiência web havia sido melhorada, mas a geometria do GLB ainda era a conceitual existente.
- Diagnosticado que o Blender MCP estava configurado apenas no Claude e não aparecia no inventário de ferramentas da sessão do Codex.
- Registrado no Codex o servidor STDIO `blender`, usando o caminho absoluto do `uvx` e o pacote `blender-mcp`.
- Instalado o add-on `blender_mcp.py` no diretório de add-ons do Blender 5.2.
- Confirmado com `codex mcp get blender` que o servidor está habilitado.

**Próximos passos:**

- Reiniciar o Codex para carregar as ferramentas do Blender MCP.
- No Blender, habilitar `Interface: MCP for Blender`, abrir o painel lateral e iniciar o MCP Server.
- Abrir o `.blend` do Sopro, reconstruir o bloco a partir das plantas e renders oficiais, otimizar a malha e exportar um novo GLB para o site.

**Bloqueios / dúvidas:**

- O book oficial fornece plantas e áreas, mas não todas as cotas executivas; elementos não cotados continuarão identificados como aproximações até validação da empresa.

---

## 2026-09-13 17:24

**Foco:** transformar o bloco 3D do Sopro em uma experiência guiada e preservar a fidelidade possível sem usar Blender fora do MCP.

**Feito:**

- Auditado o GLB: 1.519 meshes, aproximadamente 62 mil triângulos, 26 materiais de cor e nenhuma textura de imagem.
- Identificado que o arquivo reúne três estudos desconectados, fazendo a câmera automática enquadrar cerca de 51 m de largura e reduzir demais o bloco completo.
- Medidos diretamente no GLB os centros do bloco, térreo e superior para criar presets de câmera sem alterar a geometria.
- Criada a interface “Explore um bloco do Sopro”, com vista inicial do exterior, abas de térreo e superior, orientação de gestos, progresso acessível, tela cheia e navegação por teclado.
- A assistente flutuante agora se recolhe apenas enquanto o visualizador pronto estiver em foco, sem cobrir os controles.
- Mantidos carregamento sob demanda, timeout, retry, fallback e aviso de representação comercial.
- Respeitada a exigência do usuário: como o Blender MCP não está disponível, nenhuma geometria foi alterada pelo Blender local.
- Teste focado, build de 14 páginas, regressão desktop/mobile e detector de anti-patterns passaram.
- Lighthouse da página manteve Acessibilidade 100 e Boas Práticas 100.

**Próximos passos:**

- Avaliar a nova experiência local com o usuário.
- Para elevar a fidelidade geométrica, obter Blender MCP ou o arquivo arquitetônico original em SKP, RVT, IFC, DWG ou equivalente.
- Com fonte oficial, reconstruir materiais e fachadas e validar lado a lado com os renders.

**Bloqueios / dúvidas:**

- O Blender MCP não está disponível nesta sessão; a geometria atual continua conceitual.

---

## 2026-09-13 17:02

**Foco:** melhorar a página do Sopro com 3D resiliente, imagens otimizadas e comparação das tipologias.

**Feito:**

- Extraídas do book oficial as plantas do pavimento térreo (página 35, 34 m²) e superior (página 39, 29 m²), com aviso transparente sobre a diferença para os valores comerciais de 34,2 e 29,2 m² usados no site.
- Criada a seção de comparação lado a lado com áreas, características, plantas e navegação por âncora.
- Implementado o 3D sob demanda com capa, loading acessível, timeout, estado pronto, retry e fallback para a implantação; o GLB de aproximadamente 3,3 MB não é solicitado antes do clique.
- `@google/model-viewer` 4.3.1 e `three` 0.183.0 foram fixados como dependências locais e carregados por importação dinâmica.
- Geradas variantes WebP responsivas para as imagens do Sopro e criado o componente `SoproImage.astro`; numa navegação mobile completa, 35 imagens selecionadas somaram aproximadamente 0,98 MB, contra 12,58 MB do conjunto original referenciado.
- Verificação focada passou pelos estados do 3D, fallback de erro, duas tipologias e imagens responsivas.
- Regressão completa passou em 14 combinações de rota e viewport, sem overflow, imagens quebradas ou erros de página.
- Build das 14 páginas e `npm audit` passaram; Lighthouse do Sopro marcou Acessibilidade 100 e Boas Práticas 100.

**Próximos passos:**

- Validar com a empresa os dados comerciais, as áreas e a autorização das mídias do Sopro.
- Tratar performance global e LCP, principalmente CSS compartilhado, fontes e prioridades de recursos.
- Definir a estratégia de entrega do PDF de aproximadamente 27,8 MB.

**Bloqueios / dúvidas:**

- O book oficial arredonda as áreas das plantas para 34 e 29 m², enquanto o site usa 34,2 e 29,2 m²; a página informa a diferença até a validação comercial.

---

## 2026-09-13 13:51

**Foco:** disponibilizar o código do portal na pasta local e iniciar o ambiente de desenvolvimento para o Alexandre.

**Feito:**

- Confirmado que o repositório completo está em `Site Jairo Rocha/`, no branch `codex/takeover-audit`.
- Confirmado o remoto `origin` apontando para `RafaelADSdev/Site-Jairo-Rocha-`.
- Servidor Astro local iniciado em `http://localhost:4322/`.
- Site local aberto no navegador interno do Codex e mantido disponível para inspeção.

**Próximos passos:**

- Receber a lista de ajustes visuais, de conteúdo ou funcionais desejados.

**Bloqueios / dúvidas:**

- Nenhum para desenvolvimento local.

---

## 2026-09-13 11:58

**Foco:** assumir o projeto existente, integrar o repositório fornecido e estabelecer uma baseline segura para os próximos ajustes.

**Feito:**

- Conectado `https://github.com/RafaelADSdev/Site-Jairo-Rocha-.git` como `origin`.
- Preservado o branch local histórico `master`; criado `codex/takeover-audit` a partir de `origin/main`.
- Stack e escopo auditados; confirmação de que a Vercel é uma apresentação separada do site operacional `jairorocha.com.br`.
- Dependências instaladas e build de 14 páginas validado.
- Verificação E2E corrigida para acompanhar o crescimento do catálogo e tratar lazy-loading corretamente.
- Astro migrado de 5.18.2 para 7.3.2; `npm audit` passou de 3 vulnerabilidades para 0.
- Todos os fluxos E2E passaram em 1440 px e 390 px, sem overflow, imagens quebradas ou erros de página.
- Lighthouse mobile inicial: Performance 74, Acessibilidade 100, Boas Práticas 100, SEO 63; LCP 8,5 s e economia potencial de imagens em torno de 720 KiB.
- Nome acessível da marca corrigido para incluir “40 anos”.

**Próximos passos:**

- Alexandre decidir se a prévia substituirá o site atual, coexistirá com ele ou seguirá apenas como apresentação.
- Escolher hospedagem definitiva e alinhar CDN de imagens, cache e cabeçalhos.
- Priorizar a rodada de ajustes visuais/funcionais e a otimização de LCP.
- Definir a fonte do catálogo, o destino dos leads e o limite entre demonstração e produto operacional.

**Bloqueios / dúvidas:**

- Estratégia de lançamento, hospedagem e integrações reais ainda não foram aprovadas.

---
