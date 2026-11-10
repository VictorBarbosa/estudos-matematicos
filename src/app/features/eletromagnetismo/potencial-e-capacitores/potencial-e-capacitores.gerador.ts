import {
  EPSILON_0,
  K_COULOMB,
  associacaoComPassos,
  capacitorPlanoComPassos,
  potencialPontualComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-4);
const tex = (v: number): string => formatar(v).replace(',', '{,}');
const txt = (v: number): string => String(v).replace('.', ',');
const par = (v: number): string => (v < 0 ? `(${txt(v)})` : txt(v));

type Pergunta =
  | 'potencial'
  | 'carga'
  | 'trabalho'
  | 'placas'
  | 'energia'
  | 'associacao'
  | 'dois-potenciais'
  | 'misto'
  | 'energia-placas';

/**
 * Potencial elétrico e capacitores.
 *
 * O potencial é a versão escalar do campo: soma-se com sinal, sem vetores. O
 * capacitor guarda carga (Q = CV) e energia (½CV²); as associações têm as
 * regras espelhadas das dos resistores — e trocá-las é o erro clássico.
 */
export const geradorPotencialCapacitores: GeradorExercicio<number> = {
  topicoId: 'potencial-e-capacitores',
  formatoResposta: 'um número, ex.: 4,5 ou -18',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'potencial':
        return potencial(nivel, rng);
      case 'carga':
        return carga(nivel, rng);
      case 'trabalho':
        return trabalho(nivel, rng);
      case 'placas':
        return placas(nivel, rng);
      case 'energia':
        return energia(nivel, rng);
      case 'associacao':
        return associacao(nivel, rng);
      case 'dois-potenciais':
        return doisPotenciais(nivel, rng);
      case 'misto':
        return misto(nivel, rng);
      case 'energia-placas':
        return energiaPlacas(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['potencial', 'carga']);
    case 'medio':
      return rng.escolher<Pergunta>(['trabalho', 'placas', 'energia']);
    case 'dificil':
      return rng.escolher<Pergunta>(['associacao', 'dois-potenciais', 'energia']);
    // Associação mista e a energia de um capacitor dado pela geometria: duas
    // contas encadeadas em vez de uma fórmula.
    case 'extremo':
      return rng.escolher<Pergunta>(['misto', 'energia-placas']);
  }
}

function potencial(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = rng.inteiro(1, 9) * rng.sinal();
  const r = rng.escolher([0.1, 0.2, 0.3, 0.5, 0.6, 0.9]);
  const resolucao = potencialPontualComPassos(q, r);
  const gabarito = resolucao.resultado / 1000;

  return {
    id: `pot-pontual-${q}-${r}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é o potencial elétrico a ${txt(r)} m de uma carga de ${par(q)} μC, em kV (com sinal)? (2 casas decimais)`,
    enunciadoTex: `q = ${q}\\ \\mu\\text{C} \\qquad r = ${tex(r)}\\ \\text{m} \\qquad V = \\;?\\ \\text{kV}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...resolucao.passos,
        { descricao: 'Em kV.', tex: `V = ${tex(gabarito)}\\ \\text{kV}` },
      ],
    },
    conceitos: ['potencial.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: gabarito / r,
          diagnostico: 'O potencial cai com r, não com r² — r² é do campo e da força.',
          passo: 0,
          conceito: 'potencial.definicao',
        },
        {
          resposta: -gabarito,
          diagnostico: 'O potencial carrega o sinal da carga: carga negativa, potencial negativo.',
          passo: 1,
          conceito: 'potencial.definicao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `V = k·q/r, com o sinal da carga: 8,99×10⁹ vezes ${par(q)}×10⁻⁶, dividido por ${txt(r)} (sem quadrado). Divida por 1000 para kV.`,
  };
}

function carga(nivel: Nivel, rng: Rng): Exercicio<number> {
  const c = rng.escolher([2, 4.7, 10, 22, 47, 100]);
  const v = rng.escolher([3, 5, 9, 12, 24]);
  const gabarito = c * v;

  return {
    id: `pot-carga-${c}-${v}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um capacitor de ${txt(c)} μF é ligado a uma bateria de ${v} V. Qual carga ele armazena, em μC?`,
    enunciadoTex: `C = ${tex(c)}\\ \\mu\\text{F} \\qquad V = ${v}\\ \\text{V}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        { descricao: 'A capacitância é a carga por volt: Q = CV.', tex: 'Q = CV' },
        {
          descricao: 'μF vezes V dá μC diretamente.',
          tex: `Q = ${tex(c)}\\ \\mu\\text{F} \\cdot ${v}\\ \\text{V} = ${tex(gabarito)}\\ \\mu\\text{C}`,
        },
      ],
    },
    conceitos: ['capacitores.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: c / v,
          diagnostico: 'C = Q/V, então Q = C·V — multiplica, não divide.',
          passo: 0,
          conceito: 'capacitores.definicao',
        },
        {
          resposta: (c * v * v) / 2,
          diagnostico: 'Isso é a ENERGIA (½CV²). A carga é só C·V.',
          passo: 0,
          conceito: 'capacitores.definicao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Q = C·V: ${txt(c)} μF vezes ${v} V dá a carga em μC.`,
  };
}

