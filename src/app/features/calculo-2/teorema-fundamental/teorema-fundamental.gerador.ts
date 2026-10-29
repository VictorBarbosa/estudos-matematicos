import { Polinomio, teoremaFundamentalComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta = 'integral' | 'derivada-da-area' | 'limite-superior';

/** Exercícios do Teorema Fundamental, nas suas duas direções. */
export const geradorTfc: GeradorExercicio<number> = {
  topicoId: 'teorema-fundamental',
  formatoResposta: 'um número, ex.: 9',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    const a = rng.inteiro(1, 4);
    /*
     * Na pergunta pelo limite superior, o integrando precisa ser positivo em
     * (0, ∞), senão a área acumulada sobe e desce e existe outro k com o mesmo
     * valor — o gerador aceitava só o inteiro, e a outra solução, igualmente
     * correta, era reprovada. Com b ≥ 0, F é estritamente crescente e o k é
     * único.
     */
    const b = pergunta === 'limite-superior' ? rng.inteiro(0, 3) : rng.inteiro(-3, 3);
    const p = Polinomio.de(0, b, a);
    const primitiva = p.integrar(0);

    if (pergunta === 'derivada-da-area') {
      const ponto = rng.inteiro(1, 4);
      const gabarito = p.avaliar(ponto);

      return {
        id: `tfc-area-${a}${b}-${ponto}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Sendo A(x) a área acumulada a partir de 0, quanto vale A'(${ponto})?`,
        enunciadoTex: `A(x) = \\int_{0}^{x} \\left(${p.paraTex('t')}\\right) dt`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Pela segunda parte do teorema, derivar a área devolve o integrando.',
              tex: "A'(x) = f(x)",
            },
            {
              descricao: 'Basta avaliar o integrando no ponto.',
              tex: `A'(${ponto}) = ${p.paraTex()} \\big|_{x=${ponto}} = ${gabarito}`,
              nota: 'Não é preciso calcular a integral: o teorema dá o resultado direto.',
            },
          ],
        },
        conceitos: ['tfc.funcao-area', 'tfc.enunciado'],
        armadilhas: semColisoes(
          [
            {
              resposta: primitiva.avaliar(ponto),
              diagnostico:
                'Esse é o valor da ÁREA acumulada A(ponto), não da sua derivada. O teorema ' +
                'diz que a derivada da área é o próprio integrando.',
              passo: 0,
              conceito: 'tfc.funcao-area',
            },
            {
              resposta: p.derivar().avaliar(ponto),
              diagnostico:
                'Você derivou o integrando. O teorema já faz isso por você: A′ é o próprio ' +
                'integrando, sem derivar de novo.',
              passo: 1,
              conceito: 'tfc.funcao-area',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'A derivada da área acumulada é a própria função.' : undefined,
      };
    }

    if (pergunta === 'limite-superior') {
      // Dado o valor da integral de 0 a k, encontrar k entre inteiros.
      const k = rng.inteiro(1, 4);
      const valor = primitiva.avaliar(k);
      const gabarito = k;

      return {
        id: `tfc-limsup-${a}${b}-${k}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Para qual valor de k a integral vale ${Number(valor.toFixed(4))}?`,
        enunciadoTex: `\\int_{0}^{k} \\left(${p.paraTex()}\\right) dx = ${Number(valor.toFixed(4))}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: 'Encontramos a primitiva.', tex: `F(x) = ${primitiva.paraTex()}` },
            {
              descricao: 'Pelo teorema, a integral é F(k) − F(0), e F(0) = 0.',
              tex: `F(k) = ${Number(valor.toFixed(4))}`,
            },
            { descricao: 'Resolvendo para k.', tex: `k = ${gabarito}` },
          ],
        },
        conceitos: ['tfc.enunciado'],
        armadilhas: semColisoes(
          [
            {
              resposta: valor,
              diagnostico:
                'Esse é o valor da integral, que já foi dado. A pergunta é pelo limite ' +
                'superior k que produz esse valor.',
              passo: 1,
              conceito: 'tfc.enunciado',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    const de = nivel === 'dificil' ? rng.inteiro(-3, 0) : 0;
    const ate = rng.inteiro(de + 1, de + 4);
    const resolucao = teoremaFundamentalComPassos(p, de, ate);
    const gabarito = resolucao.resultado;

    return {
      id: `tfc-integral-${a}${b}-${de}${ate}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Use o Teorema Fundamental para calcular a integral.',
      enunciadoTex: `\\int_{${de}}^{${ate}} \\left(${p.paraTex()}\\right) dx`,
      gabarito,
      resolucao,
      conceitos: ['tfc.enunciado', 'tfc.constante'],
      armadilhas: semColisoes(
        [
          {
            resposta: primitiva.avaliar(ate),
            diagnostico:
              'Faltou subtrair F no limite inferior. O teorema dá a DIFERENÇA entre os dois ' +
              'valores da primitiva.',
            passo: 2,
            conceito: 'tfc.enunciado',
          },
          {
            resposta: p.avaliar(ate) - p.avaliar(de),
            diagnostico:
              'Você avaliou a função original nos extremos. É a PRIMITIVA que precisa ser ' +
              'avaliada ali.',
            passo: 0,
            conceito: 'tfc.enunciado',
          },
        ],
        gabarito,
        proximos,
      ),
    };
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['integral', 'derivada-da-area']);
    case 'medio':
      return rng.escolher<Pergunta>(['integral', 'derivada-da-area', 'limite-superior']);
    case 'dificil':
      return rng.escolher<Pergunta>(['integral', 'limite-superior']);
  }
}
