# Spec do Módulo: App Bootstrap (`app.js`)

> **Spec Layer**: Modules  
> **Arquivo**: [`js/app.js`](file:///c:/projetos/saude_financeira/js/app.js)  
> **Namespace**: *(sem namespace próprio — orquestrador puro)*  
> **Versão**: 1.1.2

---

## 1. Responsabilidade

O `app.js` é o **ponto de entrada e orquestrador do ciclo de vida** da aplicação. Ele é o último script carregado e é responsável por:

1. Aguardar o DOM estar completamente carregado.
2. Inicializar os event listeners da UI.
3. Registrar os observers reativos (UI e Storage) no State.
4. Carregar os dados persistidos ou provisionar o perfil inicial.

---

## 2. Fluxo de Bootstrap (Sequencial)

```javascript
document.addEventListener("DOMContentLoaded", () => {

  // Passo 1: Inicializar event listeners da UI
  window.App.UI.init();

  // Passo 2: Observer — UI reage a mudanças de estado
  window.App.State.subscribe((state) => {
    window.App.UI.render(state);
  });

  // Passo 3: Observer — Storage persiste a cada mudança de estado
  window.App.State.subscribe((state) => {
    window.App.Storage.saveToLocalStorage(state);
  });

  // Passo 4: Carregar dados persistidos
  const savedState = window.App.Storage.loadFromLocalStorage();

  if (savedState && Array.isArray(savedState.perfis) && savedState.perfis.length > 0) {
    // Caminho "retorno": dados existentes → carrega o estado
    window.App.State.loadState(savedState);
  } else {
    // Caminho "primeira vez": sem dados → cria perfil demonstrativo
    window.App.State.adicionarPerfil("Principal", 3000.00);
  }

  // O notify() disparado por loadState ou adicionarPerfil
  // aciona os 2 observers acima automaticamente.
});
```

---

## 3. Critérios de Funcionamento Correto

| Critério                                     | Verificação                                     |
|----------------------------------------------|-------------------------------------------------|
| `DOMContentLoaded` dispara antes de executar | Garantido pelo event listener                   |
| Todos os módulos estão carregados            | Garantido pela ordem dos `<script>` no HTML     |
| Observers registrados antes do `loadState`   | Garantido pela ordem sequencial do bootstrap    |
| Primeira renderização ocorre automaticamente | `loadState` ou `adicionarPerfil` chama `notify()` |

---

## 4. Perfil Demonstrativo Padrão

Quando não há dados no localStorage:

```javascript
window.App.State.adicionarPerfil("Principal", 3000.00);
```

- **Nome**: "Principal"
- **Salário**: R$ 3.000,00
- **Despesas**: nenhuma (tabela vazia)

---

## 5. Diagrama de Sequência do Bootstrap

```
DOMContentLoaded
      │
      ├─► UI.init()          → Registra event listeners no DOM
      │
      ├─► State.subscribe()  → Observer 1: UI.render()
      │
      ├─► State.subscribe()  → Observer 2: Storage.save()
      │
      └─► Storage.load()
              │
              ├─► [Dados encontrados] → State.loadState(savedState)
              │                              └─► notify()
              │                                    ├─► UI.render(state)
              │                                    └─► Storage.save(state)
              │
              └─► [Sem dados] → State.adicionarPerfil("Principal", 3000)
                                       └─► notify()
                                             ├─► UI.render(state)
                                             └─► Storage.save(state)
```
