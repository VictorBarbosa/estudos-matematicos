import {
  CORPOS_RIGIDOS,
  CorpoRigido,
  conservacaoAngularComPassos,
  momentoAngularComPassos,
  momentoAngularDePartiComPassos,
  momentoDeInercia,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Exercícios de momento angular.
 *
 * O resultado que o tópico existe para instalar é a conservação: sem torque
 * externo, o produto da inércia pela velocidade angular não muda. É ela que
 * explica a patinadora que acelera ao recolher os braços, o satélite que se
 * estabiliza girando e o porquê de os planetas varrerem áreas iguais em
 * tempos iguais.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

const CORPOS_POR_RAIO: readonly CorpoRigido[] = CORPOS_RIGIDOS.filter(
  (corpo) => !corpo.nome.startsWith('barra'),
);

type Tipo = 'corpo-rigido' | 'particula' | 'conservacao' | 'energia-na-conservacao';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['corpo-rigido', 'particula'],
  medio: ['corpo-rigido', 'particula', 'conservacao'],
  dificil: ['conservacao', 'energia-na-conservacao', 'particula'],
};

export const geradorMomentoAngular: GeradorExercicio<number> = {
  topicoId: 'momento-angular',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'corpo-rigido':
        return doCorpoRigido(nivel, rng);
      case 'particula':
        return daParticula(nivel, rng);
      case 'conservacao':
        return daConservacao(nivel, rng);
      default:
        return daEnergiaNaConservacao(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** `L = Iω` — o análogo rotacional de `p = mv`. */
function doCorpoRigido(nivel: Nivel, rng: Rng): Exercicio<number> {
  const corpo = rng.escolher(CORPOS_POR_RAIO);
  const massa = rng.inteiro(2, 40) / 2;
  const raio = rng.inteiro(2, 25) / 10;
  const omega = rng.inteiro(2, 40) / 2;

  const inercia = momentoDeInercia(corpo, massa, raio);
  const gabarito = inercia * omega;

  return montar({
    chave: `rig-${corpo.nome}-${massa}-${raio}-${omega}`,
    nivel,
    rng,
    enunciado:
      `${capitalizar(artigo(corpo))} ${corpo.nome} de ${numero(massa)} kg e ` +
      `${numero(raio)} m de raio gira a ${numero(omega)} rad/s. Qual é o ` +
      `momento angular, em kg·m²/s? ${PEDIDO}`,
    enunciadoTex: `L = I\\omega \\qquad I = ${corpo.fatorTex}mr^{2}`,
    gabarito,
    resolucao: momentoAngularComPassos(corpo, massa, raio, omega),
    conceitos: ['angular.momento', 'angular.dicionario'],
    armadilhas: [
      {
        resposta: massa * omega,
        diagnostico:
          'A massa entrou no lugar do momento de inércia. O momento angular é o análogo do ' +
          'momento linear, e nessa tradução a massa vira inércia.',
        passo: 1,
        conceito: 'angular.dicionario',
      },
      {
        resposta: inercia,
        diagnostico: 'Esse é só o momento de inércia. Falta multiplicar pela velocidade angular.',
        passo: 0,
        conceito: 'angular.momento',
      },
      {
        resposta: 0.5 * inercia * omega * omega,
        diagnostico:
          'Essa é a energia de rotação, em J. O momento angular não tem o fator um meio nem ' +
          'o quadrado — ele é linear na velocidade angular.',
        passo: 2,
        conceito: 'angular.momento',
      },
    ],
    dica: nivel === 'facil' ? 'Calcule a inércia primeiro, depois multiplique pela velocidade angular.' : undefined,
  });
}

/** `L = mvr·senθ` — o momento angular de uma partícula em relação a um ponto. */
function daParticula(nivel: Nivel, rng: Rng): Exercicio<number> {
  const massa = rng.inteiro(1, 20) / 2;
  const velocidade = rng.inteiro(2, 30);
  const distancia = rng.inteiro(5, 60) / 10;
  const angulo = nivel === 'facil' ? 90 : rng.escolher([30, 45, 60, 90, 120, 135, 150]);

  const braco = distancia * Math.sin((angulo * Math.PI) / 180);
  const gabarito = massa * velocidade * braco;

  return montar({
    chave: `par-${massa}-${velocidade}-${distancia}-${angulo}`,
    nivel,
    rng,
    enunciado:
      `Uma partícula de ${numero(massa)} kg passa a ${numero(distancia)} metros de um ` +
      `ponto, com velocidade de ${velocidade} m/s formando ${angulo} graus com o ` +
      `raio. Qual é o módulo do momento angular em relação a esse ponto? ${PEDIDO}`,
    enunciadoTex: `L = mvr\\operatorname{sen}\\theta`,
    gabarito,
    resolucao: momentoAngularDePartiComPassos(massa, velocidade, distancia, angulo),
    conceitos: ['angular.particula', 'angular.momento'],
    armadilhas: [
      {
        resposta: massa * velocidade * distancia,
        diagnostico:
          `Faltou o seno de ${angulo} graus. Só a parte da velocidade perpendicular ao raio ` +
          'contribui para o giro; a parte alinhada com ele não gira nada.',
        passo: 1,
        conceito: 'angular.particula',
      },
      {
        resposta: massa * velocidade * distancia * Math.cos((angulo * Math.PI) / 180),
        diagnostico:
          'Entrou cosseno no lugar do seno. É o seno que mede a parte perpendicular — com ' +
          'velocidade alinhada ao raio o momento angular é zero, e o cosseno daria o máximo.',
        passo: 0,
        conceito: 'angular.particula',
      },
      {
        resposta: massa * velocidade,
        diagnostico:
          'Isso é o momento linear. Para virar momento angular ainda falta a distância ' +
          'perpendicular ao ponto de referência.',
        passo: 2,
        conceito: 'angular.momento',
      },
    ],
  });
}

/** A patinadora: sem torque externo, `Iω` não muda. */
function daConservacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const inerciaInicial = rng.inteiro(10, 80) / 10;
  const omegaInicial = rng.inteiro(2, 30) / 2;
  const fator = rng.escolher([0.25, 0.4, 0.5, 0.6, 0.75, 1.5, 2, 2.5]);
  const inerciaFinal = Number((inerciaInicial * fator).toFixed(4));

  const gabarito = (inerciaInicial * omegaInicial) / inerciaFinal;

  return montar({
    chave: `cons-${inerciaInicial}-${omegaInicial}-${fator}`,
    nivel,
    rng,
    enunciado:
      `Um corpo gira livremente, sem torque externo, com momento de inércia ` +
      `${numero(inerciaInicial)} kg·m² a ${numero(omegaInicial)} rad/s. A inércia passa a ` +
      `${numero(inerciaFinal)}. Qual é a nova velocidade angular, em rad/s? ${PEDIDO}`,
    enunciadoTex: `I_{1}\\omega_{1} = I_{2}\\omega_{2}`,
    gabarito,
    resolucao: conservacaoAngularComPassos(inerciaInicial, omegaInicial, inerciaFinal),
    conceitos: ['angular.conservacao', 'angular.momento'],
    armadilhas: [
      {
        resposta: omegaInicial,
        diagnostico:
          'O que se conserva é o PRODUTO da inércia pela velocidade angular, não a velocidade ' +
          'angular sozinha. Mudar a inércia obriga a velocidade angular a mudar junto.',
        passo: 0,
        conceito: 'angular.conservacao',
      },
      {
        resposta: (omegaInicial * inerciaFinal) / inerciaInicial,
        diagnostico:
          'A razão está invertida. Diminuir a inércia faz a velocidade angular SUBIR — é a ' +
          'patinadora que acelera ao recolher os braços.',
        passo: 2,
        conceito: 'angular.conservacao',
      },
      {
        resposta: inerciaInicial * omegaInicial,
        diagnostico:
          'Esse é o momento angular conservado, não a nova velocidade angular. Falta dividir ' +
          'pela nova inércia.',
        passo: 1,
        conceito: 'angular.conservacao',
      },
    ],
    dica: nivel === 'medio' ? 'Calcule o momento angular inicial e divida pela nova inércia.' : undefined,
  });
}

/** O detalhe que surpreende: o momento angular se conserva, a energia não. */
function daEnergiaNaConservacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const inerciaInicial = rng.inteiro(10, 60) / 10;
  const omegaInicial = rng.inteiro(2, 24) / 2;
  const fator = rng.escolher([0.25, 0.4, 0.5, 0.6, 0.8]);
  const inerciaFinal = Number((inerciaInicial * fator).toFixed(4));

  const omegaFinal = (inerciaInicial * omegaInicial) / inerciaFinal;
  const energiaAntes = 0.5 * inerciaInicial * omegaInicial ** 2;
  const energiaDepois = 0.5 * inerciaFinal * omegaFinal ** 2;
  const gabarito = energiaDepois - energiaAntes;

  return montar({
    chave: `ene-${inerciaInicial}-${omegaInicial}-${fator}`,
    nivel,
    rng,
    enunciado:
      `Um corpo gira sem torque externo com inércia ${numero(inerciaInicial)} kg·m² a ` +
      `${numero(omegaInicial)} rad/s, e recolhe a massa até a ` +
      `inércia cair para ${numero(inerciaFinal)}. De quanto VARIOU a energia cinética de ` +
      `rotação, em J? ${PEDIDO}`,
    enunciadoTex: `\\Delta K = \\frac{1}{2}I_{2}\\omega_{2}^{2} - \\frac{1}{2}I_{1}\\omega_{1}^{2}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...conservacaoAngularComPassos(inerciaInicial, omegaInicial, inerciaFinal).passos,
        {
          descricao: 'A variação é a diferença entre as duas energias.',
          tex: `\\Delta K = ${numeroTex(energiaDepois)} - ${numeroTex(energiaAntes)} = ${numeroTex(gabarito)}\\ \\text{J}`,
          nota:
            'O momento angular se conserva, a energia não: quem recolheu a massa puxou contra a ' +
            'força centrífuga e realizou trabalho.',
        },
      ],
    },
    conceitos: ['angular.conservacao', 'angular.energia-nao-se-conserva'],
    armadilhas: [
      {
        resposta: 0,
        diagnostico:
          'A energia NÃO se conserva aqui. O que se conserva é o momento angular — e recolher a ' +
          'massa exige trabalho, que entra no sistema como energia de rotação.',
        passo: 3,
        conceito: 'angular.energia-nao-se-conserva',
      },
      {
        resposta: energiaDepois,
        diagnostico: 'Essa é a energia final. O enunciado pede a VARIAÇÃO, que é a diferença entre as duas.',
        passo: 3,
        conceito: 'angular.energia-nao-se-conserva',
      },
      {
        resposta: -gabarito,
        diagnostico:
          'O sinal ficou invertido. Recolher a massa aumenta a velocidade angular ao quadrado ' +
          'mais do que diminui a inércia, de modo que a energia sobe.',
        passo: 3,
        conceito: 'angular.energia-nao-se-conserva',
      },
    ],
  });
}

function numeroTex(valor: number): string {
  return Number(valor.toFixed(4)).toString().replace('.', '{,}');
}

function artigo(corpo: CorpoRigido): string {
  return corpo.nome.startsWith('casca') || corpo.nome.startsWith('esfera') ? 'uma' : 'um';
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function numero(valor: number): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
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
