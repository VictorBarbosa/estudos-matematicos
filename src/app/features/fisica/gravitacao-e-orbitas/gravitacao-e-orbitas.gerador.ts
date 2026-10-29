import {
  G,
  MASSA_TERRA,
  RAIO_TERRA,
  forcaGravitacionalComPassos,
  gravidadeNaAltitudeComPassos,
  orbitaCircularComPassos,
  velocidadeEscapeComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

/** Comparação relativa: as grandezas aqui variam muitas ordens de magnitude. */
const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

type Pergunta = 'gravidade-altitude' | 'velocidade-orbital' | 'periodo' | 'escape' | 'razao-forca';

export const geradorGravitacao: GeradorExercicio<number> = {
  topicoId: 'gravitacao-e-orbitas',
  formatoResposta: 'um número, ex.: 7,67 ou 7670',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'gravidade-altitude':
        return exercicioGravidade(nivel, rng);
      case 'velocidade-orbital':
        return exercicioVelocidadeOrbital(nivel, rng);
      case 'periodo':
        return exercicioPeriodo(nivel, rng);
      case 'escape':
        return exercicioEscape(nivel, rng);
      case 'razao-forca':
        return exercicioRazaoForca(nivel, rng);
    }
  },

  analisar: analisarNumero,

  ...numeroComCasas(2, 1e-4),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['gravidade-altitude', 'razao-forca']);
    case 'medio':
      return rng.escolher<Pergunta>(['velocidade-orbital', 'gravidade-altitude', 'escape']);
    case 'dificil':
      return rng.escolher<Pergunta>(['periodo', 'escape', 'velocidade-orbital']);
  }
}

