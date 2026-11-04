import {
  alcanceDoLancamentoComPassos,
  cicloideParametrica,
  circunferenciaParametrica,
  elipseParametrica,
  lancamentoParametrico,
  posicaoNoInstanteComPassos,
  retaParametrica,
  velocidadeParametricaComPassos,
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
 * Exercícios de equação paramétrica.
 *
 * A pergunta recorrente é a mesma em todos os formatos: onde o móvel está no
 * instante t, e com que velocidade. É isso que a forma paramétrica responde e
 * a cartesiana não — e por isso os enunciados falam de tempo, não de curva.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

type Tipo = 'reta' | 'circunferencia' | 'elipse' | 'lancamento' | 'velocidade' | 'alcance';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['reta', 'circunferencia'],
  medio: ['reta', 'circunferencia', 'elipse', 'lancamento'],
  dificil: ['lancamento', 'velocidade', 'alcance', 'elipse'],
};

export const geradorEquacoesParametricas: GeradorExercicio<number> = {
  topicoId: 'equacoes-parametricas',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'reta':
        return daReta(nivel, rng);
      case 'circunferencia':
        return daCircunferencia(nivel, rng);
      case 'elipse':
        return daElipse(nivel, rng);
      case 'lancamento':
        return doLancamento(nivel, rng);
      case 'velocidade':
        return daVelocidade(nivel, rng);
      default:
        return doAlcance(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** Posição num instante, na reta — o caso mais direto. */
function daReta(nivel: Nivel, rng: Rng): Exercicio<number> {
  const x0 = rng.inteiro(-8, 8);
  const y0 = rng.inteiro(-8, 8);
  const vx = rng.inteiro(-5, 5) || 2;
  const vy = rng.inteiro(-5, 5) || 3;
  const t = rng.inteiro(1, 9);

  const curva = retaParametrica(x0, y0, vx, vy);
  const gabarito = curva.x(t);

  return montar({
    chave: `ret-${x0}${y0}-${vx}${vy}-${t}`,
    nivel,
    rng,
    enunciado:
      `Um móvel segue estas equações, com t em segundos. Qual é a coordenada x no instante ` +
      `t = ${t}? ${PEDIDO}`,
    enunciadoTex: `\\begin{cases} ${curva.xTex} \\\\ ${curva.yTex} \\end{cases}`,
    gabarito,
    resolucao: posicaoNoInstanteComPassos(curva, t),
    conceitos: ['parametricas.parametro', 'parametricas.movimento'],
    armadilhas: [
      {
        resposta: curva.y(t),
        diagnostico:
          'Essa é a coordenada y. As duas equações andam juntas, mas cada uma devolve a sua ' +
          'própria coordenada.',
        passo: 1,
        conceito: 'parametricas.parametro',
      },
      {
        resposta: vx * t,
        diagnostico: `Faltou somar a posição inicial ${x0}, que é de onde o móvel parte.`,
        passo: 1,
        conceito: 'parametricas.movimento',
      },
      {
        resposta: x0 + vx,
        diagnostico:
          'O parâmetro multiplica a velocidade. Aqui ele foi tratado como se valesse 1, ' +
          'independentemente do instante pedido.',
        passo: 1,
        conceito: 'parametricas.parametro',
      },
    ],
    dica:
      nivel === 'facil' ? 'Substitua o valor de t nas duas equações, uma de cada vez.' : undefined,
  });
}

/** Posição num instante, na circunferência — onde a cartesiana não é função. */
function daCircunferencia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const cx = rng.inteiro(-5, 5);
  const cy = rng.inteiro(-5, 5);
  const raio = rng.inteiro(1, 9);
  const doze = rng.inteiro(0, 11);
  const t = (doze / 12) * 2 * Math.PI;

  const curva = circunferenciaParametrica(cx, cy, raio);
  const gabarito = curva.y(t);

  return montar({
    chave: `cir-${cx}${cy}-${raio}-${doze}`,
    nivel,
    rng,
    enunciado:
      `Qual é a coordenada y quando o parâmetro vale ${doze} doze avos de uma volta completa? ` +
      PEDIDO,
    enunciadoTex: `\\begin{cases} ${curva.xTex} \\\\ ${curva.yTex} \\end{cases}`,
    gabarito,
    resolucao: { resultado: gabarito, passos: posicaoNoInstanteComPassos(curva, t).passos },
    conceitos: ['parametricas.circunferencia', 'parametricas.parametro'],
    armadilhas: [
      {
        resposta: curva.x(t),
        diagnostico: 'Essa é a coordenada x, que usa o cosseno. A coordenada y é a do seno.',
        passo: 1,
        conceito: 'parametricas.circunferencia',
      },
      {
        resposta: raio * Math.sin(t),
        diagnostico:
          `Faltou somar a coordenada do centro, que é ${cy}. O raio dá o tamanho, e o centro ` +
          'dá o lugar.',
        passo: 1,
        conceito: 'parametricas.circunferencia',
      },
      {
        resposta: cy + raio * Math.cos(t),
        diagnostico:
          'Seno e cosseno ficaram trocados. Em x vai o cosseno, em y vai o seno — é a convenção ' +
          'que faz o parâmetro ser o ângulo medido do eixo x.',
        passo: 1,
        conceito: 'parametricas.circunferencia',
      },
    ],
  });
}

/** A elipse, que é a circunferência com dois raios. */
function daElipse(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(2, 9);
  const b = rng.inteiro(1, 8);
  const doze = rng.inteiro(1, 11);
  const t = (doze / 12) * 2 * Math.PI;

  const curva = elipseParametrica(a, b);
  const gabarito = curva.x(t);

  return montar({
    chave: `eli-${a}${b}-${doze}`,
    nivel,
    rng,
    enunciado: `Qual é a coordenada x quando o parâmetro vale ${doze} doze avos de uma volta? ${PEDIDO}`,
    enunciadoTex: `\\begin{cases} ${curva.xTex} \\\\ ${curva.yTex} \\end{cases}`,
    gabarito,
    resolucao: posicaoNoInstanteComPassos(curva, t),
    conceitos: ['parametricas.circunferencia', 'parametricas.eliminar'],
    armadilhas: [
      {
        resposta: curva.y(t),
        diagnostico: 'Essa é a coordenada y, que usa o outro semieixo e o seno.',
        passo: 1,
        conceito: 'parametricas.circunferencia',
      },
      {
        resposta: b * Math.cos(t),
        diagnostico:
          'Os semieixos ficaram trocados: quem multiplica o cosseno é o semieixo horizontal.',
        passo: 1,
        conceito: 'parametricas.circunferencia',
      },
    ],
  });
}

/** O lançamento balístico, escrito como o tempo o produz. */
function doLancamento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const v0 = rng.inteiro(10, 60);
  const angulo = rng.escolher([15, 30, 37, 45, 53, 60, 75]);
  const t = rng.inteiro(1, 5);

  const curva = lancamentoParametrico(v0, angulo);
  const gabarito = curva.y(t);

  return montar({
    chave: `lan-${v0}-${angulo}-${t}`,
    nivel,
    rng,
    enunciado:
      `Um projétil parte a ${v0} m/s formando ${angulo} graus com a horizontal, com g igual a ` +
      `9,81 m/s². Qual é a altura no instante t = ${t} s? ${PEDIDO}`,
    enunciadoTex: `\\begin{cases} ${curva.xTex} \\\\ ${curva.yTex} \\end{cases}`,
    gabarito,
    resolucao: { resultado: gabarito, passos: posicaoNoInstanteComPassos(curva, t).passos },
    conceitos: ['parametricas.movimento', 'parametricas.eliminar'],
    armadilhas: [
      {
        resposta: curva.x(t),
        diagnostico: 'Essa é a distância horizontal percorrida, não a altura.',
        passo: 1,
        conceito: 'parametricas.movimento',
      },
      {
        resposta: v0 * Math.sin((angulo * Math.PI) / 180) * t,
        diagnostico:
          'Faltou descontar a queda. A gravidade entra com o termo quadrático, que é o que ' +
          'curva a trajetória.',
        passo: 1,
        conceito: 'parametricas.movimento',
      },
      {
        resposta: v0 * t - 0.5 * 9.81 * t * t,
        diagnostico:
          'A velocidade inicial inteira foi usada na vertical. Só a componente vertical dela ' +
          'sobe, e ela é o produto pelo seno do ângulo.',
        passo: 0,
        conceito: 'parametricas.movimento',
      },
    ],
  });
}

