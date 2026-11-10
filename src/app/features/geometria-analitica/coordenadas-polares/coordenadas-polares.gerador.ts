import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-4);
const dec = (v: number): string => formatar(v).replace(',', '{,}');
const rad = (graus: number): number => (graus * Math.PI) / 180;

type Pergunta = 'para-cartesiano' | 'raio' | 'angulo' | 'circunferencia' | 'distancia' | 'orbita';

/** Ternos pitagóricos: (x, y) com r inteiro. */
const TERNOS: readonly (readonly [number, number, number])[] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
];

/**
 * Coordenadas polares.
 *
 * O ponto descrito por distância e direção, em vez de deslocamentos x e y.
 * Do vaivém com o cartesiano (onde o erro é o quadrante do ângulo) à equação
 * polar da órbita, r = p/(1 + e·cos θ), que é a forma em que a mecânica
 * celeste escreve as cônicas.
 */
export const geradorPolares: GeradorExercicio<number> = {
  topicoId: 'coordenadas-polares',
  formatoResposta: 'um número, ex.: 4,33',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'para-cartesiano':
        return paraCartesiano(nivel, rng);
      case 'raio':
        return raio(nivel, rng);
      case 'angulo':
        return angulo(nivel, rng);
      case 'circunferencia':
        return circunferencia(nivel, rng);
      case 'distancia':
        return distancia(nivel, rng);
      case 'orbita':
        return orbita(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['para-cartesiano', 'raio']);
    case 'medio':
      return rng.escolher<Pergunta>(['angulo', 'para-cartesiano', 'circunferencia']);
    case 'dificil':
      return rng.escolher<Pergunta>(['angulo', 'distancia', 'circunferencia']);
    // A órbita em forma polar e a distância entre dois pontos polares: as duas
    // usam o polar como ferramenta, não só como troca de coordenadas.
    case 'extremo':
      return rng.escolher<Pergunta>(['orbita', 'distancia']);
  }
}

