# Bugs — Site Jairo Rocha

## 🐛 Abertos

- [ ] LCP mobile de laboratório em 8,5 s na home — hero/carrossel, CSS global e entrega de imagens precisam de otimização antes de lançamento.
- [ ] Estratégia de imagens não atua na publicação atual — `src/lib/image.ts` usa o Image CDN apenas quando `NETLIFY=true`, mas a prévia publicada está na Vercel.
- [ ] Cabeçalhos configurados em `netlify.toml` não são aplicados pela Vercel; a publicação atual expõe HSTS, mas não a política completa de segurança/cache planejada.

## ⚠️ Riscos de produto

- [ ] Administração, assistente e persistência são apenas demonstrações e não devem ser apresentadas como funcionalidades operacionais.
- [ ] Catálogo, preços, disponibilidade, mídias e premissas do simulador precisam de confirmação da empresa.
- [ ] `robots.txt` e sitemap não existem na prévia; isso é aceitável enquanto ela permanecer com `noindex`, mas bloqueia o lançamento SEO.
- [ ] O PDF do Sopro tem aproximadamente 27,8 MB e precisa de estratégia de entrega antes de tráfego em produção. O GLB de aproximadamente 3,3 MB já é carregado somente após ação do usuário.

## ✅ Resolvidos

- [x] 2026-09-13 GLB do Sopro enquadrava três estudos desconectados e deixava o bloco minúsculo — causa: câmera automática considerava térreo, superior e bloco completo como uma única composição de cerca de 51 m de largura; fix: presets de câmera medidos para exterior, térreo e superior, com o bloco como vista inicial.
- [x] 2026-09-13 Assistente flutuante cobria os controles da experiência 3D — causa: os dois elementos ocupavam o canto inferior direito; fix: ocultar o atalho flutuante somente enquanto o visualizador pronto estiver em foco.
- [x] 2026-09-13 Página do Sopro transferia imagens grandes também no mobile — causa: ausência de variantes e `srcset`; fix: WebPs responsivos e componente dedicado, reduzindo a seleção medida numa navegação completa de 12,58 MB para aproximadamente 0,98 MB.
- [x] 2026-09-13 Experiência 3D não tinha estados resilientes — causa: visualizador sem capa, carregamento explícito ou recuperação; fix: carregamento sob demanda com capa, loading, timeout, retry e fallback para a implantação.
- [x] 2026-09-13 Container mobile do 3D deixava uma faixa preta abaixo do conteúdo — causa: altura mínima externa maior que a dos estados internos; fix: alinhar a altura mínima do container no breakpoint mobile.
- [x] 2026-09-13 Rótulos dourados da comparação de plantas falharam no contraste do Lighthouse — causa: contraste 4,24:1; fix: aplicar `--gold-text`, elevando Acessibilidade para 100.
- [x] 2026-09-13 Verificação E2E quebrava ao crescer o catálogo de 6 para 7 imóveis — causa: expectativa fixa; fix: comparar a restauração com a contagem inicial visível.
- [x] 2026-09-13 Imagens lazy-loading eram classificadas como quebradas antes de completar o carregamento — causa: teste confundia imagem pendente com erro; fix: forçar carregamento na auditoria e validar `naturalWidth` somente após conclusão.
- [x] 2026-09-13 Dependências apresentavam 3 vulnerabilidades, incluindo 1 crítica — causa: Astro 5.18.2 fora da linha corrigida; fix: migração para Astro 7.3.2, build e E2E completos.
- [x] 2026-09-13 Nome acessível da marca omitia o selo visível “40 anos” — causa: `aria-label` sobrescrevia o `alt` do logotipo e o texto do selo; fix: remover a sobrescrita e validar o nome acessível computado pelo navegador.
