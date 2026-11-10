import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;

const PERIODOS = [
  { nome: 'mês', adjetivo: 'mensal', porAno: 12 },
  { nome: 'trimestre', adjetivo: 'trimestral', porAno: 4 },
  { nome: 'semestre', adjetivo: 'semestral', porAno: 2 },
] as const;

const pct = (v: number, casas = 2): string => v.toFixed(casas).replace('.', ',');
const pctTex = (v: number, casas = 2): string => v.toFixed(casas).replace('.', '{,}');

/**
 * Taxa equivalente em juros compostos.
 *
 * O erro que a pergunta existe para pegar é o da proporcionalidade: 1% ao mês
 * NÃO é 12% ao ano, porque os juros de cada mês rendem juros nos seguintes.
 * Equivalentes são as taxas que levam o mesmo capital ao mesmo montante no
 * mesmo prazo: (1 + i_ano) = (1 + i_período)ᵏ.
 *
 * - Difícil: da taxa do período para a anual (potência).
 * - Extremo: da anual para a do período (raiz k-ésima).
 */
export function exercicioTaxaEquivalente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const periodo = rng.escolher(PERIODOS);
  const k = periodo.porAno;
  const paraAnual = nivel !== 'extremo';

  if (paraAnual) {
    const taxa = rng.escolher(k === 12 ? [0.5, 1, 1.5, 2, 2.5, 3] : [2, 3, 4, 5, 6, 8]);
    const fator = (1 + taxa / 100) ** k;
    const gabarito = (fator - 1) * 100;

    return {
      id: `juros-equiv-anual-${k}-${taxa}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        `Qual taxa ANUAL, em juros compostos, equivale a ${pct(taxa, taxa % 1 === 0 ? 0 : 1)}% ao ${periodo.nome}? ` +
        'Responda em %, com 2 casas decimais.',
      enunciadoTex: `i_{\\text{${periodo.adjetivo}}} = ${pctTex(taxa, taxa % 1 === 0 ? 0 : 1)}\\% \\qquad i_{\\text{anual}} = \\;?`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: `Taxas equivalentes levam o mesmo capital ao mesmo montante em 1 ano. Um ano tem ${k} períodos de um ${periodo.nome}.`,
            tex: `1 + i_{\\text{anual}} = \\left(1 + i_{\\text{${periodo.adjetivo}}}\\right)^{${k}}`,
            nota: 'Os juros de cada período rendem juros nos seguintes — por isso é potência, não multiplicação.',
          },
          {
            descricao: 'Substituímos a taxa em decimal.',
            tex: `1 + i_{\\text{anual}} = \\left(1 + ${pctTex(taxa / 100, 4)}\\right)^{${k}} = ${pctTex(fator, 6)}`,
          },
          {
            descricao: 'Tiramos o 1 e passamos a porcentagem.',
            tex: `i_{\\text{anual}} = ${pctTex(fator - 1, 6)} = ${pctTex(gabarito)}\\%`,
          },
        ],
      },
      conceitos: ['juros.equivalente', 'juros.compostos'],
      armadilhas: semColisoes(
        [
          {
            resposta: taxa * k,
            diagnostico:
              `${pct(taxa * k, 1)}% é a taxa PROPORCIONAL, a dos juros simples. Em juros compostos os juros ` +
              `de cada ${periodo.nome} rendem juros: a anual é (1 + i)^${k} − 1, um pouco maior.`,
            passo: 0,
            conceito: 'juros.equivalente',
          },
          {
            resposta: fator * 100,
            diagnostico:
              'Faltou tirar o 1: o fator (1 + i) inclui o capital. A taxa é o que passa de 1.',
            passo: 2,
            conceito: 'juros.equivalente',
          },
        ],
        gabarito,
        proximos,
      ),
      dica:
        nivel === 'dificil'
          ? `1 + i_anual = (1 + i_${periodo.adjetivo})^${k}. Use a taxa em decimal e no fim volte para %.`
          : undefined,
    };
  }

  // Extremo: parte de uma taxa do período «redonda», mostra a anual com 2 casas
  // e pede o caminho de volta pela raiz.
  const redonda = rng.escolher(k === 12 ? [1, 1.5, 2, 2.5, 3] : [3, 4, 5, 6, 8, 10]);
  const anual = Number((((1 + redonda / 100) ** k - 1) * 100).toFixed(2));
  const fatorAnual = 1 + anual / 100;
  const gabarito = (fatorAnual ** (1 / k) - 1) * 100;

  return {
    id: `juros-equiv-periodo-${k}-${anual}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma aplicação rende ${pct(anual)}% ao ano em juros compostos. Qual é a taxa ${periodo.adjetivo.toUpperCase()} ` +
      'equivalente? Responda em %, com 2 casas decimais.',
    enunciadoTex: `i_{\\text{anual}} = ${pctTex(anual)}\\% \\qquad i_{\\text{${periodo.adjetivo}}} = \\;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Mesma equivalência, agora no sentido contrário: a taxa do ${periodo.nome} é a incógnita.`,
          tex: `\\left(1 + i_{\\text{${periodo.adjetivo}}}\\right)^{${k}} = 1 + i_{\\text{anual}} = ${pctTex(fatorAnual, 4)}`,
        },
        {
          descricao: `Para desfazer a potência ${k}, tiramos a raiz de índice ${k}.`,
          tex: `1 + i_{\\text{${periodo.adjetivo}}} = \\sqrt[${k}]{${pctTex(fatorAnual, 4)}} = ${pctTex(fatorAnual ** (1 / k), 6)}`,
        },
        {
          descricao: 'Tiramos o 1 e passamos a porcentagem.',
          tex: `i_{\\text{${periodo.adjetivo}}} = ${pctTex(fatorAnual ** (1 / k) - 1, 6)} = ${pctTex(gabarito)}\\%`,
        },
      ],
    },
    conceitos: ['juros.equivalente', 'juros.compostos'],
    armadilhas: semColisoes(
      [
        {
          resposta: anual / k,
          diagnostico:
            `Dividir por ${k} dá a taxa proporcional (juros simples). Em compostos a taxa do ${periodo.nome} ` +
            `é menor: é a raiz de índice ${k} de (1 + i_anual), menos 1.`,
          passo: 1,
          conceito: 'juros.equivalente',
        },
        {
          resposta: fatorAnual ** (1 / k) * 100,
          diagnostico: 'Faltou tirar o 1 do fator: a raiz dá 1 + i, não i.',
          passo: 2,
          conceito: 'juros.equivalente',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Volte pela raiz: 1 + i_${periodo.adjetivo} = raiz de índice ${k} de (1 + i_anual). Dividir por ${k} é o erro dos juros simples.`,
  };
}
