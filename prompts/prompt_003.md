Número: Prompt 003

Título: Interface por Abas Mensais, Cadastro e Seleção de Múltiplos Perfis

Objetivo:
Desenvolver a interface visual de utilizador baseada em abas de navegação para os meses do ano (Janeiro a Dezembro) e os mecanismos interativos de gestão de perfis (selecionar perfil ativo, cadastrar um novo perfil com salário inicial e apagar um perfil existente), sincronizando as interações do DOM com o gerenciador de estado centralizado.

Contexto Atual:
Infraestrutura de pastas operacional, esqueleto de HTML estruturado, persistência ativa em LocalStorage e gerador/leitor de arquivos CSV codificados nos prompts anteriores.

Arquitetura Afetada:
* `index.html` (Inserção de botões de controle de perfil, barra de abas de meses e modal de cadastro de perfil)
* `js/ui.js` (Implementação de escutas de eventos e funções de renderização do DOM)
* `js/app.js` (Conexão inicial de inicialização e subscrição ao State)

Dependências:
* Prompt 002

Milestone:
Milestone 3 — Perfis e Abas Mensais

Complexidade:
Média

Tempo Estimado:
4 horas

Estimativa de Tokens:
~4.000 tokens

Arquivos Existentes:
* index.html
* js/ui.js
* js/state.js
* js/app.js

Arquivos Permitidos:
Qualquer arquivo dentro de `js/` ou `index.html`.

Arquivos Proibidos:
Nenhum.

Arquivos Criados:
Nenhum.

Arquivos Alterados:
* `index.html`
* `js/ui.js`
* `js/app.js`
* `CHANGELOG.md`

Arquivos Removidos:
Nenhum.

Implementação:

1. No arquivo `index.html`:
   - Adicionar uma barra superior ou lateral contendo:
     - Dropdown/Select para alternar de perfil dinamicamente.
     - Botão "Novo Perfil" que abre um formulário modal ou caixa de diálogo solicitando o nome do perfil e seu respectivo salário inicial.
     - Botão discreto para apagar o perfil ativo atual (com caixa de confirmação para segurança dos dados).
   - Desenvolver o elemento de Abas Mensais:
     - Uma barra horizontal responsiva contendo 12 botões/links correspondentes aos meses do ano (Janeiro, Fevereiro, ..., Dezembro) e mais um botão para "Relatório" (que ficará inativo até o Prompt 006).
     - Aplicar classes de estilização do Tailwind CSS destacando visualmente qual mês está "Ativo" no momento.
   - Criar uma área principal para exibição de conteúdo onde o salário base do perfil ativo do mês correspondente seja impresso de forma evidente, com um botão "Editar Salário" para ajuste de valores rápidos.

2. Desenvolver o renderizador em `js/ui.js`:
   - Método `init()`: Mapeia referências do DOM e anexa todos os escutadores de eventos de clique, troca de seleção e submissões de formulários.
   - Método `renderPerfis()`: Popula o select dropdown com os perfis cadastrados e ativa o perfil selecionado.
   - Método `renderAbas()`: Desenha as abas e adiciona a classe CSS ativa no mês corrente. Ao clicar numa aba de mês, altera a variável correspondente ao mês selecionado no Estado.
   - Método `renderSalario()`: Mostra o salário base correspondente ao perfil selecionado na tela.
   - Escutadores de Eventos:
     - Clique nos botões de abas -> Altera mês corrente no Estado -> Dispara re-render.
     - Selecionar Perfil -> Altera perfil ativo no Estado -> Dispara re-render.
     - Envio de formulário de "Novo Perfil" -> Chama `adicionarPerfil(nome, salario)` no Estado.
     - Clique no botão "Deletar Perfil" -> Confirmação -> Chama `removerPerfil(ativo)` no Estado.
     - Edição de Salário -> Input de dados -> Chama `atualizarSalario(novoValor)` no Estado.

3. Integrar no `js/app.js`:
   - Conectar a inicialização da UI.
   - Subscrever o método geral de renderização da UI no State Manager, de modo que sempre que houver modificações no estado (`subscribe`), a UI se redesenhe automaticamente.

Testes Necessários:
* Criar 3 perfis diferentes com salários variados e verificar se ao alternar entre eles a exibição dos salários e o dropdown de seleção atualizam de imediato.
* Clicar em cada uma das abas dos meses do ano e verificar se a aba selecionada recebe a estilização "ativa" e se o mês corrente muda de forma consistente.
* Testar deletar um perfil e conferir se o sistema seleciona automaticamente o perfil restante e se protege os dados por caixas de confirmação nativas (`confirm`).

Critérios de Aceite:
* O sistema de abas deve ser totalmente responsivo (visível e navegável em ecrãs móveis de smartphones).
* Modais de criação de perfis devem validar se o nome não está em branco e se o salário é um número positivo válido.
* Ao atualizar o salário ou alternar perfis, os novos dados devem persistir ao atualizar a página (LocalStorage ativo).

Definition of Done:
✓ Projeto inicia
✓ Build OK
✓ Sem erros no console
✓ Sem warnings críticos
✓ Navegação de abas funcionando de forma robusta
✓ CRUD de Perfis implementado e sincronizado
✓ CHANGELOG atualizado

Checklist:
[ ] Build OK
[ ] Projeto inicia
[ ] Sem erros
[ ] Sem warnings críticos
[ ] Navegação por abas de Janeiro a Dezembro operacional
[ ] Cadastro, seleção e remoção de perfis funcionais
[ ] Documentação atualizada
[ ] Manifesto atualizado
[ ] Changelog atualizado
[ ] History atualizado
[ ] MVP funcional

Próximos Passos:
Proceder para o Prompt 004 para criar os formulários de inserção de gastos categorizados, validações de parcelamentos de cartão de crédito e tabelas de listagem de despesas mensais.
