# ADR-002: Persistência via LocalStorage com Serialização JSON

> **Status**: Aceito  
> **Data**: 2026-06-30  
> **Decisores**: Equipe de desenvolvimento

---

## Contexto

A aplicação precisa persistir dados entre sessões do navegador sem depender de servidor externo, banco de dados remoto ou sistema de arquivos do sistema operacional.

## Decisão

Utilizar **`localStorage`** do navegador como mecanismo primário de persistência, com serialização do estado completo como **JSON** sob a chave `saude_financeira_db`.

## Consequências

### Positivas
- ✅ Nativo ao navegador, sem instalação.
- ✅ Persistência automática e síncrona via observer pattern.
- ✅ Fácil de inspecionar e depurar (DevTools → Application → LocalStorage).
- ✅ Funciona offline e no protocolo `file:///`.

### Negativas
- ❌ Limite de ~5MB por origem — pode ser insuficiente para históricos muito longos.
- ❌ Dados perdidos se o usuário limpar o cache do navegador.
- ❌ Não compartilhável entre dispositivos sem exportar CSV manualmente.
- ❌ Sem suporte a queries complexas ou indexação nativa.

## Alternativas Consideradas

| Alternativa      | Motivo de Rejeição                                  |
|------------------|-----------------------------------------------------|
| IndexedDB        | API mais complexa sem ganho real para o volume de dados esperado |
| WebSQL           | Depreciado nos padrões web modernos                 |
| Arquivo JSON local | Requer File System Access API (permissões extras) |
| Backend próprio  | Viola a restrição de privacidade e operação offline |

## Estratégia de Migração

Se o volume de dados crescer, a migração para IndexedDB pode ser feita preservando o JSON como formato intermediário, sem alterar o `state.js`.