/** Trabalho do agente externo para levar q de A a B: W = q(V_B − V_A). */
function trabalho(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = rng.inteiro(1, 9) * rng.sinal();
  const va = rng.escolher([-200, -50, 0, 100, 150, 300]);
  let vb = rng.escolher([-100, 0, 50, 200, 400, 500]);
  if (vb === va) vb += 100;
  const gabarito = (q * (vb - va)) / 1000;

  return {
    id: `pot-trabalho-${q}-${va}-${vb}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual trabalho um agente externo realiza para levar, devagar, uma carga de ${par(q)} μC de um ponto a ` +
      `${va} V até um ponto a ${vb} V, em mJ (com sinal)? (2 casas decimais)`,
    enunciadoTex: `q = ${q}\\ \\mu\\text{C} \\qquad V_A = ${va}\\ \\text{V} \\qquad V_B = ${vb}\\ \\text{V}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'O trabalho do agente é a variação da energia potencial: carga vezes a diferença de potencial.',
          tex: 'W = q\\,(V_B - V_A)',
        },
        {
          descricao: 'Substituindo, com a ordem final menos inicial.',
          tex: `W = ${q} \\times 10^{-6} \\cdot (${vb} - ${va < 0 ? `(${va})` : va}) = ${tex(gabarito / 1000)}\\ \\text{J} = ${tex(gabarito)}\\ \\text{mJ}`,
        },
      ],
    },
    conceitos: ['potencial.trabalho'],
    armadilhas: semColisoes(
      [
        {
          resposta: -gabarito,
          diagnostico: 'A ordem é V_B − V_A (final menos inicial); invertida, o sinal troca.',
          passo: 1,
          conceito: 'potencial.trabalho',
        },
        {
          resposta: (q * (vb + va)) / 1000,
          diagnostico: 'É a DIFERENÇA de potencial que conta, não a soma.',
          passo: 0,
          conceito: 'potencial.trabalho',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `W = q·(V_B − V_A) = ${par(q)}×10⁻⁶ vezes (${vb} − ${par(va)}). Em joules; multiplique por 1000 para mJ.`,
  };
}

function placas(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.escolher([50, 100, 200, 400, 500]);
  const d = rng.escolher([0.5, 1, 2, 4]);
  const resolucao = capacitorPlanoComPassos(a, d);
  const gabarito = resolucao.resultado;

  return {
    id: `pot-placas-${a}-${d}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um capacitor tem placas paralelas de ${a} cm² separadas por ${txt(d)} mm de ar. Qual é sua capacitância, ` +
      'em pF? (2 casas decimais)',
    enunciadoTex: `A = ${a}\\ \\text{cm}^{2} \\qquad d = ${tex(d)}\\ \\text{mm} \\qquad \\varepsilon_0 = 8{,}85 \\times 10^{-12}\\ \\text{F/m}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...resolucao.passos,
        { descricao: 'Portanto:', tex: `C = ${tex(gabarito)}\\ \\text{pF}` },
      ],
    },
    conceitos: ['capacitores.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: ((EPSILON_0 * a * 1e-4) / (d * 1e-2)) * 1e12,
          diagnostico: '1 mm = 10⁻³ m (não 10⁻²).',
          passo: 1,
          conceito: 'capacitores.definicao',
        },
        {
          resposta: ((EPSILON_0 * a * 1e-2) / (d * 1e-3)) * 1e12,
          diagnostico: '1 cm² = 10⁻⁴ m²: o centímetro vai ao QUADRADO na conversão.',
          passo: 1,
          conceito: 'capacitores.definicao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `C = ε₀·A/d com A em m² (${a} cm² = ${a}×10⁻⁴ m²) e d em m (${txt(d)} mm = ${txt(d)}×10⁻³ m). Depois passe para pF (×10¹²).`,
  };
}

