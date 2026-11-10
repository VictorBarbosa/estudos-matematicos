import { Rng } from '@core/treino/rng/rng';
import { numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

/**
 * Congruência, quadriláteros e diagonais.
 *
 * O currículo prometia congruência neste tópico e o gerador não a cobrava; os
 * quadriláteros e as diagonais completam o estudo dos polígonos antes das
 * áreas. Em todas as perguntas a medida vem com unidade (cm ou graus).
 */

type Caso = 'LAL' | 'ALA' | 'LLL' | 'LAAₒ';

const numTex = (v: number): string => String(Number(v.toFixed(2))).replace('.', '{,}');
const numTexto = (v: number): string => String(Number(v.toFixed(2))).replace('.', ',');

/** Congruência: ler a correspondência dos vértices e transportar a medida. */
export function exercicioCongruencia(nivel: Nivel, rng: Rng): Exercicio<number> {
  if (nivel === 'facil') return congruenciaLado(nivel, rng);
  return rng.booleano() ? congruenciaAlgebrica(nivel, rng) : congruenciaAngulo(nivel, rng);
}

function congruenciaLado(nivel: Nivel, rng: Rng): Exercicio<number> {
  const caso = rng.escolher<Caso>(['LAL', 'ALA', 'LLL', 'LAAₒ']);
  const ab = rng.inteiro(4, 12);
  let bc = rng.inteiro(4, 12);
  if (bc === ab) bc += 2;
  const anguloB = rng.inteiro(35, 110);
  return {
    id: `ang-congr-lado-${caso}-${ab}-${bc}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Os triângulos ABC e DEF são congruentes pelo caso ${caso}, com A↔D, B↔E e C↔F. ` +
      `Se AB = ${ab} cm, BC = ${bc} cm e o ângulo B mede ${anguloB}°, quanto mede EF (em cm)?`,
    enunciadoTex:
      '\\triangle ABC \\cong \\triangle DEF \\qquad A \\leftrightarrow D,\\; B \\leftrightarrow E,\\; C \\leftrightarrow F',
    gabarito: bc,
    resolucao: {
      resultado: bc,
      passos: [
        {
          descricao:
            'Em triângulos congruentes, lados correspondentes são iguais. A correspondência vem da ordem das letras.',
          tex: 'E \\leftrightarrow B,\\; F \\leftrightarrow C \\;\\Rightarrow\\; EF \\leftrightarrow BC',
        },
        { descricao: 'Transportamos a medida.', tex: `EF = BC = ${bc}\\ \\text{cm}` },
      ],
    },
    conceitos: ['angulos.congruencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: ab,
          diagnostico:
            'AB corresponde a DE, não a EF. Siga a ordem: E ocupa o lugar de B e F o de C.',
          passo: 0,
          conceito: 'angulos.congruencia',
        },
        {
          resposta: anguloB,
          diagnostico: `${anguloB}° é o ângulo B (que corresponde a E). EF é um lado, medido em cm.`,
          passo: 0,
          conceito: 'angulos.congruencia',
        },
      ],
      bc,
      proximos,
    ),
    dica: 'A ordem das letras dá a correspondência: E corresponde a B e F a C. Então EF corresponde a qual lado de ABC?',
  };
}

