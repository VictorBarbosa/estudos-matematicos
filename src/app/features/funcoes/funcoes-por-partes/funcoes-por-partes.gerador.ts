import {
  FuncaoPorPartes,
  Polinomio,
  avaliarPorPartes,
  avaliarPorPartesComPassos,
  continuidadeComPassos,
  limiteDireita,
  limiteEsquerda,
  parametroQueColaComPassos,
  porPartesParaTex,
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
 * Exercícios de função definida por partes.
 *
 * Tudo que é específico do tema acontece nas fronteiras — dentro de cada
 * trecho é uma função comum. Por isso os exercícios insistem ali: qual trecho
 * vale exatamente no ponto de corte, o que acontece chegando de cada lado, e
 * quanto vale o salto quando os dois lados discordam.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

type Tipo = 'avaliar' | 'na-fronteira' | 'salto' | 'colar' | 'lateral';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['avaliar'],
  medio: ['avaliar', 'na-fronteira', 'lateral'],
  dificil: ['na-fronteira', 'salto', 'colar', 'lateral'],
};

export const geradorFuncoesPorPartes: GeradorExercicio<number> = {
  topicoId: 'funcoes-por-partes',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'avaliar':
        return daAvaliacao(nivel, rng, false);
      case 'na-fronteira':
        return daAvaliacao(nivel, rng, true);
      case 'salto':
        return doSalto(nivel, rng);
      case 'colar':
        return daColagem(nivel, rng);
      default:
        return doLateral(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** Monta uma função de dois trechos com fronteira e coeficientes dados. */
function montarFuncao(esquerda: Polinomio, direita: Polinomio, fronteira: number): FuncaoPorPartes {
  return {
    trechos: [
      {
        expressao: esquerda,
        de: Number.NEGATIVE_INFINITY,
        ate: fronteira,
        fechadoAEsquerda: true,
      },
      {
        expressao: direita,
        de: fronteira,
        ate: Number.POSITIVE_INFINITY,
        fechadoAEsquerda: true,
      },
    ],
  };
}

/** Avaliar num ponto — na fronteira ou longe dela. */
function daAvaliacao(nivel: Nivel, rng: Rng, naFronteira: boolean): Exercicio<number> {
  const fronteira = rng.inteiro(-4, 4);
  const esquerda = Polinomio.de(rng.inteiro(-6, 6), rng.inteiro(-4, 4) || 2);
  const direita = Polinomio.de(rng.inteiro(-6, 6), rng.inteiro(-4, 4) || -3);

  const f = montarFuncao(esquerda, direita, fronteira);
  const ponto = naFronteira ? fronteira : fronteira + rng.escolher([-3, -2, -1, 1, 2, 3]);
  const gabarito = avaliarPorPartes(f, ponto);

  return montar({
    chave: `av-${fronteira}-${ponto}-${esquerda.toString()}-${direita.toString()}`,
    nivel,
    rng,
    enunciado: `Quanto vale esta função em x = ${ponto}? ${PEDIDO}`,
    enunciadoTex: porPartesParaTex(f),
    gabarito,
    resolucao: avaliarPorPartesComPassos(f, ponto),
    conceitos: naFronteira
      ? ['por-partes.fronteira', 'por-partes.qual-trecho']
      : ['por-partes.qual-trecho', 'por-partes.fronteira'],
    armadilhas: [
      {
        resposta: ponto >= fronteira ? esquerda.avaliar(ponto) : direita.avaliar(ponto),
        diagnostico: naFronteira
          ? 'Na fronteira, quem manda é a condição que inclui o sinal de igual. Aqui ela ' +
            'pertence ao trecho de baixo, e é a expressão dele que vale.'
          : 'O trecho escolhido foi o errado: confira a condição que o ponto satisfaz antes de ' +
            'substituir.',
        passo: 1,
        conceito: 'por-partes.qual-trecho',
      },
      {
        resposta: esquerda.avaliar(ponto) + direita.avaliar(ponto),
        diagnostico:
          'As duas expressões foram somadas. Numa função por partes só UMA delas vale em cada ' +
          'ponto — elas não se somam, elas se revezam.',
        passo: 0,
        conceito: 'por-partes.qual-trecho',
      },
    ],
    dica:
      nivel === 'facil'
        ? 'Veja primeiro qual condição o ponto satisfaz; só então substitua.'
        : undefined,
  });
}

/** O tamanho do salto na fronteira. */
function doSalto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const fronteira = rng.inteiro(-4, 4);
  const esquerda = Polinomio.de(rng.inteiro(-6, 6), rng.inteiro(-4, 4) || 2);
  const direita = Polinomio.de(rng.inteiro(-6, 6), rng.inteiro(-4, 4) || -3);

  const f = montarFuncao(esquerda, direita, fronteira);
  const gabarito = limiteDireita(f, fronteira) - limiteEsquerda(f, fronteira);

  return montar({
    chave: `sal-${fronteira}-${esquerda.toString()}-${direita.toString()}`,
    nivel,
    rng,
    enunciado:
      `De quanto é o salto desta função em x = ${fronteira}? Use o limite pela direita menos o ` +
      `limite pela esquerda. ${PEDIDO}`,
    enunciadoTex: porPartesParaTex(f),
    gabarito,
    resolucao: continuidadeComPassos(f, fronteira),
    conceitos: ['por-partes.salto', 'por-partes.fronteira'],
    armadilhas: [
      {
        resposta: -gabarito,
        diagnostico:
          'A ordem está trocada: o enunciado pede a direita MENOS a esquerda, e inverter troca ' +
          'o sinal do salto.',
        passo: 3,
        conceito: 'por-partes.salto',
      },
      {
        resposta: 0,
        diagnostico:
          'Salto zero só acontece quando os dois limites laterais coincidem — e aí a função é ' +
          'contínua ali. Confira cada lado separadamente.',
        passo: 3,
        conceito: 'por-partes.continuidade',
      },
      {
        resposta: limiteEsquerda(f, fronteira),
        diagnostico: 'Esse é só o limite pela esquerda. O salto é a DIFERENÇA entre os dois lados.',
        passo: 0,
        conceito: 'por-partes.salto',
      },
    ],
  });
}

/** O limite lateral isolado. */
function doLateral(nivel: Nivel, rng: Rng): Exercicio<number> {
  const fronteira = rng.inteiro(-4, 4);
  const esquerda = Polinomio.de(rng.inteiro(-6, 6), rng.inteiro(-4, 4) || 2);
  const direita = Polinomio.de(rng.inteiro(-6, 6), rng.inteiro(-4, 4) || -3);
  const pelaEsquerda = rng.booleano();

  const f = montarFuncao(esquerda, direita, fronteira);
  const gabarito = pelaEsquerda ? limiteEsquerda(f, fronteira) : limiteDireita(f, fronteira);

  return montar({
    chave: `lat-${fronteira}-${pelaEsquerda}-${esquerda.toString()}-${direita.toString()}`,
    nivel,
    rng,
    enunciado:
      `Qual é o limite desta função quando x tende a ${fronteira} pela ` +
      `${pelaEsquerda ? 'ESQUERDA' : 'DIREITA'}? ${PEDIDO}`,
    enunciadoTex: porPartesParaTex(f),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: continuidadeComPassos(f, fronteira).passos.slice(0, pelaEsquerda ? 1 : 2),
    },
    conceitos: ['por-partes.fronteira', 'por-partes.continuidade'],
    armadilhas: [
      {
        resposta: pelaEsquerda ? limiteDireita(f, fronteira) : limiteEsquerda(f, fronteira),
        diagnostico: pelaEsquerda
          ? 'Esse é o limite pela direita. Pela esquerda vale o trecho que TERMINA na fronteira.'
          : 'Esse é o limite pela esquerda. Pela direita vale o trecho que COMEÇA na fronteira.',
        passo: 0,
        conceito: 'por-partes.fronteira',
      },
      {
        resposta: limiteDireita(f, fronteira) - limiteEsquerda(f, fronteira),
        diagnostico:
          'Isso é o salto, não um limite lateral. Cada lado tem seu próprio valor, e o salto é a ' +
          'diferença entre eles.',
        passo: 1,
        conceito: 'por-partes.salto',
      },
    ],
  });
}

