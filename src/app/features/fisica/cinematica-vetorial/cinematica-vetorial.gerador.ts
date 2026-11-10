import {
  Vetor,
  anguloDeCompensacaoComPassos,
  componentesDaAceleracaoComPassos,
  deslocamentoVetorialComPassos,
  modulo,
  produtoEscalar,
  raioDeCurvaturaComPassos,
  somar,
  subtrair,
  travessiaDeRioComPassos,
  velocidadeRelativaComPassos,
  vetorParaTex,
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
 * Exercícios de cinemática vetorial.
 *
 * O erro que este tópico existe para corrigir é somar módulos. Um avião a 200
 * com vento de 50 não voa a 250, a menos que vento e rumo estejam alinhados —
 * e quase nunca estão. Por isso quase toda armadilha aqui é a soma escalar
 * feita no lugar da vetorial.
 */

const CASAS = 2;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 2 casas decimais.';

type Tipo = 'deslocamento' | 'relativa' | 'travessia' | 'compensacao' | 'componentes' | 'curvatura';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['deslocamento', 'relativa'],
  medio: ['deslocamento', 'relativa', 'travessia', 'componentes'],
  dificil: ['relativa', 'compensacao', 'componentes', 'curvatura'],
  // Compensação (apontar contra a correnteza) e curvatura são as que exigem
  // montar o triângulo de velocidades antes de qualquer conta.
  extremo: ['compensacao', 'curvatura'],
};

