import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Tolerância de correção: as duas casas decimais que o enunciado pede, ou
 * 0,01% relativos quando o valor é grande.
 *
 * Antes era 1e-6 absoluto na detecção de armadilhas e 0,01% relativo na
 * correção, o que reprovava justamente a resposta pedida: com base 3, o tempo
 * de duplicação é 0,6309 e "0,63" contava como erro.
 */
const proximos = (a: number, b: number): boolean =>
  Math.abs(a - b) <= Math.max(0.005, Math.abs(b) * 1e-4);

type Pergunta = 'valor' | 'inicial' | 'duplicacao' | 'meia-vida';

/** O número e, a base natural, escrito como o enunciado o apresenta. */
const E_TEX = 'e';

/**
 * Exercícios de função exponencial.
 *
 * As armadilhas atacam a confusão central do tema: tratar bˣ como b·x, ou
 * seja, aplicar raciocínio linear a um crescimento multiplicativo.
 */
export const geradorExponencial: GeradorExercicio<number> = {
  topicoId: 'funcao-exponencial',
  formatoResposta: 'um número, ex.: 800 ou 0,25',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);
    const base = sortearBase(nivel, rng);
    const inicial = rng.inteiro(1, 40) * rng.escolher([1, 5, 10]);

    const baseTex = base === Math.E ? E_TEX : String(base);
    const funcaoTex = `f(x) = ${inicial === 1 ? '' : inicial + ' \\cdot '}${baseTex}^{x}`;

    if (pergunta === 'meia-vida') {
      // Decaimento N(t) = N₀·e^(−λt): a meia-vida é ln2/λ e não depende de N₀.
      const lambda = rng.escolher([0.05, 0.1, 0.2, 0.25, 0.4, 0.5, 0.693]);
      const gabarito = Math.log(2) / lambda;

      return {
        id: `exponencial-meiavida-${lambda}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          `Uma amostra decai segundo N(t) = N₀·e^(−${String(lambda).replace('.', ',')}t), com t ` +
          'em anos. Qual é a meia-vida? (arredonde para 2 casas)',
        enunciadoTex: `N(t) = N_0 e^{-${String(lambda).replace('.', '{,}')}\\,t}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Meia-vida é o tempo em que resta metade da amostra.',
              tex: `N_0 e^{-${String(lambda).replace('.', '{,}')}t} = \\frac{N_0}{2}`,
            },
            {
              descricao: 'O N₀ se cancela: a meia-vida não depende da quantidade inicial.',
              tex: `e^{-${String(lambda).replace('.', '{,}')}t} = \\frac{1}{2}`,
            },
            {
              descricao: 'Aplicamos o logaritmo natural para tirar t do expoente.',
              tex: `t = \\frac{\\ln 2}{${String(lambda).replace('.', '{,}')}} \\approx ${gabarito.toFixed(4)}`,
              nota: 'Com três meias-vidas resta 1/8 da amostra — nunca zero.',
            },
          ],
        },
        conceitos: ['exponencial.meia-vida', 'exponencial.numero-e'],
        armadilhas: semColisoes(
          [
            {
              resposta: 1 / (2 * lambda),
              diagnostico:
                'Meia-vida não é "metade de 1/λ". O t está no EXPOENTE, então sair dele ' +
                'exige logaritmo: t = ln2/λ.',
              passo: 2,
              conceito: 'exponencial.meia-vida',
            },
            {
              resposta: Math.log(0.5) / lambda,
              diagnostico:
                'O sinal ficou invertido: ln(1/2) é negativo e o expoente também, e os dois ' +
                'negativos se cancelam. A meia-vida é positiva.',
              passo: 2,
              conceito: 'exponencial.meia-vida',
            },
            {
              resposta: Math.log(10) / lambda,
              diagnostico: 'Esse é o tempo para cair a um DÉCIMO. Para a metade, usa-se ln 2.',
              passo: 0,
              conceito: 'exponencial.meia-vida',
            },
          ],
          gabarito,
          proximos,
        ),
        dica:
          nivel === 'medio'
            ? 'Divida os dois lados por N₀ e aplique ln. O que sobra é ln2/λ.'
            : undefined,
      };
    }

    if (pergunta === 'duplicacao') {
      const gabarito = Math.log(2) / Math.log(base);

      return {
        id: `exponencial-duplicacao-${base}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          'Quantas unidades de x são necessárias para o valor DOBRAR? (arredonde para 2 casas)',
        enunciadoTex: funcaoTex,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: 'Queremos o t que faz o valor dobrar.', tex: `${base}^{t} = 2` },
            {
              descricao: 'Aplicamos logaritmo nos dois lados para tirar t do expoente.',
              tex: `t \\cdot \\ln ${base} = \\ln 2`,
            },
            {
              descricao: 'Isolando t.',
              tex: `t = \\frac{\\ln 2}{\\ln ${base}} \\approx ${gabarito.toFixed(4)}`,
              nota: 'Esse tempo é o mesmo partindo de qualquer valor.',
            },
          ],
        },
        conceitos: ['exponencial.crescimento'],
        armadilhas: semColisoes(
          [
            {
              resposta: 2 / base,
              diagnostico:
                'Dobrar não é dividir 2 pela base. O t aparece no EXPOENTE, então é preciso ' +
                'usar logaritmo para isolá-lo.',
              passo: 1,
              conceito: 'exponencial.crescimento',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    if (pergunta === 'inicial') {
      const gabarito = inicial;

      return {
        id: `exponencial-inicial-${inicial}-${base}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Qual é o valor da função em x = 0?',
        enunciadoTex: funcaoTex,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: 'Substituímos x por zero.', tex: `f(0) = ${inicial} \\cdot ${base}^{0}` },
            {
              descricao: 'Qualquer base não nula elevada a zero vale 1.',
              tex: `${base}^{0} = 1`,
              nota: 'Isso vem da regra do quociente de potências, não de convenção.',
            },
            { descricao: 'Sobra apenas o coeficiente inicial.', tex: `f(0) = ${inicial}` },
          ],
        },
        conceitos: ['exponencial.definicao'],
        armadilhas: semColisoes(
          [
            {
              resposta: 0,
              diagnostico:
                'Base elevada a zero não é zero, é UM. Por isso f(0) é o coeficiente que ' +
                'multiplica a potência, e a exponencial nunca passa pela origem.',
              passo: 1,
              conceito: 'exponencial.definicao',
            },
            {
              resposta: inicial * base,
              diagnostico: 'Esse é o valor em x = 1. Em x = 0 a potência vale 1, não a base.',
              passo: 1,
              conceito: 'exponencial.definicao',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: 'Quanto vale qualquer número elevado a zero?',
      };
    }

    const x = rng.inteiro(nivel === 'dificil' ? -5 : 1, 7);
    const gabarito = inicial * base ** x;

    return {
      id: `exponencial-valor-${inicial}-${base}-${x}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Qual é o valor de f(${x})?`,
      enunciadoTex: funcaoTex,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          { descricao: `Substituímos x por ${x}.`, tex: `f(${x}) = ${inicial} \\cdot ${base}^{${x}}` },
          {
            descricao:
              x >= 0
                ? 'Calculamos a potência.'
                : 'Expoente negativo significa inverter a potência.',
            tex:
              x >= 0
                ? `${base}^{${x}} = ${base ** x}`
                : `${base}^{${x}} = \\frac{1}{${base}^{${-x}}} = ${base ** x}`,
          },
          { descricao: 'Multiplicamos pelo coeficiente.', tex: `f(${x}) = ${gabarito}` },
        ],
      },
      conceitos: ['exponencial.definicao', 'exponencial.crescimento'],
      armadilhas: semColisoes(
        [
          {
            resposta: inicial * base * x,
            diagnostico:
              `Você multiplicou a base por ${x} em vez de elevá-la. Potência é multiplicação ` +
              `REPETIDA: ${base}^${x} significa multiplicar ${base} por si mesmo ${Math.abs(x)} vezes.`,
            passo: 1,
            conceito: 'exponencial.definicao',
          },
          {
            resposta: (inicial * base) ** x,
            diagnostico:
              'O coeficiente não entra na potência. Na expressão a·bˣ, o expoente age apenas ' +
              'sobre a base b.',
            passo: 0,
            conceito: 'exponencial.definicao',
          },
          {
            resposta: -(inicial * base ** Math.abs(x)),
            diagnostico:
              'Expoente negativo não torna o resultado negativo: ele INVERTE o valor. ' +
              'A exponencial de base positiva é sempre positiva.',
            passo: 1,
            conceito: 'exponencial.assintota',
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
      return rng.escolher<Pergunta>(['valor', 'inicial']);
    case 'medio':
      return rng.escolher<Pergunta>(['valor', 'inicial', 'duplicacao', 'meia-vida']);
    case 'dificil':
      return rng.escolher<Pergunta>(['valor', 'duplicacao', 'meia-vida']);
  }
}

function sortearBase(nivel: Nivel, rng: Rng): number {
  if (nivel === 'facil') {
    return rng.escolher([2, 3, 10]);
  }
  // A base natural entra a partir do Médio: é a base do cálculo, e o currículo
  // promete o número e neste tópico.
  return rng.escolher(
    nivel === 'medio' ? [2, 3, 4, 5, 10, Math.E] : [2, 3, 5, 0.5, 0.2, Math.E],
  );
}
