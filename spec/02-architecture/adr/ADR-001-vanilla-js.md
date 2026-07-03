# ADR-001: Uso de Vanilla JavaScript sem Frameworks

> **Status**: Aceito  
> **Data**: 2026-06-29  
> **Decisores**: Equipe de desenvolvimento

---

## Contexto

O projeto precisa ser executado diretamente via protocolo `file:///` (clique duplo no `index.html`) sem etapa de build, sem servidor e sem instalação. A escolha do runtime JavaScript afeta diretamente a portabilidade e a complexidade de distribuição.

## Decisão

Utilizar **Vanilla JavaScript (ES2022)** sem frameworks client-side (sem React, Vue, Angular, Svelte ou similares).

## Consequências

### Positivas
- ✅ Zero dependências de runtime em produção.
- ✅ Funciona via protocolo `file:///` sem restrições de módulos ES.
- ✅ Arquivo único `index.html` distribuível por qualquer canal (email, pen drive, etc.).
- ✅ Sem necessidade de `npm install` para usar em produção.
- ✅ Sem overhead de Virtual DOM ou reatividade de framework.

### Negativas
- ❌ Sem tipagem estática nativa (mitigado parcialmente pelo JSDoc e ESLint).
- ❌ Manipulação DOM imperativa é mais verbosa que templates declarativos.
- ❌ Sem sistema de componentes reusáveis nativo (UI é monolítica em `ui.js`).
- ❌ Dificuldade de escalar o `ui.js` para funcionalidades muito complexas.

## Alternativas Consideradas

| Alternativa | Motivo de Rejeição |
|-------------|-------------------|
| React       | Requer build (Babel/Webpack), incompatível com `file:///` |
| Vue 3 CDN   | Compatível, mas adiciona complexidade de template compilado |
| Lit Elements | Experimental, menos documentação para projetos offline |
| Alpine.js   | Válido, mas adiciona dependência CDN não essencial |
