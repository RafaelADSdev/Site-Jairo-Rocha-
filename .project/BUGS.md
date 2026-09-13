# Bugs — Site Jairo Rocha

## 🐛 Abertos

- [ ] LCP mobile de laboratório em 8,5 s na home — hero/carrossel, CSS global e entrega de imagens precisam de otimização antes de lançamento.
- [ ] Estratégia de imagens não atua na publicação atual — `src/lib/image.ts` usa o Image CDN apenas quando `NETLIFY=true`, mas a prévia publicada está na Vercel.
- [ ] Cabeçalhos configurados em `netlify.toml` não são aplicados pela Vercel; a publicação atual expõe HSTS, mas não a política completa de segurança/cache planejada.

## ⚠️ Riscos de produto

- [ ] Administração, assistente e persistência são apenas demonstrações e não devem ser apresentadas como funcionalidades operacionais.
- [ ] Catálogo, preços, disponibilidade, mídias e premissas do simulador precisam de confirmação da empresa.
- [ ] `robots.txt` e sitemap não existem na prévia; isso é aceitável enquanto ela permanecer com `noindex`, mas bloqueia o lançamento SEO.
- [ ] O PDF do Sopro tem aproximadamente 27,8 MB e o modelo GLB aproximadamente 3,3 MB; precisam de estratégia de entrega antes de tráfego em produção.

## ✅ Resolvidos

- [x] 2026-09-13 Verificação E2E quebrava ao crescer o catálogo de 6 para 7 imóveis — causa: expectativa fixa; fix: comparar a restauração com a contagem inicial visível.
- [x] 2026-09-13 Imagens lazy-loading eram classificadas como quebradas antes de completar o carregamento — causa: teste confundia imagem pendente com erro; fix: forçar carregamento na auditoria e validar `naturalWidth` somente após conclusão.
- [x] 2026-09-13 Dependências apresentavam 3 vulnerabilidades, incluindo 1 crítica — causa: Astro 5.18.2 fora da linha corrigida; fix: migração para Astro 7.3.2, build e E2E completos.
- [x] 2026-09-13 Nome acessível da marca omitia o selo visível “40 anos” — causa: `aria-label` incompleto; fix: incluir marca, aniversário e destino no nome acessível.
