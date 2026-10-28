import { equacaoParaTex, resolverSistemaComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;

/**
 * Exercícios de sistemas lineares 2×2.
 *
 * Pedimos o valor de x, que é um número só. As armadilhas cobrem responder o
 * y por engano e os erros de sinal na eliminação.
 */
export const geradorSistemas: GeradorExercicio<number> = {
  topicoId: 'sistemas-lineares',
  formatoResposta: 'o valor de x, ex.: 3',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const { a1, b1, c1, a2, b2, c2, x, y } = sortear(nivel, rng);

    const resolucao = resolverSistemaComPassos({ a1, b1, c1, a2, b2, c2 });

    return {
      id: `sistemas-${nivel}-${a1}${b1}${c1}-${a2}${b2}${c2}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Resolva o sistema e informe o valor de x.',
      enunciadoTex: `\\begin{cases} ${equacaoParaTex(a1, b1, c1)} \\\\ ${equacaoParaTex(a2, b2, c2)} \\end{cases}`,
      gabarito: x,
      resolucao: { resultado: x, passos: resolucao.passos },
      conceitos: ['sistemas.metodos', 'sistemas.intersecao'],
      armadilhas: semColisoes(
        [
          {
            resposta: y,
            diagnostico:
              'Esse é o valor de y. Os dois fazem parte da solução, mas o enunciado pede x — ' +
              'confira qual variável foi isolada no fim da eliminação.',
            passo: 3,
            conceito: 'sistemas.metodos',
          },
          {
            resposta: -x,
            diagnostico:
              'Houve uma troca de sinal na eliminação. Ao subtrair as equações, lembre de ' +
              'inverter o sinal de TODOS os termos da segunda, inclusive o termo independente.',
            passo: 2,
            conceito: 'sistemas.metodos',
          },
        ],
        x,
        proximos,
      ),
      dica:
        nivel === 'facil'
          ? 'Multiplique as equações para que os coeficientes de y fiquem iguais.'
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

interface Sorteio {
  a1: number;
  b1: number;
  c1: number;
  a2: number;
  b2: number;
  c2: number;
  x: number;
  y: number;
}

/**
 * Sorteia a SOLUÇÃO primeiro e monta as equações a partir dela. Assim o
 * sistema é sempre determinado e com resposta exata.
 */
function sortear(nivel: Nivel, rng: Rng): Sorteio {
  const x = rng.inteiro(-6, 8);
  const y = rng.inteiro(-6, 8);

  const limite = nivel === 'facil' ? 3 : nivel === 'medio' ? 5 : 8;

  const naoZero = (): number => {
    const valor = rng.inteiro(-limite, limite);
    return valor === 0 ? 1 : valor;
  };

  let a1 = naoZero();
  let b1 = naoZero();
  let a2 = naoZero();
  let b2 = naoZero();

  // Garante determinante não nulo, isto é, retas realmente concorrentes.
  if (a1 * b2 - a2 * b1 === 0) {
    b2 = b2 + 1 === 0 ? b2 + 2 : b2 + 1;
  }

  // No nível fácil, coeficientes positivos deixam a montagem mais direta.
  if (nivel === 'facil') {
    a1 = Math.abs(a1);
    b1 = Math.abs(b1);
    a2 = Math.abs(a2);
    b2 = -Math.abs(b2);
  }

  return { a1, b1, c1: a1 * x + b1 * y, a2, b2, c2: a2 * x + b2 * y, x, y };
}
