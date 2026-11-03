import {
  CONDUTIVIDADES,
  STEFAN_BOLTZMANN,
  ZERO_CELSIUS,
  calorSensivelComPassos,
  conducaoComPassos,
  conveccaoComPassos,
  equilibrioRadiativoComPassos,
  equilibrioTermicoComPassos,
  radiacaoComPassos,
  resistenciaTermicaComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Exercícios de transferência de calor.
 *
 * Dois erros aparecem o tempo todo e cada um tem a sua armadilha: usar Celsius
 * onde a lei pede kelvin — fatal na radiação, que vai à quarta potência — e
 * confundir fluxo com energia, que diferem pelo tempo.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

/** Calores específicos usuais, em J/(kg·K). */
const CALORES: readonly { readonly nome: string; readonly c: number }[] = [
  { nome: 'água', c: 4186 },
  { nome: 'alumínio', c: 900 },
  { nome: 'ferro', c: 450 },
  { nome: 'cobre', c: 385 },
  { nome: 'vidro', c: 840 },
];

type Tipo = 'conducao' | 'resistencia' | 'conveccao' | 'radiacao' | 'equilibrio-radiativo' | 'calorimetria' | 'mistura';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['conducao', 'calorimetria'],
  medio: ['conducao', 'conveccao', 'calorimetria', 'resistencia'],
  dificil: ['radiacao', 'equilibrio-radiativo', 'mistura', 'resistencia'],
};

export const geradorTransferenciaDeCalor: GeradorExercicio<number> = {
  topicoId: 'transferencia-de-calor',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'conducao':
        return daConducao(nivel, rng);
      case 'resistencia':
        return daResistencia(nivel, rng);
      case 'conveccao':
        return daConveccao(nivel, rng);
      case 'radiacao':
        return daRadiacao(nivel, rng);
      case 'equilibrio-radiativo':
        return doEquilibrioRadiativo(nivel, rng);
      case 'calorimetria':
        return daCalorimetria(nivel, rng);
      default:
        return daMistura(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** Fluxo por condução, pela lei de Fourier. */
function daConducao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const material = rng.escolher(CONDUTIVIDADES);
  const area = rng.inteiro(5, 60) / 10;
  const deltaT = rng.inteiro(5, 60);
  const espessura = rng.inteiro(1, 40) / 100;

  const gabarito = (material.k * area * deltaT) / espessura;

  return montar({
    chave: `cond-${material.material}-${area}-${deltaT}-${espessura}`,
    nivel,
    rng,
    enunciado:
      `Uma placa de ${material.material} tem ${numero(area)} m² de área e ${numero(espessura)} m ` +
      `de espessura, com uma diferença de ${deltaT} K entre as faces. A condutividade é ` +
      `${numero(material.k)} W/(m·K). Qual é o fluxo de calor, em W? ${PEDIDO}`,
    enunciadoTex: `\\frac{Q}{t} = \\frac{kA\\,\\Delta T}{L}`,
    gabarito,
    resolucao: conducaoComPassos(material.k, area, deltaT, espessura),
    conceitos: ['termica.conducao', 'termica.fluxo-e-energia'],
    armadilhas: [
      {
        resposta: material.k * area * deltaT * espessura,
        diagnostico:
          'A espessura DIVIDE, não multiplica. Quanto mais grossa a parede, menor o fluxo — é ' +
          'assim que um isolante funciona.',
        passo: 0,
        conceito: 'termica.conducao',
      },
      {
        resposta: (material.k * deltaT) / espessura,
        diagnostico: `Faltou a área, que são ${numero(area)} m². Dobrar a área dobra o fluxo.`,
        passo: 1,
        conceito: 'termica.conducao',
      },
      {
        resposta: (area * deltaT) / espessura,
        diagnostico:
          'Faltou a condutividade do material. É ela que distingue o cobre da lã de vidro, e a ' +
          'diferença entre os dois passa de quatro ordens de grandeza.',
        passo: 1,
        conceito: 'termica.conducao',
      },
    ],
    dica: nivel === 'facil' ? 'Multiplique condutividade, área e diferença; divida pela espessura.' : undefined,
  });
}

/** Resistência térmica — o análogo da resistência elétrica. */
function daResistencia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const material = rng.escolher(CONDUTIVIDADES);
  const area = rng.inteiro(5, 50) / 10;
  const espessura = rng.inteiro(1, 30) / 100;

  const gabarito = espessura / (material.k * area);

  return montar({
    chave: `res-${material.material}-${area}-${espessura}`,
    nivel,
    rng,
    enunciado:
      `Qual é a resistência térmica de uma camada de ${material.material} com ${numero(espessura)} m ` +
      `de espessura e ${numero(area)} m² de área, em K/W? A condutividade é ` +
      `${numero(material.k)} W/(m·K). ${PEDIDO}`,
    enunciadoTex: `R = \\frac{L}{kA}`,
    gabarito,
    resolucao: resistenciaTermicaComPassos(espessura, material.k, area),
    conceitos: ['termica.resistencia', 'termica.conducao'],
    armadilhas: [
      {
        resposta: (material.k * area) / espessura,
        diagnostico:
          'A fração está invertida: isso é a CONDUTÂNCIA, que é o inverso da resistência.',
        passo: 1,
        conceito: 'termica.resistencia',
      },
      {
        resposta: espessura / material.k,
        diagnostico: 'Faltou dividir pela área também — ela está no denominador junto com k.',
        passo: 1,
        conceito: 'termica.resistencia',
      },
    ],
  });
}

