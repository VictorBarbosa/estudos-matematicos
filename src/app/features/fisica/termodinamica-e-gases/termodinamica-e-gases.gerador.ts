import {
  R_GASES,
  gasIdealComPassos,
  primeiraLeiComPassos,
  trabalhoIsobaricoComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => {
  if (a === b) {
    return true;
  }
  const escala = Math.max(Math.abs(a), Math.abs(b));
  return escala === 0 ? true : Math.abs(a - b) / escala < 0.005;
};

type Pergunta = 'volume-gas' | 'pressao-gas' | 'transformacao' | 'energia-interna' | 'trabalho-isobarico';

export const geradorTermo: GeradorExercicio<number> = {
  topicoId: 'termodinamica-e-gases',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'volume-gas':
        return exercicioVolume(nivel, rng);
      case 'pressao-gas':
        return exercicioPressao(nivel, rng);
      case 'transformacao':
        return exercicioTransformacao(nivel, rng);
      case 'energia-interna':
        return exercicioEnergiaInterna(nivel, rng);
      case 'trabalho-isobarico':
        return exercicioTrabalho(nivel, rng);
    }
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');
    return /^[+-]?\d*\.?\d+(e[+-]?\d+)?$/i.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toPrecision(6)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['energia-interna', 'volume-gas']);
    case 'medio':
      return rng.escolher<Pergunta>(['transformacao', 'trabalho-isobarico', 'pressao-gas']);
    case 'dificil':
      return rng.escolher<Pergunta>(['transformacao', 'pressao-gas', 'trabalho-isobarico']);
  }
}

