import { associacaoComPassos, cargaRcComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-4);
const tex = (v: number): string => formatar(v).replace(',', '{,}');
const txt = (v: number): string => String(v).replace('.', ',');

type Pergunta =
  | 'ohm'
  | 'potencia'
  | 'equivalente'
  | 'divisor'
  | 'potencia-ri2'
  | 'misto'
  | 'malha'
  | 'tau'
  | 'rc'
  | 'duas-malhas';

/**
 * Circuitos de corrente contínua e o circuito RC.
 *
 * De Ohm a Kirchhoff: a cada nível, um circuito um pouco mais emaranhado.
 * No Extremo, duas malhas com duas fontes — resolvidas pelo potencial do nó
 * do meio — e a carga de um capacitor no tempo.
 */
export const geradorCircuitos: GeradorExercicio<number> = {
  topicoId: 'circuitos',
  formatoResposta: 'um número, ex.: 0,75 ou 12',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'ohm':
        return ohm(nivel, rng);
      case 'potencia':
        return potencia(nivel, rng, false);
      case 'potencia-ri2':
        return potencia(nivel, rng, true);
      case 'equivalente':
        return equivalente(nivel, rng);
      case 'divisor':
        return divisor(nivel, rng);
      case 'misto':
        return misto(nivel, rng);
      case 'malha':
        return malha(nivel, rng);
      case 'tau':
        return tau(nivel, rng);
      case 'rc':
        return rc(nivel, rng);
      case 'duas-malhas':
        return duasMalhas(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['ohm', 'potencia']);
    case 'medio':
      return rng.escolher<Pergunta>(['equivalente', 'divisor', 'potencia-ri2']);
    case 'dificil':
      return rng.escolher<Pergunta>(['misto', 'malha', 'tau']);
    // A carga do capacitor no tempo e duas malhas com duas fontes: o RC pede a
    // exponencial, as malhas pedem Kirchhoff de verdade.
    case 'extremo':
      return rng.escolher<Pergunta>(['rc', 'duas-malhas']);
  }
}

function ohm(nivel: Nivel, rng: Rng): Exercicio<number> {
  const v = rng.escolher([1.5, 3, 5, 9, 12, 24, 110]);
  const r = rng.escolher([10, 22, 47, 100, 220, 330, 1000]);
  const gabarito = (v / r) * 1000;

  return {
    id: `circ-ohm-${v}-${r}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um resistor de ${r} Ω está ligado a ${txt(v)} V. Qual corrente o atravessa, em mA? (2 casas decimais)`,
    enunciadoTex: `V = ${tex(v)}\\ \\text{V} \\qquad R = ${r}\\ \\Omega`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Lei de Ohm: a corrente é a tensão sobre a resistência.',
          tex: 'I = \\frac{V}{R}',
        },
        {
          descricao: 'Substituindo; em ampères, e depois em mA.',
          tex: `I = \\frac{${tex(v)}}{${r}} = ${tex(v / r)}\\ \\text{A} = ${tex(gabarito)}\\ \\text{mA}`,
        },
      ],
    },
    conceitos: ['circuitos.ohm'],
    armadilhas: semColisoes(
      [
        {
          resposta: v * r,
          diagnostico: 'V = R·I, então I = V/R — divide, não multiplica.',
          passo: 0,
          conceito: 'circuitos.ohm',
        },
        {
          resposta: v / r,
          diagnostico: 'Esse valor está em ampères; o pedido é em mA (×1000).',
          passo: 1,
          conceito: 'circuitos.ohm',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `I = V/R = ${txt(v)} / ${r} em ampères; multiplique por 1000 para mA.`,
  };
}

function potencia(nivel: Nivel, rng: Rng, porCorrente: boolean): Exercicio<number> {
  const r = rng.escolher([4, 8, 10, 20, 50, 100]);
  if (porCorrente) {
    const i = rng.escolher([0.5, 1.5, 2, 2.5, 3]);
    const gabarito = r * i * i;
    return {
      id: `circ-pot-ri-${r}-${i}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Uma corrente de ${txt(i)} A atravessa um resistor de ${r} Ω. Quanta potência ele dissipa, em W? (2 casas decimais)`,
      enunciadoTex: `I = ${tex(i)}\\ \\text{A} \\qquad R = ${r}\\ \\Omega`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          { descricao: 'Com a corrente e a resistência: P = R·I².', tex: 'P = RI^{2}' },
          {
            descricao: 'Substituindo.',
            tex: `P = ${r} \\cdot (${tex(i)})^{2} = ${tex(gabarito)}\\ \\text{W}`,
          },
        ],
      },
      conceitos: ['circuitos.potencia'],
      armadilhas: semColisoes(
        [
          {
            resposta: r * i,
            diagnostico: `R·I é a TENSÃO (${txt(r * i)} V). A potência é R·I², com a corrente ao quadrado.`,
            passo: 0,
            conceito: 'circuitos.potencia',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: `P = R·I²: ${r} vezes ${txt(i)}², com a corrente ao quadrado.`,
    };
  }
  const v = rng.escolher([6, 9, 12, 24, 120]);
  const gabarito = (v * v) / r;
  return {
    id: `circ-pot-v-${r}-${v}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um resistor de ${r} Ω está ligado a ${v} V. Quanta potência ele dissipa, em W? (2 casas decimais)`,
    enunciadoTex: `V = ${v}\\ \\text{V} \\qquad R = ${r}\\ \\Omega`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Com a tensão e a resistência: P = V²/R (P = VI com I = V/R).',
          tex: 'P = \\frac{V^{2}}{R}',
        },
        {
          descricao: 'Substituindo.',
          tex: `P = \\frac{${v}^{2}}{${r}} = \\frac{${v * v}}{${r}} = ${tex(gabarito)}\\ \\text{W}`,
        },
      ],
    },
    conceitos: ['circuitos.potencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: v / r,
          diagnostico: `V/R é a CORRENTE. A potência é V·I = V²/R.`,
          passo: 0,
          conceito: 'circuitos.potencia',
        },
        {
          resposta: v * r,
          diagnostico: 'A tensão vai ao quadrado e DIVIDE pela resistência: P = V²/R.',
          passo: 0,
          conceito: 'circuitos.potencia',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `P = V²/R: ${v}² = ${v * v}, dividido por ${r}.`,
  };
}

