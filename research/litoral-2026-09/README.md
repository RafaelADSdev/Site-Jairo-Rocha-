# Dossiê de investimento no litoral

Pesquisa pública com data de corte em 13/09/2026. Não constitui garantia de retorno, avaliação pericial ou aprovação de aquisição.

## Leitura

1. [Relatório completo](RELATORIO.md): síntese, território, demanda, comparação de compra e diárias, custos, cenários e diligência, com referências numeradas.
2. [Amostra de compra](precos-compra.md): 12 ofertas individuais, áreas, preços pedidos, taxas, estágio, fonte e exclusões.
3. [Hospedagem e metodologia](diarias-e-metodo.md): oito referências, calendários, chamadas sem data, defasagens e comparação de provedores STR.
4. [Rota, demanda e riscos](demanda-rota-riscos.md): fontes oficiais, pedágios, ambiente, tributação patrimonial e riscos regulatórios.
5. [Modelo aritmético](modelo-cenarios.mjs): premissas explícitas, resultados reproduzíveis e verificações de fronteira. Execute `node research/litoral-2026-09/modelo-cenarios.mjs` na raiz do projeto.

## Verificação e limites

- Revisão independente conferiu a correspondência dos preços do relatório com as páginas coletadas, estágio/área e resultados do modelo.
- Modelo protege ponto de equilíbrio impossível: margem não positiva ou mais de 365 noites retorna status de inviabilidade, não percentual negativo/infinito.
- Não foram obtidos extratos de receitas privadas, cotação de compra negociada, matrícula/licenças de uma unidade nem cotação final uniforme de hospedagem.
- A pesquisa em si não alterou o site. Após aprovação posterior, foi incorporada localmente à área `/litoral#investir`; ver [implementação e QA](IMPLEMENTACAO-QA.md). Nenhum anúncio externo, conta ou publicação foi alterado.
