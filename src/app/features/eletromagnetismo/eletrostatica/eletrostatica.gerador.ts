import { K_COULOMB, campoPontualComPassos, coulombComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-4);

/** Número para o LaTeX, com vírgula decimal. */
const tex = (v: number): string => formatar(v).replace(',', '{,}');
/** Número para a prosa. */
const txt = (v: number): string => String(v).replace('.', ',');
const par = (v: number): string => (v < 0 ? `(${txt(v)})` : txt(v));

type Pergunta =
  | 'forca'
  | 'campo'
  | 'forca-em-cm'
  | 'forca-no-campo'
  | 'escala'
  | 'linha'
  | 'perpendicular'
  | 'ponto-nulo';

/**
 * Eletrostática: Coulomb, campo e superposição.
 *
 * Os erros que o tópico existe para desfazer: esquecer de elevar r ao
 * quadrado, não converter μC e cm, somar módulos de forças em sentidos
 * opostos e somar direto forças perpendiculares.
 */
export const geradorEletrostatica: GeradorExercicio<number> = {
  topicoId: 'eletrostatica',
  formatoResposta: 'um número, ex.: 3,6 ou -1,25',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'forca':
        return forca(nivel, rng, false);
      case 'forca-em-cm':
        return forca(nivel, rng, true);
      case 'campo':
        return campo(nivel, rng);
      case 'forca-no-campo':
        return forcaNoCampo(nivel, rng);
      case 'escala':
        return escala(nivel, rng);
      case 'linha':
        return linha(nivel, rng);
      case 'perpendicular':
        return perpendicular(nivel, rng);
      case 'ponto-nulo':
        return pontoNulo(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['forca', 'campo']);
    case 'medio':
      return rng.escolher<Pergunta>(['forca-em-cm', 'forca-no-campo', 'campo']);
    case 'dificil':
      return rng.escolher<Pergunta>(['linha', 'escala', 'forca-em-cm']);
    // Forças perpendiculares (soma vetorial) e o ponto de campo nulo (raiz
    // de uma proporção): as duas pedem montar a geometria antes da conta.
    case 'extremo':
      return rng.escolher<Pergunta>(['perpendicular', 'ponto-nulo']);
  }
}

