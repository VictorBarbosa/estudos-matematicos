import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  nivelAoMenos,
  semColisoes,
} from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

/**
 * Exercícios de regra da cadeia com potências de binômios.
 *
 * A armadilha é sempre a mesma, e é a que importa: esquecer o fator interno.
 */
export const geradorCadeia: GeradorExercicio<number> = {
  topicoId: 'regra-da-cadeia',
  formatoResposta: 'um número, ex.: 24',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    // No Extremo a casca de fora deixa de ser potência: raiz, exponencial,
    // logaritmo ou seno, cada uma com a sua derivada.
    if (nivel === 'extremo' && rng.booleano()) {
      return exercicioOutraCasca(nivel, rng);
    }

    const a = rng.inteiro(2, nivel === 'facil' ? 3 : 5);
    const b = rng.inteiro(-4, 4);
    const n = rng.inteiro(2, nivelAoMenos(nivel, 'dificil') ? 4 : 3);
    const ponto = rng.inteiro(-2, 3);

    const interno = a * ponto + b;
    // d/dx[(ax+b)^n] = n(ax+b)^(n-1) · a
    const gabarito = n * interno ** (n - 1) * a;
    const semFatorInterno = n * interno ** (n - 1);

    const internoTex = `${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;

    return {
      id: `cadeia-${a}${b}${n}-${ponto}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Use a regra da cadeia e calcule f'(${ponto}).`,
      enunciadoTex: `f(x) = \\left(${internoTex}\\right)^{${n}}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Identificamos as duas camadas: a potência por fora, o binômio por dentro.',
            tex: `u = ${internoTex} \\qquad f = u^{${n}}`,
          },
          {
            descricao:
              'Derivamos a de fora mantendo o miolo, e multiplicamos pela derivada do miolo.',
            tex: `f'(x) = ${n}\\left(${internoTex}\\right)^{${n - 1}} \\cdot ${a}`,
          },
          {
            descricao: `Avaliando em x = ${ponto}, o miolo vale ${interno}.`,
            tex: `${n} \\cdot (${interno})^{${n - 1}} \\cdot ${a} = ${gabarito}`,
          },
        ],
      },
      conceitos: ['cadeia.regra', 'cadeia.erro-comum'],
      armadilhas: semColisoes(
        [
          {
            resposta: semFatorInterno,
            diagnostico:
              `Faltou multiplicar pela derivada interna, que vale ${a}. Sem ela o resultado ` +
              `fica ${a} vezes menor que o correto — é o erro mais comum da regra da cadeia.`,
            passo: 1,
            conceito: 'cadeia.erro-comum',
          },
          {
            resposta: n * interno ** n * a,
            diagnostico:
              'O expoente deve DIMINUIR em um ao derivar. Aqui ele foi mantido, e a potência ' +
              'ficou um grau acima do correto.',
            passo: 1,
            conceito: 'cadeia.regra',
          },
          {
            resposta: interno ** n,
            diagnostico: 'Esse é o valor da própria função no ponto, não da derivada.',
            passo: 0,
            conceito: 'cadeia.regra',
          },
        ],
        gabarito,
        proximos,
      ),
      dica:
        nivel === 'facil'
          ? 'Depois de derivar a potência, não esqueça de multiplicar pela derivada de dentro.'
          : undefined,
    };
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 }),
};

type Casca = 'raiz' | 'exp' | 'ln' | 'sen';

/**
 * Regra da cadeia com a casca de fora diferente de uma potência.
 *
 * Com (ax + b)ⁿ em todos os níveis, o Extremo só trocava os números. Aqui a
 * regra é a mesma — derivada de fora, mantendo o miolo, vezes a de dentro —,
 * mas a derivada de fora muda de cara, e é aí que se vê se a regra foi
 * entendida ou decorada para potências.
 */
function exercicioOutraCasca(nivel: Nivel, rng: Rng): Exercicio<number> {
  const casca = rng.escolher<Casca>(['raiz', 'exp', 'ln', 'sen']);
  // A exponencial cresce rápido: miolo pequeno, ou a resposta teria dez dígitos.
  const a = casca === 'exp' ? rng.inteiro(2, 3) : rng.inteiro(2, 6);
  const ponto = casca === 'exp' ? rng.inteiro(0, 1) : rng.inteiro(0, 3);
  // O miolo precisa ser positivo para raiz e logaritmo existirem no ponto.
  const b =
    casca === 'raiz' || casca === 'ln'
      ? rng.inteiro(1, 9)
      : casca === 'exp'
        ? rng.inteiro(-3, 1)
        : rng.inteiro(-3, 3);

  const u = a * ponto + b;
  const internoTex = `${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;
  const n = (v: number): string => Number(v.toFixed(4)).toString().replace('.', '{,}');

  const fora = {
    raiz: {
      g: '\\sqrt{u}',
      f: `\\sqrt{${internoTex}}`,
      df: '\\frac{1}{2\\sqrt{u}}',
      valor: 1 / (2 * Math.sqrt(u)),
      contaFora: `\\frac{1}{2\\sqrt{${u}}}`,
    },
    exp: {
      g: 'e^{u}',
      f: `e^{${internoTex}}`,
      df: 'e^{u}',
      valor: Math.exp(u),
      contaFora: `e^{${u}}`,
    },
    ln: {
      g: '\\ln u',
      f: `\\ln(${internoTex})`,
      df: '\\frac{1}{u}',
      valor: 1 / u,
      contaFora: `\\frac{1}{${u}}`,
    },
    sen: {
      g: '\\sin u',
      f: `\\sin(${internoTex})`,
      df: '\\cos u',
      valor: Math.cos(u),
      contaFora: `\\cos(${u})`,
    },
  }[casca];

  const gabarito = fora.valor * a;

  return {
    id: `cadeia-${casca}-${a}${b}-${ponto}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Use a regra da cadeia e calcule f'(${ponto}). (3 casas decimais)`,
    enunciadoTex: `f(x) = ${fora.f}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'As duas camadas: a função de fora e o miolo.',
          tex: `u = ${internoTex} \\qquad f = ${fora.g}`,
        },
        {
          descricao: 'Derivada de fora, aplicada no miolo, vezes a derivada do miolo.',
          tex: `f'(x) = ${fora.df} \\cdot u' \\qquad u' = ${a}`,
        },
        {
          descricao: `Calculamos o miolo no ponto x = ${ponto}.`,
          tex: `u = ${a} \\cdot ${ponto} ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${u}`,
        },
        {
          descricao: 'Substituímos e multiplicamos.',
          tex: `f'(${ponto}) = ${fora.contaFora} \\cdot ${a} = ${n(fora.valor)} \\cdot ${a} = ${n(gabarito)}`,
        },
      ],
    },
    conceitos: ['cadeia.regra', 'cadeia.erro-comum'],
    armadilhas: semColisoes(
      [
        {
          resposta: fora.valor,
          diagnostico:
            `Faltou multiplicar pela derivada do miolo, que vale ${a}. É o mesmo erro da ` +
            'potência, agora com outra função por fora.',
          passo: 1,
          conceito: 'cadeia.erro-comum',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Derive a função de fora mantendo o miolo, calcule o miolo em x = ${ponto} (dá ${u}) e não esqueça de multiplicar por ${a}, a derivada do miolo.`,
  };
}