export const geradorCinematicaVetorial: GeradorExercicio<number> = {
  topicoId: 'cinematica-vetorial',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'deslocamento':
        return doDeslocamento(nivel, rng);
      case 'relativa':
        return daRelativa(nivel, rng);
      case 'travessia':
        return daTravessia(nivel, rng);
      case 'compensacao':
        return daCompensacao(nivel, rng);
      case 'componentes':
        return dasComponentes(nivel, rng);
      default:
        return daCurvatura(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** Velocidade média vetorial — e a distância percorrida como armadilha. */
function doDeslocamento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const inicio: Vetor = { x: rng.inteiro(-8, 8), y: rng.inteiro(-8, 8) };
  const fim: Vetor = { x: rng.inteiro(-8, 8), y: rng.inteiro(-8, 8) };
  const tempo = rng.inteiro(2, 10);

  const deslocamento = subtrair(fim, inicio);
  const gabarito = modulo(deslocamento) / tempo;

  // Quem anda pelos catetos percorre mais que a hipotenusa.
  const peloCaminho = (Math.abs(deslocamento.x) + Math.abs(deslocamento.y)) / tempo;

  return montar({
    chave: `desl-${inicio.x}${inicio.y}-${fim.x}${fim.y}-${tempo}`,
    nivel,
    rng,
    enunciado:
      `Um corpo vai da primeira posição à segunda em ${tempo} s, com as coordenadas em ` +
      `metros. Qual é o módulo da velocidade média vetorial, em m/s? ${PEDIDO}`,
    enunciadoTex: `\\vec{r}_{1} = ${vetorParaTex(inicio)} \\qquad \\vec{r}_{2} = ${vetorParaTex(fim)}`,
    gabarito,
    resolucao: deslocamentoVetorialComPassos(inicio, fim, tempo),
    conceitos: ['cin-vetorial.deslocamento', 'cin-vetorial.velocidade-media'],
    armadilhas: [
      {
        resposta: peloCaminho,
        diagnostico:
          'As componentes foram somadas em módulo, como se o corpo andasse pelos catetos. O ' +
          'deslocamento é a hipotenusa: vale Pitágoras, não soma simples.',
        passo: 1,
        conceito: 'cin-vetorial.deslocamento',
      },
      {
        resposta: modulo(deslocamento),
        diagnostico: `Esse é o módulo do deslocamento em m. Falta dividir pelos ${tempo} s.`,
        passo: 2,
        conceito: 'cin-vetorial.velocidade-media',
      },
      {
        resposta: modulo(somar(inicio, fim)) / tempo,
        diagnostico:
          'As posições foram somadas em vez de subtraídas. Deslocamento é a posição final MENOS ' +
          'a inicial.',
        passo: 0,
        conceito: 'cin-vetorial.deslocamento',
      },
    ],
    dica:
      nivel === 'facil' ? 'Subtraia as posições e aplique Pitágoras nas componentes.' : undefined,
  });
}

/** Aeronave com vento: a soma vetorial que a aviação faz o tempo todo. */
function daRelativa(nivel: Nivel, rng: Rng): Exercicio<number> {
  const aeronave: Vetor = { x: rng.inteiro(40, 120) * 2, y: rng.inteiro(-30, 30) * 2 };
  const vento: Vetor = { x: rng.inteiro(-20, 20), y: rng.inteiro(-20, 20) };

  const resultante = somar(aeronave, vento);
  const gabarito = modulo(resultante);
  const somaDosModulos = modulo(aeronave) + modulo(vento);

  return montar({
    chave: `rel-${aeronave.x}${aeronave.y}-${vento.x}${vento.y}`,
    nivel,
    rng,
    enunciado:
      'A primeira é a velocidade da aeronave em relação ao ar e a segunda é a do vento, em ' +
      `m/s. Qual é o módulo da velocidade em relação ao solo? ${PEDIDO}`,
    enunciadoTex: `\\vec{v}_{ar} = ${vetorParaTex(aeronave)} \\qquad \\vec{v}_{vento} = ${vetorParaTex(vento)}`,
    gabarito,
    resolucao: velocidadeRelativaComPassos(aeronave, vento),
    conceitos: ['cin-vetorial.velocidade-relativa', 'cin-vetorial.deslocamento'],
    armadilhas: [
      {
        resposta: somaDosModulos,
        diagnostico:
          'Os módulos foram somados. Isso só valeria se vento e rumo estivessem perfeitamente ' +
          'alinhados — vetores se somam componente a componente, nunca módulo com módulo.',
        passo: 0,
        conceito: 'cin-vetorial.velocidade-relativa',
      },
      {
        resposta: modulo(subtrair(aeronave, vento)),
        diagnostico:
          'O vento foi subtraído. Para achar a velocidade em relação ao solo ele se SOMA: é o ' +
          'ar inteiro que se desloca, carregando a aeronave junto.',
        passo: 1,
        conceito: 'cin-vetorial.velocidade-relativa',
      },
      {
        resposta: modulo(aeronave),
        diagnostico:
          'Essa é a velocidade em relação ao ar, que é o que o instrumento de bordo mostra. O ' +
          'solo vê outra coisa, porque o próprio ar está se movendo.',
        passo: 2,
        conceito: 'cin-vetorial.velocidade-relativa',
      },
    ],
    dica:
      nivel === 'facil'
        ? 'O vento carrega o ar inteiro: some os dois vetores componente a componente e só então calcule o módulo.'
        : undefined,
  });
}

/** Travessia de rio: o arrasto da correnteza. */
function daTravessia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const barco = rng.inteiro(2, 9);
  const rio = rng.inteiro(1, 6);
  const largura = rng.inteiro(3, 20) * 10;

  const tempo = largura / barco;
  const gabarito = rio * tempo;

  return montar({
    chave: `trav-${barco}-${rio}-${largura}`,
    nivel,
    rng,
    enunciado:
      `Um barco cruza um rio de ${largura} m de largura apontando perpendicularmente à ` +
      `margem, a ${barco} m/s. A correnteza corre a ${rio} m/s. ` +
      `Quantos metros rio abaixo ele chega? ${PEDIDO}`,
    enunciadoTex: `v_{barco} = ${barco}\\ \\text{m/s} \\qquad v_{rio} = ${rio}\\ \\text{m/s} \\qquad d = ${largura}\\ \\text{m}`,
    gabarito,
    resolucao: travessiaDeRioComPassos(barco, rio, largura),
    conceitos: ['cin-vetorial.travessia', 'cin-vetorial.velocidade-relativa'],
    armadilhas: [
      {
        resposta: (largura / Math.hypot(barco, rio)) * rio,
        diagnostico:
          'O tempo foi calculado com a velocidade resultante. Mas só a componente perpendicular ' +
          'atravessa o rio — a correnteza não aproxima nem afasta da outra margem.',
        passo: 1,
        conceito: 'cin-vetorial.travessia',
      },
      {
        resposta: tempo,
        diagnostico: 'Esse é o tempo de travessia em segundos, não a distância em m.',
        passo: 2,
        conceito: 'cin-vetorial.travessia',
      },
      {
        resposta: Math.hypot(largura, rio * tempo),
        diagnostico:
          'Esse é o comprimento do caminho percorrido em diagonal. A pergunta é só o quanto ele ' +
          'desceu rio abaixo.',
        passo: 2,
        conceito: 'cin-vetorial.travessia',
      },
    ],
    dica: 'O tempo depende só da velocidade que aponta para a outra margem.',
  });
}

