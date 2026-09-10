# Jairo Rocha — mockup de apresentação

Mockup visual navegável em Astro para apresentação à empresa. Inclui home, catálogo filtrável, detalhes de imóveis, litoral com simulador e administração demonstrativa. Direção visual em [DESIGN.md](DESIGN.md); escopo em [PRODUCT.md](PRODUCT.md).

## Executar

Com Node.js e npm instalados:

```sh
npm install
npm run dev -- --port 4322
```

Abra http://localhost:4322. Nesta sessão, a porta padrão do Astro (4321) estava ocupada; a apresentação usa 4322. No PowerShell, se a política bloquear npm.ps1, use npm.cmd nos mesmos comandos.

```sh
npm run build
npm run preview -- --port 4322
```

O build gera `dist/`. Encerre o servidor de desenvolvimento antes de usar a mesma porta no preview.

## Rotas

- `/`: home e busca.
- `/imoveis`: catálogo, filtros e ordenação; aceita query `tipo=novos`, `tipo=seminovos` ou `tipo=locacao`.
- `/imovel/la-fleur-polinesia`: exemplo de detalhe com galeria e vídeo. Demais slugs em `src/data/properties.ts`.
- `/litoral` e `/litoral#simulador`: seleção costeira e simulação.
- `/admin`: listagem administrativa demonstrativa.
- `/admin/novo`: cadastro demonstrativo.

## Limites

- Atendimento chamado de IA: fluxo guiado no navegador, sem rede ou modelo conectado; não envia conversas à equipe.
- Administração sem autenticação, backend ou persistência; feedback não publica imóveis.
- Simulador matemático ilustrativo. Destino/tipologia rotulam o cenário; diária, ocupação, custos e investimento informados determinam os cálculos. Não inclui impostos, financiamento ou valorização nem garante retorno.
- PWA e integrações Meta são possibilidades futuras, não implementadas.
- Books e tours 3D são placeholders explícitos. Vídeos não fornecidos também têm estado demonstrativo.
- La Fleur Polinésia usa [vídeo de fonte pública no YouTube](https://www.youtube.com/watch?v=1q2AyjnKdyY), carregado somente após clicar em reproduzir. A reprodução acessa esse serviço externo.
- Fotografias e seleção partem do catálogo público. Dados, preços, disponibilidade e materiais precisam de confirmação pela empresa antes de uma versão operacional.

Interface em `src/pages`, `src/components` e `src/layouts`; estilo em `src/styles/global.css`. Este projeto é uma apresentação local, sem declaração de publicação em produção.