function paraCartesiano(nivel: Nivel, rng: Rng): Exercicio<number> {
  const r = rng.inteiro(2, 12);
  const theta = rng.escolher(
    nivel === 'facil' ? [30, 45, 60, 120, 150] : [135, 210, 240, 300, 330, 225],
  );
  const pedeX = rng.booleano();
  const gabarito = pedeX ? r * Math.cos(rad(theta)) : r * Math.sin(rad(theta));
  const trig = pedeX ? 'cos' : 'sin';
  const valorTrig = pedeX ? Math.cos(rad(theta)) : Math.sin(rad(theta));

  return {
    id: `polar-cart-${r}-${theta}-${pedeX ? 'x' : 'y'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `O ponto tem coordenadas polares (r, θ) = (${r}, ${theta}°). Qual é a coordenada ${pedeX ? 'x' : 'y'}? (2 casas decimais)`,
    enunciadoTex: `(r, \\theta) = (${r},\\; ${theta}^{\\circ}) \\;\\to\\; ${pedeX ? 'x' : 'y'} = \\;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'x é a projeção no eixo horizontal (cosseno) e y no vertical (seno).',
          tex: 'x = r\\cos\\theta \\qquad y = r\\sin\\theta',
        },
        {
          descricao: 'Substituindo r e θ; o sinal vem do quadrante do ângulo.',
          tex: `${pedeX ? 'x' : 'y'} = ${r}\\${trig} ${theta}^{\\circ} = ${r} \\cdot (${dec(valorTrig)}) = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['polares.conversao'],
    armadilhas: semColisoes(
      [
        {
          resposta: pedeX ? r * Math.sin(rad(theta)) : r * Math.cos(rad(theta)),
          diagnostico: pedeX ? 'Esse é o y: x usa o COSSENO.' : 'Esse é o x: y usa o SENO.',
          passo: 0,
          conceito: 'polares.conversao',
        },
        {
          resposta: Math.abs(gabarito),
          diagnostico: `O ângulo ${theta}° está no ${Math.floor(theta / 90) + 1}º quadrante: confira o sinal de ${pedeX ? 'cos' : 'sen'} ali.`,
          passo: 1,
          conceito: 'polares.conversao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? `${pedeX ? 'x = r·cos θ' : 'y = r·sen θ'}: multiplique ${r} pelo ${pedeX ? 'cosseno' : 'seno'} de ${theta}°.`
        : nivel === 'medio'
          ? `${pedeX ? 'x = r·cos θ' : 'y = r·sen θ'}. Em ${theta}° o ${pedeX ? 'cosseno' : 'seno'} tem sinal próprio do quadrante.`
          : undefined,
  };
}

function raio(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [a, b, r] = rng.escolher(TERNOS);
  const x = a * rng.sinal();
  const y = b * rng.sinal();
  return {
    id: `polar-raio-${x}-${y}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é a distância r do ponto (${x}, ${y}) até a origem — a coordenada polar r?`,
    enunciadoTex: `(x, y) = (${x},\\; ${y}) \\;\\to\\; r = \\;?`,
    gabarito: r,
    resolucao: {
      resultado: r,
      passos: [
        {
          descricao: 'r é a hipotenusa do triângulo de catetos |x| e |y|.',
          tex: 'r = \\sqrt{x^{2} + y^{2}}',
        },
        {
          descricao: 'Substituindo; os quadrados apagam os sinais.',
          tex: `r = \\sqrt{(${x})^{2} + (${y})^{2}} = \\sqrt{${a * a} + ${b * b}} = \\sqrt{${r * r}} = ${r}`,
        },
      ],
    },
    conceitos: ['polares.conversao'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.abs(x) + Math.abs(y),
          diagnostico: 'A distância não é a soma dos catetos: é a hipotenusa, √(x² + y²).',
          passo: 0,
          conceito: 'polares.conversao',
        },
        {
          resposta: r * r,
          diagnostico: `Faltou a raiz quadrada: ${r * r} é r², não r.`,
          passo: 1,
          conceito: 'polares.conversao',
        },
      ],
      r,
      proximos,
    ),
    dica: `r = √(x² + y²): some ${Math.abs(x)}² e ${Math.abs(y)}² e tire a raiz.`,
  };
}

/** θ em [0°, 360°) a partir de (x, y), com o quadrante. */
function angulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [a, b] = rng.escolher(TERNOS);
  // No Médio só os quadrantes II e IV, onde arctg(y/x) já engana; no Difícil, os quatro.
  const quadrante = nivel === 'medio' ? rng.escolher([2, 4]) : rng.escolher([1, 2, 3, 4]);
  const x = quadrante === 1 || quadrante === 4 ? a : -a;
  const y = quadrante === 1 || quadrante === 2 ? b : -b;
  const bruto = (Math.atan(y / x) * 180) / Math.PI;
  let gabarito = (Math.atan2(y, x) * 180) / Math.PI;
  if (gabarito < 0) gabarito += 360;
  const ajuste =
    quadrante === 1 ? 'nada a ajustar' : quadrante === 4 ? 'somamos 360°' : 'somamos 180°';

  return {
    id: `polar-angulo-${x}-${y}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é o ângulo polar θ do ponto (${x}, ${y}), em graus, com 0° ≤ θ < 360°? (2 casas decimais)`,
    enunciadoTex: `(x, y) = (${x},\\; ${y}) \\;\\to\\; \\theta = \\;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `O ponto está no ${quadrante}º quadrante (x ${x > 0 ? '>' : '<'} 0, y ${y > 0 ? '>' : '<'} 0).`,
          tex: `\\tan\\theta = \\frac{y}{x} = \\frac{${y}}{${x}}`,
        },
        {
          descricao:
            'A calculadora devolve arctg entre −90° e 90° — só certo nos quadrantes I e IV.',
          tex: `\\arctan\\left(\\frac{${y}}{${x}}\\right) = ${dec(bruto)}^{\\circ}`,
        },
        {
          descricao: `Ajustamos ao quadrante: ${ajuste}.`,
          tex: `\\theta = ${dec(gabarito)}^{\\circ}`,
        },
      ],
    },
    conceitos: ['polares.quadrante'],
    armadilhas: semColisoes(
      [
        {
          resposta: bruto,
          diagnostico: `Esse é o arctg cru. O ponto está no ${quadrante}º quadrante: ${ajuste}.`,
          passo: 2,
          conceito: 'polares.quadrante',
        },
        {
          resposta: bruto < 0 ? bruto + 360 : bruto,
          diagnostico: `O arctg aponta para o quadrante oposto: com x negativo, some 180°, não 360°.`,
          passo: 2,
          conceito: 'polares.quadrante',
        },
        {
          resposta: (Math.atan(x / y) * 180) / Math.PI,
          diagnostico: 'A razão está invertida: tg θ = y/x (oposto sobre adjacente).',
          passo: 0,
          conceito: 'polares.quadrante',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio' || nivel === 'dificil'
        ? `Veja o quadrante pelos sinais de x e y. arctg(${y}/${x}) dá um ângulo entre −90° e 90°; ajuste somando 180° ou 360°.`
        : undefined,
  };
}

/** r = 2a·cos θ (ou sen θ) é uma circunferência de raio a. */
function circunferencia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const d = rng.inteiro(2, 14);
  const cosseno = rng.booleano();
  const gabarito = d / 2;
  const trig = cosseno ? '\\cos' : '\\sin';
  // Na prosa, vírgula decimal comum (a descrição não passa pelo KaTeX).
  const centro = cosseno ? `(${formatar(gabarito)}; 0)` : `(0; ${formatar(gabarito)})`;

  return {
    id: `polar-circ-${d}-${cosseno ? 'c' : 's'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'A curva polar abaixo é uma circunferência. Qual é o raio dela?',
    enunciadoTex: `r = ${d}${trig}\\theta`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Multiplicamos os dois lados por r para usar r² = x² + y².',
          tex: `r^{2} = ${d}\\,r${trig}\\theta \\;\\Rightarrow\\; x^{2} + y^{2} = ${d}${cosseno ? 'x' : 'y'}`,
        },
        {
          descricao: 'Completando o quadrado.',
          tex: cosseno
            ? `\\left(x - ${dec(gabarito)}\\right)^{2} + y^{2} = ${dec(gabarito * gabarito)}`
            : `x^{2} + \\left(y - ${dec(gabarito)}\\right)^{2} = ${dec(gabarito * gabarito)}`,
        },
        {
          descricao: `Centro ${centro} e raio igual à metade de ${d}.`,
          tex: `R = \\sqrt{${dec(gabarito * gabarito)}} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['polares.curvas'],
    armadilhas: semColisoes(
      [
        {
          resposta: d,
          diagnostico: `${d} é o DIÂMETRO: a curva passa pela origem e pelo ponto a ${d} dela, do lado oposto.`,
          passo: 2,
          conceito: 'polares.curvas',
        },
        {
          resposta: gabarito * gabarito,
          diagnostico: 'Esse é R². Falta a raiz.',
          passo: 2,
          conceito: 'polares.curvas',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? `Multiplique por r: r² = ${d}·r·${cosseno ? 'cos' : 'sen'} θ vira x² + y² = ${d}${cosseno ? 'x' : 'y'}. Complete o quadrado.`
        : undefined,
  };
}

/** Distância entre dois pontos polares pela lei dos cossenos. */
function distancia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const r1 = rng.inteiro(2, 10);
  const r2 = rng.inteiro(2, 10);
  const t1 = rng.escolher([0, 30, 45, 60, 90]);
  const t2 = t1 + rng.escolher([30, 60, 90, 120, 150]);
  const dt = t2 - t1;
  const quadrado = r1 * r1 + r2 * r2 - 2 * r1 * r2 * Math.cos(rad(dt));
  const gabarito = Math.sqrt(quadrado);

  return {
    id: `polar-dist-${r1}-${t1}-${r2}-${t2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é a distância entre os pontos polares (${r1}, ${t1}°) e (${r2}, ${t2}°)? (2 casas decimais)`,
    enunciadoTex: `P_1 = (${r1},\\; ${t1}^{\\circ}) \\qquad P_2 = (${r2},\\; ${t2}^{\\circ})`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'A origem e os dois pontos formam um triângulo: lados r₁ e r₂ com o ângulo Δθ entre eles.',
          tex: `d^{2} = r_1^{2} + r_2^{2} - 2r_1r_2\\cos(\\theta_2 - \\theta_1)`,
        },
        {
          descricao: `Δθ = ${t2}° − ${t1}° = ${dt}°.`,
          tex: `d^{2} = ${r1 * r1} + ${r2 * r2} - 2 \\cdot ${r1} \\cdot ${r2} \\cdot ${dec(Math.cos(rad(dt)))} = ${dec(quadrado)}`,
        },
        { descricao: 'Raiz quadrada.', tex: `d = ${dec(gabarito)}` },
      ],
    },
    conceitos: ['polares.conversao'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.abs(r2 - r1),
          diagnostico:
            'Subtrair os r só vale se os pontos estão na mesma direção. Aqui o ângulo entre eles conta.',
          passo: 0,
          conceito: 'polares.conversao',
        },
        {
          resposta: Math.sqrt(r1 * r1 + r2 * r2 + 2 * r1 * r2 * Math.cos(rad(dt))),
          diagnostico: 'Na lei dos cossenos o termo 2r₁r₂cos Δθ é SUBTRAÍDO.',
          passo: 0,
          conceito: 'polares.conversao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'dificil' || nivel === 'extremo'
        ? `Lei dos cossenos no triângulo com a origem: d² = ${r1}² + ${r2}² − 2·${r1}·${r2}·cos ${dt}°.`
        : undefined,
  };
}

