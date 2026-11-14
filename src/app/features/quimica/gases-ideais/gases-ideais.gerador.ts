import {
  R_LITRO_ATM,
  fracaoEmMassa,
  molsIdeais,
  molsIdeaisComPassos,
  paraKelvin,
  pressaoParcial,
  pressaoParcialComPassos,
  volumeIdeal,
  volumeIdealComPassos,
  volumeNoSegundoEstado,
  volumeNoSegundoEstadoComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  DICA_KELVIN,
  DICA_PARCIAL,
  DICA_TRANSFORMACAO,
  PARCIAL,
  QUANTIDADE,
  TRANSFORMACAO,
  VOLUME,
} from '@features/quimica/gases-ideais/gases-ideais.textos';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-6);

/** Gases de garrafa, com a massa molar que a mistura usa na armadilha. */
const GASES: readonly { readonly formula: string; readonly massaMolar: number }[] = [
  { formula: 'He', massaMolar: 4.0 },
  { formula: 'N₂', massaMolar: 28.01 },
  { formula: 'O₂', massaMolar: 32.0 },
  { formula: 'CO₂', massaMolar: 44.01 },
  { formula: 'Ar', massaMolar: 39.95 },
  { formula: 'CH₄', massaMolar: 16.04 },
];

type Pergunta = 'volume' | 'quantidade' | 'transformacao' | 'parcial';

/**
 * Gases ideais e pressões parciais — uma equação só, e a temperatura em kelvin.
 *
 * O erro que o tópico existe para corrigir é a temperatura em graus Celsius.
 * Não é descuido de unidade: a equação afirma uma PROPORÇÃO entre volume e
 * temperatura, e proporção exige uma escala cujo zero seja o zero de verdade.
 * Por isso todas as temperaturas dos enunciados vêm em °C — dá-las em kelvin
 * pouparia o aluno exatamente do passo que ele precisa aprender a não pular.
 *
 * Nas pressões parciais, o erro irmão é usar a fração em massa no lugar da
 * molar. Os gases sorteados têm massas molares bem diferentes (He contra Ar,
 * por exemplo) justamente para que as duas frações não coincidam.
 */
export const geradorGases: GeradorExercicio<number> = {
  topicoId: 'gases-ideais',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'quantidade':
        return exercicioQuantidade(nivel, rng);
      case 'transformacao':
        return exercicioTransformacao(nivel, rng);
      case 'parcial':
        return exercicioParcial(nivel, rng);
      default:
        return exercicioVolume(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['volume', 'quantidade']);
    case 'medio':
      return rng.escolher<Pergunta>(['volume', 'quantidade', 'parcial']);
    case 'dificil':
      return rng.escolher<Pergunta>(['quantidade', 'transformacao', 'parcial']);
    // A transformação é a única que cobra a conversão DUAS vezes, e é onde
    // deixar os graus Celsius mais machuca.
    case 'extremo':
      return rng.escolher<Pergunta>(['transformacao', 'parcial']);
  }
}

/**
 * Temperaturas de problema: nem criogenia, nem forno.
 *
 * Só positivas, e isso é decisão de desenho: com 0 °C a armadilha de «deixar
 * em Celsius» dividiria por zero, e com temperatura negativa ela devolveria um
 * volume negativo — um absurdo que entregaria o erro antes de o aluno pensar.
 */
function sortearCelsius(rng: Rng): number {
  return rng.inteiro(5, 150);
}