/** A rapidez num instante: a derivada de cada coordenada. */
function daVelocidade(nivel: Nivel, rng: Rng): Exercicio<number> {
  const raio = rng.inteiro(1, 8);
  const doze = rng.inteiro(0, 11);
  const t = (doze / 12) * 2 * Math.PI;

  const curva = rng.booleano() ? circunferenciaParametrica(0, 0, raio) : cicloideParametrica(raio);

  const resolucao = velocidadeParametricaComPassos(curva, t);

  return montar({
    chave: `vel-${curva.tipo}-${raio}-${doze}`,
    nivel,
    rng,
    enunciado:
      `Qual é a rapidez do móvel quando o parâmetro vale ${doze} doze avos de uma volta? ` + PEDIDO,
    enunciadoTex: `\\begin{cases} ${curva.xTex} \\\\ ${curva.yTex} \\end{cases}`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['parametricas.velocidade', 'parametricas.movimento'],
    armadilhas: [
      {
        resposta: curva.x(t),
        diagnostico: 'Essa é a posição, não a velocidade. A velocidade é a derivada da posição.',
        passo: 0,
        conceito: 'parametricas.velocidade',
      },
      {
        resposta: resolucao.resultado * resolucao.resultado,
        diagnostico: 'Faltou extrair a raiz quadrada: a soma dos quadrados ainda não é o módulo.',
        passo: 2,
        conceito: 'parametricas.velocidade',
      },
    ],
    dica: 'Derive cada coordenada separadamente e combine com Pitágoras.',
  });
}