function equivalente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const valores = [rng.escolher([10, 20, 30, 60]), rng.escolher([15, 20, 40, 60])];
  if (rng.booleano()) valores.push(rng.escolher([10, 30, 60]));
  const tipo = rng.booleano() ? 'serie' : 'paralelo';
  const resolucao = associacaoComPassos(valores, tipo, 'resistor');
  const gabarito = resolucao.resultado;
  const outro = associacaoComPassos(
    valores,
    tipo === 'serie' ? 'paralelo' : 'serie',
    'resistor',
  ).resultado;

  return {
    id: `circ-eq-${tipo}-${valores.join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Resistores de ${valores.join(', ')} Ω estão ligados em ${tipo === 'serie' ? 'SÉRIE' : 'PARALELO'}. ` +
      'Qual é a resistência equivalente, em Ω? (2 casas decimais)',
    enunciadoTex: `${valores.map((v, i) => `R_${i + 1} = ${v}`).join(' \\quad ')} \\quad (\\Omega)`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...resolucao.passos,
        { descricao: 'Portanto:', tex: `R_{eq} = ${tex(gabarito)}\\ \\Omega` },
      ],
    },
    conceitos: ['circuitos.associacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: outro,
          diagnostico:
            'Série e paralelo trocados: resistores em SÉRIE se somam; em PARALELO, somam-se os inversos.',
          passo: 0,
          conceito: 'circuitos.associacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      tipo === 'serie'
        ? `Em série as resistências se somam: ${valores.join(' + ')}.`
        : `Em paralelo: 1/R = 1/${valores.join(' + 1/')}; depois inverta. O resultado é menor que ${Math.min(...valores)} Ω.`,
  };
}