/** Convecção, pela lei de resfriamento de Newton. */
function daConveccao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const h = rng.inteiro(5, 200);
  const area = rng.inteiro(5, 50) / 10;
  const deltaT = rng.inteiro(5, 80);

  const gabarito = h * area * deltaT;

  return montar({
    chave: `conv-${h}-${area}-${deltaT}`,
    nivel,
    rng,
    enunciado:
      `Uma superfície de ${numero(area)} m² está ${deltaT} K acima do ar que a banha, com ` +
      `coeficiente de convecção ${h} W/(m²·K). Qual é o fluxo de calor, em W? ${PEDIDO}`,
    enunciadoTex: `\\frac{Q}{t} = hA\\,\\Delta T`,
    gabarito,
    resolucao: conveccaoComPassos(h, area, deltaT),
    conceitos: ['termica.conveccao', 'termica.fluxo-e-energia'],
    armadilhas: [
      {
        resposta: h * deltaT,
        diagnostico: 'Faltou a área: o fluxo é proporcional à superfície exposta.',
        passo: 1,
        conceito: 'termica.conveccao',
      },
      {
        resposta: (h * area * deltaT) / 2,
        diagnostico:
          'Não há fator um meio aqui. A lei de resfriamento de Newton é um produto direto dos ' +
          'três fatores.',
        passo: 1,
        conceito: 'termica.conveccao',
      },
    ],
  });
}

/** Radiação, com a quarta potência da temperatura absoluta. */
function daRadiacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const emissividade = rng.inteiro(2, 10) / 10;
  const area = rng.inteiro(5, 40) / 10;
  const celsius = rng.inteiro(20, 400);
  const kelvin = celsius + ZERO_CELSIUS;

  const gabarito = emissividade * STEFAN_BOLTZMANN * area * kelvin ** 4;

  return montar({
    chave: `rad-${emissividade}-${area}-${celsius}`,
    nivel,
    rng,
    enunciado:
      `Um corpo de ${numero(area)} m² e emissividade ${numero(emissividade)} está a ${celsius} °C. ` +
      `Qual é a potência irradiada, em W? ${PEDIDO}`,
    enunciadoTex: `\\frac{Q}{t} = \\varepsilon\\sigma A T^{4}`,
    gabarito,
    resolucao: radiacaoComPassos(emissividade, area, kelvin),
    conceitos: ['termica.radiacao', 'termica.kelvin'],
    armadilhas: [
      {
        resposta: emissividade * STEFAN_BOLTZMANN * area * celsius ** 4,
        diagnostico:
          'A temperatura entrou em Celsius. A lei exige kelvin, e com a quarta potência o erro ' +
          'é enorme — não é um deslocamento, é um fator de muitas vezes.',
        passo: 0,
        conceito: 'termica.kelvin',
      },
      {
        resposta: emissividade * STEFAN_BOLTZMANN * area * kelvin,
        diagnostico:
          'Faltou elevar a temperatura à QUARTA potência. É ela que separa a radiação das ' +
          'outras duas formas de transferência.',
        passo: 1,
        conceito: 'termica.radiacao',
      },
      {
        resposta: STEFAN_BOLTZMANN * area * kelvin ** 4,
        diagnostico:
          `Faltou a emissividade, que vale ${numero(emissividade)}. Só um corpo negro perfeito ` +
          'irradia com emissividade 1.',
        passo: 2,
        conceito: 'termica.radiacao',
      },
    ],
  });
}

/** A temperatura de equilíbrio de um radiador no vácuo. */
function doEquilibrioRadiativo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const potencia = rng.inteiro(50, 2000);
  const emissividade = rng.inteiro(5, 10) / 10;
  const area = rng.inteiro(5, 40) / 10;

  const gabarito = (potencia / (emissividade * STEFAN_BOLTZMANN * area)) ** 0.25;

  return montar({
    chave: `eqr-${potencia}-${emissividade}-${area}`,
    nivel,
    rng,
    enunciado:
      `Um radiador de satélite com ${numero(area)} m² e emissividade ${numero(emissividade)} ` +
      `precisa dissipar ${potencia} W no vácuo. Qual é a temperatura de equilíbrio, em K? ` +
      PEDIDO,
    enunciadoTex: `P = \\varepsilon\\sigma A T^{4}`,
    gabarito,
    resolucao: equilibrioRadiativoComPassos(potencia, emissividade, area),
    conceitos: ['termica.radiacao', 'termica.vacuo'],
    armadilhas: [
      {
        resposta: potencia / (emissividade * STEFAN_BOLTZMANN * area),
        diagnostico:
          'Faltou extrair a raiz QUARTA. O valor obtido é a temperatura elevada à quarta ' +
          'potência, não a temperatura.',
        passo: 2,
        conceito: 'termica.radiacao',
      },
      {
        resposta: gabarito - ZERO_CELSIUS,
        diagnostico:
          'Esse é o resultado em graus Celsius. O enunciado pede kelvin, que é a escala em que ' +
          'a lei de Stefan-Boltzmann vale.',
        passo: 2,
        conceito: 'termica.kelvin',
      },
      {
        resposta: Math.sqrt(potencia / (emissividade * STEFAN_BOLTZMANN * area)),
        diagnostico:
          'A raiz tirada foi a quadrada. Como a temperatura entra com expoente 4, é a raiz ' +
          'quarta que desfaz a conta.',
        passo: 2,
        conceito: 'termica.radiacao',
      },
    ],
    dica: 'No vácuo não há condução nem convecção: só a radiação dissipa.',
  });
}