function congruenciaAlgebrica(nivel: Nivel, rng: Rng): Exercicio<number> {
  // AB = px + q e DE = rx + s, com x inteiro.
  const x = rng.inteiro(2, 8);
  const p = rng.inteiro(1, 4);
  let r = rng.inteiro(2, 6);
  if (r === p) r += 1;
  const q = rng.inteiro(1, 9);
  const lado = p * x + q;
  const s = lado - r * x;
  const sTex = s >= 0 ? `+ ${s}` : `- ${Math.abs(s)}`;
  const sTexto = s >= 0 ? `+ ${s}` : `− ${Math.abs(s)}`;
  const pTexto = p === 1 ? '' : String(p);
  return {
    id: `ang-congr-alg-${p}${q}${r}${s}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Os triângulos ABC e DEF são congruentes, com A↔D, B↔E e C↔F. Sabendo que ` +
      `AB = ${pTexto}x + ${q} cm e DE = ${r}x ${sTexto} cm, quanto mede AB (em cm)?`,
    enunciadoTex: `AB = ${pTexto}x + ${q} \\qquad DE = ${r}x ${sTex}`,
    gabarito: lado,
    resolucao: {
      resultado: lado,
      passos: [
        {
          descricao: 'AB e DE são lados correspondentes (A↔D, B↔E): têm a mesma medida.',
          tex: `${pTexto}x + ${q} = ${r}x ${sTex}`,
        },
        {
          descricao: 'Resolvendo a equação do 1º grau.',
          tex: `${q - s} = ${r - p}x \\;\\Rightarrow\\; x = ${x}`,
        },
        {
          descricao: 'Substituindo x em AB.',
          tex: `AB = ${p === 1 ? '' : `${p} \\cdot `}${x} + ${q} = ${lado}\\ \\text{cm}`,
        },
      ],
    },
    conceitos: ['angulos.congruencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: x,
          diagnostico: `x = ${x} é o valor da incógnita. A pergunta é a medida de AB: substitua x.`,
          passo: 2,
          conceito: 'angulos.congruencia',
        },
      ],
      lado,
      proximos,
    ),
    dica: 'AB e DE são correspondentes, então são iguais: monte a equação, ache x e substitua em AB.',
  };
}

function congruenciaAngulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(30, 80);
  const e = rng.inteiro(30, 80);
  const f = 180 - a - e;
  return {
    id: `ang-congr-ang-${a}-${e}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Os triângulos ABC e DEF são congruentes, com A↔D, B↔E e C↔F. O ângulo A mede ${a}° ` +
      `e o ângulo E mede ${e}°. Quanto mede o ângulo C? (em graus)`,
    enunciadoTex: `\\hat{A} = ${a}^\\circ \\qquad \\hat{E} = ${e}^\\circ \\qquad \\hat{C} = \\;?`,
    gabarito: f,
    resolucao: {
      resultado: f,
      passos: [
        {
          descricao: 'Ângulos correspondentes são iguais: E corresponde a B.',
          tex: `\\hat{B} = \\hat{E} = ${e}^\\circ`,
        },
        {
          descricao: 'No triângulo ABC, os três ângulos somam 180°.',
          tex: `\\hat{C} = 180^\\circ - ${a}^\\circ - ${e}^\\circ = ${f}^\\circ`,
        },
      ],
    },
    conceitos: ['angulos.congruencia', 'angulos.soma'],
    armadilhas: semColisoes(
      [
        {
          resposta: e,
          diagnostico: 'O ângulo E corresponde a B, não a C. C corresponde a F.',
          passo: 0,
          conceito: 'angulos.congruencia',
        },
        {
          resposta: 180 - a,
          diagnostico: 'Faltou descontar o ângulo B, que é igual ao E pela congruência.',
          passo: 1,
          conceito: 'angulos.soma',
        },
      ],
      f,
      proximos,
    ),
    dica: `O ângulo E corresponde a B, então B também mede ${e}°. Use a soma 180° no triângulo ABC.`,
  };
}

type Quadrilatero = 'quarto-angulo' | 'paralelogramo' | 'trapezio' | 'losango';