function divisor(nivel: Nivel, rng: Rng): Exercicio<number> {
  const v = rng.escolher([5, 9, 12, 15, 24]);
  const r1 = rng.escolher([1, 2.2, 4.7, 10]);
  const r2 = rng.escolher([1, 3.3, 4.7, 10, 22]);
  const gabarito = (v * r2) / (r1 + r2);

  return {
    id: `circ-div-${v}-${r1}-${r2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Num divisor de tensão, R₁ = ${txt(r1)} kΩ e R₂ = ${txt(r2)} kΩ estão em série com uma fonte de ${v} V. ` +
      'Qual é a tensão sobre R₂, em V? (2 casas decimais)',
    enunciadoTex: `V = ${v}\\ \\text{V} \\qquad R_1 = ${tex(r1)}\\ \\text{k}\\Omega \\qquad R_2 = ${tex(r2)}\\ \\text{k}\\Omega`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'A corrente é a mesma nos dois; cada um fica com a fração da tensão igual à sua fração da resistência.',
          tex: 'V_2 = V\\,\\frac{R_2}{R_1 + R_2}',
        },
        {
          descricao: 'Substituindo (os kΩ se cancelam).',
          tex: `V_2 = ${v} \\cdot \\frac{${tex(r2)}}{${tex(r1)} + ${tex(r2)}} = ${tex(gabarito)}\\ \\text{V}`,
        },
      ],
    },
    conceitos: ['circuitos.associacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: v - gabarito,
          diagnostico: 'Essa é a tensão sobre R₁. Sobre R₂ vai R₂/(R₁ + R₂) da tensão.',
          passo: 1,
          conceito: 'circuitos.associacao',
        },
        {
          resposta: (v * r2) / r1,
          diagnostico: 'O denominador é a resistência TOTAL, R₁ + R₂.',
          passo: 0,
          conceito: 'circuitos.associacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `V₂ = V·R₂/(R₁ + R₂) = ${v}·${txt(r2)}/(${txt(r1)} + ${txt(r2)}).`,
  };
}

