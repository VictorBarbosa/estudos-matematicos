import {
  MASSA_ELETRON,
  REPOUSO_ELETRON_KEV,
  comprimentoDeCorteComPassos,
  contracaoDoComprimentoComPassos,
  deBroglieComPassos,
  dilatacaoDoTempoComPassos,
  energiaDoFotonComPassos,
  fatorDeLorentzComPassos,
  fotoeletricoComPassos,
  numeroOnda,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-3);
const t = (v: number): string => formatar(v);
/** O valor exato, sem arredondar: 0,005 kg/m ou 0,995c não podem virar 0,01 e 1. */
const exato = (v: number): string => String(v).replace('.', ',');
const tex = (v: number, casas = 2): string => numeroOnda(v, casas);
const casas = (v: number): string =>
  Number.isInteger(Number(v.toFixed(6))) ? '' : ' (2 casas decimais)';
const gamaDe = (beta: number): number => 1 / Math.sqrt(1 - beta * beta);

type Pergunta =
  | 'foton'
  | 'gama'
  | 'dilatacao'
  | 'contracao'
  | 'fotoeletrico'
  | 'corte'
  | 'de-broglie'
  | 'beta-de-gama'
  | 'energia-cinetica';

/** Metais e suas funções trabalho, em eV. */
const METAIS: readonly (readonly [nome: string, phi: number])[] = [
  ['césio', 2.1],
  ['potássio', 2.3],
  ['sódio', 2.28],
  ['cálcio', 2.9],
  ['zinco', 4.3],
  ['cobre', 4.7],
];

/**
 * Física moderna: relatividade restrita, o fóton e as ondas de matéria.
 *
 * As armadilhas são as que essas contas sempre produzem: γ invertido (o
 * tempo encolhendo em vez de dilatar), λ em nm tratado como metro, a energia
 * cinética relativística confundida com ½mv², e a função trabalho somada em
 * vez de subtraída.
 */
export const geradorFisicaModerna: GeradorExercicio<number> = {
  topicoId: 'fisica-moderna',
  formatoResposta: 'um número, ex.: 1,25 ou 2,48',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'foton':
        return foton(nivel, rng);
      case 'gama':
        return gama(nivel, rng);
      case 'dilatacao':
        return dilatacao(nivel, rng);
      case 'contracao':
        return contracao(nivel, rng);
      case 'fotoeletrico':
        return fotoeletrico(nivel, rng);
      case 'corte':
        return corte(nivel, rng);
      case 'de-broglie':
        return deBroglie(nivel, rng);
      case 'beta-de-gama':
        return betaDeGama(nivel, rng);
      case 'energia-cinetica':
        return energiaCinetica(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['foton', 'gama']);
    case 'medio':
      return rng.escolher<Pergunta>(['dilatacao', 'contracao', 'fotoeletrico', 'foton']);
    case 'dificil':
      return rng.escolher<Pergunta>(['fotoeletrico', 'corte', 'de-broglie', 'dilatacao']);
    // A velocidade a partir de γ (a fórmula de trás para a frente) e a energia
    // cinética relativística, que não é ½mv²: as duas exigem entender γ.
    case 'extremo':
      return rng.escolher<Pergunta>(['beta-de-gama', 'energia-cinetica', 'de-broglie']);
  }
}

