import { Polinomio, integralNumerica, somaDeRiemann } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

/**
 * Exercícios de soma de Riemann.
 *
 * Usamos poucos retângulos, para que a conta seja viável à mão e o aluno
 * perceba o erro em relação à área exata.
 */
export const geradorRiemann: GeradorExercicio<number> = {
  topicoId: 'soma-de-riemann',
  formatoResposta: 'um número com até 3 casas, ex.: 0,219',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const n = rng.escolher(nivel === 'facil' ? [2, 4] : [4, 5, 8]);
    const tipo = nivel === 'facil' ? 'esquerda' : rng.booleano() ? 'esquerda' : 'direita';

    const a = rng.inteiro(1, 3);
    const de = 0;
    const ate = rng.inteiro(1, 3);

    const p = Polinomio.de(0, 0, a); // ax²
    const fn = (x: number) => p.avaliar(x);

    const gabarito = somaDeRiemann(fn, de, ate, n, tipo);
    const exata = integralNumerica(fn, de, ate);
    const outroLado = somaDeRiemann(fn, de, ate, n, tipo === 'esquerda' ? 'direita' : 'esquerda');

    const largura = (ate - de) / n;

    return {
      id: `riemann-${a}-${de}${ate}-${n}-${tipo}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        `Aproxime a área sob a curva no intervalo [${de}, ${ate}] usando ${n} retângulos, ` +
        `com altura tomada pela ${tipo}. (3 casas decimais)`,
      enunciadoTex: `f(x) = ${p.paraTex()} \\qquad n = ${n}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'A largura de cada retângulo é o intervalo dividido por n.',
            tex: `\\Delta x = \\frac{${ate} - ${de}}{${n}} = ${largura}`,
          },
          {
            descricao: `As alturas são tomadas na borda ${tipo} de cada subintervalo.`,
            tex: Array.from({ length: Math.min(n, 4) }, (_, i) => {
              const x = de + (tipo === 'esquerda' ? i : i + 1) * largura;
              return `f(${Number(x.toFixed(3))})`;
            }).join(' + ') + (n > 4 ? ' + \\cdots' : ''),
          },
          {
            descricao: 'Somamos as áreas dos retângulos.',
            tex: `S = \\Delta x \\sum f(x_i) = ${gabarito.toFixed(4)}`,
          },
          {
            descricao: 'Comparando com a área exata.',
            tex: `\\int_{${de}}^{${ate}} f(x)\\,dx = ${exata.toFixed(4)}`,
            nota: `A aproximação ${gabarito < exata ? 'subestima' : 'superestima'} a área em ${Math.abs(gabarito - exata).toFixed(4)}.`,
          },
        ],
      },
      conceitos: ['riemann.ideia', 'riemann.escolha'],
      armadilhas: semColisoes(
        [
          {
            resposta: outroLado,
            diagnostico:
              `Você tomou as alturas pela ${tipo === 'esquerda' ? 'direita' : 'esquerda'}. ` +
              'Numa função crescente, essa escolha dá um valor maior; pela esquerda, menor.',
            passo: 1,
            conceito: 'riemann.escolha',
          },
          {
            resposta: exata,
            diagnostico:
              'Esse é o valor EXATO da integral. A soma de Riemann com poucos retângulos é ' +
              'apenas uma aproximação, e ainda difere dele.',
            passo: 3,
            conceito: 'riemann.limite',
          },
          {
            resposta: gabarito / largura,
            diagnostico:
              'Faltou multiplicar pela largura Δx. A soma das alturas não é a área: cada ' +
              'altura precisa virar retângulo.',
            passo: 2,
            conceito: 'riemann.ideia',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: nivel === 'facil' ? 'Calcule Δx primeiro, depois some as alturas.' : undefined,
    };
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');
    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};
