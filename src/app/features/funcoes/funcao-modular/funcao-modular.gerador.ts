import { Fracao } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const saoEquivalentes = (a: Fracao, b: Fracao): boolean => a.igualA(b);

type Pergunta = 'valor' | 'bico' | 'equacao';

/**
 * Exercícios de função modular.
 *
 * As armadilhas cobrem os dois enganos clássicos: achar que o módulo de um
 * negativo continua negativo, e esquecer a segunda solução de |u| = k.
 */
export const geradorModular: GeradorExercicio<Fracao> = {
  topicoId: 'funcao-modular',
  formatoResposta: 'um número ou fração, ex.: 4 ou -1/2',

  gerar(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
    const pergunta = sortearPergunta(nivel, rng);
    const a = nivel === 'facil' ? 1 : rng.inteiro(1, 4) * (rng.booleano(0.7) ? 1 : -1);
    const b = rng.inteiro(-8, 8);

    const interna = `${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;
    const funcaoTex = `f(x) = \\left|${interna}\\right|`;

    if (pergunta === 'bico') {
      const gabarito = Fracao.criar(-b, a).simplificar();

      return {
        id: `modular-bico-${a}-${b}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Em que valor de x fica o "bico" do gráfico?',
        enunciadoTex: funcaoTex,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'O bico fica onde a expressão DENTRO do módulo se anula.',
              tex: `${interna} = 0`,
            },
            { descricao: 'Resolvemos a equação do 1º grau.', tex: `x = ${gabarito.paraTex()}` },
            {
              descricao: 'É ali que a reta deixa de descer e passa a subir.',
              tex: `f\\left(${gabarito.paraTex()}\\right) = 0`,
            },
          ],
        },
        conceitos: ['modular.grafico', 'modular.distancia'],
        armadilhas: semColisoes(
          [
            {
              resposta: Fracao.criar(b, a).simplificar(),
              diagnostico:
                'Faltou o sinal negativo ao isolar x. Ao passar b para o outro lado da ' +
                'igualdade, ele troca de sinal.',
              passo: 1,
              conceito: 'modular.grafico',
            },
            {
              resposta: Fracao.deInteiro(0),
              diagnostico:
                'O bico só fica em x = 0 quando a expressão interna é apenas |ax|. Com um ' +
                'termo somado dentro do módulo, o V se desloca horizontalmente.',
              passo: 0,
              conceito: 'modular.grafico',
            },
          ],
          gabarito,
          saoEquivalentes,
        ),
        dica: nivel === 'facil' ? 'Iguale o que está dentro do módulo a zero.' : undefined,
      };
    }

    if (pergunta === 'equacao') {
      const k = rng.inteiro(1, 9);
      // Das duas soluções, pedimos a maior.
      const solucoes = [(k - b) / a, (-k - b) / a];
      const gabarito = Fracao.criar(
        Math.max(...solucoes) === solucoes[0] ? k - b : -k - b,
        a,
      ).simplificar();

      const menor = Fracao.criar(
        Math.max(...solucoes) === solucoes[0] ? -k - b : k - b,
        a,
      ).simplificar();

      return {
        id: `modular-equacao-${a}-${b}-${k}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Resolva a equação modular e informe a MAIOR das soluções.',
        enunciadoTex: `\\left|${interna}\\right| = ${k}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Se o módulo vale k, o que está dentro pode ser +k ou −k.',
              tex: `${interna} = ${k} \\qquad \\text{ou} \\qquad ${interna} = ${-k}`,
              nota: 'São os dois pontos que ficam à mesma distância da origem.',
            },
            {
              descricao: 'Resolvemos cada caso separadamente.',
              tex: `x = ${gabarito.paraTex()} \\qquad \\text{ou} \\qquad x = ${menor.paraTex()}`,
            },
            {
              descricao: 'A maior delas é a resposta pedida.',
              tex: `x = ${gabarito.paraTex()}`,
            },
          ],
        },
        conceitos: ['modular.equacoes', 'modular.distancia'],
        armadilhas: semColisoes(
          [
            {
              resposta: menor,
              diagnostico:
                'Essa é a outra solução, a menor. A equação modular tem DUAS respostas, e o ' +
                'enunciado pede a maior.',
              passo: 1,
              conceito: 'modular.equacoes',
            },
            {
              resposta: Fracao.criar(k + b, a).simplificar(),
              diagnostico:
                'Houve troca de sinal ao isolar x. Confira: o termo constante passa para o ' +
                'outro lado com o sinal trocado.',
              passo: 1,
              conceito: 'modular.equacoes',
            },
          ],
          gabarito,
          saoEquivalentes,
        ),
      };
    }

    const x = rng.inteiro(-6, 6);
    const dentro = a * x + b;
    const gabarito = Fracao.deInteiro(Math.abs(dentro));

    return {
      id: `modular-valor-${a}-${b}-${x}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Qual é o valor de f(${x})?`,
      enunciadoTex: funcaoTex,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: `Substituímos x por ${x} dentro do módulo.`,
            tex: `f(${x}) = \\left|${a}(${x}) ${b >= 0 ? '+' : '-'} ${Math.abs(b)}\\right|`,
          },
          { descricao: 'Calculamos o que está dentro.', tex: `= \\left|${dentro}\\right|` },
          {
            descricao:
              dentro < 0
                ? 'O resultado interno é negativo, e o módulo o torna positivo.'
                : 'O resultado interno já é positivo, e o módulo não muda nada.',
            tex: `= ${Math.abs(dentro)}`,
          },
        ],
      },
      conceitos: ['modular.distancia'],
      armadilhas: semColisoes(
        [
          {
            resposta: Fracao.deInteiro(dentro),
            diagnostico:
              'O módulo nunca devolve um número negativo — ele é uma DISTÂNCIA até zero. ' +
              `Aqui o valor interno é ${dentro}, cuja distância até a origem é ${Math.abs(dentro)}.`,
            passo: 2,
            conceito: 'modular.distancia',
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

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['valor', 'bico']);
    case 'medio':
      return rng.escolher<Pergunta>(['valor', 'bico', 'equacao']);
    case 'dificil':
      return rng.escolher<Pergunta>(['bico', 'equacao']);
  }
}