function energia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const c = rng.escolher([10, 22, 47, 100, 220, 470]);
  const v = rng.escolher([5, 9, 12, 20, 50]);
  const gabarito = 0.5 * c * 1e-6 * v * v * 1000;

  return {
    id: `pot-energia-${c}-${v}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Quanta energia guarda um capacitor de ${c} μF carregado a ${v} V, em mJ? (2 casas decimais)`,
    enunciadoTex: `C = ${c}\\ \\mu\\text{F} \\qquad V = ${v}\\ \\text{V}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A energia é metade de C vezes V ao quadrado.',
          tex: 'U = \\tfrac{1}{2}CV^{2}',
        },
        {
          descricao: 'Substituindo, com C em farads.',
          tex: `U = \\tfrac{1}{2} \\cdot ${c} \\times 10^{-6} \\cdot ${v}^{2} = ${tex(gabarito / 1000)}\\ \\text{J} = ${tex(gabarito)}\\ \\text{mJ}`,
          nota: 'É a área do triângulo no gráfico V × Q: a carga entra aos poucos, contra uma tensão que cresce.',
        },
      ],
    },
    conceitos: ['capacitores.energia'],
    armadilhas: semColisoes(
      [
        {
          resposta: gabarito * 2,
          diagnostico: 'Faltou o ½: U = ½CV².',
          passo: 0,
          conceito: 'capacitores.energia',
        },
        {
          resposta: gabarito / v,
          diagnostico: `V vai AO QUADRADO: ${v}² = ${v * v}.`,
          passo: 1,
          conceito: 'capacitores.energia',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `U = ½·C·V²: metade de ${c}×10⁻⁶ F vezes ${v}² = ${v * v}. O resultado sai em J; para mJ, multiplique por 1000.`,
  };
}

function associacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const valores = [rng.escolher([2, 3, 4, 6]), rng.escolher([3, 4, 6, 12])];
  if (rng.booleano()) valores.push(rng.escolher([4, 6, 12]));
  const tipo = rng.booleano() ? 'serie' : 'paralelo';
  const resolucao = associacaoComPassos(valores, tipo, 'capacitor');
  const gabarito = resolucao.resultado;
  const outro = associacaoComPassos(
    valores,
    tipo === 'serie' ? 'paralelo' : 'serie',
    'capacitor',
  ).resultado;

  return {
    id: `pot-assoc-${tipo}-${valores.join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Capacitores de ${valores.join(', ')} μF estão ligados em ${tipo === 'serie' ? 'SÉRIE' : 'PARALELO'}. ` +
      'Qual é a capacitância equivalente, em μF? (2 casas decimais)',
    enunciadoTex: `${valores.map((v, i) => `C_${i + 1} = ${v}`).join(' \\quad ')} \\quad (\\mu\\text{F})`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...resolucao.passos,
        { descricao: 'Portanto:', tex: `C_{eq} = ${tex(gabarito)}\\ \\mu\\text{F}` },
      ],
    },
    conceitos: ['capacitores.associacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: outro,
          diagnostico:
            'As regras dos capacitores são o espelho das dos resistores: em PARALELO se somam; em SÉRIE, somam-se os inversos.',
          passo: 0,
          conceito: 'capacitores.associacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      tipo === 'serie'
        ? `Em série: 1/C = 1/${valores.join(' + 1/')}. Depois inverta. O resultado é menor que ${Math.min(...valores)}.`
        : `Em paralelo as capacitâncias se somam: ${valores.join(' + ')}.`,
  };
}

/** Potencial num ponto devido a duas cargas: soma com sinal. */
function doisPotenciais(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q1 = rng.inteiro(1, 8) * rng.sinal();
  const q2 = rng.inteiro(1, 8) * rng.sinal();
  const r1 = rng.escolher([0.1, 0.2, 0.3, 0.4]);
  const r2 = rng.escolher([0.2, 0.3, 0.5, 0.6]);
  const v1 = (K_COULOMB * q1 * 1e-6) / r1;
  const v2 = (K_COULOMB * q2 * 1e-6) / r2;
  const gabarito = (v1 + v2) / 1000;

  return {
    id: `pot-dois-${q1}-${q2}-${r1}-${r2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um ponto P está a ${txt(r1)} m de uma carga de ${par(q1)} μC e a ${txt(r2)} m de outra de ${par(q2)} μC. ` +
      'Qual é o potencial em P, em kV (com sinal)? (2 casas decimais)',
    enunciadoTex: `q_1 = ${q1}\\ \\mu\\text{C},\\; r_1 = ${tex(r1)}\\ \\text{m} \\qquad q_2 = ${q2}\\ \\mu\\text{C},\\; r_2 = ${tex(r2)}\\ \\text{m}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O potencial é escalar: cada carga contribui com kq/r, com o seu sinal.',
          tex: `V_1 = \\frac{8{,}99 \\times 10^{9} \\cdot ${par(q1)} \\times 10^{-6}}{${tex(r1)}} = ${tex(v1 / 1000)}\\ \\text{kV} \\qquad V_2 = \\frac{8{,}99 \\times 10^{9} \\cdot ${par(q2)} \\times 10^{-6}}{${tex(r2)}} = ${tex(v2 / 1000)}\\ \\text{kV}`,
        },
        {
          descricao: 'Somando, sem vetores.',
          tex: `V = ${tex(v1 / 1000)} ${v2 >= 0 ? '+' : '-'} ${tex(Math.abs(v2) / 1000)} = ${tex(gabarito)}\\ \\text{kV}`,
        },
      ],
    },
    conceitos: ['potencial.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: (Math.abs(v1) + Math.abs(v2)) / 1000,
          diagnostico:
            'O sinal de cada carga entra na soma: potencial de carga negativa é negativo.',
          passo: 1,
          conceito: 'potencial.definicao',
        },
        {
          resposta: (v1 / r1 + v2 / r2) / 1000,
          diagnostico: 'Potencial é kq/r — sem o quadrado da distância.',
          passo: 0,
          conceito: 'potencial.definicao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'Calcule k·q/r para cada carga, com o sinal dela, e some os dois números: potencial é escalar, sem decompor.',
  };
}

