import {
  FuncaoRacional,
  Passo,
  Polinomio,
  analisarRacionalComPassos,
  assintotaOuBuracoComPassos,
  avaliarRacional,
  comportamentoNoInfinitoComPassos,
  racionalParaTex,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Exercícios de função racional.
 *
 * O tópico gira em torno de uma distinção que quase todo mundo erra na
 * primeira vez: nem todo zero do denominador é assíntota. Quando o numerador
 * zera no mesmo ponto, o fator se cancela e o que sobra é um buraco — um
 * ponto removido, sem nada de dramático em volta.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

type Tipo = 'assintota' | 'horizontal' | 'buraco' | 'valor' | 'obliqua';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['assintota', 'valor'],
  medio: ['assintota', 'horizontal', 'valor', 'buraco'],
  dificil: ['horizontal', 'buraco', 'obliqua', 'valor'],
};

export const geradorFuncoesRacionais: GeradorExercicio<number> = {
  topicoId: 'funcoes-racionais',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'assintota':
        return daAssintota(nivel, rng);
      case 'horizontal':
        return daHorizontal(nivel, rng);
      case 'buraco':
        return doBuraco(nivel, rng);
      case 'obliqua':
        return daObliqua(nivel, rng);
      default:
        return doValor(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** Onde está a assíntota vertical. */
function daAssintota(nivel: Nivel, rng: Rng): Exercicio<number> {
  const polo = rng.inteiro(-7, 7) || 3;
  const zero = diferenteDe(rng, -8, 8, polo);
  const f: FuncaoRacional = {
    numerador: Polinomio.de(-zero, 1),
    denominador: Polinomio.de(-polo, 1),
  };

  return montar({
    chave: `ass-${polo}-${zero}`,
    nivel,
    rng,
    enunciado: `Em que valor de x está a assíntota vertical desta função? ${PEDIDO}`,
    enunciadoTex: `f(x) = ${racionalParaTex(f)}`,
    gabarito: polo,
    resolucao: ate(analisarRacionalComPassos(f), 2, polo),
    conceitos: ['racionais.assintota-vertical', 'racionais.dominio'],
    armadilhas: [
      {
        resposta: zero,
        diagnostico:
          'Esse é o ZERO da função, onde o numerador se anula e o gráfico cruza o eixo x. A ' +
          'assíntota vertical vem do denominador.',
        passo: 0,
        conceito: 'racionais.assintota-vertical',
      },
      {
        resposta: -polo,
        diagnostico:
          'O sinal ficou invertido. A assíntota está onde o denominador ZERA, e para isso o x ' +
          'precisa anular a expressão inteira.',
        passo: 0,
        conceito: 'racionais.dominio',
      },
      {
        resposta: 0,
        diagnostico:
          'Zero só seria a assíntota se o denominador fosse um múltiplo de x. Aqui ele tem uma ' +
          'constante somada.',
        passo: 0,
        conceito: 'racionais.assintota-vertical',
      },
    ],
    dica: nivel === 'facil' ? 'Resolva a equação que anula o denominador.' : undefined,
  });
}

/** O valor da assíntota horizontal, pela comparação de graus. */
function daHorizontal(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, 9) * rng.sinal();
  const c = rng.inteiro(1, 9);
  const b = rng.inteiro(-6, 6);
  const d = rng.inteiro(-6, 6);

  const f: FuncaoRacional = {
    numerador: Polinomio.de(b, a),
    denominador: Polinomio.de(d, c),
  };

  const gabarito = a / c;

  return montar({
    chave: `hor-${a}${b}-${c}${d}`,
    nivel,
    rng,
    enunciado: `Qual é o valor da assíntota horizontal desta função? ${PEDIDO}`,
    enunciadoTex: `f(x) = ${racionalParaTex(f)}`,
    gabarito,
    resolucao: { resultado: gabarito, passos: comportamentoNoInfinitoComPassos(f).passos },
    conceitos: ['racionais.comportamento-no-infinito', 'racionais.assintota-vertical'],
    armadilhas: [
      {
        resposta: 0,
        diagnostico:
          'A assíntota só é zero quando o numerador tem grau MENOR que o denominador. Com graus ' +
          'iguais, sobra a razão dos coeficientes líderes.',
        passo: 1,
        conceito: 'racionais.comportamento-no-infinito',
      },
      {
        resposta: c / a,
        diagnostico:
          'A razão está invertida: é o coeficiente líder de cima dividido pelo de baixo, na ' +
          'mesma ordem em que a fração está escrita.',
        passo: 2,
        conceito: 'racionais.comportamento-no-infinito',
      },
      {
        resposta: b / d,
        diagnostico:
          'Entraram os termos constantes. Longe da origem quem manda é o termo de MAIOR grau; ' +
          'as constantes somem na comparação.',
        passo: 0,
        conceito: 'racionais.comportamento-no-infinito',
      },
    ],
  });
}

/** Onde está o buraco — o ponto removido que não é assíntota. */
function doBuraco(nivel: Nivel, rng: Rng): Exercicio<number> {
  const comum = rng.inteiro(-6, 6);
  const polo = diferenteDe(rng, -7, 7, comum);
  const zero = diferenteDe(rng, -7, 7, comum, polo);

  const f: FuncaoRacional = {
    numerador: Polinomio.de(-comum, 1).multiplicar(Polinomio.de(-zero, 1)),
    denominador: Polinomio.de(-comum, 1).multiplicar(Polinomio.de(-polo, 1)),
  };

  return montar({
    chave: `bur-${comum}-${polo}-${zero}`,
    nivel,
    rng,
    enunciado:
      'Esta função tem um buraco e uma assíntota vertical. Em que valor de x está o BURACO? ' +
      PEDIDO,
    enunciadoTex: `f(x) = ${racionalParaTex(f)}`,
    gabarito: comum,
    resolucao: { resultado: comum, passos: assintotaOuBuracoComPassos(f, comum).passos },
    conceitos: ['racionais.buraco', 'racionais.assintota-vertical'],
    armadilhas: [
      {
        resposta: polo,
        diagnostico:
          'Aí está a assíntota, não o buraco. O buraco acontece onde numerador E denominador ' +
          'zeram juntos — ali o fator se cancela e sobra um ponto removido.',
        passo: 1,
        conceito: 'racionais.buraco',
      },
      {
        resposta: zero,
        diagnostico:
          'Esse é um zero da função: o numerador se anula, mas o denominador não. O gráfico ' +
          'passa pelo eixo x ali, sem furo nenhum.',
        passo: 1,
        conceito: 'racionais.buraco',
      },
    ],
    dica: 'Procure o fator que aparece em cima e embaixo ao mesmo tempo.',
  });
}

/** A assíntota oblíqua: o quociente da divisão. */
function daObliqua(nivel: Nivel, rng: Rng): Exercicio<number> {
  // O líder de cima é múltiplo do de baixo, de modo que o coeficiente angular
  // da assíntota é inteiro — e aparece escrito na equação da reta.
  const d = rng.inteiro(1, 5);
  const a = d * rng.inteiro(1, 4);
  const b = rng.inteiro(-6, 6);
  const c = rng.inteiro(-6, 6);
  const e = rng.inteiro(-6, 6);

  const f: FuncaoRacional = {
    numerador: Polinomio.de(c, b, a),
    denominador: Polinomio.de(e, d),
  };

  // O coeficiente angular da assíntota oblíqua é a razão dos líderes.
  const gabarito = a / d;

  return montar({
    chave: `obl-${a}${b}${c}-${d}${e}`,
    nivel,
    rng,
    enunciado:
      'Esta função tem assíntota oblíqua. Qual é o coeficiente angular dessa reta? ' + PEDIDO,
    enunciadoTex: `f(x) = ${racionalParaTex(f)}`,
    gabarito,
    resolucao: { resultado: gabarito, passos: comportamentoNoInfinitoComPassos(f).passos },
    conceitos: ['racionais.assintota-obliqua', 'racionais.comportamento-no-infinito'],
    armadilhas: [
      {
        resposta: 0,
        diagnostico:
          'Com o numerador de grau MAIOR, não há assíntota horizontal: a função cresce sem ' +
          'limite, mas ao longo de uma reta inclinada.',
        passo: 1,
        conceito: 'racionais.assintota-obliqua',
      },
      {
        resposta: d / a,
        diagnostico:
          'A razão está invertida. O coeficiente angular é o líder de cima sobre o de baixo.',
        passo: 2,
        conceito: 'racionais.assintota-obliqua',
      },
      {
        resposta: b / d,
        diagnostico:
          'Entrou o coeficiente do termo de grau 1 do numerador. Quem define a inclinação é o ' +
          'termo de maior grau, que aqui é o quadrático.',
        passo: 0,
        conceito: 'racionais.comportamento-no-infinito',
      },
    ],
  });
}

/** O valor da função num ponto, com atenção ao domínio. */
function doValor(nivel: Nivel, rng: Rng): Exercicio<number> {
  const polo = rng.inteiro(-6, 6);
  const zero = diferenteDe(rng, -7, 7, polo);
  const ponto = diferenteDe(rng, -8, 8, polo);

  const f: FuncaoRacional = {
    numerador: Polinomio.de(-zero, 1),
    denominador: Polinomio.de(-polo, 1),
  };

  const gabarito = avaliarRacional(f, ponto);

  return montar({
    chave: `val-${polo}-${zero}-${ponto}`,
    nivel,
    rng,
    enunciado: `Quanto vale esta função em x = ${ponto}? ${PEDIDO}`,
    enunciadoTex: `f(x) = ${racionalParaTex(f)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Primeiro conferimos que ${ponto} está no domínio.`,
          tex: `${f.denominador.paraTex()} \\big|_{x = ${ponto}} = ${f.denominador.avaliar(ponto)} \\neq 0`,
          nota: 'Fora do domínio não há valor nenhum a calcular.',
        },
        {
          descricao: 'Substituímos em cima e embaixo.',
          tex: `f(${ponto}) = \\frac{${f.numerador.avaliar(ponto)}}{${f.denominador.avaliar(ponto)}}`,
        },
        {
          descricao: 'E efetuamos a divisão.',
          tex: `f(${ponto}) = ${String(Number(gabarito.toFixed(6))).replace('.', '{,}')}`,
        },
      ],
    },
    conceitos: ['racionais.dominio', 'racionais.assintota-vertical'],
    armadilhas: [
      {
        resposta: 1 / gabarito,
        diagnostico: 'A fração saiu invertida: o numerador da função é quem vai em cima.',
        passo: 1,
        conceito: 'racionais.dominio',
      },
      {
        resposta: f.numerador.avaliar(ponto) - f.denominador.avaliar(ponto),
        diagnostico:
          'Em vez de dividir, os dois valores foram subtraídos. A barra de fração é uma divisão.',
        passo: 1,
        conceito: 'racionais.dominio',
      },
    ],
  });
}

/**
 * Sorteia um inteiro na faixa, evitando os valores proibidos.
 *
 * Existe para que raiz do numerador e raiz do denominador nunca coincidam por
 * acaso — o que transformaria uma assíntota num buraco e inverteria a resposta.
 */
function diferenteDe(rng: Rng, min: number, max: number, ...proibidos: readonly number[]): number {
  const vetados = new Set(proibidos);

  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const candidato = rng.inteiro(min, max);
    if (!vetados.has(candidato)) {
      return candidato;
    }
  }

  return max + 1;
}

/** O recorte da resolução, quando o exercício para antes do fim da análise. */
function ate(
  base: { readonly passos: readonly Passo[] },
  passos: number,
  gabarito: number,
): Exercicio<number>['resolucao'] {
  return { resultado: gabarito, passos: base.passos.slice(0, passos) };
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