/** Calor sensível: quanto custa aquecer. */
function daCalorimetria(nivel: Nivel, rng: Rng): Exercicio<number> {
  const material = rng.escolher(CALORES);
  const massa = rng.inteiro(1, 40) / 2;
  const deltaT = rng.inteiro(5, 80);

  const gabarito = massa * material.c * deltaT;

  return montar({
    chave: `cal-${material.nome}-${massa}-${deltaT}`,
    nivel,
    rng,
    enunciado:
      `Quanta energia, em J, é preciso para aquecer ${numero(massa)} kg de ${material.nome} em ` +
      `${deltaT} K? O calor específico é ${material.c} J/(kg·K). ${PEDIDO}`,
    enunciadoTex: `Q = mc\\,\\Delta T`,
    gabarito,
    resolucao: calorSensivelComPassos(massa, material.c, deltaT),
    conceitos: ['termica.calor-sensivel', 'termica.fluxo-e-energia'],
    armadilhas: [
      {
        resposta: material.c * deltaT,
        diagnostico: `Faltou multiplicar pela massa, que são ${numero(massa)} kg.`,
        passo: 1,
        conceito: 'termica.calor-sensivel',
      },
      {
        resposta: massa * material.c,
        diagnostico:
          'Isso é a capacidade térmica do corpo, em joules por kelvin. Falta multiplicar pela ' +
          'variação de temperatura pedida.',
        passo: 1,
        conceito: 'termica.calor-sensivel',
      },
      {
        resposta: (massa * material.c * deltaT) / 1000,
        diagnostico:
          'O resultado foi dividido por mil, como se fosse quilojoule. O enunciado pede joules.',
        passo: 2,
        conceito: 'termica.fluxo-e-energia',
      },
    ],
  });
}

/** A temperatura final de uma mistura. */
function daMistura(nivel: Nivel, rng: Rng): Exercicio<number> {
  const primeiro = rng.escolher(CALORES);
  const segundo = rng.escolher(CALORES);
  const m1 = rng.inteiro(1, 20) / 2;
  const m2 = rng.inteiro(1, 20) / 2;
  const t1 = rng.inteiro(5, 40);
  const t2 = rng.inteiro(50, 95);

  const gabarito =
    (m1 * primeiro.c * t1 + m2 * segundo.c * t2) / (m1 * primeiro.c + m2 * segundo.c);

  return montar({
    chave: `mis-${primeiro.nome}${m1}${t1}-${segundo.nome}${m2}${t2}`,
    nivel,
    rng,
    enunciado:
      `${numero(m1)} kg de ${primeiro.nome} a ${t1} °C são misturados com ${numero(m2)} kg de ` +
      `${segundo.nome} a ${t2} °C, num recipiente isolado. Qual é a temperatura final, em °C? ` +
      `Os calores específicos são ${primeiro.c} e ${segundo.c} J/(kg·K). ${PEDIDO}`,
    enunciadoTex: `Q_{1} + Q_{2} = 0`,
    gabarito,
    resolucao: equilibrioTermicoComPassos(m1, primeiro.c, t1, m2, segundo.c, t2),
    conceitos: ['termica.equilibrio', 'termica.calor-sensivel'],
    armadilhas: [
      {
        resposta: (t1 + t2) / 2,
        diagnostico:
          'A média simples só valeria se as duas capacidades térmicas fossem iguais. Cada ' +
          'parcela pesa conforme o produto da massa pelo calor específico.',
        passo: 2,
        conceito: 'termica.equilibrio',
      },
      {
        resposta: (m1 * t1 + m2 * t2) / (m1 + m2),
        diagnostico:
          'A ponderação usou só as massas. O peso correto é a capacidade térmica, que é massa ' +
          'VEZES calor específico.',
        passo: 2,
        conceito: 'termica.equilibrio',
      },
      {
        resposta: t2 - t1,
        diagnostico:
          'Essa é a diferença entre as temperaturas iniciais. A final fica entre as duas, mais ' +
          'perto de quem tem maior capacidade térmica.',
        passo: 0,
        conceito: 'termica.equilibrio',
      },
    ],
  });
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
