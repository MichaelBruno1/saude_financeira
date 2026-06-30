Número: Prompt 007

Título: Suite de Testes Automáticos com Vitest, Hardening e Entrega da Documentação

Objetivo:
Implementar uma bateria sólida de testes unitários automatizados utilizando a biblioteca Vitest no diretório `tests/` para blindar as regras matemáticas e as rotinas de persistência e exportação de CSV, além de aplicar refinamentos visuais de tratamento de erros e concluir a documentação do usuário final no README.md.

Contexto Atual:
A aplicação de Saúde Financeira está com 100% de suas funcionalidades visuais e lógicas operacionais e integradas localmente (Perfis, Abas, Despesas, Parcelamentos, Motor Financeiro, Persistência Local e Dashboard com Gráficos).

Arquitetura Afetada:
* `package.json` (Configuração definitiva do Vitest nos scripts de teste)
* `js/engine.js` (Adição de pequenas otimizações caso os testes detectem furos de regras)
* `js/storage.js` (Garantia de tolerância a falhas em parsers via testes de estresse de arquivos CSV corrompidos)
* `README.md` (Instruções detalhadas finais)

Dependências:
* Prompt 006

Milestone:
Milestone 7 — Testes e Entrega Final

Complexidade:
Média

Tempo Estimado:
3 horas

Estimativa de Tokens:
~3.500 tokens

Arquivos Existentes:
* package.json
* js/engine.js
* js/storage.js
* README.md

Arquivos Permitidos:
Qualquer arquivo do projeto.

Arquivos Proibidos:
Nenhum.

Arquivos Criados:
* `tests/engine.test.js` (Testes unitários do motor de cálculos)
* `tests/storage.test.js` (Testes unitários de parser e escrita de CSV)

Arquivos Alterados:
* `package.json`
* `README.md`
* `CHANGELOG.md`

Arquivos Removidos:
Nenhum.

Implementação:

1. Atualizar o `package.json` para suportar o Vitest:
   - Adicionar o comando `"test": "vitest run"` e `"test:watch": "vitest"` nos scripts de automação.
   - Instalar o Vitest como dependência de desenvolvimento executando o comando de instalação apropriado de forma local.

2. Desenvolver o arquivo de testes lógicos `tests/engine.test.js`:
   - Testar o comportamento das funções matemáticas do `js/engine.js`:
     - Validar se compras não parceladas são computadas apenas no mês de origem.
     - Validar se compras parceladas de cartão distribuem o valor das parcelas linearmente e com precisão decimal matemática.
     - Validar se compras de cartão de crédito iniciadas no fim do ano cruzam o limiar para o ano subsequente de forma íntegra.
     - Validar o cálculo de fatias orçamentárias (porcentagem que cada categoria consome do salário).
     - Validar se o saldo restante é calculado como `salario - gastos` de forma impecável.

3. Desenvolver o arquivo de testes de persistência `tests/storage.test.js`:
   - Testar as regras do `js/storage.js`:
     - Testar se a conversão de dados do estado para string CSV está gerando cabeçalhos e aspas no formato esperado.
     - Testar se o parser de string CSV reconstrói os perfis e saldos idênticos aos de origem.
     - Injetar strings CSV intencionalmente malformadas (com cabeçalhos ausentes, vírgulas faltando, tipos de dados incompatíveis de salário) e certificar que o parser recupera-se ou trata com erros amigáveis sem derrubar/quebrar a execução do Javascript.

4. Aplicar o Hardening da aplicação:
   - Garantir compatibilidade absoluta offline e para clique duplo no `index.html` (com protocolo `file:///`), certificando-se de que não haja referências quebradas ou módulos incompatíveis de CORS ativos.
   - Tratar cenários extremos do usuário de inputs vazios ou absurdos nos salários e gastos.

5. Atualizar e polir o `README.md` final do projeto com:
   - Detalhamento de funcionalidades do sistema.
   - Passo a passo de instalação de dependências e execução do ambiente de testes e de desenvolvimento local (`npm run dev` e `npm run test`).
   - Guia de utilização dos recursos de backup e importação de dados por arquivo CSV.

6. Atualizar a documentação contínua da pasta `prompts/` colocando os status de todos os índices, manifesto e histórico como atualizados e prontos.

Testes Necessários:
* Executar `npm run test` e verificar se toda a suite de testes unitários passa com 100% de sucesso (Zero erros).
* Gerar relatórios de cobertura (se desejável) confirmando a blindagem da lógica financeira crítica de negócios.

Critérios de Aceite:
* Os testes automatizados devem rodar em ambiente Windows sem requerer configurações complexas adicionais.
* A suite de testes deve cobrir com fidelidade cenários normais e limites extremos de parcelas e salários negativos.
* A documentação do README.md final deve estar extremamente clara, legível e em formato Markdown profissional.

Definition of Done:
✓ Projeto inicia
✓ Build OK
✓ Sem erros no console
✓ Testes passando com 100% de aproveitamento (Vitest)
✓ Linter aprovado e sem warnings críticos
✓ Compatibilidade estrita offline / file:/// homologada
✓ Documentação de README.md atualizada
✓ Manifesto, Índices, Histórico e Documentos de planejamento sincronizados
✓ CHANGELOG atualizado com todas as fases

Checklist:
[ ] Build OK
[ ] Projeto inicia
[ ] Sem erros
[ ] Sem warnings críticos
[ ] Testes passando (Vitest aprovado)
[ ] Documentação atualizada (README completo de utilizador)
[ ] Manifesto atualizado
[ ] Changelog atualizado
[ ] History atualizado
[ ] MVP funcional pronto para entrega

Próximos Passos:
Fim do ciclo evolutivo planejado. O sistema de Saúde Financeira Pessoal Local está totalmente pronto para produção e uso estrito do usuário final.
