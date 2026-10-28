import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

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
    const a = rng.inteiro(2, nivel === 'facil' ? 3 : 5);
    const b = rng.inteiro(-4, 4);
    const n = rng.inteiro(2, nivel === 'dificil' ? 4 : 3);
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
            descricao: 'Derivamos a de fora mantendo o miolo, e multiplicamos pela derivada do miolo.',
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
            diagnostico:
              'Esse é o valor da própria função no ponto, não da derivada.',
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

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');
    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 }),
};
