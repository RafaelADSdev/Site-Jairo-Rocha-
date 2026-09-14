# Bugs — Site Jairo Rocha

## Litoral — resolvidos em 2026-09-13

- [x] Roteiro de uma noite gerava três dias: corrigido para dois dias, com teste RED/GREEN.
- [x] Falha de tiles sem retry: estado de erro e nova tentativa com redraw, cobertos por teste.
- [x] Leaflet no dev retornava 504 Outdated Optimize Dep após instalar dependências: reiniciado somente o servidor deste projeto na porta 4322, validado mapa real.
- [x] Perfil de viagem truncado em 375 px: campo em largura inteira e select com fonte de 16 px.

## 🐛 Abertos

- [ ] LCP mobile de laboratório em 8,5 s na home — hero/carrossel, CSS global e entrega de imagens precisam de otimização antes de lançamento.
- [ ] Estratégia de imagens não atua na publicação atual — `src/lib/image.ts` usa o Image CDN apenas quando `NETLIFY=true`, mas a prévia publicada está na Vercel.
- [ ] Cabeçalhos configurados em `netlify.toml` não são aplicados pela Vercel; a publicação atual expõe HSTS, mas não a política completa de segurança/cache planejada.

## ⚠️ Riscos de produto

- [x] 2026-09-13 Experiência ativa do investidor substituiu a calibração baseada em hotelaria, despesas apenas percentuais e IR fixo de 15% por modelo independente antes de IR/dívida, capital total e custos explícitos. Biblioteca legada ainda existe para metadados de destinos da home, mas o script antigo não é mais importado pela página.

- [ ] Administração, assistente e persistência são apenas demonstrações e não devem ser apresentadas como funcionalidades operacionais.
- [ ] Catálogo, preços, disponibilidade, mídias e premissas do simulador precisam de confirmação da empresa.
- [ ] `robots.txt` e sitemap não existem na prévia; isso é aceitável enquanto ela permanecer com `noindex`, mas bloqueia o lançamento SEO.
- [ ] O PDF do Sopro tem aproximadamente 27,8 MB e precisa de estratégia de entrega antes de tráfego em produção. O novo GLB de aproximadamente 1,9 MB já é carregado somente após ação do usuário.

## ✅ Resolvidos

- [x] 2026-09-14 Verificação do explorador 3D expirava no servidor de desenvolvimento antigo — causa: processo Astro mantido desde o dia anterior com cache de dependências desatualizado; fix: validar contra preview limpo do build e tornar o WebGL headless determinístico com SwiftShader. Todos os três modelos passaram.

- [x] 2026-09-13 Busca nova fechava filtros no HTML e ocultava resumo no desktop sem JS — fix: details aberto no SSR; inicialização fecha somente em telas menores, com teste RED/GREEN.
- [x] 2026-09-13 Faixas de compra podiam acompanhar locação sem JS — fix: preço desabilitado até escala dinâmica estar pronta; aviso explícito do requisito de JS no catálogo.
- [x] 2026-09-13 Estado de pausa 3D podia atrasar após mudança de preferência de movimento — fix: observar a preferência também no quadro de animação e preservar pausa do usuário.

- [x] 2026-09-13 Novo resultado financeiro não era anunciado a leitores de tela — fix: status separado com debounce de 450 ms e teste E2E.
- [x] 2026-09-13 Limite interno de valores financeiros não aparecia no formulário — fix: max explícito em runtime, erro junto ao campo e teste para 1e12 + 1.
- [x] 2026-09-13 Novo comparador ignorava destino dos atalhos da home — fix: validar parâmetro `destino` contra as quatro chaves aceitas; RED/GREEN confirmado.

- [x] 2026-09-13 Exportação GLB de interiores incluía outras cenas selecionadas no arquivo Blender — fix: `use_active_scene=True` no export via MCP e verificador de regressão exige uma única cena por arquivo; resultado final de 1,05 MB/940 KB.

- [x] 2026-09-13 Retry do visualizador reutilizava GLB que falhou no cache interno — fix: invalidar tentativa, criar URL de recuperação e reutilizar a versão recuperada ao retornar à cena; timeout também invalida eventos tardios.
- [x] 2026-09-13 Controles e texto do 3D disputavam espaço com o modelo — fix: controles fora do canvas e painel de ambientes ao lado no desktop/abaixo no mobile.

- [x] 2026-09-13 Escadas externas do novo bloco 3D terminavam contra paredes sem acesso — causa: a primeira reconstrução modelou degraus como indicação visual, mas preservou as paredes superiores inteiras e omitiu os patamares; fix: via Blender MCP, dividir as paredes, criar duas portas laterais, patamares contínuos e guarda-corpos nos dois lados, regenerar o `.blend` e exportar o GLB com URL versionada.
- [x] 2026-09-13 Modelo 3D do Sopro era fragmentado, pesado e pouco fiel na leitura visual — causa: três estudos reunidos em 1.519 meshes, aproximadamente 62 mil triângulos e câmera condicionada por uma cena de 51 m; fix: reconstrução via Blender MCP a partir do book oficial, com quatro unidades, quatro piscinas, circulação externa, vidro, paisagismo, 326 meshes, cerca de 6,8 mil triângulos e GLB de 2,1 MB.
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
