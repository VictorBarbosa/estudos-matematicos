import {
  derivadaExponencialComPassos,
  derivadaExponencialDeBaseComPassos,
  derivadaLogaritmoComPassos,
  derivadaLogaritmoDeBaseComPassos,
  derivadaLogaritmoDePotenciaComPassos,
  derivadaProdutoComExponencialComPassos,
  exponencialParaTex,
  logaritmoParaTex,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  semColisoes,
} from '@core/treino/models/treino.model';

/**
 * Exercícios de derivada de exponencial e logaritmo.
 *
 * Os dois erros que este tópico existe para pegar são o mesmo erro visto de
 * dois ângulos: confundir quem é base e quem é expoente. Derivar `2ˣ` como
 * `x·2ˣ⁻¹` aplica a regra da potência onde ela não vale; achar que a derivada
 * de `ln(5x)` é `5/x` esquece que o 5 virou parcela, não fator.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

type Tipo = 'exponencial' | 'logaritmo' | 'base' | 'log-base' | 'produto' | 'potencia-no-log';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['exponencial', 'logaritmo'],
  medio: ['exponencial', 'logaritmo', 'base', 'potencia-no-log'],
  dificil: ['base', 'log-base', 'produto', 'potencia-no-log'],
  // Potência dentro do log e produto: as duas que encadeiam propriedade do
  // logaritmo com regra de derivação.
  extremo: ['potencia-no-log', 'produto'],
};

export const geradorDerivadasExpLog: GeradorExercicio<number> = {
  topicoId: 'derivadas-exponencial-logaritmo',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'exponencial':
        return daExponencial(nivel, rng);
      case 'logaritmo':
        return doLogaritmo(nivel, rng);
      case 'base':
        return daBaseQualquer(nivel, rng);
      case 'log-base':
        return doLogaritmoDeBase(nivel, rng);
      case 'produto':
        return doProduto(nivel, rng);
      default:
        return daPotenciaNoLogaritmo(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** `a·e^{kx}`: a função que é a própria derivada, a menos do fator interno. */
function daExponencial(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, 6);
  const k = nivel === 'facil' ? 1 : rng.inteiro(-3, 3) || 2;
  const x0 = rng.inteiro(-2, 2);

  const gabarito = a * k * Math.exp(k * x0);

  return montar({
    chave: `exp-${a}-${k}-${x0}`,
    nivel,
    rng,
    enunciado: `Derive e calcule f'(${x0}). ${PEDIDO}`,
    enunciadoTex: `f(x) = ${exponencialParaTex(a, k)}`,
    gabarito,
    resolucao: derivadaExponencialComPassos(a, k, x0),
    conceitos: ['exp-log.exponencial', 'exp-log.cadeia-no-expoente'],
    armadilhas: [
      {
        resposta: a * Math.exp(k * x0),
        diagnostico:
          `Faltou o fator ${k}, que a cadeia traz do expoente para fora. A exponencial é a ` +
          'própria derivada só quando o expoente é exatamente x.',
        passo: 1,
        conceito: 'exp-log.cadeia-no-expoente',
      },
      {
        resposta: a * k * x0 * Math.exp(k * x0 - 1),
        diagnostico:
          'A regra da potência não vale aqui: em e elevado a x, o x está no EXPOENTE, e não na ' +
          'base. Baixar o expoente é o erro clássico do tópico.',
        passo: 0,
        conceito: 'exp-log.base-ou-expoente',
      },
      {
        resposta: a * k * k * Math.exp(k * x0),
        diagnostico:
          'O fator interno entra uma vez só. Multiplicá-lo duas vezes é derivar a função duas ' +
          'vezes sem querer.',
        passo: 1,
        conceito: 'exp-log.cadeia-no-expoente',
      },
    ],
    dica: nivel === 'facil' ? 'A exponencial natural não muda de forma ao derivar.' : undefined,
  });
}