/** O ângulo que compensa a correnteza. */
function daCompensacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const barco = rng.inteiro(4, 12);
  const rio = rng.inteiro(1, barco - 1);

  const gabarito = (Math.asin(rio / barco) * 180) / Math.PI;

  return montar({
    chave: `comp-${barco}-${rio}`,
    nivel,
    rng,
    enunciado:
      `Um barco de ${barco} m/s quer atravessar um rio de correnteza ${rio} ` +
      'm/s chegando exatamente em frente ao ponto de partida. Quantos graus, ' +
      `em relação à perpendicular, ele deve apontar rio acima? ${PEDIDO}`,
    enunciadoTex: `v_{barco}\\operatorname{sen}\\theta = v_{rio}`,
    gabarito,
    resolucao: anguloDeCompensacaoComPassos(barco, rio),
    conceitos: ['cin-vetorial.travessia', 'cin-vetorial.velocidade-relativa'],
    armadilhas: [
      {
        resposta: (Math.atan(rio / barco) * 180) / Math.PI,
        diagnostico:
          'A razão entre as velocidades é um SENO, não uma tangente: a velocidade do barco é a ' +
          'hipotenusa do triângulo, e a correnteza é o cateto a ser anulado.',
        passo: 1,
        conceito: 'cin-vetorial.travessia',
      },
      {
        resposta: (Math.acos(rio / barco) * 180) / Math.PI,
        diagnostico:
          'O ângulo foi medido a partir da margem, e não da perpendicular. O enunciado pede o ' +
          'desvio em relação à travessia reta.',
        passo: 2,
        conceito: 'cin-vetorial.travessia',
      },
      {
        resposta: 90 - gabarito,
        diagnostico:
          'Esse é o complemento do ângulo pedido — o mesmo triângulo, lido do outro lado.',
        passo: 2,
        conceito: 'cin-vetorial.travessia',
      },
    ],
    dica:
      nivel === 'dificil'
        ? `A parte do barco que aponta rio acima tem de anular a correnteza: ${barco}·sen θ = ${rio}.`
        : undefined,
  });
}

