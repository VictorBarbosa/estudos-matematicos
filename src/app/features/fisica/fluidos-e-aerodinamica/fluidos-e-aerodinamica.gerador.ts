import {
  DENSIDADE_AGUA,
  DENSIDADE_AR,
  bernoulliComPassos,
  empuxoArquimedesComPassos,
  pressaoHidrostaticaComPassos,
  sustentacaoComPassos,
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

type Pergunta = 'pressao' | 'empuxo' | 'fracao-submersa' | 'sustentacao' | 'bernoulli';

export const geradorFluidos: GeradorExercicio<number> = {
  topicoId: 'fluidos-e-aerodinamica',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'pressao':
        return exercicioPressao(nivel, rng);
      case 'empuxo':
        return exercicioEmpuxo(nivel, rng);
      case 'fracao-submersa':
        return exercicioFracaoSubmersa(nivel, rng);
      case 'sustentacao':
        return exercicioSustentacao(nivel, rng);
      case 'bernoulli':
        return exercicioBernoulli(nivel, rng);
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
      return rng.escolher<Pergunta>(['pressao', 'empuxo']);
    case 'medio':
      return rng.escolher<Pergunta>(['fracao-submersa', 'pressao', 'sustentacao']);
    case 'dificil':
      return rng.escolher<Pergunta>(['bernoulli', 'sustentacao', 'fracao-submersa']);
  }
}

