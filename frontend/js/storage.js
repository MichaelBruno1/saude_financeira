// Namespace global
window.App = window.App || {};

window.App.Storage = (() => {
  const LOCAL_STORAGE_KEY = "saude_financeira_db";

  // Função auxiliar para analisar uma linha de CSV considerando aspas
  function parseCSVLine(line, delimiter = ',') {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        // Se encontramos duas aspas juntas dentro de aspas, é um escape de aspa
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Pula a próxima aspa
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  return {
    // Gravar o estado completo no LocalStorage em JSON
    saveToLocalStorage(data) {
      try {
        console.log("Storage: Gravando estado no LocalStorage. llmConfig ativa:", data.llmConfig.model);
        const serialized = JSON.stringify(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
        return true;
      } catch (err) {
        console.error("Falha ao salvar no LocalStorage:", err);
        return false;
      }
    },

    // Carregar o estado do LocalStorage
    loadFromLocalStorage() {
      try {
        const serialized = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serialized) {
          const parsed = JSON.parse(serialized);
          console.log("Storage: Carregado estado do LocalStorage. llmConfig recuperada");
          // Validação básica de estrutura
          if (parsed && Array.isArray(parsed.perfis) && Array.isArray(parsed.despesas)) {
            return parsed;
          }
        }
      } catch (err) {
        console.error("Falha ao carregar do LocalStorage, inicializando limpo:", err);
      }
      return null;
    },

    // Converter objeto de dados para string CSV padronizada
    convertToCSV(data, targetPerfilName) {
      if (!data) return "";
      const profile = targetPerfilName || data.perfilAtivo;

      const delimiter = ",";
      const header = ["perfil", "salario_base", "tipo_registro", "descricao", "valor", "categoria", "mes_inicio", "ano_inicio", "parcelas", "recorrente", "valor_parcela", "taxa_tr"];
      const rows = [header.join(delimiter)];

      // 1. Exportar despesas do perfil selecionado
      if (Array.isArray(data.despesas)) {
        data.despesas.forEach(d => {
          if (d.perfil !== profile) return;
          const perfilObj = data.perfis.find(p => p.nome === d.perfil);
          const salary = perfilObj ? perfilObj.salario : 0;
          
          const perfilEscaped = `"${d.perfil.replace(/"/g, '""')}"`;
          const descEscaped = `"${d.descricao.replace(/"/g, '""')}"`;
          const catEscaped = `"${d.categoria.replace(/"/g, '""')}"`;
          
          rows.push([
            perfilEscaped,
            salary.toFixed(2),
            "despesa",
            descEscaped,
            d.valor.toFixed(2),
            catEscaped,
            d.mes_inicio,
            d.ano_inicio || new Date().getFullYear(),
            d.parcelas,
            d.recorrente ? "sim" : "nao",
            "",
            ""
          ].join(delimiter));
        });
      }

      // 2. Exportar financiamentos do perfil selecionado
      if (Array.isArray(data.financiamentos)) {
        data.financiamentos.forEach(f => {
          if (f.perfil !== profile) return;
          const perfilObj = data.perfis.find(p => p.nome === f.perfil);
          const salary = perfilObj ? perfilObj.salario : 0;
          
          const perfilEscaped = `"${f.perfil.replace(/"/g, '""')}"`;
          const descEscaped = `"${f.nome.replace(/"/g, '""')}"`;
          
          rows.push([
            perfilEscaped,
            salary.toFixed(2),
            "financiamento",
            descEscaped,
            f.valorTotal.toFixed(2),
            "Financiamento",
            f.mes_inicio,
            f.ano_inicio || new Date().getFullYear(),
            f.parcelasTotais,
            "nao",
            f.valorParcela.toFixed(2),
            f.taxaTR.toFixed(4)
          ].join(delimiter));
        });
      }

      // 3. Exportar perfil mesmo se não tiver despesas nem financiamentos
      const perfilObj = data.perfis.find(p => p.nome === profile);
      if (perfilObj) {
        const hasAny = (data.despesas && data.despesas.some(d => d.perfil === profile)) ||
                       (data.financiamentos && data.financiamentos.some(f => f.perfil === profile));
        if (!hasAny) {
          const perfilEscaped = `"${perfilObj.nome.replace(/"/g, '""')}"`;
          rows.push([
            perfilEscaped,
            perfilObj.salario.toFixed(2),
            "despesa",
            `""`,
            `0.00`,
            `""`,
            1,
            new Date().getFullYear(),
            1,
            "nao",
            "",
            ""
          ].join(delimiter));
        }
      }

      return rows.join("\n");
    },

    // Processar texto CSV do utilizador e retornar um objeto de estado reconstruído
    parseFromCSV(csvText) {
      if (!csvText || !csvText.trim()) {
        throw new Error("O arquivo CSV está vazio.");
      }

      const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length === 0) {
        throw new Error("Nenhum dado legível no CSV.");
      }

      // Detectar o delimitador (normalmente vírgula ou ponto e vírgula)
      const firstLine = lines[0];
      const delimiter = firstLine.includes(";") ? ";" : ",";

      // Parsear cabeçalho
      const headers = parseCSVLine(firstLine, delimiter).map(h => h.trim().toLowerCase());
      
      // Validar colunas obrigatórias mínimo (deve ter perfil e salario_base)
      const requiredCols = ["perfil", "salario_base"];
      requiredCols.forEach(col => {
        if (!headers.includes(col)) {
          throw new Error(`Coluna obrigatória ausente no cabeçalho CSV: ${col}`);
        }
      });

      // Mapear posições das colunas
      const colMap = {
        perfil: headers.indexOf("perfil"),
        salario_base: headers.indexOf("salario_base"),
        tipo_registro: headers.indexOf("tipo_registro"),
        descricao: headers.indexOf("descricao"),
        valor: headers.indexOf("valor"),
        categoria: headers.indexOf("categoria"),
        mes_inicio: headers.indexOf("mes_inicio"),
        ano_inicio: headers.indexOf("ano_inicio"),
        parcelas: headers.indexOf("parcelas"),
        recorrente: headers.indexOf("recorrente"),
        valor_parcela: headers.indexOf("valor_parcela"),
        taxa_tr: headers.indexOf("taxa_tr")
      };

      const profilesMap = new Map(); // nome -> salario
      const parsedDespesas = [];
      const parsedFinanciamentos = [];

      // Processar linhas de dados (ignorar linha 0 que é o cabeçalho)
      for (let i = 1; i < lines.length; i++) {
        const columns = parseCSVLine(lines[i], delimiter);
        
        // Ignorar linhas com colunas insuficientes
        if (columns.length <= Math.max(colMap.perfil, colMap.salario_base)) {
          console.warn(`Ignorando linha ${i} devido a número insuficiente de colunas para perfil/salário:`, lines[i]);
          continue;
        }

        const perfilNome = columns[colMap.perfil].trim();
        const salarioVal = parseFloat(columns[colMap.salario_base]) || 0;

        if (!perfilNome) {
          console.warn(`Linha ${i} ignorada porque o nome do perfil está em branco.`);
          continue;
        }

        // Registrar/Atualizar perfil
        if (!profilesMap.has(perfilNome)) {
          profilesMap.set(perfilNome, salarioVal);
        } else if (salarioVal > 0) {
          profilesMap.set(perfilNome, salarioVal);
        }

        // Se houver campos de descrição/valor, processar
        const despesaDesc = colMap.descricao !== -1 && columns[colMap.descricao] ? columns[colMap.descricao].trim() : "";
        const despesaValor = colMap.valor !== -1 && columns[colMap.valor] ? parseFloat(columns[colMap.valor]) || 0 : 0;
        const despesaCategoria = colMap.categoria !== -1 && columns[colMap.categoria] ? columns[colMap.categoria].trim() : "Outros";
        const despesaMes = colMap.mes_inicio !== -1 && columns[colMap.mes_inicio] ? parseInt(columns[colMap.mes_inicio]) || 1 : 1;
        const despesaAno = colMap.ano_inicio !== -1 && columns[colMap.ano_inicio] ? parseInt(columns[colMap.ano_inicio]) || new Date().getFullYear() : new Date().getFullYear();
        const despesaParcelas = colMap.parcelas !== -1 && columns[colMap.parcelas] ? parseInt(columns[colMap.parcelas]) || 1 : 1;
        const despesaRecorrente = colMap.recorrente !== -1 && columns[colMap.recorrente] ? columns[colMap.recorrente].trim() === "sim" : false;
        
        const tipoReg = colMap.tipo_registro !== -1 && columns[colMap.tipo_registro] ? columns[colMap.tipo_registro].trim().toLowerCase() : "despesa";

        if (despesaDesc && despesaValor > 0) {
          if (tipoReg === "financiamento") {
            const valParcela = colMap.valor_parcela !== -1 && columns[colMap.valor_parcela] ? parseFloat(columns[colMap.valor_parcela]) || 0 : 0;
            const trRate = colMap.taxa_tr !== -1 && columns[colMap.taxa_tr] ? parseFloat(columns[colMap.taxa_tr]) || 0 : 0;
            
            parsedFinanciamentos.push({
              id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5) + i,
              perfil: perfilNome,
              nome: despesaDesc,
              valorTotal: despesaValor,
              valorParcela: valParcela || (despesaValor / despesaParcelas), // fallback inteligente
              parcelasTotais: despesaParcelas,
              taxaTR: trRate,
              mes_inicio: Math.min(12, Math.max(1, despesaMes)),
              ano_inicio: despesaAno
            });
          } else {
            parsedDespesas.push({
              id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5) + i,
              perfil: perfilNome,
              descricao: despesaDesc,
              valor: despesaValor,
              categoria: despesaCategoria,
              mes_inicio: Math.min(12, Math.max(1, despesaMes)),
              ano_inicio: despesaAno,
              parcelas: Math.max(1, despesaParcelas),
              recorrente: despesaRecorrente
            });
          }
        }
      }

      if (profilesMap.size === 0) {
        throw new Error("Não foi possível importar nenhum perfil válido do arquivo CSV.");
      }

      // Reconstruir array de perfis
      const perfis = [];
      profilesMap.forEach((salario, nome) => {
        perfis.push({ nome, salario });
      });

      const perfilAtivo = perfis[0].nome;

      return {
        perfis,
        perfilAtivo,
        despesas: parsedDespesas,
        financiamentos: parsedFinanciamentos
      };
    },

    // Despoleta o download automático de um arquivo CSV físico no navegador
    exportAsCSVFile(data, targetPerfilName) {
      try {
        const profile = targetPerfilName || data.perfilAtivo;
        const csvContent = this.convertToCSV(data, profile);
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `saude_financeira_perfil_${profile}_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
      } catch (err) {
        console.error("Falha ao exportar arquivo CSV:", err);
        return false;
      }
    }
  };
})();
