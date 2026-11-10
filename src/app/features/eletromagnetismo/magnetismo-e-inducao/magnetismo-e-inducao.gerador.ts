import {
  MU_0,
  campoFioComPassos,
  cientificoTex,
  faradayComPassos,
  lorentzComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-4);
const tex = (v: number): string => formatar(v).replace(',', '{,}');
const txt = (v: number): string => String(v).replace('.', ',');
const rad = (g: number): number => (g * Math.PI) / 180;

/** Massa e carga das partículas, no SI. */
const PARTICULAS = {
  proton: {
    nome: 'um próton',
    m: 1.67e-27,
    mTexto: '1,67×10⁻²⁷ kg',
    mTex: '1{,}67 \\times 10^{-27}',
  },
  eletron: {
    nome: 'um elétron',
    m: 9.11e-31,
    mTexto: '9,11×10⁻³¹ kg',
    mTex: '9{,}11 \\times 10^{-31}',
  },
} as const;
const CARGA_E = 1.6e-19;

type Pergunta =
  | 'lorentz'
  | 'forca-fio'
  | 'lorentz-angulo'
  | 'campo-fio'
  | 'fluxo'
  | 'raio'
  | 'faraday'
  | 'solenoide'
  | 'barra'
  | 'raio-acelerado';

/**
 * Magnetismo e indução.
 *
 * A força magnética depende do seno do ângulo entre velocidade (ou corrente)
 * e campo; o fluxo, do cosseno entre o campo e a NORMAL da espira — trocar
 * os dois é o erro mais comum. Faraday fecha o tópico: variar o fluxo induz
 * uma fem, e Lenz diz o sentido.
 */
export const geradorMagnetismo: GeradorExercicio<number> = {
  topicoId: 'magnetismo-e-inducao',
  formatoResposta: 'um número, ex.: 0,48 ou 12',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'lorentz':
        return lorentz(nivel, rng, false);
      case 'lorentz-angulo':
        return lorentz(nivel, rng, true);
      case 'forca-fio':
        return forcaFio(nivel, rng);
      case 'campo-fio':
        return campoFio(nivel, rng);
      case 'fluxo':
        return fluxo(nivel, rng);
      case 'raio':
        return raio(nivel, rng);
      case 'faraday':
        return faraday(nivel, rng);
      case 'solenoide':
        return solenoide(nivel, rng);
      case 'barra':
        return barra(nivel, rng);
      case 'raio-acelerado':
        return raioAcelerado(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['lorentz', 'forca-fio']);
    case 'medio':
      return rng.escolher<Pergunta>(['lorentz-angulo', 'campo-fio', 'fluxo']);
    case 'dificil':
      return rng.escolher<Pergunta>(['raio', 'faraday', 'solenoide']);
    // A barra que corre sobre trilhos (fem, corrente e força de freio) e o
    // raio de uma partícula acelerada antes de entrar no campo: duas leis
    // encadeadas em cada uma.
    case 'extremo':
      return rng.escolher<Pergunta>(['barra', 'raio-acelerado']);
  }
}

