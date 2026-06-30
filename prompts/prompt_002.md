Número: Prompt 002

Título: Core de Estado Reativo e Mecanismo de Persistência CSV / LocalStorage

Objetivo:
Implementar a lógica centralizada de controle de dados no State Manager (`js/state.js`) e as funções de persistência, leitura e escrita física de dados em LocalStorage e conversor de texto estruturado para arquivos CSV em `js/storage.js`.

Contexto Atual:
Infraestrutura de pastas configurada e esqueleto HTML importando os scripts vazios com namespaces globais em conformidade com o Prompt 001.

Arquitetura Afetada:
* `js/state.js` (Gerenciador de Estado em memória RAM)
* `js/storage.js` (Mecanismo de parse/build CSV e gravação física em LocalStorage)
* `index.html` (Inserção de botões de teste ou controle de salvamento na UI)

Dependências:
* Prompt 001

Milestone:
Milestone 2 — Core de Estado e Armazenamento CSV/LocalStorage

Complexidade:
Média

Tempo Estimado:
4 horas

Estimativa de Tokens:
~4.200 tokens

Arquivos Existentes:
* index.html
* js/state.js
* js/storage.js
* js/app.js

Arquivos Permitidos:
Qualquer arquivo dentro de `js/` ou `index.html`.

Arquivos Proibidos:
Nenhum.

Arquivos Criados:
Nenhum (os arquivos vazios foram criados no setup do Prompt 001).

Arquivos Alterados:
* `js/state.js`
* `js/storage.js`
* `js/app.js`
* `index.html` (para botões iniciais de salvar/importar e feedback visual)
* `CHANGELOG.md` (criado ou atualizado)

Arquivos Removidos:
Nenhum.

Implementação:

1. Desenvolver o State Manager em `js/state.js`:
   - Estrutura interna em memória RAM para manter:
     ```javascript
     {
       perfis: [], // Array de objetos { nome, salario }
       perfilAtivo: null, // String contendo o nome do perfil selecionado
       despesas: [] // Array de objetos despesas: { perfil, descricao, valor, categoria, mes_inicio, parcelas }
     }
     ```
   - Métodos reativos para:
     - `adicionarPerfil(nome, salario)`
     - `selecionarPerfil(nome)`
     - `removerPerfil(nome)`
     - `atualizarSalario(valor)`
     - `adicionarDespesa(descricao, valor, categoria, mes_inicio, parcelas)`
     - `removerDespesa(id)`
   - Implementar um sistema de callbacks simples ("Listeners") onde partes da UI podem se registrar para serem notificadas automaticamente sempre que houver alteração no estado (`subscribe(callback)`).

2. Desenvolver o Storage Engine em `js/storage.js`:
   - Método `saveToLocalStorage(data)`: Serializa o estado em JSON e o guarda de forma segura na chave `saude_financeira_db`.
   - Método `loadFromLocalStorage()`: Recupera os dados do LocalStorage, efetuando o parse com tratamento de erro e retornando um objeto de estado íntegro ou dados padrão caso esteja vazio.
   - Método `convertToCSV(data)`: Transforma os dados em string CSV contendo o cabeçalho padronizado: `perfil,salario_base,descricao,valor,categoria,mes_inicio,parcelas`.
   - Método `parseFromCSV(csvText)`: Recebe uma string CSV do utilizador, valida a integridade do formato, processa cada linha, cria as entidades no formato correto em memória RAM e reconstrói o estado completo da aplicação.
   - Método `exportAsCSVFile()`: Despoleta o download automático de um arquivo `.csv` no navegador contendo os dados do perfil ativo ou dados gerais de todos os perfis.
   - Sincronização automática: Adicionar um gatilho para que qualquer modificação no estado invoque a gravação silenciosa no LocalStorage.

3. Integrar no arquivo principal `js/app.js` a inicialização correta de carregamento de dados ao abrir a aplicação. Se houver dados no LocalStorage, carregar de imediato; caso contrário, inicializar com um perfil demonstrativo padrão (ex: "Principal", Salário: 3000.00).

4. Adicionar na barra lateral de `index.html` elementos básicos de importação de arquivos para que o usuário consiga fazer upload do seu arquivo CSV e botões para baixar/exportar os dados em formato CSV físico.

Testes Necessários:
* Cadastrar um perfil demonstrativo, inserir dados fictícios e recarregar a página para certificar que o LocalStorage persiste os dados.
* Efetuar o download do arquivo CSV gerado e checar se o formato, delimitador (vírgula ou ponto e vírgula) e colunas batem rigorosamente com a especificação técnica do manifesto.
* Efetuar o upload de um arquivo CSV de testes válido e checar se o estado de múltiplos perfis é perfeitamente atualizado e renderizado na tela.

Critérios de Aceite:
* O sistema deve sincronizar o estado no LocalStorage a cada alteração, sem atrasos visíveis.
* O parser de CSV deve ignorar espaços em branco extras, tratar quebras de linha (`\r\n` e `\n`) de forma resiliente e lançar alertas amigáveis em caso de arquivo corrompido ou colunas faltantes.
* O arquivo CSV gerado por exportação deve poder ser lido perfeitamente pelo próprio importador da aplicação.

Definition of Done:
✓ Projeto inicia
✓ Build OK
✓ Sem erros no console
✓ Sem warnings críticos
✓ LocalStorage persistindo automaticamente
✓ Download e Upload de CSV integrados e validados de forma manual
✓ CHANGELOG atualizado

Checklist:
[ ] Build OK
[ ] Projeto inicia
[ ] Sem erros
[ ] Sem warnings críticos
[ ] Persistência em LocalStorage funcional
[ ] Parser/Export de CSV validado com dados reais
[ ] Documentação atualizada
[ ] Manifesto atualizado
[ ] Changelog atualizado
[ ] History atualizado
[ ] MVP funcional

Próximos Passos:
Proceder para o Prompt 003 para construir a interface visual de Abas Mensais dinâmicas (Janeiro a Dezembro) e os formulários interativos de gestão de perfis e alteração de salários.