/** `a·ln(kx)`: o k some, e é esse o ponto. */
function doLogaritmo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, 8);
  const k = nivel === 'facil' ? 1 : rng.inteiro(2, 9);
  const x0 = rng.inteiro(1, 10);

  const gabarito = a / x0;

  return montar({
    chave: `log-${a}-${k}-${x0}`,
    nivel,
    rng,
    enunciado: `Derive e calcule f'(${x0}). ${PEDIDO}`,
    enunciadoTex: `f(x) = ${logaritmoParaTex(a, k)}`,
    gabarito,
    resolucao: derivadaLogaritmoComPassos(a, k, x0),
    conceitos: ['exp-log.logaritmo', 'exp-log.constante-no-logaritmo'],
    armadilhas: [
      {
        resposta: (a * k) / x0,
        diagnostico:
          `O ${k} de dentro do logaritmo não sobrevive à derivada: pela propriedade do produto, ` +
          'ele vira uma parcela constante, e constante derivada dá zero.',
        passo: 1,
        conceito: 'exp-log.constante-no-logaritmo',
      },
      {
        resposta: a / (k * x0),
        diagnostico:
          'A cadeia foi aplicada como se o fator interno dividisse o resultado. Ele aparece no ' +
          'numerador e no denominador ao mesmo tempo, e por isso se cancela.',
        passo: 1,
        conceito: 'exp-log.constante-no-logaritmo',
      },
      {
        resposta: a * Math.log(k * x0),
        diagnostico: 'Esse é o valor da própria função no ponto, não o da derivada.',
        passo: 2,
        conceito: 'exp-log.logaritmo',
      },
    ],
    dica:
      nivel === 'facil'
        ? 'A derivada do logaritmo natural é o inverso de x.'
        : 'Separe o logaritmo do produto antes de derivar.',
  });
}

/** `a·bˣ`: a base deixa de ser e, e aparece o fator ln b. */
function daBaseQualquer(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, 5);
  const base = rng.escolher([2, 3, 5, 10]);
  const x0 = rng.inteiro(0, 4);

  const gabarito = a * base ** x0 * Math.log(base);

  return montar({
    chave: `base-${a}-${base}-${x0}`,
    nivel,
    rng,
    enunciado: `Derive e calcule f'(${x0}). ${PEDIDO}`,
    enunciadoTex: `f(x) = ${a === 1 ? '' : `${a}\\cdot `}${base}^{x}`,
    gabarito,
    resolucao: derivadaExponencialDeBaseComPassos(a, base, x0),
    conceitos: ['exp-log.base-qualquer', 'exp-log.base-ou-expoente'],
    armadilhas: [
      {
        resposta: a * base ** x0,
        diagnostico:
          `Faltou o fator que vem da mudança de base. Só com base e esse fator vale 1; com base ` +
          `${base} ele é o logaritmo natural de ${base}.`,
        passo: 1,
        conceito: 'exp-log.base-qualquer',
      },
      {
        resposta: a * x0 * base ** (x0 - 1),
        diagnostico:
          'Isso é a regra da potência, que serve para x elevado a uma constante. Aqui a ' +
          'constante é a base e o x é o expoente, e a regra é outra.',
        passo: 0,
        conceito: 'exp-log.base-ou-expoente',
      },
      {
        resposta: (a * base ** x0) / Math.log(base),
        diagnostico:
          'O logaritmo da base multiplica a derivada da exponencial; quem divide por ele é a ' +
          'derivada do logaritmo de base b, que é outra função.',
        passo: 1,
        conceito: 'exp-log.base-qualquer',
      },
    ],
  });
}

/** `a·log_b(x)`: a inversa do caso anterior, e o ln b muda de lado. */
function doLogaritmoDeBase(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, 6);
  const base = rng.escolher([2, 3, 5, 10]);
  const x0 = rng.inteiro(1, 12);

  const gabarito = a / (x0 * Math.log(base));

  return montar({
    chave: `logbase-${a}-${base}-${x0}`,
    nivel,
    rng,
    enunciado: `Derive e calcule f'(${x0}). ${PEDIDO}`,
    enunciadoTex: `f(x) = ${a === 1 ? '' : a}\\log_{${base}} x`,
    gabarito,
    resolucao: derivadaLogaritmoDeBaseComPassos(a, base, x0),
    conceitos: ['exp-log.logaritmo-de-base', 'exp-log.logaritmo'],
    armadilhas: [
      {
        resposta: a / x0,
        diagnostico:
          `Essa é a derivada do logaritmo NATURAL. Com base ${base} ainda falta dividir pelo ` +
          `logaritmo natural de ${base}, que vem da mudança de base.`,
        passo: 1,
        conceito: 'exp-log.logaritmo-de-base',
      },
      {
        resposta: (a * Math.log(base)) / x0,
        diagnostico:
          'O logaritmo da base está no lugar errado: na mudança de base ele fica no denominador, ' +
          'porque divide o logaritmo natural.',
        passo: 1,
        conceito: 'exp-log.logaritmo-de-base',
      },
    ],
  });
}