function forca(nivel: Nivel, rng: Rng, emCm: boolean): Exercicio<number> {
  const q1 = rng.inteiro(1, 9) * (emCm && rng.booleano() ? -1 : 1);
  const q2 = rng.inteiro(1, 9) * rng.sinal();
  const rCm = emCm ? rng.escolher([5, 10, 15, 20, 25, 30]) : rng.escolher([10, 20, 30, 40, 50]);
  const r = rCm / 100;
  const resolucao = coulombComPassos(q1, q2, r);
  const gabarito = Math.abs(resolucao.resultado);
  const distancia = emCm ? `${rCm} cm` : `${txt(r)} m`;

  return {
    id: `elet-forca-${q1}-${q2}-${rCm}-${emCm ? 'cm' : 'm'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Duas cargas pontuais, q₁ = ${par(q1)} μC e q₂ = ${par(q2)} μC, estão a ${distancia} uma da outra. ` +
      'Qual é o módulo da força elétrica entre elas, em newtons? (2 casas decimais)',
    enunciadoTex: `q_1 = ${q1}\\ \\mu\\text{C} \\qquad q_2 = ${q2}\\ \\mu\\text{C} \\qquad r = ${emCm ? `${rCm}\\ \\text{cm}` : `${tex(r)}\\ \\text{m}`}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...(emCm
          ? [
              {
                descricao: 'A distância vai em metros.',
                tex: `r = ${rCm}\\ \\text{cm} = ${tex(r)}\\ \\text{m}`,
              },
            ]
          : []),
        ...resolucao.passos,
        {
          descricao: q1 * q2 > 0 ? 'O módulo da força (repulsão).' : 'O módulo da força (atração).',
          tex: `|F| = ${tex(gabarito)}\\ \\text{N}`,
        },
      ],
    },
    conceitos: ['eletrostatica.coulomb'],
    armadilhas: semColisoes(
      [
        {
          resposta: gabarito * r,
          diagnostico: 'A distância entra AO QUADRADO na lei de Coulomb: divida por r², não por r.',
          passo: 0,
          conceito: 'eletrostatica.coulomb',
        },
        ...(emCm
          ? [
              {
                resposta: gabarito / 1e4,
                diagnostico: `Faltou passar ${rCm} cm para ${txt(r)} m: com r em centímetros, r² fica 10 000 vezes maior.`,
                passo: 0,
                conceito: 'eletrostatica.coulomb',
              },
            ]
          : []),
        {
          resposta: (K_COULOMB * Math.abs(q1 * q2)) / (r * r) / 1e6,
          diagnostico: 'Cada carga leva 10⁻⁶: o produto q₁q₂ leva 10⁻¹², não 10⁻⁶.',
          passo: 1,
          conceito: 'eletrostatica.coulomb',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `F = k·q₁·q₂/r², com k = 8,99×10⁹, as cargas em coulombs (×10⁻⁶) e r em metros, ao quadrado: (${txt(r)})².`,
  };
}

function campo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = rng.inteiro(1, 12) * rng.sinal();
  const rCm = rng.escolher([10, 20, 25, 30, 40, 50, 60]);
  const r = rCm / 100;
  const resolucao = campoPontualComPassos(q, r);
  const gabarito = resolucao.resultado / 1000;

  return {
    id: `elet-campo-${q}-${rCm}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é a intensidade do campo elétrico criado por uma carga de ${par(q)} μC a ${txt(r)} m dela, ` +
      'em kN/C? (2 casas decimais)',
    enunciadoTex: `q = ${q}\\ \\mu\\text{C} \\qquad r = ${tex(r)}\\ \\text{m} \\qquad E = \\;?\\ \\text{kN/C}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...resolucao.passos,
        { descricao: 'Em kN/C (dividindo por 1000).', tex: `E = ${tex(gabarito)}\\ \\text{kN/C}` },
      ],
    },
    conceitos: ['eletrostatica.campo'],
    armadilhas: semColisoes(
      [
        {
          resposta: gabarito * r,
          diagnostico: 'O campo de uma carga pontual cai com r², não com r.',
          passo: 0,
          conceito: 'eletrostatica.campo',
        },
        {
          resposta: -gabarito,
          diagnostico:
            'A intensidade (módulo) é positiva; o sinal da carga só diz se o campo aponta para fora ou para dentro.',
          passo: 1,
          conceito: 'eletrostatica.campo',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `E = k·|q|/r²: ${txt(Math.abs(q))}×10⁻⁶ vezes 8,99×10⁹, dividido por (${txt(r)})². Depois divida por 1000 para kN/C.`,
  };
}

function forcaNoCampo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = rng.inteiro(1, 9) * rng.sinal();
  const e = rng.escolher([500, 1200, 2000, 2500, 4000, 5000, 8000]);
  const gabarito = Math.abs(q) * 1e-6 * e * 1000;

  return {
    id: `elet-forca-campo-${q}-${e}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma carga de ${par(q)} μC é colocada num campo elétrico uniforme de ${e} N/C. ` +
      'Qual é o módulo da força sobre ela, em mN? (2 casas decimais)',
    enunciadoTex: `q = ${q}\\ \\mu\\text{C} \\qquad E = ${e}\\ \\text{N/C}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        { descricao: 'No campo, a força é carga vezes campo.', tex: 'F = |q|\\,E' },
        {
          descricao: 'Substituindo, com a carga em coulombs.',
          tex: `F = ${Math.abs(q)} \\times 10^{-6} \\cdot ${e} = ${tex(gabarito / 1000)}\\ \\text{N} = ${tex(gabarito)}\\ \\text{mN}`,
          nota:
            q > 0
              ? 'Carga positiva: força no sentido do campo.'
              : 'Carga negativa: força no sentido OPOSTO ao do campo.',
        },
      ],
    },
    conceitos: ['eletrostatica.campo'],
    armadilhas: semColisoes(
      [
        {
          resposta: gabarito / 1000,
          diagnostico: 'Esse é o valor em newtons; o enunciado pede mN (multiplique por 1000).',
          passo: 1,
          conceito: 'eletrostatica.campo',
        },
        {
          resposta: Math.abs(q) * e,
          diagnostico: 'Faltou converter a carga: 1 μC = 10⁻⁶ C.',
          passo: 1,
          conceito: 'eletrostatica.campo',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `F = q·E: ${txt(Math.abs(q))}×10⁻⁶ C vezes ${e} N/C dá newtons; para mN, multiplique por 1000.`,
  };
}

/** Por quanto a força se multiplica quando as cargas e a distância mudam. */
function escala(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.escolher([1, 2, 3, 4]);
  const b = rng.escolher([1, 2, 3]);
  const d = rng.escolher([2, 3, 4, 0.5]);
  const gabarito = (a * b) / (d * d);
  const fracao = !Number.isInteger(gabarito);

  return {
    id: `elet-escala-${a}-${b}-${d}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma carga é multiplicada por ${a}, a outra por ${b}, e a distância entre elas é multiplicada por ` +
      `${txt(d)}. Por quanto fica multiplicada a força?` +
      (fracao ? ' Responda como fração ou com 2 casas decimais.' : ''),
    enunciadoTex: `q_1 \\to ${a}q_1 \\qquad q_2 \\to ${b}q_2 \\qquad r \\to ${tex(d)}r`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A força é proporcional ao produto das cargas e a 1/r².',
          tex: 'F \\propto \\frac{q_1 q_2}{r^{2}}',
        },
        {
          descricao: 'Aplicamos os fatores: o da distância vai ao quadrado no denominador.',
          tex: `\\frac{F'}{F} = \\frac{${a} \\cdot ${b}}{(${tex(d)})^{2}} = \\frac{${a * b}}{${tex(d * d)}} = ${tex(gabarito)}`,
        },
      ],
    },
    conceitos: ['eletrostatica.coulomb'],
    armadilhas: semColisoes(
      [
        {
          resposta: (a * b) / d,
          diagnostico: `A distância entra ao quadrado: divida por ${txt(d)}², não por ${txt(d)}.`,
          passo: 1,
          conceito: 'eletrostatica.coulomb',
        },
        {
          resposta: a * b * d * d,
          diagnostico:
            'Afastar as cargas ENFRAQUECE a força: o fator da distância divide, não multiplica.',
          passo: 1,
          conceito: 'eletrostatica.coulomb',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `A força é proporcional a q₁·q₂ e inversamente a r²: multiplique ${a} por ${b} e divida por ${txt(d)}².`,
  };
}

/** Três cargas em linha: força resultante sobre a do meio, com sinal (+ para a direita). */
function linha(nivel: Nivel, rng: Rng): Exercicio<number> {
  const qa = rng.inteiro(1, 6) * rng.sinal();
  const qm = rng.inteiro(1, 5);
  const qb = rng.inteiro(1, 6) * rng.sinal();
  const da = rng.escolher([0.1, 0.2, 0.3]);
  const db = rng.escolher([0.1, 0.2, 0.3, 0.4]);
  // Força de A (à esquerda) sobre o meio: + (para a direita) se repulsão.
  const fa = (K_COULOMB * qa * 1e-6 * qm * 1e-6) / (da * da);
  // Força de B (à direita) sobre o meio: repulsão empurra para a esquerda (−).
  const fb = -(K_COULOMB * qb * 1e-6 * qm * 1e-6) / (db * db);
  const gabarito = fa + fb;

  return {
    id: `elet-linha-${qa}-${qm}-${qb}-${da}-${db}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Três cargas estão numa reta: A = ${par(qa)} μC à esquerda, M = ${qm} μC no meio e B = ${par(qb)} μC ` +
      `à direita. M está a ${txt(da)} m de A e a ${txt(db)} m de B. Qual é a força resultante sobre M, em N, ` +
      'com sinal positivo para a direita? (2 casas decimais)',
    enunciadoTex: `A\\,(${qa}\\ \\mu\\text{C}) \\;\\xleftrightarrow{${tex(da)}\\ \\text{m}}\\; M\\,(${qm}\\ \\mu\\text{C}) \\;\\xleftrightarrow{${tex(db)}\\ \\text{m}}\\; B\\,(${qb}\\ \\mu\\text{C})`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Força de A sobre M: ${qa * qm > 0 ? 'repulsão, empurra M para a DIREITA' : 'atração, puxa M para a ESQUERDA'}.`,
          tex: `F_A = 8{,}99 \\times 10^{9} \\cdot \\frac{${Math.abs(qa)} \\times 10^{-6} \\cdot ${qm} \\times 10^{-6}}{(${tex(da)})^{2}} = ${tex(Math.abs(fa))}\\ \\text{N} \\;\\Rightarrow\\; ${fa >= 0 ? '+' : '-'}${tex(Math.abs(fa))}`,
        },
        {
          descricao: `Força de B sobre M: ${qb * qm > 0 ? 'repulsão, empurra M para a ESQUERDA' : 'atração, puxa M para a DIREITA'}.`,
          tex: `F_B = 8{,}99 \\times 10^{9} \\cdot \\frac{${Math.abs(qb)} \\times 10^{-6} \\cdot ${qm} \\times 10^{-6}}{(${tex(db)})^{2}} = ${tex(Math.abs(fb))}\\ \\text{N} \\;\\Rightarrow\\; ${fb >= 0 ? '+' : '-'}${tex(Math.abs(fb))}`,
        },
        {
          descricao: 'A resultante é a soma com sinais (superposição).',
          tex: `F = ${tex(fa)} ${fb >= 0 ? '+' : '-'} ${tex(Math.abs(fb))} = ${tex(gabarito)}\\ \\text{N}`,
        },
      ],
    },
    conceitos: ['eletrostatica.superposicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.abs(fa) + Math.abs(fb),
          diagnostico:
            'Somar os módulos só vale se as duas forças apontam para o mesmo lado. Veja o sentido de cada uma.',
          passo: 2,
          conceito: 'eletrostatica.superposicao',
        },
        {
          resposta: -gabarito,
          diagnostico:
            'Sentido trocado: cargas de mesmo sinal se REPELEM — a força de A sobre M aponta para longe de A.',
          passo: 0,
          conceito: 'eletrostatica.superposicao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'Calcule a força de A e a de B sobre M separadamente; dê a cada uma o sinal do seu sentido (repulsão afasta, atração aproxima) e some.',
  };
}

/** Duas forças perpendiculares sobre uma carga num vértice de ângulo reto. */
function perpendicular(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = rng.inteiro(1, 5);
  const q1 = rng.inteiro(1, 8);
  const q2 = rng.inteiro(1, 8);
  const d1 = rng.escolher([0.2, 0.3, 0.4]);
  const d2 = rng.escolher([0.2, 0.3, 0.4, 0.5]);
  const f1 = (K_COULOMB * q * q1 * 1e-12) / (d1 * d1);
  const f2 = (K_COULOMB * q * q2 * 1e-12) / (d2 * d2);
  const gabarito = Math.hypot(f1, f2);

  return {
    id: `elet-perp-${q}-${q1}-${q2}-${d1}-${d2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma carga de ${q} μC está no vértice do ângulo reto de um triângulo. Sobre um cateto, a ${txt(d1)} m, ` +
      `há uma carga de ${q1} μC; sobre o outro, a ${txt(d2)} m, uma de ${q2} μC. Qual é o módulo da força ` +
      'resultante sobre a primeira, em N? (2 casas decimais)',
    enunciadoTex: `F_1 \\perp F_2 \\qquad r_1 = ${tex(d1)}\\ \\text{m} \\qquad r_2 = ${tex(d2)}\\ \\text{m}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Cada força pela lei de Coulomb.',
          tex: `F_1 = \\frac{8{,}99 \\times 10^{9} \\cdot ${q} \\cdot ${q1} \\times 10^{-12}}{(${tex(d1)})^{2}} = ${tex(f1)} \\qquad F_2 = \\frac{8{,}99 \\times 10^{9} \\cdot ${q} \\cdot ${q2} \\times 10^{-12}}{(${tex(d2)})^{2}} = ${tex(f2)}`,
        },
        {
          descricao: 'As forças são perpendiculares: a resultante é a hipotenusa.',
          tex: `F = \\sqrt{(${tex(f1)})^{2} + (${tex(f2)})^{2}} = ${tex(gabarito)}\\ \\text{N}`,
        },
      ],
    },
    conceitos: ['eletrostatica.superposicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: f1 + f2,
          diagnostico: 'Forças perpendiculares não se somam direto: a resultante é √(F₁² + F₂²).',
          passo: 1,
          conceito: 'eletrostatica.superposicao',
        },
        {
          resposta: Math.abs(f1 - f2),
          diagnostico:
            'Subtrair só vale para forças em sentidos opostos na mesma reta. Aqui elas formam 90°.',
          passo: 1,
          conceito: 'eletrostatica.superposicao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'Calcule F₁ e F₂ por Coulomb; como são perpendiculares, a resultante é √(F₁² + F₂²), como num triângulo retângulo.',
  };
}