/** O valor da constante que cola as duas pontas. */
function daColagem(nivel: Nivel, rng: Rng): Exercicio<number> {
  const fronteira = rng.inteiro(-4, 4);
  const esquerda = Polinomio.de(rng.inteiro(-6, 6), rng.inteiro(-4, 4) || 2);
  const direitaSemConstante = Polinomio.de(0, rng.inteiro(-4, 4) || -3);

  const gabarito = esquerda.avaliar(fronteira) - direitaSemConstante.avaliar(fronteira);

  const comConstante = direitaSemConstante.somar(Polinomio.de(gabarito));
  const f = montarFuncao(esquerda, comConstante, fronteira);

  return montar({
    chave: `col-${fronteira}-${esquerda.toString()}-${direitaSemConstante.toString()}`,
    nivel,
    rng,
    enunciado: `Qual valor da constante c torna esta função contínua em x = ${fronteira}? ${PEDIDO}`,
    enunciadoTex:
      `f(x) = \\begin{cases} ${esquerda.paraTex()}, & x < ${fronteira} \\\\ ` +
      `${direitaSemConstante.paraTex()} + c, & x \\geq ${fronteira} \\end{cases}`,
    gabarito,
    resolucao: parametroQueColaComPassos(esquerda, direitaSemConstante, fronteira),
    conceitos: ['por-partes.continuidade', 'por-partes.fronteira'],
    armadilhas: [
      {
        resposta: -gabarito,
        diagnostico:
          'O sinal ficou invertido. A constante é o valor da esquerda MENOS o que a direita já ' +
          'entrega sozinha na fronteira.',
        passo: 3,
        conceito: 'por-partes.continuidade',
      },
      {
        resposta: esquerda.avaliar(fronteira),
        diagnostico:
          'Esse é o valor do trecho da esquerda na fronteira. A constante é a diferença que ' +
          'falta para a direita alcançá-lo, não o valor inteiro.',
        passo: 1,
        conceito: 'por-partes.continuidade',
      },
      {
        resposta: 0,
        diagnostico:
          'Com constante zero as duas pontas só se encontrariam por sorte. Compare os dois ' +
          'valores na fronteira antes de concluir.',
        passo: 2,
        conceito: 'por-partes.continuidade',
      },
    ],
    dica: 'Iguale os dois limites laterais e isole a constante.',
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
