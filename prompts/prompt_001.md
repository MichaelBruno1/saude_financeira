Número: Prompt 001

Título: Projeto Base, Infraestrutura, Linter e Esqueleto HTML

Objetivo:
Configurar a infraestrutura inicial da aplicação de Saúde Financeira, estabelecendo a árvore física de pastas, arquivos de desenvolvimento (package.json para automação, eslint para linting) e o esqueleto estático inicial do index.html integrado com Tailwind CSS e Chart.js (via CDN ou referências locais), garantindo que a aplicação seja carregada sem erros pelo navegador via protocolo de arquivo local (file:///).

Contexto Atual:
Workspace completamente vazio. Fase de planejamento concluída e gravada na pasta `prompts/`.

Arquitetura Afetada:
Estrutura geral de pastas, dependências de desenvolvimento de linter/testes e arquivo index.html de base.

Dependências:
Nenhuma (Este é o ponto de entrada do projeto).

Milestone:
Milestone 1 — Projeto Inicial e Infraestrutura

Complexidade:
Baixa

Tempo Estimado:
3 horas

Estimativa de Tokens:
~3.500 tokens

Arquivos Existentes:
Nenhum (diretório limpo).

Arquivos Permitidos:
* package.json
* eslint.config.js
* index.html
* css/style.css
* js/app.js
* js/state.js
* js/storage.js
* js/engine.js
* js/ui.js
* js/charts.js
* README.md

Arquivos Proibidos:
Nenhum.

Arquivos Criados:
* `package.json`
* `eslint.config.js`
* `index.html`
* `css/style.css`
* `js/app.js`
* `js/state.js`
* `js/storage.js`
* `js/engine.js`
* `js/ui.js`
* `js/charts.js`
* `README.md`

Arquivos Alterados:
Nenhum.

Arquivos Removidos:
Nenhum.

Implementação:

1. Criar o arquivo `package.json` contendo scripts para desenvolvimento local ("dev" utilizando `lite-server`), execução de testes ("test" para o Vitest que será configurado no final) e linter ("lint" com ESLint).
   - Dependências de desenvolvimento: `lite-server`, `eslint`.

2. Criar a configuração básica de linting em `eslint.config.js` para validar código ECMAScript 6+ Vanilla.

3. Criar a estrutura física de diretórios:
   - `css/` para folha de estilos.
   - `js/` para as camadas lógicas de JavaScript Vanilla.

4. Desenvolver o arquivo `index.html` básico contendo:
   - Estrutura HTML5 padrão.
   - Carregamento do Tailwind CSS via CDN estável `<script src="https://cdn.tailwindcss.com"></script>` (garantindo que se possa estilizar a página sem dependências de build CSS local).
   - Carregamento da biblioteca Chart.js via CDN `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`.
   - Layout estático inicial contendo um container principal responsivo (Sidebar lateral com menu e cabeçalho, conteúdo centralizado com área para as abas dos meses e aba de relatórios).
   - Importação ordenada dos scripts JavaScript em tags `<script>` convencionais (para rodar diretamente em protocolo `file:///` sem dores de cabeça com CORS):
     ```html
     <script src="js/storage.js"></script>
     <script src="js/state.js"></script>
     <script src="js/engine.js"></script>
     <script src="js/charts.js"></script>
     <script src="js/ui.js"></script>
     <script src="js/app.js"></script>
     ```

5. Criar os arquivos de JavaScript em `js/` vazios, contendo apenas declarações de Namespaces ou escopos globais limpos para não poluir o escopo global do navegador e evitar conflitos. Exemplo:
   - Em `js/state.js`: `window.App = window.App || {}; window.App.State = { ... };`
   - Seguir este mesmo padrão para `Storage`, `Engine`, `Charts` e `UI` de modo a manter encapsulamento sem dependência de imports ES6 no protocolo local `file:///`.

6. Criar `css/style.css` para adicionar pequenas correções de layout e efeitos de transição das abas.

7. Criar `README.md` inicial do projeto documentando o propósito, como rodar o ambiente de desenvolvimento e arquitetura.

Testes Necessários:
* Executar `npm install` e verificar se todas as dependências de desenvolvimento foram instaladas com sucesso.
* Executar o linter `npm run lint` para garantir que o projeto inicia em conformidade de estilo.
* Executar `npm run dev` para iniciar o lite-server local e certificar que a página abre no navegador sem erros lógicos no console (F12).
* Testar abertura direta do `index.html` através de clique duplo (protocolo `file:///`) para assegurar compatibilidade absoluta.

Critérios de Aceite:
* O projeto deve compilar e rodar localmente de forma limpa.
* O console de ferramentas do desenvolvedor (F12) não deve exibir nenhuma mensagem de erro ou importação CORS falha.
* As dependências externas de Tailwind CSS e Chart.js devem estar devidamente integradas e acessíveis.

Definition of Done:
✓ Projeto inicia
✓ Build OK
✓ Sem erros
✓ Sem warnings críticos
✓ Linter aprovado
✓ Projeto executa localmente
✓ Funcionalidade validada
✓ README atualizado

Checklist:
[ ] Build OK
[ ] Projeto inicia
[ ] Sem erros
[ ] Sem warnings críticos
[ ] Testes passando
[ ] Documentação atualizada
[ ] Manifesto atualizado
[ ] Changelog atualizado
[ ] History atualizado
[ ] MVP funcional

Próximos Passos:
Proceder para o Prompt 002 para desenvolver o gerenciador de estado centralizado em RAM e os motores de persistência em LocalStorage e leitura/geração de strings do arquivo CSV.
