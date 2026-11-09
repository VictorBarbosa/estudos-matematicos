import { Polinomio } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  nivelAoMenos,
  semColisoes,
} from '@core/treino/models/treino.model';

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
    if (nivel === 'facil') {
      return exercicioAvaliar(nivel, rng);
    }
    // No Extremo entra um produto de binômios a distribuir antes de reduzir.
    if (nivel === 'extremo' && rng.booleano()) {
      return exercicioDistribuir(nivel, rng);
    }
    return exercicioReduzir(nivel, rng);
  },

  analisar: analisarNumero,

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
    rng.inteiro(nivelAoMenos(nivel, 'dificil') ? -4 : 1, 4),
  );

  const subtrai = nivelAoMenos(nivel, 'dificil') ? rng.booleano() : false;
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

/**
 * Distribuir um escalar e um produto de binômios, e só então reduzir.
 *
 * O Extremo era a soma e a subtração do Difícil com os mesmos números. Aqui é
 * preciso multiplicar antes de juntar: k(ax² + bx + c) − (dx + e)(fx + g). O
 * termo em x recebe contribuição de dois lugares, e esquecer um deles é o erro.
 */
function exercicioDistribuir(nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = rng.escolher([2, 3, 4, 5, -2, -3]);
  const p = Polinomio.de(rng.inteiro(-6, 6), rng.inteiro(-6, 6), rng.inteiro(1, 4));
  const d = rng.inteiro(1, 4);
  const e = rng.inteiro(-5, 5) || 1;
  const fCoef = rng.inteiro(1, 4);
  const g = rng.inteiro(-5, 5) || -1;

  const binomio1 = Polinomio.de(e, d);
  const binomio2 = Polinomio.de(g, fCoef);
  const escalado = p.escalar(k);
  const produto = binomio1.multiplicar(binomio2);
  const resultado = escalado.subtrair(produto);
  const gabarito = resultado.coeficiente(1);

  const pTex = p.paraTex();
  const enunciadoTex = `${k}\\left(${pTex}\\right) - \\left(${binomio1.paraTex()}\\right)\\left(${binomio2.paraTex()}\\right)`;

  return {
    id: `expressoes-distribuir-${k}-${pTex}-${d}${e}${fCoef}${g}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Distribua, reduza os termos semelhantes e informe o coeficiente de x.',
    enunciadoTex,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Distribuímos o ${k} por todos os termos do primeiro parêntese.`,
          tex: `${k}\\left(${pTex}\\right) = ${escalado.paraTex()}`,
        },
        {
          descricao: 'Multiplicamos os binômios, cada termo do primeiro por cada termo do segundo.',
          tex:
            `\\left(${binomio1.paraTex()}\\right)\\left(${binomio2.paraTex()}\\right) = ` +
            `${produto.paraTex()}`,
          nota: `O termo em x vem de dois produtos cruzados: ${d}·${g} e ${e}·${fCoef}.`,
        },
        {
          descricao: 'O sinal de menos troca o sinal de TODO o produto.',
          tex: `${escalado.paraTex()} - \\left(${produto.paraTex()}\\right) = ${resultado.paraTex()}`,
        },
        {
          descricao: 'O coeficiente de x é o que o enunciado pede.',
          tex: `${k} \\cdot ${p.coeficiente(1)} - (${d * g} + ${e * fCoef}) = ${gabarito}`,
        },
      ],
    },
    conceitos: ['expressoes.distributiva', 'expressoes.semelhantes'],
    armadilhas: semColisoes(
      [
        {
          resposta: escalado.somar(produto).coeficiente(1),
          diagnostico:
            'O menos antes do produto vale para o produto INTEIRO: cada termo dele troca de sinal.',
          passo: 2,
          conceito: 'expressoes.distributiva',
        },
        {
          resposta: k * p.coeficiente(1) - d * g,
          diagnostico:
            'No produto dos binômios, o termo em x tem DUAS contribuições cruzadas. Faltou uma.',
          passo: 1,
          conceito: 'expressoes.distributiva',
        },
        {
          resposta: p.coeficiente(1) - produto.coeficiente(1),
          diagnostico: `O ${k} multiplica todos os termos do primeiro parêntese, inclusive o de x.`,
          passo: 0,
          conceito: 'expressoes.distributiva',
        },
      ],
      gabarito,
      saoIguais,
    ),
  };
}
