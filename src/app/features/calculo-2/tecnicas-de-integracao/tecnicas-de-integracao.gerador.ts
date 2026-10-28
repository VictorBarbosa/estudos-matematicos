import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

/**
 * Exercícios de substituição com potências de binômios.
 *
 * A armadilha central é esquecer de dividir pelo coeficiente interno — o
 * espelho exato do erro clássico da regra da cadeia.
 */
export const geradorTecnicas: GeradorExercicio<number> = {
  topicoId: 'tecnicas-de-integracao',
  formatoResposta: 'um número, ex.: 10,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const a = rng.inteiro(2, nivel === 'facil' ? 3 : 5);
    const b = rng.inteiro(-3, 3);
    const n = rng.inteiro(2, nivel === 'dificil' ? 4 : 3);

    const de = 0;
    const ate = rng.inteiro(1, 3);

    // ∫(ax+b)^n dx = (ax+b)^(n+1) / (a(n+1))
    const primitiva = (x: number): number => (a * x + b) ** (n + 1) / (a * (n + 1));
    const gabarito = primitiva(ate) - primitiva(de);

    // Erro clássico: esquecer de dividir pelo coeficiente interno.
    const semDividir =
      ((a * ate + b) ** (n + 1) - (a * de + b) ** (n + 1)) / (n + 1);

    const internoTex = `${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;

    return {
      id: `tecnicas-${a}${b}${n}-${de}${ate}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Resolva por substituição. (2 casas decimais)',
      enunciadoTex: `\\int_{${de}}^{${ate}} \\left(${internoTex}\\right)^{${n}} dx`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Chamamos o miolo de u e calculamos du.',
            tex: `u = ${internoTex} \\qquad du = ${a}\\,dx \;\\Rightarrow\; dx = \\frac{du}{${a}}`,
          },
          {
            descricao: 'A integral vira uma potência simples.',
            tex: `\\frac{1}{${a}}\\int u^{${n}}\\,du = \\frac{1}{${a}} \\cdot \\frac{u^{${n + 1}}}{${n + 1}}`,
          },
          {
            descricao: 'Voltando à variável original.',
            tex: `\\frac{\\left(${internoTex}\\right)^{${n + 1}}}{${a * (n + 1)}}`,
            nota: 'O denominador traz o coeficiente interno — é ele que a substituição revela.',
          },
          {
            descricao: 'Avaliando nos limites.',
            tex: `${primitiva(ate).toFixed(4)} - ${primitiva(de).toFixed(4)} = ${gabarito.toFixed(4)}`,
          },
        ],
      },
      conceitos: ['tecnicas.substituicao', 'tecnicas.escolha'],
      armadilhas: semColisoes(
        [
          {
            resposta: semDividir,
            diagnostico:
              `Faltou dividir pelo coeficiente interno ${a}. Ao trocar dx por du, aparece um ` +
              `fator 1/${a} que precisa acompanhar toda a integral.`,
            passo: 1,
            conceito: 'tecnicas.substituicao',
          },
          {
            resposta: (a * ate + b) ** (n + 1) / (a * (n + 1)),
            diagnostico:
              'Faltou subtrair o valor no limite inferior. A integral definida continua ' +
              'sendo F(b) − F(a), mesmo depois da substituição.',
            passo: 3,
            conceito: 'tecnicas.substituicao',
          },
          {
            resposta: ((a * ate + b) ** n - (a * de + b) ** n) / (a * n),
            diagnostico:
              'O expoente deve AUMENTAR em um ao integrar. Aqui ele foi mantido, o que ' +
              'corresponderia a derivar.',
            passo: 1,
            conceito: 'tecnicas.substituicao',
          },
        ],
        gabarito,
        proximos,
      ),
      dica:
        nivel === 'facil'
          ? 'Depois de trocar por u, não esqueça o fator que vem de dx = du/a.'
          : undefined,
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
