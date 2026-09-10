# Portal Jairo Rocha — escopo inicial

## Estado verificado

Em 10/09/2026, a pasta local contém duas imagens de marca/comunicação, sem aplicação existente. O site público e o HTML do simulador de referência foram consultados. Não houve acesso a credenciais nem publicação.

## Requisitos solicitados

- Portal imobiliário com PWA e hero de forte impacto visual.
- Navegação por novos, seminovos e locação.
- Busca de imóveis e seção de destaques.
- Página individual de empreendimento com fotos, vídeos, book e apresentação 3D.
- Imagens do catálogo utilizáveis nas campanhas da Meta.
- Pré-atendimento por IA capaz de pesquisar o catálogo e identificar imóveis compatíveis com as necessidades do visitante.
- Área dedicada ao litoral pernambucano, com destaque e simulação inspirada no protótipo informado.
- Acesso administrativo para cadastrar imóveis.

## Desdobramento proposto para implementação

- Administrador: autenticação, autorização no servidor, cadastro/edição, rascunho/publicação, disponibilidade, categorias, destaque e ordenação de mídia.
- Empreendimentos: URL própria, galeria, vídeo, PDF e tour 3D vinculado ao empreendimento. Disponibilidade dos materiais depende dos arquivos e links reais das construtoras.
- Busca: finalidade, localização, preço, tipologia e quartos; resultados paginados e estado vazio útil.
- IA: consultar somente imóveis publicados; justificar a compatibilidade com dados do catálogo; informar ausência de resultados; preparar encaminhamento ao atendimento humano.
- Meta: distinguir prévia de compartilhamento de integração de catálogo publicitário. Confirmar mecanismo e conta de destino antes de definir formato de exportação.
- PWA: instalação, ícones, manifesto e experiência de indisponibilidade de conexão; definir política de atualização para evitar preços e disponibilidade obsoletos.

## Referência do litoral

O protótipo organiza a simulação em tipo de imóvel, preço, destino e estágio (pronto/na planta). Apresenta receita bruta, custos, renda líquida, sazonalidade e prazo de retorno, mantendo valorização patrimonial separada da renda. Seus parâmetros são referências a validar, não resultados comerciais confirmados para a nova plataforma. A referência inclui destinos de Alagoas; o pedido atual delimita o litoral pernambucano.

## Decisões pendentes

1. Arquitetura/hospedagem obrigatória ou escolha delegada.
2. Cadastro próprio ou integração com CRM existente.
3. Fluxo de definição visual: imagem conceitual ou construção direta no código.
4. Origem e autorização de uso das mídias; disponibilidade de books e tours 3D reais.
5. Forma de integração com a Meta, provedor de IA e destino do atendimento.
6. Premissas e responsável pela atualização do simulador.

## Fontes

- https://jairorocha.com.br/
- https://litoral.srv1577302.hstgr.cloud/simuladores/simulador-litoral.html
- IMG_3289.PNG
- WhatsApp Image 2026-09-10 at 1.46.55 PM.jpeg

Este arquivo registra o pedido e propostas iniciais; não representa implementação concluída nem aprovação de decisões pendentes.
