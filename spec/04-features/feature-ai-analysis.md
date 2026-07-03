# Feature Spec: Análise Financeira com IA

> **Spec Layer**: Features  
> **ID**: `FEAT-017`  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-07-02

---

## 1. Visão Geral

A feature de Análise Financeira com IA permite ao usuário enviar os dados do seu perfil financeiro para uma LLM (Large Language Model) local ou remota compatível com a API OpenAI, recebendo um diagnóstico personalizado em Markdown.

---

## 2. Configuração da LLM

A configuração é feita no arquivo `llm_config.js` (ignorado no `.gitignore` por segurança):

```javascript
window.App.LlmConfig = {
  "apiUrl": "http://localhost:1234/v1",  // URL base da API OpenAI-compatible
  "apiKey": "sua-chave-aqui",           // API Key (ou "llm-studio" para LM Studio)
  "model": "qwen/qwen3-14b"             // Modelo a ser utilizado
};
```

**LLMs compatíveis**: LM Studio, Ollama (com plugin OpenAI), GPT-4o, Claude, etc.

---

## 3. Fluxo de Geração de Análise

```
1. Usuário acessa a aba "Relatórios" → seção "Análise Financeira"
2. Usuário clica em "Gerar análise inteligente"
3. UI coleta os dados:
   a. Perfil ativo (nome, salário)
   b. Método de planejamento selecionado
   c. Limites do planejador para o método
   d. Resumo de gastos do mês atual (por categoria)
   e. Detalhes de todas as despesas do mês
   f. Detalhes de todos os financiamentos
4. UI preenche o template de prompt carregado dinamicamente com os dados interpolados
5. UI faz fetch() para:
   POST {apiUrl}/chat/completions
   Headers: { Authorization: "Bearer {apiKey}", Content-Type: "application/json" }
   Body: { model, messages: [{ role: "user", content: promptPreenchido }] }
6. UI exibe a resposta em Markdown no painel de análise
```

---

## 4. Template de Prompt

O template (`prompts/analise.md`) é carregado via fetch (ou fallback local) e contém os seguintes placeholders:

| Placeholder               | Substituído por                              |
|---------------------------|----------------------------------------------|
| `{{PERFIL}}`              | Nome do perfil ativo                         |
| `{{SALARIO}}`             | Salário base formatado em BRL                |
| `{{METODO_PLANEJADOR}}`   | Ex: "Conservador"                            |
| `{{LIMITES_PLANEJADOR}}`  | Tabela de limites por categoria              |
| `{{GASTOS_REAIS}}`        | Resumo por categoria (R$ e %)                |
| `{{DETALHE_DESPESAS}}`    | Lista de despesas detalhadas do mês          |
| `{{DETALHE_FINANCIAMENTOS}}` | Lista de financiamentos ativos            |

---

## 5. Estrutura da Resposta Esperada (Markdown)

A LLM é instruída a retornar 5 seções:

1. **🩺 Saúde Financeira** — Classificação (Excelente/Boa/Atenção/Crítica) + 3 frases explicativas.
2. **📊 Comparação com o Planejamento** — ✅ dentro da meta / ⚠️ próximo / 🚨 acima.
3. **💡 O que Fazer Agora** — Até 5 ações práticas por impacto.
4. **💰 Para Onde Seu Dinheiro Está Indo** — Categorias com maior consumo.
5. **🔮 Se Nada Mudar...** — Projeção anual: saldo estimado, riscos e oportunidades.

---

## 6. Tratamento de Erros

### Erro de CORS (protocolo `file:///`)
```
Dica: Para usar a análise com IA via servidor local (LM Studio/Ollama),
execute com: npm run dev
Ou habilite CORS wildcard no servidor (ex: --cors-allow-origin=* no LM Studio).
```

### Outros Erros de Rede
Exibir mensagem de erro genérica com detalhes do erro HTTP.

---

## 7. Critérios de Aceite

- `CA-1`: O botão de análise envia os dados corretos do perfil ativo para a API configurada.
- `CA-2`: A resposta é renderizada como Markdown no painel de análise.
- `CA-3`: Em caso de erro de CORS via `file:///`, a dica de resolução é exibida claramente.
- `CA-4`: A API Key não é exposta no repositório (`llm_config.js` está no `.gitignore`).
- `CA-5`: Se `llm_config.js` não estiver configurado, o botão exibe mensagem orientativa.
