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
