import {
  dopplerComPassos,
  harmonicoComPassos,
  nivelSonoroComPassos,
  numeroOnda,
  velocidadeDaOndaComPassos,
  velocidadeNaCordaComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-3);

/** Número legível na prosa (vírgula decimal, sem LaTeX). */
const t = (v: number): string => formatar(v);
/** O valor exato, sem arredondar: 0,005 kg/m ou 0,995c não podem virar 0,01 e 1. */
const exato = (v: number): string => String(v).replace('.', ',');
const CASAS = ' (2 casas decimais)';
const casas = (v: number): string => (Number.isInteger(Number(v.toFixed(6))) ? '' : CASAS);

const SOM_NO_AR = 340;

type Pergunta =
  | 'velocidade'
  | 'corda'
  | 'harmonico-corda'
  | 'decibeis'
  | 'tubo'
  | 'doppler'
  | 'doppler-ambos'
  | 'batimento';

/**
 * Ondas e som.
 *
 * Da relação v = λf, que vale para qualquer onda, aos fenômenos que só o som
 * mostra no dia a dia: as notas de uma corda e de um tubo, o decibel e o
 * Doppler da sirene. No Extremo, o Doppler com fonte e observador em
 * movimento e o batimento entre duas notas quase iguais.
 */
export const geradorOndasESom: GeradorExercicio<number> = {
  topicoId: 'ondas-e-som',
  formatoResposta: 'um número, ex.: 440 ou 2,35',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'velocidade':
        return velocidade(nivel, rng);
      case 'corda':
        return corda(nivel, rng);
      case 'harmonico-corda':
        return harmonicoCorda(nivel, rng);
      case 'decibeis':
        return decibeis(nivel, rng);
      case 'tubo':
        return tubo(nivel, rng);
      case 'doppler':
        return doppler(nivel, rng, false);
      case 'doppler-ambos':
        return doppler(nivel, rng, true);
      case 'batimento':
        return batimento(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['velocidade', 'corda']);
    case 'medio':
      return rng.escolher<Pergunta>(['velocidade', 'corda', 'harmonico-corda', 'decibeis']);
    case 'dificil':
      return rng.escolher<Pergunta>(['harmonico-corda', 'tubo', 'doppler', 'decibeis']);
    // Doppler com os dois em movimento e o batimento: as duas combinam duas
    // contas e pedem decidir sinais e qual frequência subtrair.
    case 'extremo':
      return rng.escolher<Pergunta>(['doppler-ambos', 'batimento', 'tubo']);
  }
}