function lorentz(nivel: Nivel, rng: Rng, comAngulo: boolean): Exercicio<number> {
  const q = rng.inteiro(1, 9) * rng.sinal();
  const v = rng.escolher([200, 500, 1000, 2000, 5000]);
  const b = rng.escolher([0.2, 0.4, 0.5, 0.8, 1.2]);
  const angulo = comAngulo ? rng.escolher([30, 45, 60, 120, 150]) : 90;
  const resolucao = lorentzComPassos(q, v, b, angulo);
  const gabarito = resolucao.resultado * 1000;

  return {
    id: `mag-lorentz-${q}-${v}-${b}-${angulo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma partícula de carga ${q < 0 ? `(${q})` : q} μC atravessa a ${v} m/s um campo magnético de ${txt(b)} T, ` +
      `${comAngulo ? `formando ${angulo}° com ele` : 'perpendicular a ele'}. Qual é o módulo da força magnética, em mN? (2 casas decimais)`,
    enunciadoTex: `q = ${q}\\ \\mu\\text{C} \\qquad v = ${v}\\ \\text{m/s} \\qquad B = ${tex(b)}\\ \\text{T} \\qquad \\theta = ${angulo}^{\\circ}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...resolucao.passos,
        { descricao: 'Em mN.', tex: `F = ${tex(gabarito)}\\ \\text{mN}` },
      ],
    },
    conceitos: ['magnetismo.lorentz'],
    armadilhas: semColisoes(
      [
        ...(comAngulo
          ? [
              {
                resposta: Math.abs(q) * 1e-6 * v * b * Math.abs(Math.cos(rad(angulo))) * 1000,
                diagnostico:
                  'A força magnética usa o SENO do ângulo entre v e B: só a parte perpendicular conta.',
                passo: 0,
                conceito: 'magnetismo.lorentz',
              },
              {
                resposta: Math.abs(q) * 1e-6 * v * b * 1000,
                diagnostico: `Faltou o sen ${angulo}°: o ângulo não é 90°.`,
                passo: 1,
                conceito: 'magnetismo.lorentz',
              },
            ]
          : []),
        {
          resposta: gabarito / 1000,
          diagnostico: 'Esse valor está em newtons; o pedido é em mN.',
          passo: 1,
          conceito: 'magnetismo.lorentz',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `F = |q|·v·B·sen θ, com a carga em coulombs (${Math.abs(q)}×10⁻⁶) e sen ${angulo}°. Em N; para mN, multiplique por 1000.`,
  };
}

function forcaFio(nivel: Nivel, rng: Rng): Exercicio<number> {
  const i = rng.escolher([2, 3, 5, 8, 10]);
  const l = rng.escolher([0.2, 0.5, 1, 1.5]);
  const b = rng.escolher([0.05, 0.1, 0.2, 0.3]);
  const gabarito = b * i * l;

  return {
    id: `mag-fio-${i}-${l}-${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um fio de ${txt(l)} m, com corrente de ${i} A, está perpendicular a um campo magnético de ${txt(b)} T. ` +
      'Qual é a força sobre ele, em N? (2 casas decimais)',
    enunciadoTex: `I = ${i}\\ \\text{A} \\qquad L = ${tex(l)}\\ \\text{m} \\qquad B = ${tex(b)}\\ \\text{T}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Num fio, a força é campo vezes corrente vezes comprimento (vezes sen θ).',
          tex: 'F = BIL\\sin\\theta',
        },
        {
          descricao: 'Perpendicular: sen 90° = 1.',
          tex: `F = ${tex(b)} \\cdot ${i} \\cdot ${tex(l)} \\cdot 1 = ${tex(gabarito)}\\ \\text{N}`,
        },
      ],
    },
    conceitos: ['magnetismo.lorentz'],
    armadilhas: semColisoes(
      [
        {
          resposta: b * i,
          diagnostico: `Faltou o comprimento do fio: F = B·I·L, com L = ${txt(l)} m.`,
          passo: 0,
          conceito: 'magnetismo.lorentz',
        },
        {
          resposta: (b * l) / i,
          diagnostico: 'A corrente multiplica (mais corrente, mais força), não divide.',
          passo: 0,
          conceito: 'magnetismo.lorentz',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `F = B·I·L: ${txt(b)} T vezes ${i} A vezes ${txt(l)} m (perpendicular, sen 90° = 1).`,
  };
}

function campoFio(nivel: Nivel, rng: Rng): Exercicio<number> {
  const i = rng.escolher([1, 2, 5, 10, 20, 25]);
  const r = rng.escolher([1, 2, 4, 5, 10]);
  const resolucao = campoFioComPassos(i, r);
  const gabarito = resolucao.resultado;

  return {
    id: `mag-campofio-${i}-${r}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é o campo magnético a ${r} cm de um fio longo com ${i} A, em μT? (2 casas decimais)`,
    enunciadoTex: `I = ${i}\\ \\text{A} \\qquad r = ${r}\\ \\text{cm} \\qquad \\mu_0 = 4\\pi \\times 10^{-7}\\ \\text{T·m/A}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...resolucao.passos,
        { descricao: 'Portanto:', tex: `B = ${tex(gabarito)}\\ \\mu\\text{T}` },
      ],
    },
    conceitos: ['magnetismo.fontes'],
    armadilhas: semColisoes(
      [
        {
          resposta: gabarito / 100,
          diagnostico: `A distância vai em metros: ${r} cm = ${txt(r / 100)} m.`,
          passo: 1,
          conceito: 'magnetismo.fontes',
        },
        {
          resposta: ((MU_0 * i) / (r / 100)) * 1e6,
          diagnostico: 'Faltou o 2π do denominador: B = μ₀I/(2πr).',
          passo: 0,
          conceito: 'magnetismo.fontes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `B = μ₀·I/(2π·r): com μ₀ = 4π×10⁻⁷ o π cancela e fica 2×10⁻⁷·${i}/${txt(r / 100)} em teslas. Para μT, ×10⁶.`,
  };
}

/** Fluxo com o ângulo entre o campo e a normal da espira. */
function fluxo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const b = rng.escolher([0.2, 0.4, 0.5, 0.8]);
  const a = rng.escolher([50, 100, 200, 400]);
  const angulo = rng.escolher([0, 30, 45, 60]);
  const gabarito = b * a * 1e-4 * Math.cos(rad(angulo)) * 1000;

  return {
    id: `mag-fluxo-${b}-${a}-${angulo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma espira de ${a} cm² está num campo uniforme de ${txt(b)} T, que forma ${angulo}° com a NORMAL da espira. ` +
      'Qual é o fluxo magnético, em mWb? (2 casas decimais)',
    enunciadoTex: `B = ${tex(b)}\\ \\text{T} \\qquad A = ${a}\\ \\text{cm}^{2} \\qquad \\theta = ${angulo}^{\\circ}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'O fluxo conta quantas linhas atravessam a espira: o cosseno do ângulo com a normal.',
          tex: '\\Phi = BA\\cos\\theta',
        },
        {
          descricao: 'Com a área em m² (1 cm² = 10⁻⁴ m²).',
          tex: `\\Phi = ${tex(b)} \\cdot ${a} \\times 10^{-4} \\cdot \\cos ${angulo}^{\\circ} = ${tex(gabarito / 1000)}\\ \\text{Wb} = ${tex(gabarito)}\\ \\text{mWb}`,
        },
      ],
    },
    conceitos: ['magnetismo.inducao'],
    armadilhas: semColisoes(
      [
        ...(angulo !== 0 && angulo !== 45
          ? [
              {
                resposta: b * a * 1e-4 * Math.sin(rad(angulo)) * 1000,
                diagnostico: 'Com o ângulo medido a partir da NORMAL, o fluxo usa o cosseno.',
                passo: 0,
                conceito: 'magnetismo.inducao',
              },
            ]
          : []),
        {
          resposta: b * a * 1e-2 * Math.cos(rad(angulo)) * 1000,
          diagnostico: '1 cm² = 10⁻⁴ m²: o centímetro vai ao quadrado.',
          passo: 1,
          conceito: 'magnetismo.inducao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Φ = B·A·cos θ, com A em m² (${a} cm² = ${a}×10⁻⁴ m²) e o ângulo medido da normal. Em Wb; ×1000 para mWb.`,
  };
}

/** Raio da órbita circular de uma partícula num campo: r = mv/(qB). */
function raio(nivel: Nivel, rng: Rng): Exercicio<number> {
  const qual = rng.escolher(['proton', 'eletron'] as const);
  const p = PARTICULAS[qual];
  const v = qual === 'proton' ? rng.escolher([1e5, 2e5, 5e5, 1e6]) : rng.escolher([1e6, 2e6, 5e6]);
  const b = rng.escolher([0.01, 0.05, 0.1, 0.5]);
  const metros = (p.m * v) / (CARGA_E * b);
  const unidade = qual === 'proton' ? 'cm' : 'mm';
  const gabarito = metros * (qual === 'proton' ? 100 : 1000);
  const vTexto = `${String(v / 10 ** Math.floor(Math.log10(v)))}×10${'⁰¹²³⁴⁵⁶⁷⁸⁹'[Math.floor(Math.log10(v))]}`;

  return {
    id: `mag-raio-${qual}-${v}-${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `${qual === 'proton' ? 'Um próton' : 'Um elétron'} (massa ${p.mTexto}, carga 1,6×10⁻¹⁹ C) entra a ${vTexto} m/s, ` +
      `perpendicular, num campo de ${txt(b)} T. Qual é o raio da órbita, em ${unidade}? (2 casas decimais)`,
    enunciadoTex: `r = \\frac{mv}{|q|B}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A força magnética faz o papel de força centrípeta.',
          tex: '|q|vB = \\frac{mv^{2}}{r} \\;\\Rightarrow\\; r = \\frac{mv}{|q|B}',
        },
        {
          descricao: 'Substituindo.',
          tex: `r = \\frac{${p.mTex} \\cdot ${cientificoTex(v)}}{1{,}6 \\times 10^{-19} \\cdot ${tex(b)}} = ${tex(gabarito)}\\ \\text{${unidade}}`,
        },
      ],
    },
    conceitos: ['magnetismo.movimento'],
    armadilhas: semColisoes(
      [
        {
          resposta: ((p.m * v * v) / (CARGA_E * b)) * (qual === 'proton' ? 100 : 1000),
          diagnostico:
            'Um v se cancela ao igualar qvB a mv²/r: fica r = mv/(qB), com v na primeira potência.',
          passo: 0,
          conceito: 'magnetismo.movimento',
        },
        {
          resposta: metros,
          diagnostico: `Esse valor está em metros; o pedido é em ${unidade}.`,
          passo: 1,
          conceito: 'magnetismo.movimento',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Iguale a força magnética q·v·B à centrípeta m·v²/r: r = m·v/(q·B). Depois passe de metros para ${unidade}.`,
  };
}

function faraday(nivel: Nivel, rng: Rng): Exercicio<number> {
  const n = rng.escolher([10, 50, 100, 200, 500]);
  const a = rng.escolher([20, 50, 100, 200]);
  const b1 = rng.escolher([0, 0.1, 0.2]);
  const b2 = rng.escolher([0.4, 0.5, 0.8, 1]);
  const dt = rng.escolher([0.05, 0.1, 0.2, 0.5]);
  const resolucao = faradayComPassos(n, a, b1, b2, dt);
  const gabarito = resolucao.resultado;

  return {
    id: `mag-faraday-${n}-${a}-${b1}-${b2}-${dt}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma bobina de ${n} espiras, cada uma com ${a} cm², está perpendicular a um campo que passa de ${txt(b1)} T ` +
      `para ${txt(b2)} T em ${txt(dt)} s. Qual é o módulo da fem induzida, em V? (2 casas decimais)`,
    enunciadoTex: `N = ${n} \\qquad A = ${a}\\ \\text{cm}^{2} \\qquad B: ${tex(b1)} \\to ${tex(b2)}\\ \\text{T} \\qquad \\Delta t = ${tex(dt)}\\ \\text{s}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...resolucao.passos,
        { descricao: 'Portanto:', tex: `|\\varepsilon| = ${tex(gabarito)}\\ \\text{V}` },
      ],
    },
    conceitos: ['magnetismo.inducao'],
    armadilhas: semColisoes(
      [
        {
          resposta: gabarito / n,
          diagnostico: `Faltou multiplicar pelo número de espiras: cada uma soma a sua fem, N = ${n}.`,
          passo: 2,
          conceito: 'magnetismo.inducao',
        },
        {
          resposta: (n * b2 * a * 1e-4) / dt,
          diagnostico: 'Faraday usa a VARIAÇÃO do fluxo (final menos inicial), não o fluxo final.',
          passo: 1,
          conceito: 'magnetismo.inducao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `|ε| = N·ΔΦ/Δt, com ΔΦ = (${txt(b2)} − ${txt(b1)})·${a}×10⁻⁴ Wb. Multiplique por ${n} e divida por ${txt(dt)} s.`,
  };
}

function solenoide(nivel: Nivel, rng: Rng): Exercicio<number> {
  const espiras = rng.escolher([200, 500, 1000, 2000]);
  const comprimento = rng.escolher([10, 20, 25, 50]);
  const i = rng.escolher([0.5, 1, 2, 3]);
  const n = espiras / (comprimento / 100);
  const gabarito = MU_0 * n * i * 1000;

  return {
    id: `mag-solenoide-${espiras}-${comprimento}-${i}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um solenoide de ${comprimento} cm tem ${espiras} espiras e corrente de ${txt(i)} A. Qual é o campo no ` +
      'interior, em mT? (2 casas decimais)',
    enunciadoTex: `B = \\mu_0 n I \\qquad N = ${espiras} \\qquad L = ${comprimento}\\ \\text{cm} \\qquad I = ${tex(i)}\\ \\text{A}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'n é o número de espiras POR METRO.',
          tex: `n = \\frac{${espiras}}{${tex(comprimento / 100)}\\ \\text{m}} = ${tex(n)}\\ \\text{espiras/m}`,
        },
        {
          descricao: 'Substituindo.',
          tex: `B = 4\\pi \\times 10^{-7} \\cdot ${tex(n)} \\cdot ${tex(i)} = ${tex(gabarito / 1000)}\\ \\text{T} = ${tex(gabarito)}\\ \\text{mT}`,
          nota: 'O campo dentro do solenoide é uniforme e não depende do raio.',
        },
      ],
    },
    conceitos: ['magnetismo.fontes'],
    armadilhas: semColisoes(
      [
        {
          resposta: MU_0 * espiras * i * 1000,
          diagnostico: `n é por METRO: divida as ${espiras} espiras pelo comprimento ${txt(comprimento / 100)} m.`,
          passo: 0,
          conceito: 'magnetismo.fontes',
        },
        {
          resposta: MU_0 * (espiras / comprimento) * i * 1000,
          diagnostico: 'O comprimento vai em metros, não em centímetros.',
          passo: 0,
          conceito: 'magnetismo.fontes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `B = μ₀·n·I com n em espiras por metro: ${espiras} / ${txt(comprimento / 100)} m. Use μ₀ = 4π×10⁻⁷; para mT, ×1000.`,
  };
}

/** Barra condutora sobre trilhos: fem, corrente ou força de freio. */
function barra(nivel: Nivel, rng: Rng): Exercicio<number> {
  const b = rng.escolher([0.2, 0.5, 0.8, 1]);
  const l = rng.escolher([0.2, 0.4, 0.5, 1]);
  const v = rng.escolher([2, 4, 5, 10]);
  const r = rng.escolher([0.5, 1, 2, 4]);
  const fem = b * l * v;
  const i = fem / r;
  const forca = b * i * l;
  const pede = rng.escolher(['corrente', 'forca'] as const);
  const gabarito = pede === 'corrente' ? i : forca;

  return {
    id: `mag-barra-${b}-${l}-${v}-${r}-${pede}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma barra de ${txt(l)} m desliza a ${v} m/s sobre trilhos, num campo de ${txt(b)} T perpendicular ao plano. ` +
      `O circuito fechado tem ${txt(r)} Ω. ` +
      (pede === 'corrente'
        ? 'Qual é a corrente induzida, em A? (2 casas decimais)'
        : 'Qual é a força magnética que freia a barra, em N? (2 casas decimais)'),
    enunciadoTex: `B = ${tex(b)}\\ \\text{T} \\qquad L = ${tex(l)}\\ \\text{m} \\qquad v = ${v}\\ \\text{m/s} \\qquad R = ${tex(r)}\\ \\Omega`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A área do circuito cresce L·v por segundo: a fem é B·L·v.',
          tex: `\\varepsilon = BLv = ${tex(b)} \\cdot ${tex(l)} \\cdot ${v} = ${tex(fem)}\\ \\text{V}`,
        },
        {
          descricao: 'A corrente, por Ohm.',
          tex: `I = \\frac{${tex(fem)}}{${tex(r)}} = ${tex(i)}\\ \\text{A}`,
        },
        ...(pede === 'forca'
          ? [
              {
                descricao:
                  'Pela lei de Lenz, a força sobre a corrente induzida se opõe ao movimento: F = B·I·L.',
                tex: `F = ${tex(b)} \\cdot ${tex(i)} \\cdot ${tex(l)} = ${tex(forca)}\\ \\text{N}`,
              },
            ]
          : []),
      ],
    },
    conceitos: ['magnetismo.inducao'],
    armadilhas: semColisoes(
      [
        {
          resposta: fem,
          diagnostico: `${txt(fem)} V é a fem. ${pede === 'corrente' ? 'A corrente é fem/R.' : 'Falta a corrente (fem/R) e a força B·I·L.'}`,
          passo: 1,
          conceito: 'magnetismo.inducao',
        },
        ...(pede === 'forca'
          ? [
              {
                resposta: i,
                diagnostico: 'Essa é a corrente. A força de freio é B·I·L.',
                passo: 2,
                conceito: 'magnetismo.inducao',
              },
            ]
          : []),
      ],
      gabarito,
      proximos,
    ),
    dica: `Encadeie: fem = B·L·v, corrente = fem/R${pede === 'forca' ? ', força = B·I·L' : ''}.`,
  };
}

/** Partícula acelerada por uma ddp e depois desviada pelo campo. */
function raioAcelerado(nivel: Nivel, rng: Rng): Exercicio<number> {
  const ddp = rng.escolher([100, 500, 1000, 2000, 5000]);
  const b = rng.escolher([0.05, 0.1, 0.2, 0.5]);
  const p = PARTICULAS.proton;
  const v = Math.sqrt((2 * CARGA_E * ddp) / p.m);
  const gabarito = ((p.m * v) / (CARGA_E * b)) * 100;

  return {
    id: `mag-raio-acel-${ddp}-${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um próton (massa 1,67×10⁻²⁷ kg, carga 1,6×10⁻¹⁹ C), partindo do repouso, é acelerado por ${ddp} V e entra ` +
      `perpendicular num campo de ${txt(b)} T. Qual é o raio da órbita, em cm? (2 casas decimais)`,
    enunciadoTex: `\\Delta V = ${ddp}\\ \\text{V} \\qquad B = ${tex(b)}\\ \\text{T}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A energia ganha na ddp vira energia cinética: qΔV = ½mv².',
          tex: `v = \\sqrt{\\frac{2qV}{m}} = \\sqrt{\\frac{2 \\cdot 1{,}6 \\times 10^{-19} \\cdot ${ddp}}{1{,}67 \\times 10^{-27}}} = ${tex(v / 1000)} \\times 10^{3}\\ \\text{m/s}`,
        },
        {
          descricao: 'No campo, a força magnética é a centrípeta: r = mv/(qB).',
          tex: `r = \\frac{1{,}67 \\times 10^{-27} \\cdot ${tex(v / 1000)} \\times 10^{3}}{1{,}6 \\times 10^{-19} \\cdot ${tex(b)}} = ${tex(gabarito)}\\ \\text{cm}`,
        },
      ],
    },
    conceitos: ['magnetismo.movimento'],
    armadilhas: semColisoes(
      [
        {
          resposta: ((p.m * Math.sqrt((CARGA_E * ddp) / p.m)) / (CARGA_E * b)) * 100,
          diagnostico: 'Faltou o 2 de qV = ½mv²: v = √(2qV/m).',
          passo: 0,
          conceito: 'magnetismo.movimento',
        },
        {
          resposta: (p.m * v) / (CARGA_E * b),
          diagnostico: 'Esse valor está em metros; o pedido é em cm.',
          passo: 1,
          conceito: 'magnetismo.movimento',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'Dois passos: a velocidade sai da energia, q·ΔV = ½·m·v²; o raio, de r = m·v/(q·B). Passe para cm no fim.',
  };
}
