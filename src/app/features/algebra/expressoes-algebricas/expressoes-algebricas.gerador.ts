import { Polinomio } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const saoIguais = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;

/**
 * Exercícios de expressões algébricas.
 *
 * No nível fácil pedimos o valor numérico; nos demais, o coeficiente de um
 * termo após reduzir — o que exige ter agrupado corretamente os semelhantes.
 */
export const geradorExpressoes: GeradorExercicio<number> = {
  topicoId: 'expressoes-algebricas',
  formatoResposta: 'um número, ex.: 10 ou -3',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    return nivel === 'facil' ? exercicioAvaliar(nivel, rng) : exercicioReduzir(nivel, rng);
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');
    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: saoIguais,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function exercicioAvaliar(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, 4);
  const b = rng.inteiro(-6, 6);
  const c = rng.inteiro(-8, 8);
  const x = rng.inteiro(-4, 5);

  const polinomio = Polinomio.de(c, b, a);
  const gabarito = polinomio.avaliar(x);

  return {
    id: `expressoes-avaliar-${a}${b}${c}-${x}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule o valor numérico da expressão para x = ${x}.`,
    enunciadoTex: `${polinomio.paraTex()} \\quad \\text{com} \\quad x = ${x}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Substituímos x por ${x} em cada termo.`,
          tex: `${a}(${x})^{2} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}(${x}) ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`,
        },
        {
          descricao: 'Resolvemos a potência antes dos produtos.',
          tex: `${a} \\cdot ${x * x} ${b >= 0 ? '+' : '-'} ${Math.abs(b)} \\cdot ${x < 0 ? `(${x})` : x} ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`,
        },
        {
          descricao: 'Efetuamos os produtos e somamos.',
          tex: `= ${a * x * x} ${b * x >= 0 ? '+' : '-'} ${Math.abs(b * x)} ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['expressoes.variavel'],
    armadilhas: semColisoes(
      [
        {
          // Tratou x² como 2x.
          resposta: a * 2 * x + b * x + c,
          diagnostico:
            'Parece que x² foi lido como 2x. Elevar ao quadrado é multiplicar x por ele ' +
            `mesmo: para x = ${x}, x² = ${x * x}, e não ${2 * x}.`,
          passo: 1,
          conceito: 'expressoes.variavel',
        },
        {
          // Esqueceu o sinal do x negativo na potência.
          resposta: a * -(x * x) + b * x + c,
          diagnostico:
            'Um número negativo elevado ao quadrado fica POSITIVO, porque os dois sinais se ' +
            'cancelam na multiplicação.',
          passo: 1,
          conceito: 'expressoes.variavel',
        },
      ],
      gabarito,
      saoIguais,
    ),
    dica: 'Resolva a potência antes dos produtos e das somas.',
  };
}

function exercicioReduzir(nivel: Nivel, rng: Rng): Exercicio<number> {
  // Duas expressões que serão somadas ou subtraídas.
  const primeira = Polinomio.de(rng.inteiro(-8, 8), rng.inteiro(-6, 6), rng.inteiro(1, 5));
  const segunda = Polinomio.de(
    rng.inteiro(-8, 8),
    rng.inteiro(-6, 6),
    rng.inteiro(nivel === 'dificil' ? -4 : 1, 4),
  );

  const subtrai = nivel === 'dificil' ? rng.booleano() : false;
  const resultado = subtrai ? primeira.subtrair(segunda) : primeira.somar(segunda);

  // Pedimos o coeficiente de x, o termo em que os erros de sinal aparecem.
  const gabarito = resultado.coeficiente(1);

  const operador = subtrai ? '-' : '+';
  const enunciadoTex = `\\left(${primeira.paraTex()}\\right) ${operador} \\left(${segunda.paraTex()}\\right)`;

  return {
    id: `expressoes-reduzir-${primeira.paraTex()}-${operador}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Reduza os termos semelhantes e informe o coeficiente de x no resultado.',
    enunciadoTex,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        { descricao: 'Partimos da expressão.', tex: enunciadoTex },
        ...(subtrai
          ? [
              {
                descricao: 'O sinal de menos distribui sobre TODOS os termos do segundo parêntese.',
                tex: `${primeira.paraTex()} ${segunda.escalar(-1).paraTex().startsWith('-') ? '' : '+ '}${segunda.escalar(-1).paraTex()}`,
                nota: 'Cada termo de dentro troca de sinal, não apenas o primeiro.',
              },
            ]
          : []),
        {
          descricao: 'Agrupamos os termos de mesmo grau e somamos os coeficientes.',
          tex: `= ${resultado.paraTex()}`,
        },
        {
          descricao: 'O coeficiente de x é o que o enunciado pede.',
          tex: `${gabarito}`,
        },
      ],
    },
    conceitos: subtrai
      ? ['expressoes.distributiva', 'expressoes.semelhantes']
      : ['expressoes.semelhantes'],
    armadilhas: semColisoes(
      [
        {
          // Somou quando deveria subtrair o segundo polinômio inteiro.
          resposta: primeira.somar(segunda).coeficiente(1),
          diagnostico:
            'O sinal de menos antes do parêntese precisa ser distribuído sobre todos os ' +
            'termos de dentro. Parece que ele foi aplicado só ao primeiro.',
          passo: 1,
          conceito: 'expressoes.distributiva',
        },
        {
          // Somou coeficientes de graus diferentes.
          resposta: resultado.coeficiente(1) + resultado.coeficiente(2),
          diagnostico:
            'Termos de graus diferentes não se somam: x e x² são "unidades" distintas. ' +
            'Some apenas os coeficientes dos termos com a mesma potência.',
          passo: 2,
          conceito: 'expressoes.semelhantes',
        },
      ],
      gabarito,
      saoIguais,
    ),
  };
}