function exercicioVolume(nivel: Nivel, rng: Rng): Exercicio<number> {
  const mols = rng.inteiro(50, 400) / 100;
  const pressao = rng.inteiro(50, 400) / 100;
  const celsius = sortearCelsius(rng);

  const { resultado, passos } = volumeIdealComPassos(mols, pressao, celsius);
  const texto = enunciadoTrilingue(VOLUME, [mols, pressao, celsius], DICA_KELVIN);

  return {
    id: `gas-vol-${mols}-${pressao}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: 'PV = nRT \\qquad R = 0{,}08206\\;\\text{L·atm/(mol·K)}',
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['gas.equacao', 'gas.kelvin'],
    armadilhas: semColisoes(
      [
        {
          resposta: volumeIdeal(mols, pressao, celsius),
          diagnostico:
            'A temperatura ficou em graus Celsius. A equação diz que o volume é proporcional ' +
            'a T, e isso só vale numa escala cujo zero é o zero de verdade: some 273,15.',
          passo: 1,
          conceito: 'gas.kelvin',
        },
        {
          resposta: (pressao * paraKelvin(celsius) * R_LITRO_ATM) / mols,
          diagnostico:
            'Os papéis de n e de P trocaram de lugar. O volume é nRT dividido pela pressão: ' +
            'mais gás ocupa mais, mais pressão comprime.',
          passo: 2,
          conceito: 'gas.equacao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioQuantidade(nivel: Nivel, rng: Rng): Exercicio<number> {
  const litros = rng.inteiro(20, 500) / 10;
  const pressao = rng.inteiro(50, 400) / 100;
  const celsius = sortearCelsius(rng);

  const { resultado, passos } = molsIdeaisComPassos(pressao, litros, celsius);
  const texto = enunciadoTrilingue(QUANTIDADE, [pressao, litros, celsius], DICA_KELVIN);

  return {
    id: `gas-mols-${litros}-${pressao}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: 'n = \\frac{PV}{RT} \\qquad R = 0{,}08206\\;\\text{L·atm/(mol·K)}',
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['gas.equacao', 'gas.kelvin'],
    armadilhas: semColisoes(
      [
        {
          resposta: molsIdeais(pressao, litros, celsius),
          diagnostico:
            'A temperatura entrou em graus Celsius. Passe para kelvin somando 273,15 — a ' +
            'razão entre temperaturas só faz sentido na escala absoluta.',
          passo: 1,
          conceito: 'gas.kelvin',
        },
        {
          resposta: (pressao * litros * R_LITRO_ATM) / paraKelvin(celsius),
          diagnostico:
            'O R acabou multiplicando em vez de dividir. Na forma n = PV/RT ele está embaixo, ' +
            'junto com a temperatura.',
          passo: 2,
          conceito: 'gas.equacao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioTransformacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const v1 = rng.inteiro(20, 300) / 10;
  const p1 = rng.inteiro(50, 400) / 100;
  const p2 = rng.inteiro(50, 400) / 100;
  const celsius1 = sortearCelsius(rng);
  const celsius2 = sortearCelsius(rng);

  const { resultado, passos } = volumeNoSegundoEstadoComPassos(p1, v1, celsius1, p2, celsius2);
  const texto = enunciadoTrilingue(
    TRANSFORMACAO,
    [p1, v1, celsius1, p2, celsius2],
    DICA_TRANSFORMACAO,
  );

  return {
    id: `gas-transf-${v1}-${p1}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: '\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2}',
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['gas.transformacao', 'gas.kelvin'],
    armadilhas: semColisoes(
      [
        {
          resposta: volumeNoSegundoEstado(p1, v1, celsius1, p2, celsius2),
          diagnostico:
            'As temperaturas ficaram em graus Celsius. Aqui o estrago é dobrado: a razão ' +
            'T₂/T₁ em Celsius não tem relação com a razão verdadeira.',
          passo: 1,
          conceito: 'gas.kelvin',
        },
        {
          resposta: (p1 * v1 * paraKelvin(celsius1)) / (paraKelvin(celsius2) * p2),
          diagnostico:
            'As duas temperaturas trocaram de lugar. Aquecer expande: T₂ vai em cima, junto ' +
            'com o estado final.',
          passo: 3,
          conceito: 'gas.transformacao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioParcial(nivel: Nivel, rng: Rng): Exercicio<number> {
  const primeiro = rng.escolher(GASES);
  // O segundo gás é sempre outro, e a mistura é de massas molares diferentes
  // de propósito: é isso que separa a fração molar da fração em massa.
  const outros = GASES.filter((g) => g.formula !== primeiro.formula);
  const segundo = rng.escolher(outros);

  const molsDoPrimeiro = rng.inteiro(50, 400) / 100;
  const molsDoSegundo = rng.inteiro(50, 400) / 100;
  const total = rng.inteiro(100, 600) / 100;

  const molsTotais = molsDoPrimeiro + molsDoSegundo;

  const { resultado, passos } = pressaoParcialComPassos(
    molsDoPrimeiro,
    molsTotais,
    total,
    primeiro.formula,
  );

  const texto = enunciadoTrilingue(
    PARCIAL,
    [primeiro.formula, molsDoPrimeiro, segundo.formula, molsDoSegundo, total],
    DICA_PARCIAL,
  );

  const massaDoPrimeiro = molsDoPrimeiro * primeiro.massaMolar;
  const massaTotal = massaDoPrimeiro + molsDoSegundo * segundo.massaMolar;

  return {
    id: `gas-parc-${primeiro.formula}-${molsDoPrimeiro}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: 'P_i = x_i \\cdot P_{\\text{total}}',
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['gas.parcial', 'gas.equacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: fracaoEmMassa(massaDoPrimeiro, massaTotal) * total,
          diagnostico:
            'Essa é a fração em MASSA. O que empurra a parede é partícula, não grama: a ' +
            'fração que vale aqui é a molar.',
          passo: 1,
          conceito: 'gas.parcial',
        },
        {
          resposta: pressaoParcial(molsDoSegundo, molsTotais, total),
          diagnostico:
            'Essa é a pressão parcial do OUTRO gás. A fração molar usa os mols do gás que a ' +
            'pergunta nomeia.',
          passo: 1,
          conceito: 'gas.parcial',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}