function exercicioGravidade(nivel: Nivel, rng: Rng): Exercicio<number> {
  // Altitude em múltiplos de 10 km, do nível do mar à geoestacionária: a
  // faixa inteira, e não meia dúzia de valores memorizáveis.
  const altitudeKm = rng.booleano(0.1) ? 0 : rng.inteiro(10, 4000) * 10;
  const altitude = altitudeKm * 1000;

  const { resultado, passos } = gravidadeNaAltitudeComPassos(altitude);
  const superficie = (G * MASSA_TERRA) / RAIO_TERRA ** 2;

  return {
    id: `grav-g-${altitudeKm}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é a aceleração da gravidade a ${altitudeKm.toLocaleString('pt-BR')} km de ` +
      'altitude? (em m/s², 2 casas decimais)',
    enunciadoTex: `h = ${altitudeKm.toLocaleString('pt-BR').replace(/\./g, '\\,')}\\,\\text{km}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['gravitacao.lei'],
    armadilhas: semColisoes(
      [
        {
          resposta: (G * MASSA_TERRA) / altitude ** 2 || superficie,
          diagnostico:
            'A distância é medida do CENTRO da Terra: some o raio terrestre (6 371 km) à ' +
            'altitude.',
          passo: 1,
          conceito: 'gravitacao.lei',
        },
        {
          resposta: superficie,
          diagnostico:
            altitudeKm === 0
              ? 'Confira a conta: na superfície a gravidade é cerca de 9,8 m/s².'
              : 'Essa é a gravidade na SUPERFÍCIE. A essa altitude ela já caiu — mas bem menos ' +
                'do que a intuição sugere.',
          passo: 2,
          conceito: 'gravitacao.lei',
        },
        {
          resposta: (G * MASSA_TERRA) / (RAIO_TERRA + altitude),
          diagnostico:
            'O denominador é a distância ao QUADRADO. Sem o quadrado, o resultado nem tem ' +
            'unidade de aceleração.',
          passo: 0,
          conceito: 'gravitacao.lei',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'g = GM/r², com r medido do centro da Terra.' : undefined,
  };
}

function exercicioVelocidadeOrbital(nivel: Nivel, rng: Rng): Exercicio<number> {
  const altitudeKm = rng.inteiro(15, 4000) * 10;
  const { resultado, passos } = orbitaCircularComPassos(altitudeKm * 1000);

  // A resposta é pedida em km/s para ficar legível.
  const gabarito = resultado.velocidade / 1000;

  return {
    id: `grav-v-${altitudeKm}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é a velocidade de um satélite em órbita circular a ` +
      `${altitudeKm.toLocaleString('pt-BR')} km de altitude? (em km/s, 2 casas decimais)`,
    enunciadoTex: `h = ${altitudeKm.toLocaleString('pt-BR').replace(/\./g, '\\,')}\\,\\text{km}`,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['gravitacao.orbita'],
    armadilhas: semColisoes(
      [
        {
          resposta: (velocidadeEscapeComPassos(MASSA_TERRA, RAIO_TERRA + altitudeKm * 1000)
            .resultado /
            1000),
          diagnostico:
            'Essa é a velocidade de ESCAPE nesse raio, √2 vezes maior. Para orbitar, basta a ' +
            'velocidade em que a gravidade iguala a força centrípeta.',
          passo: 2,
          conceito: 'gravitacao.escape',
        },
        {
          resposta: Math.sqrt((G * MASSA_TERRA) / (altitudeKm * 1000)) / 1000,
          diagnostico:
            'O raio é medido do CENTRO: some os 6 371 km do raio terrestre à altitude.',
          passo: 2,
          conceito: 'gravitacao.orbita',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? 'v = √(GM/r), com r do centro da Terra.' : undefined,
  };
}

function exercicioPeriodo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const altitudeKm = rng.inteiro(20, 4000) * 10;
  const { resultado, passos } = orbitaCircularComPassos(altitudeKm * 1000);

  // Em minutos, que é como se fala de órbitas baixas.
  const gabarito = resultado.periodo / 60;

  return {
    id: `grav-t-${altitudeKm}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é o período orbital a ${altitudeKm.toLocaleString('pt-BR')} km de altitude? ` +
      '(em minutos, 2 casas decimais)',
    enunciadoTex: `h = ${altitudeKm.toLocaleString('pt-BR').replace(/\./g, '\\,')}\\,\\text{km}`,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['gravitacao.orbita', 'gravitacao.kepler'],
    armadilhas: semColisoes(
      [
        {
          resposta: resultado.periodo,
          diagnostico: 'Esse valor está em SEGUNDOS. A pergunta pede minutos.',
          passo: 3,
          conceito: 'gravitacao.orbita',
        },
        {
          resposta: (2 * Math.PI * (RAIO_TERRA + altitudeKm * 1000)) / 1000 / 60,
          diagnostico:
            'Você usou o perímetro da órbita mas esqueceu de dividir pela velocidade orbital.',
          passo: 3,
          conceito: 'gravitacao.orbita',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}

function exercicioEscape(nivel: Nivel, rng: Rng): Exercicio<number> {
  /** Corpos do sistema solar, com massa em kg e raio em m. */
  const corpos: readonly { readonly nome: string; readonly massa: number; readonly raio: number }[] =
    [
      { nome: 'a Terra', massa: 5.972e24, raio: 6.371e6 },
      { nome: 'a Lua', massa: 7.342e22, raio: 1.737e6 },
      { nome: 'Marte', massa: 6.417e23, raio: 3.39e6 },
      { nome: 'Júpiter', massa: 1.898e27, raio: 6.9911e7 },
    ];

  const corpo = rng.escolher(corpos);
  const { resultado, passos } = velocidadeEscapeComPassos(corpo.massa, corpo.raio);
  const gabarito = resultado / 1000;

  return {
    id: `grav-esc-${corpo.nome}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é a velocidade de escape da superfície de ${corpo.nome}? (em km/s, 2 casas ` +
      'decimais)',
    enunciadoTex:
      `M = ${corpo.massa.toExponential(3)}\\,\\text{kg} \\qquad R = ${corpo.raio.toExponential(3)}\\,\\text{m}`,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['gravitacao.escape'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.sqrt((G * corpo.massa) / corpo.raio) / 1000,
          diagnostico:
            'Essa é a velocidade ORBITAL rasante. A de escape tem o fator 2 dentro da raiz, ' +
            'sendo √2 vezes maior.',
          passo: 3,
          conceito: 'gravitacao.orbita',
        },
        {
          resposta: Math.sqrt((2 * G * corpo.massa) / corpo.raio ** 2) / 1000,
          diagnostico:
            'Na energia potencial o raio aparece elevado a 1, não ao quadrado. O quadrado é da ' +
            'FORÇA, não da energia.',
          passo: 1,
          conceito: 'gravitacao.escape',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}

function exercicioRazaoForca(nivel: Nivel, rng: Rng): Exercicio<number> {
  const fator = rng.escolher([2, 3, 4, 5, 10]);
  const resultado = fator * fator;

  return {
    id: `grav-razao-${fator}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Se a distância entre dois corpos for multiplicada por ${fator}, a força gravitacional ` +
      'entre eles fica dividida por quanto?',
    enunciadoTex: `d \\to ${fator}d \\qquad F \\to \\frac{F}{?}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'A força é inversamente proporcional ao quadrado da distância.',
          tex: 'F \\propto \\frac{1}{d^{2}}',
        },
        {
          descricao: 'Multiplicando a distância pelo fator, o denominador é elevado ao quadrado.',
          tex: `\\frac{1}{(${fator}d)^{2}} = \\frac{1}{${resultado}d^{2}}`,
        },
        {
          descricao: 'Logo a força fica dividida pelo quadrado do fator.',
          tex: `F \\to \\frac{F}{${resultado}}`,
          nota: 'Dobrar a distância divide a força por quatro — não por dois.',
        },
      ],
    },
    conceitos: ['gravitacao.lei'],
    armadilhas: semColisoes(
      [
        {
          resposta: fator,
          diagnostico:
            'A dependência é com o QUADRADO da distância. Dividir pelo fator seria o caso de ' +
            'uma proporcionalidade inversa simples.',
          passo: 1,
          conceito: 'gravitacao.lei',
        },
        {
          resposta: fator ** 3,
          diagnostico:
            'O expoente é 2, não 3. O cubo aparece na terceira lei de Kepler, relacionando ' +
            'período e raio.',
          passo: 1,
          conceito: 'gravitacao.kepler',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'F ∝ 1/d²' : undefined,
  };
}
