import { Polinomio, teoremaFundamentalComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { coeficiente } from '@core/treino/sorteio';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

/** Exercícios de integral definida de polinômios. */
export const geradorDefinida: GeradorExercicio<number> = {
  topicoId: 'integral-definida',
  formatoResposta: 'um número, ex.: 9 ou -2,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const a = rng.inteiro(1, 9);
    // Zerar b e c no nível fácil reduzia o tópico a poucas integrais; valores
    // pequenos mantêm a conta simples sem colapsar a variedade.
    const b = nivel === 'facil' ? coeficiente(rng, 4) : coeficiente(rng, 9);
    const c = nivel === 'facil' ? coeficiente(rng, 5) : coeficiente(rng, 12);

    const p = Polinomio.de(c, b, a);
    const primitiva = p.integrar(0);

    const de = nivel === 'dificil' ? rng.inteiro(-5, 1) : rng.inteiro(0, 3);
    const ate = rng.inteiro(de + 1, de + 7);

    const resolucao = teoremaFundamentalComPassos(p, de, ate);
    const gabarito = resolucao.resultado;

    return {
      id: `def-${a}${b}${c}-${de}${ate}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Calcule a integral definida.',
      enunciadoTex: `\\int_{${de}}^{${ate}} \\left(${p.paraTex()}\\right) dx`,
      gabarito,
      resolucao,
      conceitos: ['integral-def.definicao', 'tfc.enunciado'],
      armadilhas: semColisoes(
        [
          {
            resposta: primitiva.avaliar(ate),
            diagnostico:
              'Faltou subtrair o valor da primitiva no limite INFERIOR. A integral definida é ' +
              'F(b) − F(a), não apenas F(b).',
            passo: 2,
            conceito: 'tfc.enunciado',
          },
          {
            resposta: primitiva.avaliar(de) - primitiva.avaliar(ate),
            diagnostico:
              'A ordem da subtração está invertida: é F(b) − F(a), do limite superior menos ' +
              'o inferior. Trocar a ordem inverte o sinal.',
            passo: 2,
            conceito: 'integral-def.propriedades',
          },
          {
            resposta: p.avaliar(ate) - p.avaliar(de),
            diagnostico:
              'Você usou a função original em vez da primitiva. É preciso integrar antes de ' +
              'avaliar nos extremos.',
            passo: 0,
            conceito: 'tfc.enunciado',
          },
        ],
        gabarito,
        proximos,
      ),
      dica:
        nivel === 'facil'
          ? 'Encontre a primitiva e avalie nos dois extremos, subtraindo.'
          : undefined,
    };
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');

    const fracao = /^([+-]?\d+)\/(\d+)$/.exec(limpo);
    if (fracao) {
      const denominador = Number(fracao[2]);
      return denominador === 0 ? null : Number(fracao[1]) / denominador;
    }

    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};