/** E = 1240/λ (eV, λ em nm). */
function foton(nivel: Nivel, rng: Rng): Exercicio<number> {
  const lambda = nivel === 'facil' ? rng.inteiro(20, 70) * 10 : rng.inteiro(380, 700);
  const resolucao = energiaDoFotonComPassos(lambda);
  const gabarito = resolucao.resultado;
  return {
    id: `moderna-foton-${lambda}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é a energia de um fóton de luz com comprimento de onda ${lambda} nm, em elétron-volts (eV)?${casas(gabarito)}`,
    enunciadoTex: `\\lambda = ${lambda}\\ \\text{nm} \\qquad hc = 1240\\ \\text{eV·nm}`,
    gabarito,
    resolucao,
    conceitos: ['moderna.foton'],
    armadilhas: semColisoes(
      [
        {
          resposta: lambda / 1240,
          diagnostico:
            'A razão está invertida: E = hc/λ. Comprimento de onda maior significa fóton MENOS energético.',
          passo: 0,
          conceito: 'moderna.foton',
        },
        {
          resposta: 1240 * lambda,
          diagnostico: 'λ vai no denominador: E = hc/λ.',
          passo: 0,
          conceito: 'moderna.foton',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `E = hc/λ, e hc vale 1240 eV·nm: divida 1240 por ${lambda}.`,
  };
}

/** γ a partir de v/c. */
function gama(nivel: Nivel, rng: Rng): Exercicio<number> {
  const beta = rng.inteiro(10, 99) / 100;
  const resolucao = fatorDeLorentzComPassos(beta);
  const gabarito = resolucao.resultado;
  return {
    id: `moderna-gama-${beta}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Uma nave viaja a ${exato(beta)}c. Qual é o fator de Lorentz γ?${casas(gabarito)}`,
    enunciadoTex: `v = ${tex(beta)}\\,c \\qquad \\gamma = \\;?`,
    gabarito,
    resolucao,
    conceitos: ['moderna.lorentz'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.sqrt(1 - beta * beta),
          diagnostico:
            'Esse é 1/γ. O fator de Lorentz é o INVERSO da raiz, e por isso é sempre maior que 1.',
          passo: 1,
          conceito: 'moderna.lorentz',
        },
        {
          resposta: 1 / (1 - beta * beta),
          diagnostico: 'Faltou a raiz quadrada: γ = 1/√(1 − β²).',
          passo: 1,
          conceito: 'moderna.lorentz',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `γ = 1/√(1 − β²) com β = ${exato(beta)}: eleve ${exato(beta)} ao quadrado, tire de 1, raiz, e inverta.`,
  };
}

/** Δt = γΔt₀, com o múon ou um relógio de bordo. */
function dilatacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const beta = rng.escolher([0.6, 0.8, 0.9, 0.95, 0.99, 0.995]);
  const muon = rng.booleano();
  const proprio = muon ? 2.2 : rng.inteiro(1, 10);
  const resolucao = dilatacaoDoTempoComPassos(proprio, beta);
  const gabarito = resolucao.resultado;
  const enunciado = muon
    ? `Um múon vive em média 2,2 µs no próprio referencial. Viajando a ${exato(beta)}c, quanto tempo ele dura para quem o vê passar, em µs?`
    : `Um relógio a bordo de uma nave que viaja a ${exato(beta)}c marca ${proprio} h. Quanto tempo passa para quem ficou na Terra, em horas?`;
  return {
    id: `moderna-dilat-${beta}-${proprio}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: enunciado + casas(gabarito),
    enunciadoTex: `\\Delta t_0 = ${tex(proprio)}\\ \\text{${muon ? 'µs' : 'h'}} \\qquad v = ${tex(beta, 3)}\\,c`,
    gabarito,
    resolucao,
    conceitos: ['moderna.dilatacao', 'moderna.lorentz'],
    armadilhas: semColisoes(
      [
        {
          resposta: proprio / gamaDe(beta),
          diagnostico:
            'O tempo DILATA para quem observa: Δt = γΔt₀ é maior que o tempo próprio, não menor.',
          passo: 2,
          conceito: 'moderna.dilatacao',
        },
        {
          resposta: proprio * beta,
          diagnostico: 'A correção é o fator γ = 1/√(1 − β²), não a velocidade.',
          passo: 0,
          conceito: 'moderna.lorentz',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Ache γ = 1/√(1 − ${exato(beta)}²) e multiplique o tempo próprio por ele: quem vê o relógio passar mede MAIS tempo.`,
  };
}

/** L = L₀/γ. */
function contracao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const beta = rng.escolher([0.6, 0.8, 0.9, 0.95, 0.5]);
  const proprio = rng.inteiro(5, 30) * 10;
  const resolucao = contracaoDoComprimentoComPassos(proprio, beta);
  const gabarito = resolucao.resultado;
  return {
    id: `moderna-contr-${beta}-${proprio}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Uma nave mede ${proprio} m em repouso. Passando a ${exato(beta)}c, que comprimento ela tem para um observador na Terra, em metros?${casas(gabarito)}`,
    enunciadoTex: `L_0 = ${proprio}\\ \\text{m} \\qquad v = ${tex(beta)}\\,c`,
    gabarito,
    resolucao,
    conceitos: ['moderna.dilatacao', 'moderna.lorentz'],
    armadilhas: semColisoes(
      [
        {
          resposta: proprio * gamaDe(beta),
          diagnostico:
            'O comprimento ENCOLHE na direção do movimento: divide-se por γ, não se multiplica.',
          passo: 2,
          conceito: 'moderna.dilatacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `L = L₀/γ: ache γ = 1/√(1 − ${exato(beta)}²) e divida ${proprio} m por ele.`,
  };
}

/** K_max = 1240/λ − φ. */
function fotoeletrico(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [metal, phi] = rng.escolher(METAIS);
  // λ curto o bastante para arrancar elétrons: E > φ.
  const limite = Math.floor(1240 / phi / 10) * 10;
  const lambda = rng.inteiro(15, Math.max(16, limite / 10 - 2)) * 10;
  const resolucao = fotoeletricoComPassos(lambda, phi);
  const gabarito = resolucao.resultado;
  return {
    id: `moderna-foto-${metal}-${lambda}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Luz de ${lambda} nm incide sobre ${metal}, cuja função trabalho é ${t(phi)} eV. ` +
      `Qual é a energia cinética máxima dos elétrons arrancados, em eV?${casas(gabarito)}`,
    enunciadoTex: `\\lambda = ${lambda}\\ \\text{nm} \\qquad \\phi = ${tex(phi)}\\ \\text{eV}`,
    gabarito,
    resolucao,
    conceitos: ['moderna.fotoeletrico', 'moderna.foton'],
    armadilhas: semColisoes(
      [
        {
          resposta: 1240 / lambda + phi,
          diagnostico:
            'A função trabalho é o CUSTO de arrancar o elétron: ela se subtrai da energia do fóton.',
          passo: 2,
          conceito: 'moderna.fotoeletrico',
        },
        {
          resposta: 1240 / lambda,
          diagnostico: 'Essa é a energia do fóton. O elétron sai com ela menos a função trabalho.',
          passo: 2,
          conceito: 'moderna.fotoeletrico',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Energia do fóton: 1240/${lambda} eV. Tire dela a função trabalho, ${t(phi)} eV.`,
  };
}

/** λ de corte = 1240/φ. */
function corte(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [metal, phi] = rng.escolher(METAIS);
  const resolucao = comprimentoDeCorteComPassos(phi);
  const gabarito = resolucao.resultado;
  return {
    id: `moderna-corte-${metal}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `A função trabalho do ${metal} é ${t(phi)} eV. Qual é o MAIOR comprimento de onda que ainda arranca elétrons dele, em nm?${casas(gabarito)}`,
    enunciadoTex: `\\phi = ${tex(phi)}\\ \\text{eV} \\qquad \\lambda_c = \\;?`,
    gabarito,
    resolucao,
    conceitos: ['moderna.fotoeletrico'],
    armadilhas: semColisoes(
      [
        {
          resposta: phi / 1240,
          diagnostico: 'A razão está invertida: λc = hc/φ = 1240/φ.',
          passo: 0,
          conceito: 'moderna.fotoeletrico',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `No corte, o fóton só tem a energia φ: 1240/λc = ${t(phi)}, então λc = 1240/${t(phi)}.`,
  };
}

/** λ de de Broglie de um elétron, em nm. */
function deBroglie(nivel: Nivel, rng: Rng): Exercicio<number> {
  const mantissa = rng.inteiro(10, 90) / 10;
  const velocidade = mantissa * 1e6;
  const resolucao = deBroglieComPassos(MASSA_ELETRON, velocidade);
  const gabarito = resolucao.resultado;
  return {
    id: `moderna-broglie-${mantissa}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um elétron (m = 9,11 × 10⁻³¹ kg) se move a ${t(mantissa)} × 10⁶ m/s. ` +
      `Qual é o comprimento de onda de de Broglie dele, em nm? (h = 6,626 × 10⁻³⁴ J·s)${casas(gabarito)}`,
    enunciadoTex: `m = 9{,}11 \\times 10^{-31}\\ \\text{kg} \\qquad v = ${tex(mantissa)} \\times 10^{6}\\ \\text{m/s}`,
    gabarito,
    resolucao,
    conceitos: ['moderna.de-broglie'],
    armadilhas: semColisoes(
      [
        {
          resposta: gabarito * 1e-9,
          diagnostico:
            'Esse valor está em metros. A pergunta pede nanômetros: multiplique por 10⁹.',
          passo: 2,
          conceito: 'moderna.de-broglie',
        },
        {
          resposta: gabarito * 1e6,
          diagnostico: `A velocidade é ${t(mantissa)} × 10⁶ m/s: sem o 10⁶ o momento sai um milhão de vezes menor.`,
          passo: 1,
          conceito: 'moderna.de-broglie',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `λ = h/(m·v): calcule m·v = 9,11 × 10⁻³¹ × ${t(mantissa)} × 10⁶ e divida h por ele; passe de metros para nm.`,
  };
}

/** v/c a partir de γ: β = √(1 − 1/γ²). */
function betaDeGama(nivel: Nivel, rng: Rng): Exercicio<number> {
  const gamaValor = rng.escolher([1.25, 1.5, 2, 2.5, 3, 5, 10, 1.1]);
  const inverso = 1 / (gamaValor * gamaValor);
  const gabarito = Math.sqrt(1 - inverso);
  return {
    id: `moderna-beta-${gamaValor}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma partícula instável vive ${t(gamaValor)} vezes mais no laboratório do que no próprio referencial. ` +
      `Qual é a velocidade dela, como fração de c (v/c)?${casas(gabarito)}`,
    enunciadoTex: `\\frac{\\Delta t}{\\Delta t_0} = \\gamma = ${tex(gamaValor)} \\qquad \\frac{v}{c} = \\;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A razão entre os tempos é o próprio γ. Invertemos a fórmula de γ.',
          tex: '\\gamma = \\frac{1}{\\sqrt{1 - \\beta^{2}}} \\;\\Rightarrow\\; \\beta = \\sqrt{1 - \\frac{1}{\\gamma^{2}}}',
        },
        {
          descricao: 'Substituindo.',
          tex: `\\beta = \\sqrt{1 - \\frac{1}{${tex(gamaValor)}^{2}}} = \\sqrt{1 - ${tex(inverso, 4)}} = ${tex(gabarito, 4)}`,
        },
      ],
    },
    conceitos: ['moderna.lorentz'],
    armadilhas: semColisoes(
      [
        {
          resposta: 1 / gamaValor,
          diagnostico: 'v/c não é 1/γ. De γ = 1/√(1 − β²) sai β = √(1 − 1/γ²).',
          passo: 0,
          conceito: 'moderna.lorentz',
        },
        {
          resposta: 1 - inverso,
          diagnostico: 'Esse é β². Falta a raiz quadrada.',
          passo: 1,
          conceito: 'moderna.lorentz',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `A razão dos tempos é γ = ${t(gamaValor)}. Isole β em γ = 1/√(1 − β²): β = √(1 − 1/γ²).`,
  };
}

/** K = (γ − 1)·mc² do elétron, em keV. */
function energiaCinetica(nivel: Nivel, rng: Rng): Exercicio<number> {
  const beta = rng.escolher([0.6, 0.8, 0.9, 0.5, 0.95, 0.99]);
  const gamaValor = gamaDe(beta);
  const gabarito = (gamaValor - 1) * REPOUSO_ELETRON_KEV;
  const classica = 0.5 * REPOUSO_ELETRON_KEV * beta * beta;
  return {
    id: `moderna-ec-${beta}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um elétron (energia de repouso mc² = 511 keV) se move a ${exato(beta)}c. ` +
      `Qual é a energia cinética dele, em keV?${casas(gabarito)}`,
    enunciadoTex: `mc^{2} = 511\\ \\text{keV} \\qquad v = ${tex(beta)}\\,c`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A energia total é γmc²; a cinética é o que passa da energia de repouso.',
          tex: 'K = (\\gamma - 1)\\,mc^{2}',
        },
        {
          descricao: 'O fator de Lorentz.',
          tex: `\\gamma = \\frac{1}{\\sqrt{1 - ${tex(beta)}^{2}}} = ${tex(gamaValor, 4)}`,
        },
        {
          descricao: 'Substituindo.',
          tex: `K = (${tex(gamaValor, 4)} - 1) \\cdot 511 = ${tex(gabarito)}\\ \\text{keV}`,
        },
      ],
    },
    conceitos: ['moderna.energia'],
    armadilhas: semColisoes(
      [
        {
          resposta: classica,
          diagnostico: `½mv² só vale para v muito menor que c. A ${exato(beta)}c use K = (γ − 1)mc².`,
          passo: 0,
          conceito: 'moderna.energia',
        },
        {
          resposta: gamaValor * REPOUSO_ELETRON_KEV,
          diagnostico:
            'Essa é a energia TOTAL, γmc². A cinética desconta a de repouso: (γ − 1)mc².',
          passo: 0,
          conceito: 'moderna.energia',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `K = (γ − 1)·511 keV, com γ = 1/√(1 − ${exato(beta)}²). Não use ½mv²: a velocidade é relativística.`,
  };
}