/** v = λf, ou λ = v/f no Médio. */
function velocidade(nivel: Nivel, rng: Rng): Exercicio<number> {
  const pedeLambda = nivel === 'medio' && rng.booleano();
  const f = rng.escolher([110, 220, 256, 330, 440, 500, 680, 880, 1000, 1700]);
  const lambda = rng.inteiro(5, 400) / 100;

  if (pedeLambda) {
    const [v, meio] = rng.escolher([
      [340, 'no ar'],
      [343, 'no ar a 20 °C'],
      [1480, 'na água'],
      [5000, 'no aço'],
    ] as const);
    const gabarito = v / f;
    return {
      id: `onda-lambda-${v}-${f}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Um som de ${f} Hz se propaga ${meio} a ${v} m/s. Qual é o comprimento de onda, em metros?${casas(gabarito)}`,
      enunciadoTex: `v = ${v}\\ \\text{m/s} \\qquad f = ${f}\\ \\text{Hz} \\qquad \\lambda = \\;?`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          { descricao: 'De v = λ·f, isolamos λ.', tex: '\\lambda = \\frac{v}{f}' },
          {
            descricao: 'Substituindo.',
            tex: `\\lambda = \\frac{${v}}{${f}} = ${numeroOnda(gabarito)}\\ \\text{m}`,
          },
        ],
      },
      conceitos: ['ondas.relacao'],
      armadilhas: semColisoes(
        [
          {
            resposta: v * f,
            diagnostico: `λ = v/f: a velocidade se DIVIDE pela frequência. ${v} vezes ${f} daria uma velocidade sem sentido.`,
            passo: 0,
            conceito: 'ondas.relacao',
          },
          {
            resposta: f / v,
            diagnostico: 'A divisão está invertida: λ = v/f, não f/v.',
            passo: 0,
            conceito: 'ondas.relacao',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: `De v = λ·f sai λ = v/f: divida ${v} por ${f}.`,
    };
  }

  const resolucao = velocidadeDaOndaComPassos(lambda, f);
  const gabarito = resolucao.resultado;
  return {
    id: `onda-v-${lambda}-${f}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Uma onda tem comprimento de onda ${t(lambda)} m e frequência ${f} Hz. Qual é a velocidade dela, em m/s?${casas(gabarito)}`,
    enunciadoTex: `\\lambda = ${numeroOnda(lambda)}\\ \\text{m} \\qquad f = ${f}\\ \\text{Hz}`,
    gabarito,
    resolucao,
    conceitos: ['ondas.relacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: f / lambda,
          diagnostico: 'v = λ·f: multiplica-se, não se divide.',
          passo: 0,
          conceito: 'ondas.relacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Em cada oscilação a onda anda um λ, e há ${f} oscilações por segundo: v = ${t(lambda)} × ${f}.`,
  };
}

/** v = √(T/μ); do Médio em diante, μ vem em g/m e precisa de conversão. */
function corda(nivel: Nivel, rng: Rng): Exercicio<number> {
  const tracao = rng.inteiro(2, 30) * 10;
  const gramas = rng.escolher([1, 2, 4, 5, 8, 10, 20, 25]);
  const mu = gramas / 1000;
  const emGramas = nivel !== 'facil';
  const resolucao = velocidadeNaCordaComPassos(tracao, mu);
  const gabarito = resolucao.resultado;
  const muTexto = emGramas ? `${gramas} g/m` : `${exato(mu)} kg/m`;

  return {
    id: `onda-corda-${tracao}-${gramas}-${emGramas ? 'g' : 'kg'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Uma corda está esticada com tração de ${tracao} N e tem densidade linear de ${muTexto}. Com que velocidade uma onda corre por ela, em m/s?${casas(gabarito)}`,
    enunciadoTex: `T = ${tracao}\\ \\text{N} \\qquad \\mu = ${emGramas ? `${gramas}\\ \\text{g/m}` : `${numeroOnda(mu, 3)}\\ \\text{kg/m}`}`,
    gabarito,
    resolucao: emGramas
      ? {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Primeiro, μ em kg/m: 1 g = 0,001 kg.',
              tex: `\\mu = ${gramas}\\ \\text{g/m} = ${numeroOnda(mu, 3)}\\ \\text{kg/m}`,
            },
            ...resolucao.passos,
          ],
        }
      : resolucao,
    conceitos: ['ondas.corda'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.sqrt(tracao / gramas),
          diagnostico: `A densidade tem de estar em kg/m: ${gramas} g/m = ${exato(mu)} kg/m. Sem converter, a velocidade sai cerca de 32 vezes menor.`,
          passo: 0,
          conceito: 'ondas.corda',
        },
        {
          resposta: tracao / mu,
          diagnostico: 'Faltou a raiz quadrada: v = √(T/μ).',
          passo: 1,
          conceito: 'ondas.corda',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: emGramas
      ? `Passe μ para kg/m (${gramas} g/m = ${exato(mu)} kg/m) e use v = √(T/μ).`
      : `v = √(T/μ): divida ${tracao} por ${exato(mu)} e tire a raiz quadrada.`,
  };
}

/** fₙ = n·v/(2L) numa corda presa nas duas pontas. */
function harmonicoCorda(nivel: Nivel, rng: Rng): Exercicio<number> {
  const ordem = rng.inteiro(1, nivel === 'medio' ? 3 : 5);
  const L = rng.escolher([0.5, 0.6, 0.65, 0.8, 1, 1.2, 1.5]);
  const v = rng.inteiro(10, 60) * 10;
  const resolucao = harmonicoComPassos(ordem, L, v);
  const gabarito = resolucao.resultado;
  const nome =
    ordem === 1 ? 'a frequência fundamental (1º harmônico)' : `a frequência do ${ordem}º harmônico`;

  return {
    id: `onda-harm-${ordem}-${L}-${v}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Uma corda de violão de ${t(L)} m, presa nas duas pontas, conduz ondas a ${v} m/s. Qual é ${nome}, em Hz?${casas(gabarito)}`,
    enunciadoTex: `L = ${numeroOnda(L)}\\ \\text{m} \\qquad v = ${v}\\ \\text{m/s} \\qquad n = ${ordem}`,
    gabarito,
    resolucao,
    conceitos: ['ondas.harmonicos'],
    armadilhas: semColisoes(
      [
        {
          resposta: (ordem * v) / L,
          diagnostico:
            'Na corda presa cabe MEIA onda no fundamental: λ = 2L, então divide-se por 2L, não por L.',
          passo: 0,
          conceito: 'ondas.harmonicos',
        },
        {
          resposta: (ordem * v) / (4 * L),
          diagnostico: 'O 4L é do tubo fechado numa ponta. Corda presa nas duas pontas usa 2L.',
          passo: 0,
          conceito: 'ondas.harmonicos',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Na corda presa cabem n meias ondas: fₙ = n·v/(2L) = ${ordem}·${v}/(2·${t(L)}).`,
  };
}

/** β = 10·log(I/I₀). */
function decibeis(nivel: Nivel, rng: Rng): Exercicio<number> {
  const mantissa = nivel === 'medio' ? 1 : rng.escolher([2, 3, 5, 8]);
  const expoente = rng.inteiro(-10, -2);
  const intensidade = mantissa * 10 ** expoente;
  const resolucao = nivelSonoroComPassos(intensidade);
  const gabarito = resolucao.resultado;
  const intensidadeTexto =
    mantissa === 1 ? `10${sobrescrito(expoente)}` : `${mantissa} × 10${sobrescrito(expoente)}`;

  return {
    id: `onda-db-${mantissa}-${expoente}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um som chega com intensidade de ${intensidadeTexto} W/m². Qual é o nível sonoro, em dB?${casas(gabarito)}`,
    enunciadoTex: `I = ${mantissa === 1 ? '' : `${mantissa} \\times `}10^{${expoente}}\\ \\text{W/m}^{2} \\qquad I_0 = 10^{-12}\\ \\text{W/m}^{2}`,
    gabarito,
    resolucao,
    conceitos: ['ondas.decibel'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.log10(intensidade / 1e-12),
          diagnostico: 'Faltou o fator 10: β = 10·log(I/I₀). O log sozinho dá bels, não decibéis.',
          passo: 2,
          conceito: 'ondas.decibel',
        },
        {
          resposta: 10 * Math.log10(intensidade),
          diagnostico:
            'Faltou dividir por I₀ = 10⁻¹² W/m² antes do log: o decibel compara com o limiar da audição.',
          passo: 1,
          conceito: 'ondas.decibel',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      mantissa === 1
        ? `I/I₀ = 10${sobrescrito(expoente)} / 10⁻¹² = 10${sobrescrito(expoente + 12)}. O log de 10 elevado a k é k; depois multiplique por 10.`
        : `Calcule I/I₀ (divida por 10⁻¹²), tire o log decimal e multiplique por 10.`,
  };
}

/** Tubo aberto (2L, todos os n) ou fechado numa ponta (4L, só n ímpar). */
function tubo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const fechado = rng.booleano();
  const ordem = fechado ? rng.escolher([1, 3, 5]) : rng.inteiro(1, 4);
  const L = rng.escolher([0.25, 0.34, 0.5, 0.68, 0.85, 1, 1.7]);
  const resolucao = harmonicoComPassos(ordem, L, SOM_NO_AR, fechado);
  const gabarito = resolucao.resultado;

  return {
    id: `onda-tubo-${fechado ? 'f' : 'a'}-${ordem}-${L}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um tubo de ${t(L)} m ${fechado ? 'fechado numa ponta e aberto na outra' : 'aberto nas duas pontas'} ressoa com o som a ${SOM_NO_AR} m/s. ` +
      `Qual é a frequência do ${ordem}º harmônico, em Hz?${casas(gabarito)}`,
    enunciadoTex: `L = ${numeroOnda(L)}\\ \\text{m} \\qquad v = ${SOM_NO_AR}\\ \\text{m/s} \\qquad n = ${ordem}`,
    gabarito,
    resolucao,
    conceitos: ['ondas.harmonicos'],
    armadilhas: semColisoes(
      [
        {
          resposta: fechado ? (ordem * SOM_NO_AR) / (2 * L) : (ordem * SOM_NO_AR) / (4 * L),
          diagnostico: fechado
            ? 'Tubo fechado numa ponta tem nó só de um lado: cabe um QUARTO de onda, e divide-se por 4L, não por 2L.'
            : 'Tubo aberto nas duas pontas se comporta como a corda: 2L, não 4L.',
          passo: 0,
          conceito: 'ondas.harmonicos',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: fechado
      ? `Fechado numa ponta: fₙ = n·v/(4L), só com n ímpar. Aqui n = ${ordem}.`
      : `Aberto nas duas pontas: fₙ = n·v/(2L), como na corda.`,
  };
}

/** Doppler com observador parado (Difícil) ou os dois em movimento (Extremo). */
function doppler(nivel: Nivel, rng: Rng, ambos: boolean): Exercicio<number> {
  const f = rng.escolher([400, 500, 600, 800, 1000]);
  const fonteAproxima = rng.booleano();
  const vf = rng.inteiro(10, 40) * (fonteAproxima ? 1 : -1);
  const observadorAproxima = rng.booleano();
  const vo = ambos ? rng.inteiro(5, 25) * (observadorAproxima ? 1 : -1) : 0;
  const resolucao = dopplerComPassos(f, SOM_NO_AR, vo, vf);
  const gabarito = resolucao.resultado;
  const fonteTexto = `${fonteAproxima ? 'se aproxima' : 'se afasta'} a ${Math.abs(vf)} m/s`;
  const observadorTexto = ambos
    ? `, e o ouvinte ${observadorAproxima ? 'vai na direção dela' : 'foge dela'} a ${Math.abs(vo)} m/s`
    : ', e o ouvinte está parado';

  return {
    id: `onda-doppler-${ambos ? 'ab' : 'f'}-${f}-${vf}-${vo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma sirene de ${f} Hz ${fonteTexto}${observadorTexto}. Com o som a ${SOM_NO_AR} m/s, ` +
      `que frequência o ouvinte escuta, em Hz?${casas(gabarito)}`,
    enunciadoTex: `f = ${f}\\ \\text{Hz} \\qquad v_f = ${vf}\\ \\text{m/s} \\qquad v_o = ${vo}\\ \\text{m/s}`,
    gabarito,
    resolucao,
    conceitos: ['ondas.doppler'],
    armadilhas: semColisoes(
      [
        {
          resposta: (f * (SOM_NO_AR - vo)) / (SOM_NO_AR + vf),
          diagnostico:
            'Os sinais estão trocados: aproximar-se AUMENTA a frequência ouvida, afastar-se diminui.',
          passo: 0,
          conceito: 'ondas.doppler',
        },
        {
          resposta: f,
          diagnostico: 'Com movimento relativo a frequência ouvida muda: é o efeito Doppler.',
          passo: 0,
          conceito: 'ondas.doppler',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: ambos
      ? `f′ = f·(v + vₒ)/(v − v_f): vₒ = ${vo} e v_f = ${vf} (positivos quando se aproximam).`
      : `f′ = f·v/(v − v_f), com v_f = ${vf} (positivo se a fonte se aproxima).`,
  };
}

/** Batimento entre os fundamentais de duas cordas iguais com trações diferentes. */
function batimento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const L = rng.escolher([0.5, 0.6, 0.65, 0.8]);
  const v1 = rng.inteiro(20, 40) * 10;
  const v2 = v1 + rng.inteiro(2, 12);
  const f1 = v1 / (2 * L);
  const f2 = v2 / (2 * L);
  const gabarito = Math.abs(f2 - f1);

  return {
    id: `onda-bat-${L}-${v1}-${v2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Duas cordas de ${t(L)} m, presas nas pontas, conduzem ondas a ${v1} m/s e a ${v2} m/s. ` +
      `Tocadas juntas no fundamental, quantos batimentos por segundo se ouvem?${casas(gabarito)}`,
    enunciadoTex: `L = ${numeroOnda(L)}\\ \\text{m} \\qquad v_1 = ${v1}\\ \\text{m/s} \\qquad v_2 = ${v2}\\ \\text{m/s}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O fundamental de cada corda.',
          tex: `f_1 = \\frac{${v1}}{2 \\cdot ${numeroOnda(L)}} = ${numeroOnda(f1)}\\ \\text{Hz} \\qquad f_2 = \\frac{${v2}}{2 \\cdot ${numeroOnda(L)}} = ${numeroOnda(f2)}\\ \\text{Hz}`,
        },
        {
          descricao: 'Duas notas próximas somadas pulsam na frequência da diferença.',
          tex: `f_{bat} = |f_2 - f_1| = ${numeroOnda(gabarito)}\\ \\text{Hz}`,
        },
      ],
    },
    conceitos: ['ondas.harmonicos'],
    armadilhas: semColisoes(
      [
        {
          resposta: v2 - v1,
          diagnostico: 'Subtraia as FREQUÊNCIAS, não as velocidades: cada uma dividida por 2L.',
          passo: 1,
          conceito: 'ondas.harmonicos',
        },
        {
          resposta: (f1 + f2) / 2,
          diagnostico:
            'Essa é a nota que se ouve (a média). Os batimentos por segundo são a DIFERENÇA.',
          passo: 1,
          conceito: 'ondas.harmonicos',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Calcule o fundamental de cada corda (v/(2L)) e subtraia: os batimentos são |f₂ − f₁|.`,
  };
}

const SOBRESCRITOS = '⁰¹²³⁴⁵⁶⁷⁸⁹';

/** −5 → ⁻⁵, para a prosa. */
function sobrescrito(n: number): string {
  return (
    (n < 0 ? '⁻' : '') +
    String(Math.abs(n))
      .split('')
      .map((d) => SOBRESCRITOS[Number(d)])
      .join('')
  );
}