/** Aceleração tangencial e normal, a partir dos vetores. */
function dasComponentes(nivel: Nivel, rng: Rng): Exercicio<number> {
  const velocidade: Vetor = { x: rng.inteiro(1, 9), y: rng.inteiro(-9, 9) };
  const aceleracao: Vetor = { x: rng.inteiro(-6, 6), y: rng.inteiro(-6, 6) };

  const rapidez = modulo(velocidade);
  const gabarito = produtoEscalar(velocidade, aceleracao) / rapidez;

  return montar({
    chave: `comp-${velocidade.x}${velocidade.y}-${aceleracao.x}${aceleracao.y}`,
    nivel,
    rng,
    enunciado:
      'Num certo instante, um corpo tem esta velocidade e esta aceleração, em unidades do SI. ' +
      `Qual é a componente TANGENCIAL da aceleração, em m/s²? ${PEDIDO}`,
    enunciadoTex: `\\vec{v} = ${vetorParaTex(velocidade)} \\qquad \\vec{a} = ${vetorParaTex(aceleracao)}`,
    gabarito,
    resolucao: componentesDaAceleracaoComPassos(velocidade, aceleracao),
    conceitos: ['cin-vetorial.componentes-da-aceleracao', 'cin-vetorial.velocidade-media'],
    armadilhas: [
      {
        resposta: modulo(aceleracao),
        diagnostico:
          'Esse é o módulo da aceleração inteira. Só a parte dela alinhada com a velocidade muda ' +
          'a rapidez; a parte perpendicular muda a direção.',
        passo: 0,
        conceito: 'cin-vetorial.componentes-da-aceleracao',
      },
      {
        resposta: produtoEscalar(velocidade, aceleracao),
        diagnostico:
          'Faltou dividir pelo módulo da velocidade. O produto escalar sozinho não é uma ' +
          'projeção: ele precisa ser normalizado pela direção sobre a qual se projeta.',
        passo: 2,
        conceito: 'cin-vetorial.componentes-da-aceleracao',
      },
      {
        resposta: Math.sqrt(
          Math.max(
            0,
            modulo(aceleracao) ** 2 - (produtoEscalar(velocidade, aceleracao) / rapidez) ** 2,
          ),
        ),
        diagnostico:
          'Essa é a componente NORMAL, que curva a trajetória. A tangencial é a que acelera ou ' +
          'freia o movimento.',
        passo: 3,
        conceito: 'cin-vetorial.componentes-da-aceleracao',
      },
    ],
    dica:
      nivel === 'medio'
        ? 'A tangencial é a projeção da aceleração na direção da velocidade: produto escalar a·v, dividido pelo módulo de v.'
        : undefined,
  });
}

/** O raio de curvatura da trajetória. */
function daCurvatura(nivel: Nivel, rng: Rng): Exercicio<number> {
  // Velocidade e aceleração perpendiculares garantem curvatura bem definida.
  const velocidade: Vetor = { x: rng.inteiro(2, 12), y: 0 };
  const aceleracao: Vetor = { x: rng.inteiro(-4, 4), y: rng.inteiro(1, 8) * rng.sinal() };

  const rapidez = modulo(velocidade);
  const tangencial = produtoEscalar(velocidade, aceleracao) / rapidez;
  const normal = Math.sqrt(Math.max(0, modulo(aceleracao) ** 2 - tangencial ** 2));
  const gabarito = (rapidez * rapidez) / normal;

  return montar({
    chave: `curv-${velocidade.x}-${aceleracao.x}${aceleracao.y}`,
    nivel,
    rng,
    enunciado:
      'Com esta velocidade e esta aceleração, em unidades do SI, qual é o raio de curvatura da ' +
      `trajetória nesse instante, em m? ${PEDIDO}`,
    enunciadoTex: `\\vec{v} = ${vetorParaTex(velocidade)} \\qquad \\vec{a} = ${vetorParaTex(aceleracao)}`,
    gabarito,
    resolucao: raioDeCurvaturaComPassos(velocidade, aceleracao),
    conceitos: ['cin-vetorial.curvatura', 'cin-vetorial.componentes-da-aceleracao'],
    armadilhas: [
      {
        resposta: (rapidez * rapidez) / modulo(aceleracao),
        diagnostico:
          'Entrou a aceleração inteira no denominador. Quem curva a trajetória é só a componente ' +
          'NORMAL — a tangencial apenas muda a rapidez.',
        passo: 0,
        conceito: 'cin-vetorial.curvatura',
      },
      {
        resposta: rapidez / normal,
        diagnostico:
          'A velocidade entra ao QUADRADO. É a mesma relação do movimento circular, em que a ' +
          'aceleração centrípeta é v ao quadrado sobre o raio.',
        passo: 1,
        conceito: 'cin-vetorial.curvatura',
      },
      {
        resposta: normal,
        diagnostico:
          'Essa é a componente normal da aceleração, não o raio. Falta dividir o quadrado da ' +
          'velocidade por ela.',
        passo: 2,
        conceito: 'cin-vetorial.curvatura',
      },
    ],
    dica:
      nivel === 'dificil'
        ? `Só a componente da aceleração perpendicular à velocidade curva a trajetória. Com ela, r = v²/aₙ, e aqui v = ${rapidez}.`
        : undefined,
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