/** C₁ em série com (C₂ ∥ C₃), e a carga na fonte. */
function misto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const c1 = rng.escolher([3, 4, 6, 12]);
  const c2 = rng.escolher([1, 2, 4]);
  const c3 = rng.escolher([2, 4, 8]);
  const v = rng.escolher([6, 9, 12, 24]);
  const paralelo = c2 + c3;
  const ceq = (c1 * paralelo) / (c1 + paralelo);
  const pedeCarga = rng.booleano();
  const gabarito = pedeCarga ? ceq * v : ceq;

  return {
    id: `pot-misto-${c1}-${c2}-${c3}-${v}-${pedeCarga ? 'q' : 'c'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `C₁ = ${c1} μF está em série com a associação em paralelo de C₂ = ${c2} μF e C₃ = ${c3} μF, ligados a ${v} V. ` +
      (pedeCarga
        ? 'Qual é a carga fornecida pela fonte, em μC? (2 casas decimais)'
        : 'Qual é a capacitância equivalente, em μF? (2 casas decimais)'),
    enunciadoTex: `C_1 \\;\\text{em série com}\\; (C_2 \\parallel C_3) \\qquad V = ${v}\\ \\text{V}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Primeiro o paralelo: somam-se.',
          tex: `C_{23} = ${c2} + ${c3} = ${paralelo}\\ \\mu\\text{F}`,
        },
        {
          descricao: 'Depois a série com C₁: produto sobre soma (para dois).',
          tex: `C_{eq} = \\frac{${c1} \\cdot ${paralelo}}{${c1} + ${paralelo}} = ${tex(ceq)}\\ \\mu\\text{F}`,
        },
        ...(pedeCarga
          ? [
              {
                descricao: 'A fonte vê o equivalente: Q = C_eq·V.',
                tex: `Q = ${tex(ceq)} \\cdot ${v} = ${tex(gabarito)}\\ \\mu\\text{C}`,
              },
            ]
          : []),
      ],
    },
    conceitos: ['capacitores.associacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: pedeCarga ? (c1 + paralelo) * v : c1 + paralelo,
          diagnostico: 'C₁ e o bloco C₂∥C₃ estão em SÉRIE: somam-se os inversos, não os valores.',
          passo: 1,
          conceito: 'capacitores.associacao',
        },
        {
          resposta: pedeCarga
            ? ((c1 * ((c2 * c3) / (c2 + c3))) / (c1 + (c2 * c3) / (c2 + c3))) * v
            : (c1 * ((c2 * c3) / (c2 + c3))) / (c1 + (c2 * c3) / (c2 + c3)),
          diagnostico: 'Em PARALELO os capacitores se somam: C₂₃ = C₂ + C₃.',
          passo: 0,
          conceito: 'capacitores.associacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Resolva de dentro para fora: C₂ ∥ C₃ soma (${c2} + ${c3}); depois a série com C₁ = ${c1} é produto sobre soma.`,
  };
}