/** r = p / (1 + e·cos θ): periélio, afélio ou semieixo maior. */
function orbita(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = rng.escolher([6000, 7000, 8000, 9000, 12000]);
  const e = rng.escolher([0.1, 0.2, 0.25, 0.4, 0.5]);
  const pede = rng.escolher(['perielio', 'afelio', 'semieixo'] as const);
  const peri = p / (1 + e);
  const afe = p / (1 - e);
  const a = (peri + afe) / 2;
  const gabarito = pede === 'perielio' ? peri : pede === 'afelio' ? afe : a;
  const eTex = String(e).replace('.', '{,}');
  const nome = {
    perielio: 'a menor distância (periélio, θ = 0°)',
    afelio: 'a maior distância (afélio, θ = 180°)',
    semieixo: 'o semieixo maior a',
  }[pede];

  return {
    id: `polar-orbita-${p}-${e}-${pede}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `A órbita de um satélite, com o planeta num foco, é r = p/(1 + e·cos θ), em km. Qual é ${nome}? (2 casas decimais)`,
    enunciadoTex: `r = \\frac{${p}}{1 + ${eTex}\\cos\\theta}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Mais perto quando cos θ = 1 (θ = 0°); mais longe quando cos θ = −1 (θ = 180°).',
          tex: `r_{min} = \\frac{${p}}{1 + ${eTex}} = ${dec(peri)} \\qquad r_{max} = \\frac{${p}}{1 - ${eTex}} = ${dec(afe)}`,
        },
        ...(pede === 'semieixo'
          ? [
              {
                descricao: 'O eixo maior vai do periélio ao afélio; o semieixo é a metade.',
                tex: `a = \\frac{r_{min} + r_{max}}{2} = \\frac{${dec(peri)} + ${dec(afe)}}{2} = ${dec(a)}`,
              },
            ]
          : []),
        {
          descricao: 'Portanto:',
          tex: `${pede === 'semieixo' ? 'a' : pede === 'perielio' ? 'r_{min}' : 'r_{max}'} = ${dec(gabarito)}\\ \\text{km}`,
        },
      ],
    },
    conceitos: ['polares.orbita'],
    armadilhas: semColisoes(
      [
        {
          resposta: pede === 'afelio' ? peri : afe,
          diagnostico:
            'Trocou periélio e afélio: com 1 + e·cos θ no denominador, o MAIOR denominador (cos θ = 1) dá o MENOR r.',
          passo: 0,
          conceito: 'polares.orbita',
        },
        {
          resposta: p,
          diagnostico:
            'p é a distância em θ = 90° (o semilatus rectum), não o periélio nem o afélio.',
          passo: 0,
          conceito: 'polares.orbita',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'O mais perto é com cos θ = 1 e o mais longe com cos θ = −1: substitua e calcule p/(1 + e) e p/(1 − e).',
  };
}