/** Propriedades dos quadriláteros, sempre em graus. */
export function exercicioQuadrilatero(nivel: Nivel, rng: Rng): Exercicio<number> {
  const tipo =
    nivel === 'medio'
      ? rng.escolher<Quadrilatero>(['quarto-angulo', 'paralelogramo', 'trapezio'])
      : rng.escolher<Quadrilatero>(['losango', 'trapezio', 'quarto-angulo']);
  const conceitos = ['angulos.quadrilateros'];

  if (tipo === 'quarto-angulo') {
    const a = rng.inteiro(60, 120);
    const b = rng.inteiro(60, 120);
    const c = rng.inteiro(50, Math.min(150, 330 - a - b));
    const d = 360 - a - b - c;
    return {
      id: `ang-quad-quarto-${a}${b}${c}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Três ângulos de um quadrilátero medem ${a}°, ${b}° e ${c}°. Quanto mede o quarto? (em graus)`,
      enunciadoTex: `${a}^\\circ + ${b}^\\circ + ${c}^\\circ + x = 360^\\circ`,
      gabarito: d,
      resolucao: {
        resultado: d,
        passos: [
          {
            descricao:
              'Uma diagonal divide o quadrilátero em dois triângulos: a soma é 2 vezes 180°, ou seja, 360°.',
            tex: 'S = (4 - 2) \\cdot 180^\\circ = 360^\\circ',
          },
          {
            descricao: 'Isolando o quarto ângulo.',
            tex: `x = 360^\\circ - ${a + b + c}^\\circ = ${d}^\\circ`,
          },
        ],
      },
      conceitos,
      armadilhas: semColisoes(
        [
          {
            resposta: 360 - (a + b + c) - 180,
            diagnostico: 'A soma dos ângulos de um QUADRILÁTERO é 360°, não 180°.',
            passo: 0,
            conceito: 'angulos.quadrilateros',
          },
        ],
        d,
        proximos,
      ),
      dica: `Os quatro ângulos de um quadrilátero somam 360°: tire ${a}°, ${b}° e ${c}° de 360°.`,
    };
  }

  if (tipo === 'paralelogramo' || tipo === 'trapezio') {
    const alfa = rng.inteiro(40, 85);
    const resposta = 180 - alfa;
    const enunciado =
      tipo === 'paralelogramo'
        ? `Num paralelogramo, um ângulo mede ${alfa}°. Quanto mede o ângulo vizinho (consecutivo)? (em graus)`
        : `Num trapézio isósceles, cada ângulo da base maior mede ${alfa}°. Quanto mede cada ângulo da base menor? (em graus)`;
    return {
      id: `ang-quad-${tipo}-${alfa}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado,
      enunciadoTex: `\\alpha = ${alfa}^\\circ \\qquad \\beta = \\;?`,
      gabarito: resposta,
      resolucao: {
        resultado: resposta,
        passos: [
          {
            descricao:
              tipo === 'paralelogramo'
                ? 'Lados opostos são paralelos: dois ângulos consecutivos são colaterais internos e somam 180°.'
                : 'As bases são paralelas: o ângulo da base maior e o da base menor do mesmo lado somam 180°.',
            tex: '\\alpha + \\beta = 180^\\circ',
          },
          {
            descricao: 'Isolando β.',
            tex: `\\beta = 180^\\circ - ${alfa}^\\circ = ${resposta}^\\circ`,
          },
        ],
      },
      conceitos,
      armadilhas: semColisoes(
        [
          {
            resposta: alfa,
            diagnostico:
              tipo === 'paralelogramo'
                ? `${alfa}° é o ângulo OPOSTO (opostos são iguais). O consecutivo é o suplementar.`
                : `${alfa}° é o outro ângulo da mesma base. O da base menor é o suplementar.`,
            passo: 0,
            conceito: 'angulos.quadrilateros',
          },
          {
            resposta: 90 - alfa,
            diagnostico:
              'Ângulos entre paralelas cortadas por uma transversal somam 180°, não 90°.',
            passo: 0,
            conceito: 'angulos.quadrilateros',
          },
        ],
        resposta,
        proximos,
      ),
      dica: 'Entre duas paralelas, os dois ângulos do mesmo lado de um lado transversal somam 180°.',
    };
  }

  // Losango: diagonais perpendiculares e bissetrizes dos ângulos.
  const alfa = rng.inteiro(20, 80) * 2;
  const anguloB = 180 - alfa;
  const resposta = anguloB / 2;
  return {
    id: `ang-quad-losango-${alfa}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Num losango ABCD, o ângulo do vértice A mede ${alfa}°. Que ângulo a diagonal BD forma com o lado AB? (em graus)`,
    enunciadoTex: `\\hat{A} = ${alfa}^\\circ \\qquad A\\hat{B}D = \\;?`,
    gabarito: resposta,
    resolucao: {
      resultado: resposta,
      passos: [
        {
          descricao: 'Ângulos consecutivos do losango (um paralelogramo) somam 180°.',
          tex: `\\hat{B} = 180^\\circ - ${alfa}^\\circ = ${anguloB}^\\circ`,
        },
        {
          descricao: 'No losango, cada diagonal corta ao meio os ângulos dos vértices que liga.',
          tex: `A\\hat{B}D = \\frac{${anguloB}^\\circ}{2} = ${numTex(resposta)}^\\circ`,
        },
      ],
    },
    conceitos,
    armadilhas: semColisoes(
      [
        {
          resposta: alfa / 2,
          diagnostico: `${numTexto(alfa / 2)}° é metade do ângulo A, que a diagonal AC corta. BD corta o ângulo B.`,
          passo: 1,
          conceito: 'angulos.quadrilateros',
        },
        {
          resposta: anguloB,
          diagnostico: `${anguloB}° é o ângulo B inteiro. A diagonal BD o divide ao meio.`,
          passo: 1,
          conceito: 'angulos.quadrilateros',
        },
      ],
      resposta,
      proximos,
    ),
    dica: 'O ângulo B mede 180° menos o ângulo A, e a diagonal BD corta o ângulo B ao meio.',
  };
}

/** Diagonais de um polígono regular dado pelo ângulo externo (Médio) ou interno (Extremo). */
export function exercicioDiagonais(nivel: Nivel, rng: Rng): Exercicio<number> {
  const n = rng.escolher([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]);
  const externo = 360 / n;
  const interno = 180 - externo;
  const pelaInterno = nivel === 'extremo';
  const gabarito = (n * (n - 3)) / 2;
  const angulo = pelaInterno ? interno : externo;

  return {
    id: `ang-diag-${n}-${pelaInterno ? 'i' : 'e'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um polígono regular tem ângulo ${pelaInterno ? 'interno' : 'externo'} de ${numTexto(angulo)}°. Quantas diagonais ele tem?`,
    enunciadoTex: `a_${pelaInterno ? 'i' : 'e'} = ${numTex(angulo)}^\\circ`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...(pelaInterno
          ? [
              {
                descricao: 'Primeiro o externo, suplementar do interno.',
                tex: `a_e = 180^\\circ - ${numTex(angulo)}^\\circ = ${numTex(externo)}^\\circ`,
              },
            ]
          : []),
        {
          descricao: 'Os externos somam 360°: o número de lados é 360° dividido pelo externo.',
          tex: `n = \\frac{360^\\circ}{${numTex(externo)}^\\circ} = ${n}`,
        },
        {
          descricao:
            'De cada vértice saem n − 3 diagonais (não para ele mesmo nem para os dois vizinhos); cada diagonal foi contada duas vezes.',
          tex: `d = \\frac{n(n - 3)}{2} = \\frac{${n} \\cdot ${n - 3}}{2} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['angulos.poligono-regular'],
    armadilhas: semColisoes(
      [
        {
          resposta: n * (n - 3),
          diagnostico:
            'Faltou dividir por 2: cada diagonal liga dois vértices e foi contada uma vez em cada ponta.',
          passo: 2,
          conceito: 'angulos.poligono-regular',
        },
        {
          resposta: n,
          diagnostico: `${n} é o número de lados. A pergunta é quantas diagonais: n(n − 3)/2.`,
          passo: 2,
          conceito: 'angulos.poligono-regular',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: pelaInterno
      ? `Passe ao externo (180° − ${numTexto(angulo)}°), ache n = 360° ÷ externo e use d = n(n − 3)/2.`
      : `n = 360° ÷ ${numTexto(angulo)}°. Depois, d = n(n − 3)/2.`,
  };
}
