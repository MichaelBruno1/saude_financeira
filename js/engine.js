// Namespace global
window.App = window.App || {};

window.App.Engine = (() => {
  function getCategoriesList() {
    let list = ["Saúde", "Alimentação", "Moradia", "Cartão de Crédito", "Lazer", "Serviços por Assinatura", "Serviços", "Financiamento", "Investimento", "Outros"];
    if (typeof window !== "undefined" && window.App && window.App.State) {
      const state = window.App.State.getState();
      if (state && state.categorias) {
        list = Object.keys(state.categorias);
        if (!list.includes("Financiamento")) list.push("Financiamento");
        if (!list.includes("Outros")) list.push("Outros");
      }
    }
    return list;
  }

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

      // Se for recorrente, repete o valor total para todos os meses a partir de mes_inicio do ano de início
      if (despesa.recorrente) {
        if (targetYear > S_year || (targetYear === S_year && mesSelecionado >= S)) {
          const index = (targetYear - S_year) * 12 + mesSelecionado - S + 1;
          return {
            active: true,
            index: index,
            total: Infinity,
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

      // Inicializar dicionário de gastos com as categorias dinâmicas
      const gastosPorCategoria = {};
      getCategoriesList().forEach(cat => {
        gastosPorCategoria[cat] = 0;
      });

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
          const details = this.getFinancingDetailsForMonth(f, mes, targetYear);
          if (details.active) {
            gastosPorCategoria["Financiamento"] += details.valorParcela;
            totalGastos += details.valorParcela;
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

      const gastosPorCategoria = {};
      getCategoriesList().forEach(cat => {
        gastosPorCategoria[cat] = 0;
      });

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
    simulateAmortization(V, P, N, TR, extraVal, extraFrequency, system = "price", taxaJurosAnual = 0) {
      let rContract;
      if (taxaJurosAnual && !isNaN(taxaJurosAnual) && parseFloat(taxaJurosAnual) > 0) {
        rContract = (parseFloat(taxaJurosAnual) / 12) / 100;
      } else {
        rContract = this.solveImplicitInterestRate(V, P, N);
      }
      const trRate = (parseFloat(TR) || 0) / 100;
      const rate = rContract + trRate;
      const systemName = String(system || "price").toLowerCase();
      const constantAmortization = V / N;

      // 1. Cenário Normal (sem amortizações extras adicionais)
      let S_normal = V;
      let totalInterestNormal = 0;
      let monthsNormal = 0;

      for (let m = 1; m <= N; m++) {
        if (S_normal <= 0) break;
        monthsNormal++;
        
        let J_t = S_normal * rate;
        let A_t = systemName === "sac" ? constantAmortization : (P - J_t);
        
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
        let A_t = systemName === "sac" ? constantAmortization : (P - J_t);
        
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
    },

    getFinancingTimeline(f, despesas) {
      const V = parseFloat(f.valorTotal) || 0;
      const P = parseFloat(f.valorParcela) || 0;
      const N = parseInt(f.parcelasTotais) || 1;
      const TR = parseFloat(f.taxaTR) || 0;
      const system = String(f.sistema || "price").toLowerCase();
      const taxaJurosAnual = parseFloat(f.taxaJurosAnual) || 0;

      let rContract;
      if (taxaJurosAnual > 0) {
        rContract = (taxaJurosAnual / 12) / 100;
      } else {
        rContract = this.solveImplicitInterestRate(V, P, N);
      }
      const trRate = TR / 100;
      const rate = rContract + trRate;
      const constantAmortization = V / N;

      const S_month = parseInt(f.mes_inicio) || 1;
      const S_year = parseInt(f.ano_inicio) || new Date().getFullYear();
      const startAbs = S_year * 12 + S_month - 1;

      // Filter amortizations for this financing
      const amortExpenses = Array.isArray(despesas)
        ? despesas.filter(d => d.categoria === "Amortização" && d.financiamentoId === f.id)
        : [];

      let S = V;
      const timeline = [];
      let actualMonths = 0;

      for (let m = 1; m <= N; m++) {
        if (S <= 0) break;
        actualMonths++;

        const stepAbs = startAbs + m - 1;
        const stepMonth = (stepAbs % 12) + 1;
        const stepYear = Math.floor(stepAbs / 12);

        // Find extra amortizations in this month/year
        const extraAmort = amortExpenses
          .filter(d => d.mes_inicio === stepMonth && (d.ano_inicio || S_year) === stepYear)
          .reduce((sum, d) => sum + d.valor, 0);

        let J_t = S * rate;
        let A_t = system === "sac" ? constantAmortization : (P - J_t);
        if (A_t <= 0) A_t = 0.01;

        const totalA = A_t + extraAmort;
        const regularInstallment = system === "sac" ? (A_t + J_t) : P;
        const totalPaidThisMonth = regularInstallment + extraAmort;

        timeline.push({
          monthIndex: m,
          mes: stepMonth,
          ano: stepYear,
          saldoDevedorAntes: parseFloat(S.toFixed(2)),
          juros: parseFloat(J_t.toFixed(2)),
          amortizacaoRegular: parseFloat(A_t.toFixed(2)),
          amortizacaoExtra: parseFloat(extraAmort.toFixed(2)),
          valorParcela: parseFloat(regularInstallment.toFixed(2)),
          totalPago: parseFloat(totalPaidThisMonth.toFixed(2))
        });

        if (S < totalA) {
          S = 0;
        } else {
          S -= totalA;
        }
      }

      return {
        actualMonths,
        timeline,
        saldoDevedorFinal: parseFloat(S.toFixed(2))
      };
    },

    getFinancingDetailsForMonth(f, mes, ano, despesas) {
      const timelineInfo = this.getFinancingTimeline(f, despesas);
      const S_month = parseInt(f.mes_inicio) || 1;
      const S_year = parseInt(f.ano_inicio) || new Date().getFullYear();
      const startAbs = S_year * 12 + S_month - 1;
      const targetAbs = ano * 12 + mes - 1;
      const index = targetAbs - startAbs + 1;

      if (index <= 0) {
        return {
          active: false,
          index: 0,
          saldoDevedorAntes: parseFloat((f.valorTotal || 0).toFixed(2)),
          saldoDevedorDepois: parseFloat((f.valorTotal || 0).toFixed(2)),
          valorParcela: parseFloat((f.valorParcela || 0).toFixed(2)),
          amortizacao: 0,
          juros: 0,
          actualMonths: timelineInfo.actualMonths
        };
      }

      const step = timelineInfo.timeline.find(t => t.monthIndex === index);
      if (!step) {
        return {
          active: false,
          index: index,
          saldoDevedorAntes: 0,
          saldoDevedorDepois: 0,
          valorParcela: 0,
          amortizacao: 0,
          juros: 0,
          actualMonths: timelineInfo.actualMonths
        };
      }

      const saldoDevedorDepois = Math.max(0, step.saldoDevedorAntes - step.amortizacaoRegular - step.amortizacaoExtra);

      return {
        active: true,
        index: index,
        saldoDevedorAntes: step.saldoDevedorAntes,
        saldoDevedorDepois: parseFloat(saldoDevedorDepois.toFixed(2)),
        valorParcela: step.valorParcela,
        amortizacao: step.amortizacaoRegular + step.amortizacaoExtra,
        juros: step.juros,
        actualMonths: timelineInfo.actualMonths
      };
    }
  };
})();
