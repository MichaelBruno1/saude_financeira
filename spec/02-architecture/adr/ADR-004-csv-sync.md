# ADR-004: Sincronização Física via CSV

> **Status**: Aceito  
> **Data**: 2026-06-30  
> **Decisores**: Equipe de desenvolvimento

---

## Contexto

A aplicação precisa de um mecanismo de backup e transferência de dados entre dispositivos sem depender de servidor ou conta. O usuário deve conseguir levar seus dados de um computador para outro.

## Decisão

Implementar **exportação e importação incremental de perfis via arquivos CSV**, com suporte a dois tipos de registro (`despesa` e `financiamento`) em um formato de cabeçalho padronizado.

## Formato CSV Definido

```
perfil,salario_base,tipo_registro,descricao,valor,categoria,mes_inicio,ano_inicio,parcelas,recorrente,valor_parcela,taxa_tr
```

## Comportamento de Importação

- **Perfil existente**: atualiza salário, remove despesas/financiamentos anteriores e reimporta do CSV.
- **Perfil novo**: cria o perfil e importa os dados.
- **Retrocompatibilidade**: colunas ausentes no CSV são tratadas com fallbacks defensivos.

## Consequências

### Positivas
- ✅ Formato universal, abrível em Excel, Google Sheets e qualquer editor de texto.
- ✅ Sem dependência de conta, servidor ou aplicativo externo.
- ✅ Importação incremental preserva outros perfis já existentes.
- ✅ Compatibilidade retroativa permite abrir arquivos de versões anteriores.

### Negativas
- ❌ Não é automático (requer ação manual do usuário para exportar/importar).
- ❌ Não substitui sincronização em tempo real entre dispositivos.
- ❌ Perde configurações de categorias, cores e planejamento (não exportadas).

## Alternativas Consideradas

| Alternativa       | Motivo de Rejeição                                        |
|-------------------|-----------------------------------------------------------|
| JSON bruto        | Menos acessível para usuários não-técnicos               |
| QR Code           | Limitado em tamanho para históricos com muitas despesas   |
| Dropbox/Drive API | Requer conta e permissões OAuth, viola privacidade        |
| SQLite WASM       | Alta complexidade de integração para o escopo do projeto  |
