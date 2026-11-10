import { paraRadianos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;
const tex2 = (v: number): string => v.toFixed(2).replace('.', '{,}');

/**
 * Triângulos notáveis: 30-60-90 e 45-45-90, com o lado pedido na forma exata.
 *
 * O ponto é reconhecer as proporções 1 : √3 : 2 e 1 : 1 : √2 sem calculadora —
 * a resposta aceita a raiz escrita (5√3) ou o decimal.
 */
export function exercicioNotavel(nivel: Nivel, rng: Rng): Exercicio<number> {
  const tipo = rng.escolher(['30-60-90', '45-45-90'] as const);
  const k = rng.inteiro(2, 12);

  if (tipo === '45-45-90') {
    // Catetos k, hipotenusa k√2. Pergunta a hipotenusa ou, no Médio, o cateto dada a hipotenusa.
    const pedeCateto = nivel !== 'facil' && rng.booleano();
    const gabarito = pedeCateto ? k : k * Math.SQRT2;
    return {
      id: `triangulo-notavel-45-${k}-${pedeCateto ? 'c' : 'h'}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: pedeCateto
        ? `Um triângulo retângulo isósceles (ângulos de 45°) tem hipotenusa ${k}√2 cm. Quanto mede cada cateto, em cm?`
        : `Um triângulo retângulo isósceles (ângulos de 45°) tem catetos de ${k} cm. Quanto mede a hipotenusa, em cm? (forma exata, ex.: 3√2, ou 2 casas decimais)`,
      enunciadoTex: pedeCateto
        ? `45^{\\circ}\\text{-}45^{\\circ}\\text{-}90^{\\circ} \\qquad h = ${k}\\sqrt{2}\\ \\text{cm}`
        : `45^{\\circ}\\text{-}45^{\\circ}\\text{-}90^{\\circ} \\qquad c = ${k}\\ \\text{cm}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'No triângulo de 45°, os lados estão na proporção 1 : 1 : √2.',
            tex: 'c : c : h = 1 : 1 : \\sqrt{2}',
            nota: 'É metade de um quadrado: a hipotenusa é a diagonal, lado vezes √2.',
          },
          pedeCateto
            ? {
                descricao: 'Dividimos a hipotenusa por √2.',
                tex: `c = \\frac{${k}\\sqrt{2}}{\\sqrt{2}} = ${k}`,
              }
            : {
                descricao: 'Multiplicamos o cateto por √2.',
                tex: `h = ${k}\\sqrt{2} \\approx ${tex2(gabarito)}`,
              },
        ],
      },
      conceitos: ['triangulo.notaveis'],
      armadilhas: semColisoes(
        [
          {
            resposta: pedeCateto ? k * Math.SQRT2 : k,
            diagnostico: pedeCateto
              ? 'A hipotenusa é o lado MAIOR: o cateto é ela dividida por √2, não multiplicada.'
              : 'No triângulo de 45° os dois catetos são iguais, mas a hipotenusa é maior: cateto vezes √2.',
            passo: 1,
            conceito: 'triangulo.notaveis',
          },
          {
            resposta: pedeCateto ? (k * Math.SQRT2) / 2 : 2 * k,
            diagnostico:
              'A proporção 1 : 1 : √2 é a do triângulo de 45°; 1 : √3 : 2 é a do 30-60-90.',
            passo: 0,
            conceito: 'triangulo.notaveis',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: pedeCateto
        ? `No triângulo de 45° a hipotenusa é o cateto vezes √2. Aqui ela é ${k}√2.`
        : `No triângulo de 45° a hipotenusa é o cateto vezes √2: ${k} vezes √2.`,
    };
  }

  // 30-60-90: lados k (oposto a 30°), k√3 (oposto a 60°), 2k (hipotenusa).
  const pedido = rng.escolher(['curto', 'longo'] as const);
  const gabarito = pedido === 'curto' ? k : k * Math.sqrt(3);
  const h = 2 * k;
  return {
    id: `triangulo-notavel-30-${k}-${pedido}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Num triângulo retângulo com ângulos de 30° e 60°, a hipotenusa mede ${h} cm. ` +
      `Quanto mede o cateto oposto ao ângulo de ${pedido === 'curto' ? '30°' : '60°'}, em cm?` +
      (pedido === 'longo' ? ' (forma exata, ex.: 4√3, ou 2 casas decimais)' : ''),
    enunciadoTex: `30^{\\circ}\\text{-}60^{\\circ}\\text{-}90^{\\circ} \\qquad h = ${h}\\ \\text{cm}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'No 30-60-90, os lados estão na proporção 1 : √3 : 2 (oposto a 30°, oposto a 60°, hipotenusa).',
          tex: '\\text{oposto a }30^{\\circ} : \\text{oposto a }60^{\\circ} : h = 1 : \\sqrt{3} : 2',
          nota: 'É metade de um triângulo equilátero: o lado menor é metade da hipotenusa.',
        },
        {
          descricao: `A hipotenusa ${h} corresponde ao 2: a unidade vale ${k}.`,
          tex: `2 \\to ${h} \\;\\Rightarrow\\; 1 \\to ${k}`,
        },
        pedido === 'curto'
          ? { descricao: 'O cateto oposto a 30° é a unidade.', tex: `c = ${k}` }
          : {
              descricao: 'O cateto oposto a 60° é a unidade vezes √3.',
              tex: `c = ${k}\\sqrt{3} \\approx ${tex2(gabarito)}`,
            },
      ],
    },
    conceitos: ['triangulo.notaveis'],
    armadilhas: semColisoes(
      [
        {
          resposta: pedido === 'curto' ? k * Math.sqrt(3) : k,
          diagnostico:
            'Ao menor ângulo (30°) se opõe o menor lado. O oposto a 60° é o maior cateto, √3 vezes o outro.',
          passo: 0,
          conceito: 'triangulo.notaveis',
        },
        {
          resposta: pedido === 'curto' ? h / Math.sqrt(3) : h * Math.sqrt(3),
          diagnostico: `A hipotenusa é o 2 da proporção, não o 1: a unidade é ${h} ÷ 2 = ${k}.`,
          passo: 1,
          conceito: 'triangulo.notaveis',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `No 30-60-90 o cateto oposto a 30° é metade da hipotenusa (${h} ÷ 2), e o oposto a 60° é esse valor vezes √3.`,
  };
}

/**
 * A altura de um prédio pela sombra ou pelo ângulo de elevação.
 *
 * A tangente fora do papel: o cateto oposto é a altura, o adjacente é a
 * distância no chão. No Difícil, o observador tem altura própria a somar.
 */
export function exercicioAltura(nivel: Nivel, rng: Rng): Exercicio<number> {
  const angulo = rng.escolher([25, 30, 35, 40, 50, 55, 60, 65]);
  const distancia = rng.inteiro(10, 80);
  const olho = nivel === 'dificil' ? rng.escolher([1.5, 1.6, 1.7, 1.8]) : 0;
  const tg = Math.tan(paraRadianos(angulo));
  const subida = distancia * tg;
  const gabarito = subida + olho;

  return {
    id: `triangulo-altura-${angulo}-${distancia}-${olho}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      olho > 0
        ? `Uma pessoa, com os olhos a ${String(olho).replace('.', ',')} m do chão, está a ${distancia} m de um prédio e vê o topo sob um ângulo de elevação de ${angulo}°. Qual é a altura do prédio, em metros? (2 casas decimais)`
        : `Um poste projeta uma sombra de ${distancia} m quando os raios do sol fazem ${angulo}° com o chão. Qual é a altura do poste, em metros? (2 casas decimais)`,
    enunciadoTex: `\\tan ${angulo}^{\\circ} = \\frac{\\text{altura}}{${distancia}\\ \\text{m}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'A altura é o cateto OPOSTO ao ângulo e a distância no chão é o ADJACENTE: a razão é a tangente.',
          tex: `\\tan ${angulo}^{\\circ} = \\frac{h}{${distancia}} \\;\\Rightarrow\\; h = ${distancia} \\cdot \\tan ${angulo}^{\\circ}`,
        },
        {
          descricao: 'Calculando.',
          tex: `h = ${distancia} \\cdot ${tg.toFixed(4).replace('.', '{,}')} = ${tex2(subida)}\\ \\text{m}`,
        },
        ...(olho > 0
          ? [
              {
                descricao: `O ângulo foi medido da altura dos olhos: somamos os ${String(olho).replace('.', ',')} m.`,
                tex: `${tex2(subida)} + ${tex2(olho)} = ${tex2(gabarito)}\\ \\text{m}`,
              },
            ]
          : []),
      ],
    },
    conceitos: ['triangulo.razoes', 'triangulo.elevacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: distancia * Math.sin(paraRadianos(angulo)) + olho,
          diagnostico:
            'O seno usaria a hipotenusa (a linha de visada), que não foi dada. Com a distância no chão, que é o cateto adjacente, a razão é a tangente.',
          passo: 0,
          conceito: 'triangulo.razoes',
        },
        {
          resposta: distancia / tg + olho,
          diagnostico:
            'Ficou invertido: tg = altura ÷ distância, então a altura é distância VEZES tg.',
          passo: 0,
          conceito: 'triangulo.razoes',
        },
        ...(olho > 0
          ? [
              {
                resposta: subida,
                diagnostico: `Faltou somar a altura dos olhos (${String(olho).replace('.', ',')} m): o triângulo começa nela, não no chão.`,
                passo: 2,
                conceito: 'triangulo.elevacao',
              },
            ]
          : []),
      ],
      gabarito,
      proximos,
    ),
    dica:
      olho > 0
        ? `A altura acima dos olhos é ${distancia}·tg ${angulo}°; depois some a altura dos olhos.`
        : `A altura é o cateto oposto e a sombra, o adjacente: altura = ${distancia}·tg ${angulo}°.`,
  };
}

/**
 * Dois pontos de observação: o clássico de vestibular em que a distância ao
 * prédio não é conhecida, só o quanto se andou entre as duas medidas.
 *
 * h = d·tg α·tg β / (tg β − tg α), com β o ângulo mais perto (maior).
 */
export function exercicioDuasVisadas(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [alfa, beta] = rng.escolher([
    [30, 60],
    [30, 45],
    [45, 60],
    [20, 40],
    [35, 55],
  ] as const);
  const d = rng.inteiro(20, 80);
  const ta = Math.tan(paraRadianos(alfa));
  const tb = Math.tan(paraRadianos(beta));
  const gabarito = (d * ta * tb) / (tb - ta);
  const x = gabarito / tb;

  return {
    id: `triangulo-duas-${alfa}-${beta}-${d}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `De um ponto A, o topo de uma torre é visto sob ${alfa}°. Andando ${d} m em direção à torre, ` +
      `até B, o ângulo passa a ${beta}°. Qual é a altura da torre, em metros? (2 casas decimais)`,
    enunciadoTex: `\\tan ${alfa}^{\\circ} = \\frac{h}{x + ${d}} \\qquad \\tan ${beta}^{\\circ} = \\frac{h}{x}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Com x a distância de B até a torre, as duas visadas dão duas equações.',
          tex: `h = x\\tan ${beta}^{\\circ} \\qquad h = (x + ${d})\\tan ${alfa}^{\\circ}`,
        },
        {
          descricao: 'Igualando e isolando x.',
          tex: `x(\\tan ${beta}^{\\circ} - \\tan ${alfa}^{\\circ}) = ${d}\\tan ${alfa}^{\\circ} \\;\\Rightarrow\\; x = \\frac{${d} \\cdot ${ta.toFixed(4).replace('.', '{,}')}}{${tb.toFixed(4).replace('.', '{,}')} - ${ta.toFixed(4).replace('.', '{,}')}} = ${tex2(x)}\\ \\text{m}`,
        },
        {
          descricao: 'A altura pela visada de B.',
          tex: `h = ${tex2(x)} \\cdot ${tb.toFixed(4).replace('.', '{,}')} = ${tex2(gabarito)}\\ \\text{m}`,
        },
      ],
    },
    conceitos: ['triangulo.elevacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: d * tb,
          diagnostico: `${d} m é quanto se andou, não a distância de B até a torre. É preciso montar as duas equações.`,
          passo: 0,
          conceito: 'triangulo.elevacao',
        },
        {
          resposta: x,
          diagnostico:
            'Esse é x, a distância de B até a torre. Falta multiplicar pela tangente para achar a altura.',
          passo: 2,
          conceito: 'triangulo.elevacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Chame de x a distância de B à torre: h = x·tg ${beta}° e h = (x + ${d})·tg ${alfa}°. Iguale e ache x.`,
  };
}