/** O alcance do lançamento, lido da forma paramétrica. */
function doAlcance(nivel: Nivel, rng: Rng): Exercicio<number> {
  const v0 = rng.inteiro(10, 80);
  const angulo = rng.escolher([15, 30, 37, 45, 53, 60, 75]);

  const resolucao = alcanceDoLancamentoComPassos(v0, angulo);

  return montar({
    chave: `alc-${v0}-${angulo}`,
    nivel,
    rng,
    enunciado:
      `Um projétil parte a ${v0} m/s formando ${angulo} graus com a horizontal, com g igual a ` +
      `9,81 m/s². Qual é o alcance, em m? ${PEDIDO}`,
    enunciadoTex: `t_{voo} = \\frac{2v_{0}\\operatorname{sen}\\theta}{g}`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['parametricas.movimento', 'parametricas.eliminar'],
    armadilhas: [
      {
        resposta: (2 * v0 * Math.sin((angulo * Math.PI) / 180)) / 9.81,
        diagnostico: 'Esse é o tempo de voo, em segundos. O alcance é a distância percorrida nele.',
        passo: 1,
        conceito: 'parametricas.movimento',
      },
      {
        resposta: (v0 * v0 * Math.sin((angulo * Math.PI) / 180)) / 9.81,
        diagnostico:
          'Falta o fator que vem do arco duplo. O alcance usa o seno de duas vezes o ângulo, e ' +
          'não o seno dele sozinho.',
        passo: 2,
        conceito: 'parametricas.movimento',
      },
      {
        resposta: (v0 * v0) / 9.81,
        diagnostico:
          'Esse seria o alcance de um lançamento a 45 graus, em que o seno do arco duplo vale 1. ' +
          'Em qualquer outro ângulo ele é menor.',
        passo: 2,
        conceito: 'parametricas.movimento',
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
