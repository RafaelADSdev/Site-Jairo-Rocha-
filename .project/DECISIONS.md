# Decisões Técnicas — Site Jairo Rocha

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
