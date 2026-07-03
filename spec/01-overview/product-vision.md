# Visão do Produto — Saúde Financeira

> **Spec Layer**: Overview  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-07-02

---

## 1. Declaração do Produto

**Saúde Financeira** é uma aplicação web de gestão orçamentária pessoal, executada inteiramente no navegador do usuário sem dependência de servidores, contas ou conexão com a internet, garantindo privacidade total e controle absoluto sobre os dados financeiros.

---

## 2. Problema que Resolve

| Problema                                       | Solução                                                      |
|------------------------------------------------|--------------------------------------------------------------|
| Apps financeiros exigem envio de dados para a nuvem | Tudo fica no `LocalStorage` do navegador do próprio usuário |
| Dificuldade em projetar parcelamentos longos   | Motor matemático distribui parcelas automaticamente por meses/anos |
| Financiamentos imobiliários são difíceis de simular | Simulador SAC com taxa TR e amortização extraordinária integrado |
| Falta de controle sobre gastos por categoria  | Planejador financeiro com 3 perfis de controle e alertas em tempo real |

---

## 3. Visão de Longo Prazo

> "Ser a ferramenta financeira pessoal mais simples, privada e poderosa que um usuário pode usar diretamente no seu navegador, sem instalar nada."

---

## 4. Objetivos do Produto

### 4.1. Objetivos de Negócio

- **OB-01**: Permitir que qualquer usuário gerencie seus gastos mensais sem criar conta nem fornecer dados pessoais.
- **OB-02**: Garantir que os dados do usuário jamais saiam do dispositivo dele, exceto por exportação explícita.
- **OB-03**: Oferecer projeções financeiras precisas de longo prazo (parcelamentos e financiamentos).
- **OB-04**: Ser utilizável como um único arquivo `index.html` sem etapa de build.

### 4.2. Objetivos Técnicos

- **OT-01**: Zero dependências de runtime em produção (apenas Tailwind CSS e Chart.js via CDN).
- **OT-02**: Tempo de carregamento < 2 segundos em conexão lenta (arquivos estáticos).
- **OT-03**: Sem erros JavaScript no console em qualquer navegador moderno (Chrome, Firefox, Edge, Safari).
- **OT-04**: Compatibilidade com protocolo `file:///` (abertura por clique duplo no arquivo).

---

## 5. Personas

### Persona 1: Carlos — O Controlador

- **Perfil**: 35 anos, desenvolvedor, família de 4 pessoas.
- **Dor**: Gasta com cartão de crédito parcelado e perde o controle de quantas parcelas ainda estão ativas.
- **Ganho com o produto**: Visualiza em cada mês exatamente quais parcelas estão ativas e quanto restará de saldo.

### Persona 2: Mariana — A Investidora

- **Perfil**: 29 anos, analista de dados, solteira, quer montar uma reserva.
- **Dor**: Não sabe quanto pode destinar ao investimento sem comprometer as despesas fixas.
- **Ganho com o produto**: O Planejador Financeiro mostra qual percentual do salário vai para cada categoria e quanto sobra para investir.

### Persona 3: Roberto — O Financiado

- **Perfil**: 45 anos, financiou um apartamento e um carro, quer entender o custo real dos juros.
- **Dor**: Não sabe o impacto real de pagar R$ 500 a mais por mês no saldo devedor.
- **Ganho com o produto**: Simulador SAC mostra economia de juros e meses poupados com amortizações extras.

---

## 6. Funcionalidades Mapeadas (Feature Flags)

| ID         | Funcionalidade                       | Status         | Desde   |
|------------|--------------------------------------|----------------|---------|
| `FEAT-001` | Múltiplos Perfis                     | ✅ Produção     | v0.2.0  |
| `FEAT-002` | Abas Multi-Anuais Dinâmicas          | ✅ Produção     | v0.7.0  |
| `FEAT-003` | CRUD de Despesas                     | ✅ Produção     | v0.4.0  |
| `FEAT-004` | Parcelamento de Cartão               | ✅ Produção     | v0.5.0  |
| `FEAT-005` | Despesas Recorrentes                 | ✅ Produção     | v0.6.1  |
| `FEAT-006` | Financiamentos e Contratos           | ✅ Produção     | v0.6.1  |
| `FEAT-007` | Simulador de Amortização SAC         | ✅ Produção     | v0.6.1  |
| `FEAT-008` | Dashboard de Relatórios              | ✅ Produção     | v0.6.0  |
| `FEAT-009` | Gráfico Donut por Categoria          | ✅ Produção     | v0.6.0  |
| `FEAT-010` | Gráfico de Linha do Cartão           | ✅ Produção     | v0.6.0  |
| `FEAT-011` | Planejador Financeiro                | ✅ Produção     | v1.0.0  |
| `FEAT-012` | Categorias Customizadas              | ✅ Produção     | v0.8.0  |
| `FEAT-013` | Paleta de Cores por Categoria        | ✅ Produção     | v0.8.0  |
| `FEAT-014` | Modo Claro / Modo Escuro             | ✅ Produção     | v0.8.0  |
| `FEAT-015` | Exportação CSV por Perfil            | ✅ Produção     | v0.9.0  |
| `FEAT-016` | Importação Incremental CSV           | ✅ Produção     | v0.9.0  |
| `FEAT-017` | Análise Financeira com IA (LLM)      | ✅ Produção     | v1.1.0  |

---

## 7. Não Escopo (Out of Scope)

Os itens a seguir estão explicitamente fora do escopo do produto:

- ❌ Autenticação de usuário (login/senha/OAuth)
- ❌ Sincronização em nuvem ou banco de dados remoto
- ❌ Aplicativo móvel nativo (iOS/Android)
- ❌ Integração bancária automática (Open Finance)
- ❌ Notificações push ou emails
- ❌ Modo multiusuário/colaborativo
- ❌ Build de produção ou bundler (Webpack/Vite)

---

## 8. Métricas de Sucesso

| Métrica                                         | Meta       |
|-------------------------------------------------|------------|
| Erros JS no console ao abrir o app             | 0          |
| Tempo para carregar o app (protocolo `file:///`) | < 1s     |
| Tempo de resposta ao adicionar uma despesa      | < 100ms    |
| Cobertura de testes das funções do `engine.js` | > 80%      |