/** R₁ em série com (R₂ ∥ R₃), e a corrente da fonte. */
function misto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const r1 = rng.escolher([2, 4, 5, 10]);
  const r2 = rng.escolher([6, 12, 20]);
  const r3 = rng.escolher([3, 6, 12, 30]);
  const v = rng.escolher([6, 9, 12, 24]);
  const paralelo = (r2 * r3) / (r2 + r3);
  const req = r1 + paralelo;
  const gabarito = v / req;

  return {
    id: `circ-misto-${r1}-${r2}-${r3}-${v}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `R₁ = ${r1} Ω está em série com o paralelo de R₂ = ${r2} Ω e R₃ = ${r3} Ω, tudo ligado a ${v} V. ` +
      'Qual corrente sai da fonte, em A? (2 casas decimais)',
    enunciadoTex: `R_1 + (R_2 \\parallel R_3) \\qquad V = ${v}\\ \\text{V}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O paralelo, por produto sobre soma.',
          tex: `R_{23} = \\frac{${r2} \\cdot ${r3}}{${r2} + ${r3}} = ${tex(paralelo)}\\ \\Omega`,
        },
        {
          descricao: 'Em série com R₁, as resistências se somam.',
          tex: `R_{eq} = ${r1} + ${tex(paralelo)} = ${tex(req)}\\ \\Omega`,
        },
        {
          descricao: 'Ohm no circuito inteiro.',
          tex: `I = \\frac{${v}}{${tex(req)}} = ${tex(gabarito)}\\ \\text{A}`,
        },
      ],
    },
    conceitos: ['circuitos.associacao', 'circuitos.ohm'],
    armadilhas: semColisoes(
      [
        {
          resposta: v / (r1 + r2 + r3),
          diagnostico:
            'R₂ e R₃ estão em PARALELO: não se somam, combinam-se por produto sobre soma.',
          passo: 0,
          conceito: 'circuitos.associacao',
        },
        {
          resposta: v / r1,
          diagnostico: 'A fonte vê a resistência equivalente do circuito todo, não só R₁.',
          passo: 2,
          conceito: 'circuitos.ohm',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Reduza de dentro para fora: R₂ ∥ R₃ por produto sobre soma; some R₁ = ${r1}; depois I = ${v}/R_eq.`,
  };
}

/** Uma malha com duas fontes: em oposição ou a favor. */
function malha(nivel: Nivel, rng: Rng): Exercicio<number> {
  const e1 = rng.escolher([9, 12, 18, 24]);
  // e₂ menor que e₁: em oposição, a corrente nunca se anula.
  const e2 = rng.escolher([3, 5, 6]);
  const r1 = rng.escolher([2, 3, 4]);
  const r2 = rng.escolher([1, 2, 5, 6]);
  const oposicao = rng.booleano();
  const gabarito = (oposicao ? e1 - e2 : e1 + e2) / (r1 + r2);

  return {
    id: `circ-malha-${e1}-${e2}-${r1}-${r2}-${oposicao ? 'op' : 'fa'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma única malha tem uma bateria de ${e1} V e outra de ${e2} V ${oposicao ? 'em OPOSIÇÃO (polos se enfrentando)' : 'no MESMO sentido'}, ` +
      `e resistores de ${r1} Ω e ${r2} Ω. Qual é a corrente na malha, em A? (2 casas decimais)`,
    enunciadoTex: `\\varepsilon_1 = ${e1}\\ \\text{V} \\qquad \\varepsilon_2 = ${e2}\\ \\text{V} \\qquad R_1 = ${r1}\\ \\Omega \\qquad R_2 = ${r2}\\ \\Omega`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Kirchhoff das tensões: percorrendo a malha, a soma das fem é igual à soma das quedas RI.',
          tex: `${oposicao ? '\\varepsilon_1 - \\varepsilon_2' : '\\varepsilon_1 + \\varepsilon_2'} = (R_1 + R_2)\\,I`,
        },
        {
          descricao: oposicao
            ? 'Em oposição, as fem se subtraem.'
            : 'No mesmo sentido, as fem se somam.',
          tex: `${e1} ${oposicao ? '-' : '+'} ${e2} = ${r1 + r2}\\,I \\;\\Rightarrow\\; I = ${tex(gabarito)}\\ \\text{A}`,
        },
      ],
    },
    conceitos: ['circuitos.kirchhoff'],
    armadilhas: semColisoes(
      [
        {
          resposta: (oposicao ? e1 + e2 : e1 - e2) / (r1 + r2),
          diagnostico: oposicao
            ? 'Baterias em oposição empurram a corrente em sentidos contrários: as fem se SUBTRAEM.'
            : 'Baterias no mesmo sentido se ajudam: as fem se SOMAM.',
          passo: 1,
          conceito: 'circuitos.kirchhoff',
        },
        {
          resposta: (oposicao ? e1 - e2 : e1 + e2) / r1,
          diagnostico:
            'Os dois resistores estão na mesma malha, em série: a resistência é R₁ + R₂.',
          passo: 0,
          conceito: 'circuitos.kirchhoff',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Some as fem com sinal (${oposicao ? 'em oposição se subtraem' : 'no mesmo sentido se somam'}) e divida pela resistência total ${r1} + ${r2}.`,
  };
}

function tau(nivel: Nivel, rng: Rng): Exercicio<number> {
  const r = rng.escolher([1, 2.2, 4.7, 10, 47, 100]);
  const c = rng.escolher([1, 10, 22, 47, 100]);
  const gabarito = r * c;

  return {
    id: `circ-tau-${r}-${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um circuito RC tem R = ${txt(r)} kΩ e C = ${c} μF. Qual é a constante de tempo, em ms? (2 casas decimais)`,
    enunciadoTex: `R = ${tex(r)}\\ \\text{k}\\Omega \\qquad C = ${c}\\ \\mu\\text{F}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        { descricao: 'A constante de tempo é o produto RC.', tex: '\\tau = RC' },
        {
          descricao: 'kΩ vezes μF: 10³ · 10⁻⁶ = 10⁻³, ou seja, milissegundos.',
          tex: `\\tau = ${tex(r)} \\times 10^{3} \\cdot ${c} \\times 10^{-6} = ${tex(gabarito / 1000)}\\ \\text{s} = ${tex(gabarito)}\\ \\text{ms}`,
          nota: 'Depois de um τ o capacitor tem 63% da carga final; depois de 5τ, mais de 99%.',
        },
      ],
    },
    conceitos: ['circuitos.rc'],
    armadilhas: semColisoes(
      [
        {
          resposta: gabarito / 1000,
          diagnostico: 'Esse valor está em segundos; o pedido é em ms.',
          passo: 1,
          conceito: 'circuitos.rc',
        },
        {
          resposta: r / c,
          diagnostico: 'τ = R·C — produto, não divisão.',
          passo: 0,
          conceito: 'circuitos.rc',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `τ = R·C: ${txt(r)} kΩ vezes ${c} μF dá direto em milissegundos (10³ × 10⁻⁶ = 10⁻³).`,
  };
}

function rc(nivel: Nivel, rng: Rng): Exercicio<number> {
  const r = rng.escolher([10, 20, 47, 100]);
  const c = rng.escolher([10, 22, 47, 100]);
  const v = rng.escolher([5, 9, 12]);
  const tauS = r * c * 1e-3;
  const t = Number((tauS * rng.escolher([0.5, 1, 1.5, 2, 3])).toFixed(3));
  const resolucao = cargaRcComPassos(r, c, v, t);
  const gabarito = resolucao.resultado;

  return {
    id: `circ-rc-${r}-${c}-${v}-${t}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um capacitor de ${c} μF, inicialmente descarregado, é carregado por uma fonte de ${v} V através de ` +
      `${r} kΩ. Qual é a carga dele após ${txt(t)} s, em μC? (2 casas decimais)`,
    enunciadoTex: `q(t) = Q\\left(1 - e^{-t/RC}\\right) \\qquad R = ${r}\\ \\text{k}\\Omega,\\; C = ${c}\\ \\mu\\text{F},\\; V = ${v}\\ \\text{V}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...resolucao.passos,
        { descricao: 'Portanto:', tex: `q = ${tex(gabarito)}\\ \\mu\\text{C}` },
      ],
    },
    conceitos: ['circuitos.rc'],
    armadilhas: semColisoes(
      [
        {
          resposta: c * v * Math.exp(-t / tauS),
          diagnostico: 'Isso é o quanto FALTA carregar. A carga é Q·(1 − e^(−t/τ)).',
          passo: 2,
          conceito: 'circuitos.rc',
        },
        {
          resposta: c * v,
          diagnostico: 'C·V é a carga FINAL, que só se atinge depois de vários τ.',
          passo: 1,
          conceito: 'circuitos.rc',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Calcule τ = R·C = ${r}×10³ · ${c}×10⁻⁶ s e a carga final Q = ${c}·${v} μC; depois q = Q·(1 − e elevado a −t/τ).`,
  };
}

/**
 * Duas malhas com duas fontes e um resistor comum.
 *
 * Pelo potencial V do nó do meio (o outro nó é a referência):
 * (ε₁ − V)/R₁ + (ε₂ − V)/R₂ = V/R₃.
 */
function duasMalhas(nivel: Nivel, rng: Rng): Exercicio<number> {
  const e1 = rng.escolher([6, 9, 12, 18]);
  const e2 = rng.escolher([3, 6, 9, 12]);
  const r1 = rng.escolher([1, 2, 3, 4]);
  const r2 = rng.escolher([2, 3, 6]);
  const r3 = rng.escolher([2, 4, 6, 12]);
  const v = (e1 / r1 + e2 / r2) / (1 / r1 + 1 / r2 + 1 / r3);
  const gabarito = v / r3;

  return {
    id: `circ-2malhas-${e1}-${e2}-${r1}-${r2}-${r3}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Dois ramos com fontes — ${e1} V em série com ${r1} Ω, e ${e2} V em série com ${r2} Ω — estão em paralelo ` +
      `com um resistor de ${r3} Ω (os polos positivos do mesmo lado). Qual corrente atravessa o resistor de ${r3} Ω, ` +
      'em A? (2 casas decimais)',
    enunciadoTex: `(\\varepsilon_1 = ${e1}\\ \\text{V},\\; R_1 = ${r1}\\ \\Omega) \\parallel (\\varepsilon_2 = ${e2}\\ \\text{V},\\; R_2 = ${r2}\\ \\Omega) \\parallel R_3 = ${r3}\\ \\Omega`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Kirchhoff dos nós no nó de cima, com potencial V: o que chega pelos ramos das fontes sai por R₃.',
          tex: `\\frac{${e1} - V}{${r1}} + \\frac{${e2} - V}{${r2}} = \\frac{V}{${r3}}`,
        },
        {
          descricao: 'Isolando V.',
          tex: `V = \\frac{${e1}/${r1} + ${e2}/${r2}}{1/${r1} + 1/${r2} + 1/${r3}} = ${tex(v)}\\ \\text{V}`,
        },
        {
          descricao: 'Ohm no resistor do meio.',
          tex: `I_3 = \\frac{${tex(v)}}{${r3}} = ${tex(gabarito)}\\ \\text{A}`,
        },
      ],
    },
    conceitos: ['circuitos.kirchhoff'],
    armadilhas: semColisoes(
      [
        {
          resposta: (e1 + e2) / (r1 + r2 + r3),
          diagnostico:
            'Não é uma malha só: os três ramos estão em paralelo entre os mesmos dois nós. Use a lei dos nós.',
          passo: 0,
          conceito: 'circuitos.kirchhoff',
        },
        {
          resposta: v,
          diagnostico: `Esse é o potencial do nó (em volts). A corrente em R₃ é V/${r3}.`,
          passo: 2,
          conceito: 'circuitos.kirchhoff',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Chame de V o potencial do nó comum. Lei dos nós: (${e1} − V)/${r1} + (${e2} − V)/${r2} = V/${r3}. Ache V e depois I = V/${r3}.`,
  };
}