/** `xⁿ·e^{kx}`: a forma que aparece em todo decaimento com atraso. */
function doProduto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const n = rng.inteiro(1, 3);
  const k = rng.escolher([-2, -1, 1, 2]);
  const x0 = rng.inteiro(1, 3);

  const gabarito = Math.exp(k * x0) * (n * x0 ** (n - 1) + k * x0 ** n);

  return montar({
    chave: `prodexp-${n}-${k}-${x0}`,
    nivel,
    rng,
    enunciado: `Derive e calcule f'(${x0}). ${PEDIDO}`,
    enunciadoTex: `f(x) = ${n === 1 ? 'x' : `x^{${n}}`}e^{${k === 1 ? 'x' : k === -1 ? '-x' : `${k}x`}}`,
    gabarito,
    resolucao: derivadaProdutoComExponencialComPassos(n, k, x0),
    conceitos: ['exp-log.produto', 'exp-log.exponencial'],
    armadilhas: [
      {
        resposta: n * x0 ** (n - 1) * k * Math.exp(k * x0),
        diagnostico:
          'A derivada de um produto não é o produto das derivadas. São duas parcelas somadas.',
        passo: 0,
        conceito: 'exp-log.produto',
      },
      {
        resposta: Math.exp(k * x0) * n * x0 ** (n - 1),
        diagnostico:
          'Só a primeira parcela foi escrita: a potência derivada vezes a exponencial. Falta a ' +
          'parcela em que a exponencial é que deriva.',
        passo: 1,
        conceito: 'exp-log.produto',
      },
      {
        resposta: Math.exp(k * x0) * (n * x0 ** (n - 1) + x0 ** n),
        diagnostico:
          `Ao derivar a exponencial, o fator ${k} do expoente precisa sair junto. Sem ele a ` +
          'segunda parcela fica incompleta.',
        passo: 1,
        conceito: 'exp-log.cadeia-no-expoente',
      },
    ],
  });
}

/** `a·ln(xⁿ)`: simplificar antes de derivar poupa a cadeia inteira. */
function daPotenciaNoLogaritmo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, 5);
  const n = rng.inteiro(2, 5);
  const x0 = rng.inteiro(1, 10);

  const gabarito = (a * n) / x0;

  return montar({
    chave: `logpot-${a}-${n}-${x0}`,
    nivel,
    rng,
    enunciado: `Derive e calcule f'(${x0}). ${PEDIDO}`,
    enunciadoTex: `f(x) = ${a === 1 ? '' : a}\\ln\\left(x^{${n}}\\right)`,
    gabarito,
    resolucao: derivadaLogaritmoDePotenciaComPassos(a, n, x0),
    conceitos: ['exp-log.potencia-no-logaritmo', 'exp-log.logaritmo'],
    armadilhas: [
      {
        resposta: a / x0,
        diagnostico:
          `O expoente ${n} desce como fator pela propriedade do logaritmo, e precisa aparecer na ` +
          'derivada. Sem ele a resposta fica um múltiplo abaixo.',
        passo: 0,
        conceito: 'exp-log.potencia-no-logaritmo',
      },
      {
        resposta: (a * n) / x0 ** n,
        diagnostico:
          'O denominador é x, e não x elevado ao expoente: depois de baixar a potência, o que ' +
          'resta por dentro do logaritmo é só o x.',
        passo: 1,
        conceito: 'exp-log.potencia-no-logaritmo',
      },
      {
        resposta: (a * n * x0 ** (n - 1)) / x0 ** n,
        diagnostico:
          'A cadeia foi aplicada sem simplificar antes. O resultado até chega ao mesmo lugar, ' +
          'mas o caminho mais curto é baixar o expoente primeiro.',
        passo: 0,
        conceito: 'exp-log.potencia-no-logaritmo',
      },
    ],
  });
}

interface Pedido {
  readonly chave: string;
  readonly nivel: Nivel;
  readonly rng: Rng;
  readonly enunciado: string;
  readonly enunciadoTex: string;
  readonly gabarito: number;
  readonly resolucao: Exercicio<number>['resolucao'];
  readonly conceitos: readonly string[];
  readonly armadilhas: readonly Armadilha<number>[];
  readonly dica?: string;
}

function montar(pedido: Pedido): Exercicio<number> {
  return {
    id: `${pedido.chave}-${pedido.rng.inteiro(0, 9999)}`,
    nivel: pedido.nivel,
    enunciado: pedido.enunciado,
    enunciadoTex: pedido.enunciadoTex,
    gabarito: pedido.gabarito,
    resolucao: pedido.resolucao,
    conceitos: pedido.conceitos,
    armadilhas: semColisoes(
      pedido.armadilhas.filter((armadilha) => Number.isFinite(armadilha.resposta)),
      pedido.gabarito,
      saoEquivalentes,
    ),
    dica: pedido.dica,
  };
}