function exercicioPressao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const profundidade = rng.inteiro(1, 100);
  const { resultado, passos } = pressaoHidrostaticaComPassos(profundidade);

  // A resposta é pedida em kPa, para não lidar com cinco dígitos.
  const gabarito = resultado / 1000;

  return {
    id: `flu-p-${profundidade}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é a pressão total a ${profundidade} m de profundidade na água? (em kPa, 2 casas ` +
      'decimais; considere a atmosfera de 101,325 kPa)',
    enunciadoTex: `h = ${profundidade}\\,\\text{m} \\qquad \\rho = 1000\\,\\text{kg/m}^{3}`,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['fluidos.pressao'],
    armadilhas: semColisoes(
      [
        {
          resposta: (DENSIDADE_AGUA * 9.81 * profundidade) / 1000,
          diagnostico:
            'Essa é só a pressão da COLUNA de água. A pressão total inclui também a atmosfera ' +
            'que pesa sobre a superfície.',
          passo: 2,
          conceito: 'fluidos.pressao',
        },
        {
          resposta: (DENSIDADE_AGUA * profundidade) / 1000,
          diagnostico: 'Faltou a gravidade: a pressão vem do PESO da coluna, não da massa.',
          passo: 1,
          conceito: 'fluidos.pressao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? 'p = p₀ + ρgh' : undefined,
  };
}

function exercicioEmpuxo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const volumeLitros = rng.inteiro(1, 50);
  const volume = volumeLitros / 1000;
  const densidadeCorpo = rng.escolher([500, 800, 920, 2700, 7800]);

  const { resultado, passos } = empuxoArquimedesComPassos(volume, densidadeCorpo);

  return {
    id: `flu-e-${volumeLitros}-${densidadeCorpo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um corpo de ${volumeLitros} L totalmente submerso em água sofre que empuxo, em ` +
      'newtons? (2 casas decimais)',
    enunciadoTex: `V = ${volumeLitros}\\,\\text{L} \\qquad \\rho_{água} = 1000\\,\\text{kg/m}^{3}`,
    gabarito: resultado.empuxo,
    resolucao: { resultado: resultado.empuxo, passos },
    conceitos: ['fluidos.pressao'],
    armadilhas: semColisoes(
      [
        {
          resposta: resultado.peso,
          diagnostico:
            'Esse é o PESO do corpo, que usa a densidade DELE. O empuxo usa a densidade do ' +
            'FLUIDO deslocado.',
          passo: 1,
          conceito: 'fluidos.pressao',
        },
        {
          resposta: DENSIDADE_AGUA * volume,
          diagnostico:
            'Faltou multiplicar pela gravidade: o empuxo é o PESO do fluido deslocado, em ' +
            'newtons.',
          passo: 0,
          conceito: 'fluidos.pressao',
        },
      ],
      resultado.empuxo,
      proximos,
    ),
    dica: nivel === 'facil' ? 'E = ρ_fluido · V · g (1 L = 0,001 m³)' : undefined,
  };
}

function exercicioFracaoSubmersa(nivel: Nivel, rng: Rng): Exercicio<number> {
  const densidadeCorpo = rng.escolher([200, 400, 600, 700, 920, 950]);
  const { resultado, passos } = empuxoArquimedesComPassos(1, densidadeCorpo);

  return {
    id: `flu-fs-${densidadeCorpo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um corpo de densidade ${densidadeCorpo} kg/m³ flutua em água. Que fração do seu volume ` +
      'fica submersa? (responda entre 0 e 1, com 2 casas decimais)',
    enunciadoTex:
      `\\rho_{corpo} = ${densidadeCorpo} \\qquad \\rho_{água} = 1000\\,\\text{kg/m}^{3}`,
    gabarito: resultado.fracaoSubmersa,
    resolucao: { resultado: resultado.fracaoSubmersa, passos },
    conceitos: ['fluidos.pressao'],
    armadilhas: semColisoes(
      [
        {
          resposta: 1 - resultado.fracaoSubmersa,
          diagnostico:
            'Essa é a fração que fica FORA da água. A submersa é a razão direta entre as ' +
            'densidades.',
          passo: 3,
          conceito: 'fluidos.pressao',
        },
        {
          resposta: DENSIDADE_AGUA / densidadeCorpo,
          diagnostico:
            'A razão está invertida. Como o corpo é menos denso, a fração submersa é menor ' +
            'que 1.',
          passo: 3,
          conceito: 'fluidos.pressao',
        },
      ],
      resultado.fracaoSubmersa,
      proximos,
    ),
  };
}

function exercicioSustentacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const area = rng.inteiro(10, 120);
  const inferior = rng.inteiro(40, 90);
  const superior = inferior + rng.inteiro(5, 25);

  const { resultado, passos } = sustentacaoComPassos(area, superior, inferior);

  return {
    id: `flu-sus-${area}-${superior}-${inferior}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma asa de ${area} m² tem ar a ${superior} m/s na face superior e ${inferior} m/s na ` +
      'inferior. Qual é a sustentação, em newtons? (2 casas decimais)',
    enunciadoTex:
      `A = ${area}\\,\\text{m}^{2} \\qquad v_{sup} = ${superior} \\qquad v_{inf} = ${inferior}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['fluidos.sustentacao', 'fluidos.bernoulli'],
    armadilhas: semColisoes(
      [
        {
          resposta: (DENSIDADE_AR * (superior - inferior) ** 2 * area) / 2,
          diagnostico:
            'A conta é a diferença dos QUADRADOS das velocidades, não o quadrado da diferença. ' +
            'São coisas bem diferentes.',
          passo: 0,
          conceito: 'fluidos.sustentacao',
        },
        {
          resposta: (DENSIDADE_AR * (superior ** 2 - inferior ** 2)) / 2,
          diagnostico:
            'Esse é o Δp, em pascal. Falta multiplicar pela área da asa para obter a força.',
          passo: 2,
          conceito: 'fluidos.sustentacao',
        },
        {
          resposta: DENSIDADE_AR * (superior ** 2 - inferior ** 2) * area,
          diagnostico: 'Faltou dividir por 2, que vem do termo ρv²/2 de Bernoulli.',
          passo: 1,
          conceito: 'fluidos.bernoulli',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioBernoulli(nivel: Nivel, rng: Rng): Exercicio<number> {
  const velocidadeA = rng.inteiro(5, 30);
  const velocidadeB = velocidadeA + rng.inteiro(5, 40);

  const { resultado, passos } = bernoulliComPassos(101325, velocidadeA, velocidadeB);
  const gabarito = resultado / 1000;

  return {
    id: `flu-bern-${velocidadeA}-${velocidadeB}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Ar à pressão atmosférica (101,325 kPa) acelera de ${velocidadeA} para ${velocidadeB} ` +
      'm/s num duto horizontal. Qual é a nova pressão, em kPa? (2 casas decimais)',
    enunciadoTex:
      `p_A = 101{,}325\\,\\text{kPa} \\qquad v_A = ${velocidadeA} \\qquad v_B = ${velocidadeB}`,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['fluidos.bernoulli'],
    armadilhas: semColisoes(
      [
        {
          resposta:
            (101325 + (DENSIDADE_AR * (velocidadeB ** 2 - velocidadeA ** 2)) / 2) / 1000,
          diagnostico:
            'O sinal está invertido: onde o fluido ACELERA, a pressão CAI. Foi exatamente isso ' +
            'que Bernoulli descobriu.',
          passo: 2,
          conceito: 'fluidos.bernoulli',
        },
        {
          resposta: 101.325,
          diagnostico:
            'A pressão muda sim: parte da energia de pressão virou energia cinética do ' +
            'escoamento.',
          passo: 1,
          conceito: 'fluidos.bernoulli',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}
