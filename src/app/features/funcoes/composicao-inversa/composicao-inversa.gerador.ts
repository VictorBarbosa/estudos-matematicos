import { Fracao, comporComPassos, inverterComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const saoEquivalentes = (a: Fracao, b: Fracao): boolean => a.igualA(b);

type Pergunta = 'composta' | 'inversa' | 'ordem';

/**
 * Exercícios de composição e inversa.
 *
 * As armadilhas tratam os dois erros estruturais: compor na ordem errada e
 * confundir a inversa com o inverso multiplicativo.
 */
export const geradorComposicao: GeradorExercicio<Fracao> = {
  topicoId: 'composicao-inversa',
  formatoResposta: 'um número ou fração, ex.: 7 ou -1/2',

  gerar(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
    const pergunta = sortearPergunta(nivel, rng);

    const f = { a: naoZero(rng, nivel), b: rng.inteiro(-8, 8) };
    const g = { a: naoZero(rng, nivel), b: rng.inteiro(-8, 8) };
    const x = rng.inteiro(-4, 5);

    const fTex = `f(x) = ${escrever(f.a)}x ${f.b >= 0 ? '+' : '-'} ${Math.abs(f.b)}`;
    const gTex = `g(x) = ${escrever(g.a)}x ${g.b >= 0 ? '+' : '-'} ${Math.abs(g.b)}`;

    if (pergunta === 'inversa') {
      const resolucao = inverterComPassos(f);
      const inversa = resolucao.resultado;
      const gabarito = Fracao.criar(x - f.b, f.a).simplificar();

      return {
        id: `composicao-inversa-${f.a}-${f.b}-${x}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Encontre a inversa de f e calcule f⁻¹(${x}).`,
        enunciadoTex: fTex,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            ...resolucao.passos,
            {
              descricao: `Agora avaliamos a inversa em ${x}.`,
              tex: `f^{-1}(${x}) = \\frac{${x} ${f.b >= 0 ? '-' : '+'} ${Math.abs(f.b)}}{${f.a}} = ${gabarito.paraTex()}`,
            },
          ],
        },
        conceitos: ['composicao.inversa', 'composicao.reflexo'],
        armadilhas: semColisoes(
          [
            {
              // Avaliou f em vez da inversa.
              resposta: Fracao.deInteiro(f.a * x + f.b),
              diagnostico:
                'Esse é o valor de f(x), não da inversa. A inversa DESFAZ a função: ela ' +
                'subtrai o termo constante e depois divide pelo coeficiente.',
              passo: 2,
              conceito: 'composicao.inversa',
            },
            {
              // Confundiu com o inverso multiplicativo.
              resposta: Fracao.criar(1, f.a * x + f.b === 0 ? 1 : f.a * x + f.b).simplificar(),
              diagnostico:
                'O expoente −1 em f⁻¹ NÃO significa 1/f. Ele indica a função que desfaz f, e ' +
                'não o inverso multiplicativo do seu valor.',
              passo: 2,
              conceito: 'composicao.inversa',
            },
            {
              // Esqueceu de subtrair b antes de dividir.
              resposta: Fracao.criar(x, f.a).simplificar(),
              diagnostico:
                'Faltou desfazer a soma antes da divisão. As operações se desfazem na ordem ' +
                'INVERSA: primeiro subtrai-se o termo constante, depois divide-se.',
              passo: 1,
              conceito: 'composicao.inversa',
            },
          ],
          gabarito,
          saoEquivalentes,
        ),
        dica: nivel === 'facil' ? 'Escreva y = f(x) e isole o x.' : undefined,
      };
    }

    // Composta: f(g(x)) ou g(f(x)).
    const direta = pergunta === 'composta';
    const resolucao = direta ? comporComPassos(f, g) : comporComPassos(g, f);
    const composta = resolucao.resultado;
    const gabarito = Fracao.deInteiro(composta.a * x + composta.b);

    const outraOrdem = direta ? comporComPassos(g, f).resultado : comporComPassos(f, g).resultado;

    return {
      id: `composicao-${direta ? 'fg' : 'gf'}-${f.a}${f.b}-${g.a}${g.b}-${x}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: direta ? `Calcule f(g(${x})).` : `Calcule g(f(${x})).`,
      enunciadoTex: `${fTex} \\qquad ${gTex}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Aplicamos primeiro a função de DENTRO.',
            tex: direta
              ? `g(${x}) = ${g.a * x + g.b}`
              : `f(${x}) = ${f.a * x + f.b}`,
          },
          {
            descricao: 'O resultado vira a entrada da função de fora.',
            tex: direta
              ? `f(${g.a * x + g.b}) = ${f.a}(${g.a * x + g.b}) ${f.b >= 0 ? '+' : '-'} ${Math.abs(f.b)}`
              : `g(${f.a * x + f.b}) = ${g.a}(${f.a * x + f.b}) ${g.b >= 0 ? '+' : '-'} ${Math.abs(g.b)}`,
          },
          { descricao: 'Calculamos.', tex: `= ${gabarito.paraTex()}` },
          ...resolucao.passos.slice(1),
        ],
      },
      conceitos: ['composicao.encadear'],
      armadilhas: semColisoes(
        [
          {
            resposta: Fracao.deInteiro(outraOrdem.a * x + outraOrdem.b),
            diagnostico: direta
              ? 'Você compôs na ordem contrária. Em f(g(x)), quem age primeiro é g — a função ' +
                'que está DENTRO dos parênteses.'
              : 'Você compôs na ordem contrária. Em g(f(x)), quem age primeiro é f.',
            passo: 0,
            conceito: 'composicao.encadear',
          },
          {
            // Somou os resultados em vez de encadear.
            resposta: Fracao.deInteiro(f.a * x + f.b + (g.a * x + g.b)),
            diagnostico:
              'Compor não é somar as duas funções. A saída de uma precisa ENTRAR na outra, ' +
              'como etapas em sequência.',
            passo: 1,
            conceito: 'composicao.encadear',
          },
        ],
        gabarito,
        saoEquivalentes,
      ),
    };
  },

  analisar: (entrada) => Fracao.analisar(entrada),
  saoEquivalentes,
  formatar: (valor) => valor.toString(),
};

function escrever(a: number): string {
  return a === 1 ? '' : a === -1 ? '-' : String(a);
}

function naoZero(rng: Rng, nivel: Nivel): number {
  const limite = nivel === 'facil' ? 3 : 5;
  const valor = rng.inteiro(1, limite) * (nivel === 'facil' ? 1 : rng.sinal());
  return valor === 0 ? 1 : valor;
}

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['composta', 'inversa']);
    case 'medio':
      return rng.escolher<Pergunta>(['composta', 'ordem', 'inversa']);
    case 'dificil':
      return rng.escolher<Pergunta>(['ordem', 'inversa']);
  }
}
