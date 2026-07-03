# Feature Spec: Sincronização CSV

> **Spec Layer**: Features  
> **ID**: `FEAT-015` + `FEAT-016`  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-06-30

---

## 1. Visão Geral

A sincronização física via CSV permite ao usuário fazer backup completo de um perfil e transferi-lo entre dispositivos sem depender de nuvem ou servidor.

---

## 2. Exportação

### Trigger
Botão "Exportar CSV" no rodapé da sidebar, associado ao perfil ativo.

### Comportamento
1. Captura os dados do perfil ativo do estado atual.
2. Chama `Storage.convertToCSV(data, perfilAtivo)`.
3. Dispara o download via `Storage.exportAsCSVFile()`.

### Nome do Arquivo
```
saude_financeira_perfil_{nome}_{timestamp}.csv
Exemplo: saude_financeira_perfil_Principal_1751550000000.csv
```

### Dados Exportados
- ✅ Despesas do perfil ativo
- ✅ Financiamentos do perfil ativo
- ✅ Salário base do perfil
- ❌ Categorias customizadas e cores (não exportadas)
- ❌ Configurações de planejamento (não exportadas)
- ❌ Outros perfis (cada exportação é de um único perfil)

---

## 3. Importação

### Trigger
Botão "Importar CSV" no rodapé da sidebar, abre seletor de arquivo (`<input type="file">`).

### Fluxo de Importação Incremental

```
1. Usuário seleciona arquivo .csv
2. FileReader.readAsText() lê o conteúdo
3. Storage.parseFromCSV(csvText) faz o parse
4. State.importarPerfilCSV(parsedData) realiza a importação:

   Para cada perfil no CSV:
     SE perfil já existe:
       ├── Atualiza o salário
       └── Limpa e reimporta despesas + financiamentos do perfil
     SE perfil é novo:
       └── Cria o perfil e importa os dados
   
   Define o primeiro perfil importado como perfilAtivo
   Chama notify() → UI re-renderiza → Storage salva
```

### Retrocompatibilidade

Arquivos CSV de versões anteriores são suportados:

| Versão | Comportamento ao faltar colunas novas                      |
|--------|------------------------------------------------------------|
| Pré-v0.7.0 | `ano_inicio` = ano atual, `recorrente` = false         |
| Pré-v0.9.0 | `tipo_registro` = "despesa", `valor_parcela` = valor/parcelas, `taxa_tr` = 0 |

---

## 4. Formato CSV Completo

Veja a spec detalhada em [`06-data-formats/csv-format.md`](../06-data-formats/csv-format.md).

---

## 5. Critérios de Aceite

- `CA-1`: Exportar e reimportar o mesmo CSV resulta em dados idênticos.
- `CA-2`: Importar CSV de perfil existente preserva os outros perfis no localStorage.
- `CA-3`: Importar CSV de perfil novo cria o perfil e o seleciona como ativo.
- `CA-4`: Importar CSV antigo (sem `ano_inicio`) não causa erros ou perda de dados.
- `CA-5`: O nome do arquivo exportado inclui o nome do perfil e o timestamp.
- `CA-6`: Perfis sem despesas nem financiamentos são exportados com linha vazia para preservar o perfil.
