// Namespace global
window.App = window.App || {};

window.App.Engine = (() => {
  return {
    /**
     * Calcula as informações de parcela de uma despesa para um determinado mês selecionado.
     * Suporta rolagem de ano fiscal de forma circular (meses 1 a 12).
     * 
     * @param {Object} despesa - Objeto contendo { valor, categoria, mes_inicio, parcelas }
     * @param {number} mesSelecionado - Mês sendo visualizado (1 a 12)
     * @returns {Object|null} Retorna info da parcela ativa { active: true, index, total, valorParcela } ou null se inativa
     */
    getInstallmentInfo(despesa, mesSelecionado, anoSelecionado) {
      const S = parseInt(despesa.mes_inicio) || 1;
      const S_year = parseInt(despesa.ano_inicio) || new Date().getFullYear();
      const P = parseInt(despesa.parcelas) || 1;
      const valorTotal = parseFloat(despesa.valor) || 0;
      const targetYear = parseInt(anoSelecionado) || new Date().getFullYear();

      // Se for recorrente, repete o valor total para todos os meses a partir de mes_inicio até 12 no ano de inicio
      if (despesa.recorrente) {
        if (targetYear === S_year && mesSelecionado >= S && mesSelecionado <= 12) {
          return {
            active: true,
            index: mesSelecionado - S + 1,
            total: 12 - S + 1,
            valorParcela: valorTotal
          };
        }
        return null;
      }

      // Se for despesa comum (não Cartão de Crédito) ou com apenas 1 parcela
      if (despesa.categoria !== "Cartão de Crédito" || P <= 1) {
        if (S === mesSelecionado && S_year === targetYear) {
          return {
            active: true,
            index: 1,
            total: 1,
            valorParcela: valorTotal
          };
        }
        return null;
      }

      // Para Cartão de Crédito com parcelas P > 1
      // Calculamos usando o índice absoluto de meses
      const startAbs = S_year * 12 + S - 1;
      const targetAbs = targetYear * 12 + mesSelecionado - 1;
      const index = targetAbs - startAbs + 1;

      // Se a parcela calculada incide dentro do limite total de parcelas
      if (index >= 1 && index <= P) {
        const valorParcela = parseFloat((valorTotal / P).toFixed(2));
        return {
          active: true,
          index: index,
          total: P,
          valorParcela: valorParcela
        };
      }

      return null;
    },

    /**
     * Consolida e sumariza financeiramente todos os gastos de um perfil para um mês específico.
     * 
     * @param {Object} perfil - Objeto perfil contendo { nome, salario }
     * @param {number} mes - Mês analisado (1 a 12)
     * @param {Array} despesas - Lista de todas as despesas cadastradas na base
     * @returns {Object} Contendo gastosPorCategoria, porcentagemPorCategoria, totalGastos e saldoRestante
     */
    calculateMonthlySummary(perfil, mes, despesas, financiamentos, anoSelecionado) {
      const salario = perfil ? parseFloat(perfil.salario) || 0 : 0;
      const nomePerfil = perfil ? perfil.nome : "";
      const targetYear = parseInt(anoSelecionado) || new Date().getFullYear();

      // Inicializar dicionário de gastos com as categorias obrigatórias
      const gastosPorCategoria = {
        "Saúde": 0,
        "Alimentação": 0,
        "Moradia": 0,
        "Cartão de Crédito": 0,
        "Lazer": 0,
        "Serviços por Assinatura": 0,
        "Serviços": 0,
        "Financiamento": 0,
        "Outros": 0
      };

      let totalGastos = 0;

      // Filtrar e acumular despesas ativas no mês
      despesas.forEach(d => {
        if (d.perfil !== nomePerfil) return;

        const info = this.getInstallmentInfo(d, mes, targetYear);
        if (info && info.active) {
          const categoria = gastosPorCategoria.hasOwnProperty(d.categoria) ? d.categoria : "Outros";
          gastosPorCategoria[categoria] += info.valorParcela;
          totalGastos += info.valorParcela;
        }
      });

      // Se houver financiamentos vinculados a este perfil, adiciona o valor da parcela em "Financiamento" se ativo neste mês/ano
      if (Array.isArray(financiamentos)) {
        financiamentos.forEach(f => {
          if (f.perfil !== nomePerfil) return;

          const S_month = parseInt(f.mes_inicio) || 1;
          const S_year = parseInt(f.ano_inicio) || targetYear;
          const P = parseInt(f.parcelasTotais) || 1;

          const startAbs = S_year * 12 + S_month - 1;
          const viewAbs = targetYear * 12 + mes - 1;
          const index = viewAbs - startAbs + 1;

          if (index >= 1 && index <= P) {
            gastosPorCategoria["Financiamento"] += f.valorParcela;
            totalGastos += f.valorParcela;
          }
        });
      }

      // Arredondar valores consolidados de gastos
      for (const cat in gastosPorCategoria) {
        gastosPorCategoria[cat] = parseFloat(gastosPorCategoria[cat].toFixed(2));
      }
      totalGastos = parseFloat(totalGastos.toFixed(2));

      // Calcular o percentual de cada categoria sobre o salário base
      const porcentagemPorCategoria = {};
      for (const cat in gastosPorCategoria) {
        if (salario > 0) {
          porcentagemPorCategoria[cat] = parseFloat(((gastosPorCategoria[cat] / salario) * 100).toFixed(2));
        } else {
          porcentagemPorCategoria[cat] = 0;
        }
      }

      const saldoRestante = parseFloat((salario - totalGastos).toFixed(2));

      return {
        gastosPorCategoria,
        porcentagemPorCategoria,
        totalGastos,
        saldoRestante
      };
    },

    /**
     * Calcula as parcelas acumuladas de cartão de crédito para cada mês de Janeiro (1) a Dezembro (12).
     */
    calculateCardProjection(despesas, perfilNome, anoSelecionado) {
      const projection = Array(12).fill(0);
      if (!despesas) return projection;
      const targetYear = parseInt(anoSelecionado) || new Date().getFullYear();

      despesas.forEach(d => {
        if (d.perfil !== perfilNome) return;
        
        for (let m = 1; m <= 12; m++) {
          const info = this.getInstallmentInfo(d, m, targetYear);
          if (info && info.active && d.categoria === "Cartão de Crédito") {
            projection[m - 1] += info.valorParcela;
          }
        }
      });

      return projection.map(val => parseFloat(val.toFixed(2)));
    },

    /**
     * Calcula o consolidado anual de gastos e saldo (Janeiro a Dezembro somados).
     */
    calculateAnnualSummary(perfil, despesas, financiamentos, anoSelecionado) {
      const salarioMensal = perfil ? parseFloat(perfil.salario) || 0 : 0;
      const salarioAnual = salarioMensal * 12;
      const targetYear = parseInt(anoSelecionado) || new Date().getFullYear();

      const gastosPorCategoria = {
        "Saúde": 0,
        "Alimentação": 0,
        "Moradia": 0,
        "Cartão de Crédito": 0,
        "Lazer": 0,
        "Serviços por Assinatura": 0,
        "Serviços": 0,
        "Financiamento": 0,
        "Outros": 0
      };

      let totalGastos = 0;

      for (let m = 1; m <= 12; m++) {
        const summary = this.calculateMonthlySummary(perfil, m, despesas, financiamentos, targetYear);
        for (const cat in gastosPorCategoria) {
          gastosPorCategoria[cat] += summary.gastosPorCategoria[cat];
        }
        totalGastos += summary.totalGastos;
      }

      // Arredondar valores consolidados
      for (const cat in gastosPorCategoria) {
        gastosPorCategoria[cat] = parseFloat(gastosPorCategoria[cat].toFixed(2));
      }
      totalGastos = parseFloat(totalGastos.toFixed(2));

      // Percentuais anuais
      const porcentagemPorCategoria = {};
      for (const cat in gastosPorCategoria) {
        if (salarioAnual > 0) {
          porcentagemPorCategoria[cat] = parseFloat(((gastosPorCategoria[cat] / salarioAnual) * 100).toFixed(2));
        } else {
          porcentagemPorCategoria[cat] = 0;
        }
      }

      const saldoRestante = parseFloat((salarioAnual - totalGastos).toFixed(2));

      return {
        gastosPorCategoria,
        porcentagemPorCategoria,
        totalGastos,
        saldoRestante
      };
    },

    /**
     * Resolve a taxa de juros mensal implícita (r) de um financiamento Price usando o método Newton-Raphson.
     */
    solveImplicitInterestRate(V, P, N) {
      if (P * N <= V) return 0;
      
      // Chute inicial razoável baseado na diferença entre o total pago e o principal
      let r = (P * N - V) / (V * N);
      
      for (let i = 0; i < 200; i++) {
        const pow = Math.pow(1 + r, -N);
        const f = P - V * r / (1 - pow);
        const df = -V * (1 - pow - N * r * pow) / Math.pow(1 - pow, 2);
        const nextR = r - f / df;
        
        if (Math.abs(nextR - r) < 1e-7) {
          return nextR;
        }
        r = nextR;
      }
      return r;
    },

    /**
     * Simula a quitação de financiamento comparando os juros e prazos com e sem amortização extra.
     */
    simulateAmortization(V, P, N, TR, extraVal, extraFrequency) {
      const rImplicit = this.solveImplicitInterestRate(V, P, N);
      const trRate = (parseFloat(TR) || 0) / 100;
      const rate = rImplicit + trRate;

      // 1. Cenário Normal (sem amortizações extras adicionais)
      let S_normal = V;
      let totalInterestNormal = 0;
      let monthsNormal = 0;

      for (let m = 1; m <= N; m++) {
        if (S_normal <= 0) break;
        monthsNormal++;
        
        let J_t = S_normal * rate;
        let A_t = P - J_t;
        
        if (A_t <= 0) {
          A_t = 0.01; // salvaguarda contra amortizações nulas/negativas
        }

        if (S_normal < A_t) {
          totalInterestNormal += S_normal * rate;
          S_normal = 0;
        } else {
          totalInterestNormal += J_t;
          S_normal -= A_t;
        }
      }

      // 2. Cenário com Amortizações Extras (redução de prazo)
      let S_amort = V;
      let totalInterestAmort = 0;
      let monthsAmort = 0;
      const extra = parseFloat(extraVal) || 0;

      for (let m = 1; m <= N; m++) {
        if (S_amort <= 0) break;
        monthsAmort++;

        let J_t = S_amort * rate;
        let A_t = P - J_t;
        
        if (A_t <= 0) {
          A_t = 0.01;
        }

        // Determinar se há pagamento de amortização extra neste mês
        let extraPayment = 0;
        if (extra > 0) {
          if (extraFrequency === "monthly") {
            extraPayment = extra;
          } else if (extraFrequency === "yearly" && m % 12 === 0) {
            extraPayment = extra;
          }
        }

        const totalA = A_t + extraPayment;

        if (S_amort < totalA) {
          totalInterestAmort += S_amort * rate;
          S_amort = 0;
        } else {
          totalInterestAmort += J_t;
          S_amort -= totalA;
        }
      }

      const normalInterest = parseFloat(totalInterestNormal.toFixed(2));
      const normalTotal = parseFloat((V + normalInterest).toFixed(2));
      const amortInterest = parseFloat(totalInterestAmort.toFixed(2));
      const amortTotal = parseFloat((V + amortInterest).toFixed(2));

      const jurosEconomizados = parseFloat((normalInterest - amortInterest).toFixed(2));
      const mesesEconomizados = monthsNormal - monthsAmort;

      return {
        normalMonths: monthsNormal,
        normalInterest: normalInterest,
        normalTotal: normalTotal,
        amortMonths: monthsAmort,
        amortInterest: amortInterest,
        amortTotal: amortTotal,
        jurosEconomizados: Math.max(0, jurosEconomizados),
        mesesEconomizados: Math.max(0, mesesEconomizados)
      };
    }
  };
})();
