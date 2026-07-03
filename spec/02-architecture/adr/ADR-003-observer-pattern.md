# ADR-003: Observer Pattern para Reatividade do Estado

> **Status**: Aceito  
> **Data**: 2026-06-30  
> **Decisores**: Equipe de desenvolvimento

---

## Contexto

A aplicação possui múltiplos consumidores que precisam reagir a mudanças no estado: a UI precisa re-renderizar, o storage precisa persistir, e os gráficos precisam ser redesenhados. É necessário um mecanismo de propagação de mudanças desacoplado.

## Decisão

Implementar o **Observer Pattern (Publisher/Subscriber)** diretamente no `state.js`, onde o State é o Subject e `ui.js` e `storage.js` são Observers registrados via `subscribe()`.

```javascript
// Registro de observers no app.js
App.State.subscribe((state) => App.UI.render(state));
App.State.subscribe((state) => App.Storage.saveToLocalStorage(state));
```

## Consequências

### Positivas
- ✅ Desacoplamento total: o `state.js` não importa nem referencia `ui.js` ou `storage.js`.
- ✅ Fácil adição de novos observers sem modificar o `state.js`.
- ✅ Re-renderização automática a cada mutação de dados.
- ✅ Persistência automática sem chamadas explícitas no código de UI.

### Negativas
- ❌ Re-renderização total da UI a cada mutação (sem re-renderização parcial/seletiva).
- ❌ Se muitas mutações ocorrerem em sequência, pode causar redundância de renderizações.
- ❌ Debugging de fluxo de dados pode ser menos óbvio para desenvolvedores novatos.

## Implementação

```javascript
// state.js - implementação interna
const _listeners = [];

function notify() {
  const stateCopy = JSON.parse(JSON.stringify(_state));
  _listeners.forEach(callback => {
    try { callback(stateCopy); }
    catch(err) { console.error("Erro no listener:", err); }
  });
}

// API pública
subscribe(callback) {
  _listeners.push(callback);
  return () => { /* unsubscribe */ };
}
```

## Alternativas Consideradas

| Alternativa          | Motivo de Rejeição                               |
|----------------------|--------------------------------------------------|
| Chamadas diretas     | Alto acoplamento entre módulos                   |
| Custom Events (DOM)  | Acoplamento ao DOM, mais verboso                 |
| Redux/Zustand        | Dependência externa, incompatível com restrições |
| Proxy JavaScript     | Menos explícito, depuração mais difícil          |
