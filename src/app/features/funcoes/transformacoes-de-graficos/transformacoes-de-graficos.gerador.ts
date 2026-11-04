import {
  Transformacao,
  pontoTransformadoComPassos,
  transformacaoParaTex,
  transformarPonto,
  verticeTransformadoComPassos,
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
 * Exercícios de transformação de gráficos.
 *
 * Quase toda armadilha aqui vem da mesma fonte: a assimetria entre dentro e
 * fora do argumento. Fora, a intuição acerta — somar sobe, multiplicar estica.
 * Dentro, tudo se inverte: somar desloca para a esquerda, multiplicar comprime.
 * Os exercícios atacam exatamente esse ponto, seguindo um ponto conhecido em
 * vez de pedir a curva inteira.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

type Tipo = 'vertice' | 'ponto-x' | 'ponto-y' | 'horizontal' | 'zero-deslocado';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['vertice', 'ponto-y'],
  medio: ['vertice', 'ponto-y', 'ponto-x', 'zero-deslocado'],
  dificil: ['ponto-x', 'horizontal', 'zero-deslocado'],
};

export const geradorTransformacoes: GeradorExercicio<number> = {
  topicoId: 'transformacoes-de-graficos',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'vertice':
        return doVertice(nivel, rng);
      case 'ponto-x':
        return doPontoX(nivel, rng);
      case 'ponto-y':
        return doPontoY(nivel, rng);
      case 'horizontal':
        return daHorizontal(nivel, rng);
      default:
        return doZeroDeslocado(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** Sorteia uma transformação, mais ou menos agressiva conforme o nível. */
function sortear(nivel: Nivel, rng: Rng): Transformacao {
  const a = nivel === 'facil' ? rng.inteiro(1, 3) : rng.inteiro(-4, 4) || 2;
  const b = nivel === 'dificil' ? rng.escolher([-3, -2, 2, 3]) : 1;
  const h = rng.inteiro(-5, 5);
  const k = rng.inteiro(-5, 5);

  return { a, b, h, k };
}

/** A abscissa do vértice: ler `h` direto, com o sinal certo. */
function doVertice(nivel: Nivel, rng: Rng): Exercicio<number> {
  const t = { ...sortear(nivel, rng), b: 1 };

  return montar({
    chave: `ver-${t.a}-${t.h}-${t.k}`,
    nivel,
    rng,
    enunciado: `Qual é a abscissa do vértice desta parábola? ${PEDIDO}`,
    enunciadoTex: parabolaTex(t),
    gabarito: t.h,
    resolucao: verticeTransformadoComPassos(t),
    conceitos: ['transformacoes.deslocamento', 'transformacoes.dentro-e-fora'],
    armadilhas: [
      {
        resposta: -t.h,
        diagnostico:
          'O sinal está invertido. Subtrair h DENTRO dos parênteses desloca o gráfico h para a ' +
          'DIREITA — o x precisa crescer para compensar a subtração.',
        passo: 2,
        conceito: 'transformacoes.dentro-e-fora',
      },
      {
        resposta: t.k,
        diagnostico:
          'Esse é o deslocamento vertical, que é a ordenada do vértice. A abscissa vem do que ' +
          'está dentro dos parênteses.',
        passo: 2,
        conceito: 'transformacoes.deslocamento',
      },
      {
        resposta: 0,
        diagnostico:
          'Zero seria o vértice da parábola básica. Esta foi deslocada, e o vértice andou junto.',
        passo: 0,
        conceito: 'transformacoes.deslocamento',
      },
    ],
    dica:
      nivel === 'facil' ? 'O vértice está onde o que está dentro dos parênteses zera.' : undefined,
  });
}

/** Para onde vai a abscissa de um ponto conhecido. */
function doPontoX(nivel: Nivel, rng: Rng): Exercicio<number> {
  const t = sortear(nivel, rng);
  const ponto = { x: rng.inteiro(-6, 6), y: rng.inteiro(-6, 6) };
  const destino = transformarPonto(ponto, t);

  return montar({
    chave: `px-${t.a}${t.b}${t.h}${t.k}-${ponto.x}${ponto.y}`,
    nivel,
    rng,
    enunciado:
      `O ponto (${ponto.x}, ${ponto.y}) pertence ao gráfico de f. Qual é a ABSCISSA do ponto ` +
      `correspondente no gráfico transformado? ${PEDIDO}`,
    enunciadoTex: `g(x) = ${transformacaoParaTex(t)}`,
    gabarito: destino.x,
    resolucao: pontoTransformadoComPassos(ponto, t),
    conceitos: ['transformacoes.dentro-e-fora', 'transformacoes.escala'],
    armadilhas: [
      {
        resposta: ponto.x * t.b + t.h,
        diagnostico:
          'A conta na horizontal é o AVESSO do que está escrito: para o argumento valer o x ' +
          'original, o novo x é o antigo DIVIDIDO por b, não multiplicado.',
        passo: 1,
        conceito: 'transformacoes.escala',
      },
      {
        resposta: ponto.x / t.b - t.h,
        diagnostico:
          'O deslocamento entrou com o sinal trocado. Subtrair h dentro dos parênteses move o ' +
          'gráfico para a direita, e o novo x é maior.',
        passo: 1,
        conceito: 'transformacoes.dentro-e-fora',
      },
      {
        resposta: destino.y,
        diagnostico:
          'Esse é o valor da ORDENADA transformada. O enunciado pede a abscissa, que vem da ' +
          'conta feita dentro dos parênteses.',
        passo: 2,
        conceito: 'transformacoes.dentro-e-fora',
      },
    ],
  });
}

/** Para onde vai a ordenada — a conta direta, sem inversão. */
function doPontoY(nivel: Nivel, rng: Rng): Exercicio<number> {
  const t = sortear(nivel, rng);
  const ponto = { x: rng.inteiro(-6, 6), y: rng.inteiro(-6, 6) };
  const destino = transformarPonto(ponto, t);

  return montar({
    chave: `py-${t.a}${t.b}${t.h}${t.k}-${ponto.x}${ponto.y}`,
    nivel,
    rng,
    enunciado:
      `O ponto (${ponto.x}, ${ponto.y}) pertence ao gráfico de f. Qual é a ORDENADA do ponto ` +
      `correspondente no gráfico transformado? ${PEDIDO}`,
    enunciadoTex: `g(x) = ${transformacaoParaTex(t)}`,
    gabarito: destino.y,
    resolucao: {
      resultado: destino.y,
      passos: pontoTransformadoComPassos(ponto, t).passos,
    },
    conceitos: ['transformacoes.escala', 'transformacoes.dentro-e-fora'],
    armadilhas: [
      {
        resposta: t.a * (ponto.y + t.k),
        diagnostico:
          'A ordem está trocada: primeiro multiplica pelo fator vertical, depois soma o ' +
          'deslocamento. O k está fora do produto.',
        passo: 2,
        conceito: 'transformacoes.escala',
      },
      {
        resposta: ponto.y + t.k,
        diagnostico: `Faltou multiplicar pelo fator vertical ${formatar(t.a)}.`,
        passo: 2,
        conceito: 'transformacoes.escala',
      },
      {
        resposta: destino.x,
        diagnostico:
          'Esse é o valor da ABSCISSA transformada. O enunciado pede a ordenada, que vem do que ' +
          'está fora dos parênteses.',
        passo: 1,
        conceito: 'transformacoes.dentro-e-fora',
      },
    ],
  });
}

/** O fator horizontal: comprime ou estica, sempre ao contrário do que parece. */
function daHorizontal(nivel: Nivel, rng: Rng): Exercicio<number> {
  const b = rng.escolher([2, 3, 4]);
  const t: Transformacao = { a: 1, b, h: 0, k: 0 };
  const largura = rng.inteiro(2, 12);

  const gabarito = largura / b;

  return montar({
    chave: `hor-${b}-${largura}`,
    nivel,
    rng,
    enunciado:
      `O gráfico de f ocupa uma largura de ${largura} unidades no eixo x. Qual largura o ` +
      `gráfico transformado ocupa? ${PEDIDO}`,
    enunciadoTex: `g(x) = ${transformacaoParaTex(t)}`,
    gabarito,
    resolucao: daLargura(largura, b, gabarito),
    conceitos: ['transformacoes.escala', 'transformacoes.dentro-e-fora'],
    armadilhas: [
      {
        resposta: largura * b,
        diagnostico:
          `Multiplicar o x por ${b} COMPRIME o gráfico, não estica. Tudo que acontece dentro do ` +
          'argumento é ao contrário do que o número sugere.',
        passo: 1,
        conceito: 'transformacoes.escala',
      },
      {
        resposta: largura,
        diagnostico:
          'A largura muda sim: o fator dentro do argumento é exatamente o que altera a escala ' +
          'horizontal.',
        passo: 0,
        conceito: 'transformacoes.escala',
      },
    ],
    dica: 'Dentro do argumento, multiplicar comprime e dividir estica.',
  });
}

/** Para onde vai um zero da função. */
function doZeroDeslocado(nivel: Nivel, rng: Rng): Exercicio<number> {
  const t = { ...sortear(nivel, rng), k: 0 };
  const zero = rng.inteiro(-6, 6);
  const destino = transformarPonto({ x: zero, y: 0 }, t);

  return montar({
    chave: `zer-${t.a}${t.b}${t.h}-${zero}`,
    nivel,
    rng,
    enunciado:
      `A função f tem um zero em x = ${zero}. Em que valor de x o gráfico transformado cruza o ` +
      `eixo horizontal? ${PEDIDO}`,
    enunciadoTex: `g(x) = ${transformacaoParaTex(t)}`,
    gabarito: destino.x,
    resolucao: pontoTransformadoComPassos({ x: zero, y: 0 }, t),
    conceitos: ['transformacoes.dentro-e-fora', 'transformacoes.deslocamento'],
    armadilhas: [
      {
        resposta: zero,
        diagnostico:
          'O zero se move junto com o gráfico. Só a altura dele é que continua sendo zero, ' +
          'porque o fator vertical multiplica zero e o deslocamento vertical aqui é nulo.',
        passo: 1,
        conceito: 'transformacoes.deslocamento',
      },
      {
        resposta: zero * t.b + t.h,
        diagnostico:
          'Na horizontal a conta é o avesso: divide-se pelo fator interno em vez de multiplicar.',
        passo: 1,
        conceito: 'transformacoes.escala',
      },
      {
        resposta: zero / t.b - t.h,
        diagnostico:
          'O deslocamento entrou com sinal trocado. Subtrair h dentro dos parênteses empurra o ' +
          'gráfico para a direita.',
        passo: 1,
        conceito: 'transformacoes.dentro-e-fora',
      },
    ],
  });
}

/**
 * A largura depois da compressão horizontal.
 *
 * O motor descreve a transformação; aqui o que se mede é o efeito dela sobre
 * uma distância no eixo x, que é o avesso do fator escrito no argumento.
 */
function daLargura(largura: number, b: number, resultado: number): Exercicio<number>['resolucao'] {
  return {
    resultado,
    passos: [
      {
        descricao: 'Dois pontos do gráfico original, separados pela largura dada.',
        tex: `x_{2} - x_{1} = ${largura}`,
      },
      {
        descricao: 'Cada um deles aparece agora no x que faz o argumento valer o mesmo de antes.',
        tex: `${b}x = x_{antigo} \\;\\Longrightarrow\\; x = \\frac{x_{antigo}}{${b}}`,
        nota: `Dividir por ${b} é o avesso de multiplicar por ${b} dentro do argumento.`,
      },
      {
        descricao: 'A distância entre eles encolhe na mesma proporção.',
        tex: `\\frac{${largura}}{${b}} = ${formatarTex(resultado)}`,
      },
    ],
  };
}

/** `y = 2(x - 3)^{2} + 1`, a forma canônica que o vértice se lê direto. */
function parabolaTex(t: Transformacao): string {
  const coeficiente = t.a === 1 ? '' : t.a === -1 ? '-' : formatarTex(t.a);
  const dentro = t.h === 0 ? 'x' : `x ${t.h > 0 ? '-' : '+'} ${formatarTex(Math.abs(t.h))}`;
  const corpo = `${coeficiente}\\left(${dentro}\\right)^{2}`;

  return t.k === 0
    ? `y = ${corpo}`
    : `y = ${corpo} ${t.k > 0 ? '+' : '-'} ${formatarTex(Math.abs(t.k))}`;
}

function formatarTex(valor: number): string {
  return String(Number(valor.toFixed(6))).replace('.', '{,}');
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
