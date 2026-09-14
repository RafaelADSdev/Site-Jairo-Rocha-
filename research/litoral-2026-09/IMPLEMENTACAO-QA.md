# Implementação do caderno do investidor

Entrega local em 13/09/2026, após aprovação da incorporação do dossiê. Acesso: `/litoral#investir`; cálculo: `/litoral#simulador`.

## Entregue

- 12 preços pedidos e oito referências de hospedagem nas quatro praias existentes, com fontes individuais, data da pesquisa, área, estágio, custos e advertências.
- Estatísticas municipais AirDNA/AirROI separadas, sem média artificial ou retorno atribuído a uma unidade.
- Motor independente com compra, aquisição, montagem, reserva inicial, noites disponíveis/ocupadas, limpeza cobrada/paga, comissões, gestão, manutenção, consumo e despesas fixas.
- Três sensibilidades hipotéticas; prejuízo explícito, equilíbrio inviável explicado. Caixa antes de IR e dívida, sem valorização. Filtro de praia não altera premissas financeiras.
- Checklist de documentos, seis temas de risco com fontes primárias e pedido de estudo copiável; fallback manual. Nenhum envio ou backend.
- Interface na identidade existente, comparação empilhada no celular, detalhes progressivos, conteúdo estático acessível sem JavaScript, erros junto aos campos e status acessível com debounce.

## Evidências de verificação

- `node --experimental-strip-types --test --experimental-test-coverage src/lib/litoral-investment.test.ts`: 16 aprovados; 100% linhas/branches/funções da biblioteca financeira, não cobertura de todo o site.
- `node .project/verify-litoral-investment.mjs`: destinos, links de entrada, cenários, perda, limites inválidos, ausência de noites, margem negativa, clipboard negado, sem JS e larguras 375/768/1440 aprovados.
- `node .project/verify-litoral-experience.mjs`: fotos reais, mapa OSM ao vivo, retry, planejamento, cópia e vídeos horizontal/vertical de 22 s aprovados.
- `node .project/verify.mjs`: sete rotas em desktop/mobile, sem overflow ou imagens quebradas, fluxos e zero erros JS.
- `npm run build`: 14 páginas compiladas. Aviso já conhecido de chunk grande do visualizador 3D persiste; não foi introduzido pelo motor financeiro.
- Detector Claivor no componente: zero ocorrências. Contraste dos tokens: texto secundário/fundo suave 5,01:1; vinho/branco 11,83:1; erros/branco 8,13:1. Não equivale a auditoria WCAG completa.
- Capturas em `tmp/litoral-investor-*.png` inspecionadas. Nenhuma dependência nova, imagem IA, deploy ou push.

## Limites

Pesquisa pública não comprova ocupação/receita de uma unidade. Anúncios podem mudar ou sair do ar. Sem extratos privados, orçamento fechado, matrícula ou licenças validadas. Resultado operacional não é renda líquida pessoal. Tributação e financiamento exigem análise própria. Fonte legada de destinos da home permanece no repositório; o simulador antigo não está ativo na página.