/** Entre duas cargas positivas, o ponto onde o campo se anula. */
function pontoNulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [q1, q2] = rng.escolher([
    [1, 4],
    [4, 1],
    [1, 9],
    [9, 4],
    [4, 9],
    [2, 8],
    [1, 2],
  ] as const);
  const d = rng.escolher([30, 40, 60, 90, 120]);
  // k q1 / x² = k q2 / (d − x)² ⇒ (d − x)/x = √(q2/q1) ⇒ x = d / (1 + √(q2/q1))
  const raiz = Math.sqrt(q2 / q1);
  const gabarito = d / (1 + raiz);

  return {
    id: `elet-nulo-${q1}-${q2}-${d}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Duas cargas positivas, de ${q1} μC e ${q2} μC, estão a ${d} cm uma da outra. A que distância da carga de ` +
      `${q1} μC, entre elas, o campo elétrico é nulo, em cm? (2 casas decimais)`,
    enunciadoTex: `q_1 = ${q1}\\ \\mu\\text{C} \\qquad q_2 = ${q2}\\ \\mu\\text{C} \\qquad d = ${d}\\ \\text{cm}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Entre duas cargas positivas os campos apontam em sentidos opostos: o nulo é onde os módulos se igualam.',
          tex: `\\frac{k\\,q_1}{x^{2}} = \\frac{k\\,q_2}{(${d} - x)^{2}}`,
        },
        {
          descricao:
            'O k se cancela; tirando a raiz dos dois lados (tudo positivo entre as cargas).',
          tex: `\\frac{${d} - x}{x} = \\sqrt{\\frac{${q2}}{${q1}}} = ${tex(raiz)}`,
        },
        {
          descricao: 'Isolando x.',
          tex: `x = \\frac{${d}}{1 + ${tex(raiz)}} = ${tex(gabarito)}\\ \\text{cm}`,
          nota: 'O ponto fica mais perto da carga MENOR — a maior precisa de mais distância para enfraquecer.',
        },
      ],
    },
    conceitos: ['eletrostatica.campo', 'eletrostatica.superposicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: d - gabarito,
          diagnostico: `Essa é a distância até a carga de ${q2} μC. O pedido é a partir da de ${q1} μC.`,
          passo: 2,
          conceito: 'eletrostatica.campo',
        },
        {
          resposta: (d * q1) / (q1 + q2),
          diagnostico:
            'O campo cai com o QUADRADO da distância: a divisão é pela raiz da razão das cargas, não pela razão.',
          passo: 1,
          conceito: 'eletrostatica.campo',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Iguale k·${q1}/x² a k·${q2}/(${d} − x)² e tire a raiz dos dois lados: (${d} − x)/x = √(${q2}/${q1}).`,
  };
}