/** Energia de um capacitor de placas, a partir da geometria. */
function energiaPlacas(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.escolher([100, 200, 400]);
  const d = rng.escolher([0.5, 1, 2]);
  const v = rng.escolher([50, 100, 200]);
  const c = (EPSILON_0 * a * 1e-4) / (d * 1e-3);
  const gabarito = 0.5 * c * v * v * 1e9;

  return {
    id: `pot-energia-placas-${a}-${d}-${v}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um capacitor de placas de ${a} cm², separadas por ${txt(d)} mm de ar, é carregado a ${v} V. ` +
      'Quanta energia ele guarda, em nJ? (2 casas decimais)',
    enunciadoTex: `A = ${a}\\ \\text{cm}^{2} \\qquad d = ${tex(d)}\\ \\text{mm} \\qquad V = ${v}\\ \\text{V}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A capacitância pela geometria, no SI.',
          tex: `C = \\frac{8{,}85 \\times 10^{-12} \\cdot ${a} \\times 10^{-4}}{${tex(d)} \\times 10^{-3}} = ${tex(c * 1e12)}\\ \\text{pF}`,
        },
        {
          descricao: 'A energia, ½CV².',
          tex: `U = \\tfrac{1}{2} \\cdot ${tex(c * 1e12)} \\times 10^{-12} \\cdot ${v}^{2} = ${tex(gabarito)}\\ \\text{nJ}`,
        },
      ],
    },
    conceitos: ['capacitores.definicao', 'capacitores.energia'],
    armadilhas: semColisoes(
      [
        {
          resposta: gabarito * 2,
          diagnostico: 'Faltou o ½ da energia: U = ½CV².',
          passo: 1,
          conceito: 'capacitores.energia',
        },
        {
          resposta: gabarito / v,
          diagnostico: 'V vai ao quadrado na energia.',
          passo: 1,
          conceito: 'capacitores.energia',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Dois passos: C = ε₀·A/d (A = ${a}×10⁻⁴ m², d = ${txt(d)}×10⁻³ m) e depois U = ½·C·${v}². Para nJ, multiplique por 10⁹.`,
  };
}