function exercicioVolume(nivel: Nivel, rng: Rng): Exercicio<number> {
  const mols = rng.inteiro(1, 5);
  const temperaturaCelsius = rng.escolher([0, 25, 100, 200, 300]);
  const temperatura = temperaturaCelsius + 273.15;
  const pressao = 101325;

  const { resultado, passos } = gasIdealComPassos({ mols, temperatura, pressao });
  // Em litros, que é a unidade usual.
  const gabarito = resultado.volume * 1000;

  return {
    id: `ter-v-${mols}-${temperaturaCelsius}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Que volume ocupam ${mols} mol de gás ideal a ${temperaturaCelsius} °C e 1 atm? (em ` +
      'litros, 2 casas decimais)',
    enunciadoTex:
      `n = ${mols}\\,\\text{mol} \\qquad T = ${temperaturaCelsius}^\\circ\\text{C} \\qquad p = 1\\,\\text{atm}`,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['termo.gas-ideal'],
    armadilhas: semColisoes(
      [
        {
          resposta:
            temperaturaCelsius === 0 ? gabarito / 2 : (mols * R_GASES * temperaturaCelsius * 1000) / pressao,
          diagnostico:
            'A temperatura precisa estar em KELVIN. Em celsius, o zero da escala é arbitrário e ' +
            'a proporcionalidade se quebra — a 0 °C o resultado seria zero.',
          passo: 1,
          conceito: 'termo.gas-ideal',
        },
        {
          resposta: resultado.volume,
          diagnostico: 'Esse valor está em m³. A pergunta pede litros (1 m³ = 1000 L).',
          passo: 2,
          conceito: 'termo.gas-ideal',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? 'pV = nRT, com T em kelvin.' : undefined,
  };
}

function exercicioPressao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const mols = rng.inteiro(1, 10);
  const volumeLitros = rng.inteiro(5, 50);
  const temperaturaCelsius = rng.escolher([20, 25, 50, 100, 150]);

  const { resultado, passos } = gasIdealComPassos({
    mols,
    volume: volumeLitros / 1000,
    temperatura: temperaturaCelsius + 273.15,
  });

  // Em kPa, para a resposta não ter seis dígitos.
  const gabarito = resultado.pressao / 1000;

  return {
    id: `ter-p-${mols}-${volumeLitros}-${temperaturaCelsius}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é a pressão de ${mols} mol de gás ideal em ${volumeLitros} L a ` +
      `${temperaturaCelsius} °C? (em kPa, 2 casas decimais)`,
    enunciadoTex:
      `n = ${mols} \\qquad V = ${volumeLitros}\\,\\text{L} \\qquad T = ${temperaturaCelsius}^\\circ\\text{C}`,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['termo.gas-ideal'],
    armadilhas: semColisoes(
      [
        {
          resposta: (mols * R_GASES * (temperaturaCelsius + 273.15)) / volumeLitros / 1000,
          diagnostico:
            'O volume precisa estar em m³, não em litros: 1 L = 0,001 m³. Usar litros direto ' +
            'erra por mil.',
          passo: 1,
          conceito: 'termo.gas-ideal',
        },
        {
          resposta: (mols * R_GASES * temperaturaCelsius) / (volumeLitros / 1000) / 1000,
          diagnostico: 'A temperatura precisa estar em kelvin: some 273,15 aos graus celsius.',
          passo: 1,
          conceito: 'termo.gas-ideal',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}

function exercicioTransformacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const pressao1 = rng.inteiro(1, 5);
  const volume1 = rng.inteiro(5, 40);
  const temperatura1 = rng.escolher([273, 300, 350, 400]);
  const temperatura2 = rng.escolher([273, 300, 350, 400, 500, 600]);
  const pressao2 = rng.inteiro(1, 5);

  // Isolando V₂ na equação geral dos gases.
  const resultado = (pressao1 * volume1 * temperatura2) / (temperatura1 * pressao2);

  return {
    id: `ter-trans-${pressao1}_${volume1}_${temperatura1}-${pressao2}_${temperatura2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um gás a ${pressao1} atm ocupa ${volume1} L a ${temperatura1} K. Levado a ${pressao2} ` +
      `atm e ${temperatura2} K, que volume passa a ocupar? (em litros, 2 casas decimais)`,
    enunciadoTex:
      `p_1 = ${pressao1} \\quad V_1 = ${volume1} \\quad T_1 = ${temperatura1} \\quad ` +
      `p_2 = ${pressao2} \\quad T_2 = ${temperatura2}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'A quantidade de gás não muda, então pV/T é constante.',
          tex: '\\frac{p_1 V_1}{T_1} = \\frac{p_2 V_2}{T_2}',
        },
        {
          descricao: 'Isolamos o volume final.',
          tex: `V_2 = \\frac{p_1 V_1 T_2}{T_1 p_2}`,
          nota: 'Nenhuma conversão de unidade é necessária: as unidades se cancelam, desde que iguais nos dois estados.',
        },
        {
          descricao: 'Substituindo.',
          tex:
            `V_2 = \\frac{${pressao1} \\cdot ${volume1} \\cdot ${temperatura2}}` +
            `{${temperatura1} \\cdot ${pressao2}} = ${Number(resultado.toFixed(4))}\\,\\text{L}`,
        },
      ],
    },
    conceitos: ['termo.gas-ideal'],
    armadilhas: semColisoes(
      [
        {
          resposta: (pressao1 * volume1 * temperatura1) / (temperatura2 * pressao2),
          diagnostico:
            'As temperaturas estão trocadas. Aquecer um gás a pressão constante o EXPANDE, ' +
            'então T₂ vai no numerador.',
          passo: 1,
          conceito: 'termo.gas-ideal',
        },
        {
          resposta: (pressao2 * volume1 * temperatura2) / (temperatura1 * pressao1),
          diagnostico:
            'As pressões estão trocadas. Aumentar a pressão COMPRIME o gás, então p₂ vai no ' +
            'denominador.',
          passo: 1,
          conceito: 'termo.gas-ideal',
        },
        {
          resposta: volume1,
          diagnostico: 'O volume muda sim: tanto a pressão quanto a temperatura foram alteradas.',
          passo: 2,
          conceito: 'termo.gas-ideal',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioEnergiaInterna(nivel: Nivel, rng: Rng): Exercicio<number> {
  const calor = rng.inteiro(-500, 800);
  const trabalho = rng.inteiro(-300, 600);

  const { resultado, passos } = primeiraLeiComPassos(calor, trabalho);

  return {
    id: `ter-u-${calor}-${trabalho}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um gás ${calor >= 0 ? 'recebe' : 'perde'} ${Math.abs(calor)} J de calor e ` +
      `${trabalho >= 0 ? 'realiza' : 'recebe'} ${Math.abs(trabalho)} J de trabalho. Qual é a ` +
      'variação da energia interna, em joules?',
    enunciadoTex: `Q = ${calor}\\,\\text{J} \\qquad W = ${trabalho}\\,\\text{J}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['termo.primeira-lei'],
    armadilhas: semColisoes(
      [
        {
          resposta: calor + trabalho,
          diagnostico:
            'O trabalho realizado PELO gás sai dele, então entra subtraindo: ΔU = Q − W.',
          passo: 0,
          conceito: 'termo.primeira-lei',
        },
        {
          resposta: trabalho - calor,
          diagnostico:
            'Os papéis estão trocados. O calor recebido entra somando; o trabalho realizado, ' +
            'subtraindo.',
          passo: 1,
          conceito: 'termo.primeira-lei',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'ΔU = Q − W' : undefined,
  };
}

function exercicioTrabalho(nivel: Nivel, rng: Rng): Exercicio<number> {
  const pressaoAtm = rng.inteiro(1, 5);
  const pressao = pressaoAtm * 101325;
  const volumeInicial = rng.inteiro(5, 30);
  const volumeFinal = volumeInicial + rng.inteiro(5, 40);

  const { resultado, passos } = trabalhoIsobaricoComPassos(
    pressao,
    volumeInicial / 1000,
    volumeFinal / 1000,
  );

  return {
    id: `ter-w-${pressaoAtm}-${volumeInicial}-${volumeFinal}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um gás expande de ${volumeInicial} L para ${volumeFinal} L à pressão constante de ` +
      `${pressaoAtm} atm. Qual é o trabalho realizado pelo gás, em joules? (2 casas decimais)`,
    enunciadoTex:
      `p = ${pressaoAtm}\\,\\text{atm} \\qquad V_i = ${volumeInicial}\\,\\text{L} \\qquad ` +
      `V_f = ${volumeFinal}\\,\\text{L}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['termo.trabalho'],
    armadilhas: semColisoes(
      [
        {
          resposta: pressao * (volumeFinal - volumeInicial),
          diagnostico:
            'O volume precisa estar em m³: 1 L = 0,001 m³. Em litros, o resultado erra por mil.',
          passo: 1,
          conceito: 'termo.trabalho',
        },
        {
          resposta: (pressao * volumeFinal) / 1000,
          diagnostico:
            'O trabalho usa a VARIAÇÃO de volume, não o volume final. Só a expansão realiza ' +
            'trabalho.',
          passo: 1,
          conceito: 'termo.trabalho',
        },
        {
          resposta: (pressaoAtm * (volumeFinal - volumeInicial)) / 1000,
          diagnostico:
            'A pressão precisa estar em pascal: 1 atm = 101 325 Pa. Em atmosferas, o resultado ' +
            'não sai em joules.',
          passo: 0,
          conceito: 'termo.trabalho',
        },
      ],
      resultado,
      proximos,
    ),
  };
}
