import { areaComPassos, perimetroCirculoComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta =
  | 'comprimento'
  | 'area-circulo'
  | 'raio-pela-area'
  | 'setor'
  | 'poligono'
  | 'arco'
  | 'coroa'
  | 'angulo-inscrito';

export const geradorCirculo: GeradorExercicio<number> = {
  topicoId: 'circulo-e-poligonos',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'comprimento':
        return exercicioComprimento(nivel, rng);
      case 'area-circulo':
        return exercicioAreaCirculo(nivel, rng);
      case 'raio-pela-area':
        return exercicioRaioPelaArea(nivel, rng);
      case 'setor':
        return exercicioSetor(nivel, rng);
      case 'poligono':
        return exercicioPoligono(nivel, rng);
      case 'arco':
        return exercicioArco(nivel, rng);
      case 'coroa':
        return exercicioCoroa(nivel, rng);
      case 'angulo-inscrito':
        return exercicioAnguloInscrito(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(2)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['comprimento', 'area-circulo', 'arco']);
    case 'medio':
      return rng.escolher<Pergunta>([
        'area-circulo',
        'setor',
        'raio-pela-area',
        'arco',
        'angulo-inscrito',
      ]);
    case 'dificil':
      return rng.escolher<Pergunta>(['raio-pela-area', 'setor', 'poligono', 'coroa']);
    // Raio pela área exige raiz quadrada; o polígono, a fórmula do apótema; e
    // a coroa obriga a ver que a subtração é de áreas, não de raios.
    case 'extremo':
      return rng.escolher<Pergunta>(['raio-pela-area', 'poligono', 'coroa']);
  }
}

function exercicioComprimento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const raio = rng.inteiro(2, 60);
  const { resultado, passos } = perimetroCirculoComPassos(raio);

  return {
    id: `circ-comp-${raio}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é o comprimento de uma circunferência de raio ${raio} cm? ` +
      '(em cm, 2 casas decimais)',
    enunciadoTex: `r = ${raio}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['circulo.pi'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.PI * raio * raio,
          diagnostico:
            'Essa é a ÁREA, que se mede em unidades quadradas. O comprimento é uma medida ' +
            'linear: C = 2πr.',
          passo: 1,
          conceito: 'circulo.area',
        },
        {
          resposta: Math.PI * raio,
          diagnostico: 'Faltou o 2: π multiplica o DIÂMETRO, que é o dobro do raio. C = πd = 2πr.',
          passo: 1,
          conceito: 'circulo.pi',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'C = 2πr' : undefined,
  };
}

function exercicioAreaCirculo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const raio = rng.inteiro(2, 45);
  const { resultado, passos } = areaComPassos('circulo', { raio });

  return {
    id: `circ-area-${raio}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é a área de um círculo de raio ${raio} cm? (em cm², 2 casas decimais)`,
    enunciadoTex: `r = ${raio}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['circulo.area'],
    armadilhas: semColisoes(
      [
        {
          resposta: 2 * Math.PI * raio,
          diagnostico: 'Esse é o COMPRIMENTO da circunferência. A área depende de r², não de r.',
          passo: 2,
          conceito: 'circulo.pi',
        },
        {
          resposta: Math.PI * (2 * raio) ** 2,
          diagnostico:
            'Você usou o diâmetro no lugar do raio. Com o diâmetro, a fórmula seria πd²/4.',
          passo: 2,
          conceito: 'circulo.area',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'A = πr²' : undefined,
  };
}

function exercicioRaioPelaArea(nivel: Nivel, rng: Rng): Exercicio<number> {
  // No extremo o raio vai mais longe: a raiz quadrada deixa de ser de cabeça.
  const raio = nivel === 'extremo' ? rng.inteiro(13, 90) : rng.inteiro(2, 12);
  const area = Math.PI * raio * raio;

  return {
    id: `circ-raio-${raio}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um círculo tem área ${Number(area.toFixed(2))} cm². Qual é o seu raio? ` +
      '(em cm, 2 casas decimais)',
    enunciadoTex: `A = ${Number(area.toFixed(2))}`,
    gabarito: raio,
    resolucao: {
      resultado: raio,
      passos: [
        {
          descricao: 'Partimos da área e isolamos o raio ao quadrado.',
          tex: `r^{2} = \\frac{A}{\\pi} = \\frac{${Number(area.toFixed(2))}}{\\pi}`,
        },
        {
          descricao: 'Extraímos a raiz quadrada.',
          tex: `r = \\sqrt{${Number((area / Math.PI).toFixed(4))}} = ${raio}`,
          nota: 'Só a raiz positiva interessa: raio negativo não existe.',
        },
      ],
    },
    conceitos: ['circulo.area'],
    armadilhas: semColisoes(
      [
        {
          resposta: area / Math.PI,
          diagnostico: 'Você parou em r². Falta extrair a raiz quadrada para chegar ao raio.',
          passo: 1,
          conceito: 'circulo.area',
        },
        {
          resposta: area / (2 * Math.PI),
          diagnostico:
            'Dividir por 2π é o caminho para achar o raio a partir do COMPRIMENTO, não da ' +
            'área.',
          passo: 0,
          conceito: 'circulo.pi',
        },
      ],
      raio,
      proximos,
    ),
  };
}

function exercicioSetor(nivel: Nivel, rng: Rng): Exercicio<number> {
  const raio = rng.inteiro(2, 30);
  // Qualquer ângulo múltiplo de 5°, não os oito de sempre.
  const anguloGraus = rng.inteiro(2, 72) * 5;

  const { resultado, passos } = areaComPassos('setor', { raio, anguloGraus });
  const areaTotal = Math.PI * raio * raio;

  return {
    id: `circ-setor-${raio}-${anguloGraus}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é a área de um setor circular de raio ${raio} cm e ângulo ${anguloGraus}°? ` +
      '(em cm², 2 casas decimais)',
    enunciadoTex: `r = ${raio} \\qquad \\theta = ${anguloGraus}^\\circ`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['circulo.area'],
    armadilhas: semColisoes(
      [
        {
          resposta: areaTotal,
          diagnostico:
            'Essa é a área do círculo INTEIRO. O setor é apenas a fração correspondente ao ' +
            'ângulo.',
          passo: 1,
          conceito: 'circulo.area',
        },
        {
          resposta: (2 * Math.PI * raio * anguloGraus) / 360,
          diagnostico:
            'Esse é o comprimento do ARCO, uma medida linear. A área do setor usa πr², não ' +
            '2πr.',
          passo: 1,
          conceito: 'circulo.area',
        },
        {
          resposta: (areaTotal * anguloGraus) / 180,
          diagnostico:
            'A fração é θ/360°, porque a volta completa tem 360°. Dividir por 180° dobraria ' +
            'o setor.',
          passo: 0,
          conceito: 'circulo.area',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioPoligono(nivel: Nivel, rng: Rng): Exercicio<number> {
  const lados = rng.escolher([5, 6, 8, 10, 12]);
  const base = rng.inteiro(2, 9);

  // Apótema exato do polígono regular, a partir do lado.
  const apotema = base / (2 * Math.tan(Math.PI / lados));
  const { resultado, passos } = areaComPassos('poligono-regular', { lados, base, apotema });

  return {
    id: `circ-poli-${lados}-${base}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um polígono regular de ${lados} lados tem lado ${base} cm e apótema ` +
      `${Number(apotema.toFixed(3))} cm. Qual é sua área? (em cm², 2 casas decimais)`,
    enunciadoTex: `n = ${lados} \\qquad \\ell = ${base} \\qquad a = ${Number(apotema.toFixed(3))}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['circulo.poligonos'],
    armadilhas: semColisoes(
      [
        {
          resposta: lados * base * apotema,
          diagnostico: 'Faltou dividir por 2: cada um dos n triângulos tem área ℓ·a/2, não ℓ·a.',
          passo: 2,
          conceito: 'circulo.poligonos',
        },
        {
          resposta: (base * apotema) / 2,
          diagnostico:
            'Essa é a área de UM dos triângulos. Falta multiplicar pelos n triângulos que ' +
            'compõem o polígono.',
          passo: 2,
          conceito: 'circulo.poligonos',
        },
      ],
      resultado,
      proximos,
    ),
    // O polígono estreia no Difícil; no Fácil esta dica nunca aparecia.
    dica: nivel === 'dificil' ? 'A = p·a/2, com p = n·ℓ.' : undefined,
  };
}

/** Comprimento de arco: a fração do perímetro que o ângulo recorta. */
function exercicioArco(nivel: Nivel, rng: Rng): Exercicio<number> {
  const raio = rng.inteiro(2, 40);
  const anguloGraus = rng.inteiro(2, 72) * 5;

  const perimetro = 2 * Math.PI * raio;
  const resultado = (perimetro * anguloGraus) / 360;

  return {
    id: `circ-arco-${raio}-${anguloGraus}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é o comprimento do arco de uma circunferência de raio ${raio} cm ` +
      `correspondente a um ângulo central de ${anguloGraus}°? (em cm, 2 casas decimais)`,
    enunciadoTex: `r = ${raio} \\qquad \\theta = ${anguloGraus}^\\circ`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'A volta inteira tem 360°, e o arco é a fração que o ângulo recorta.',
          tex: `\\frac{${anguloGraus}^\\circ}{360^\\circ} = ${Number((anguloGraus / 360).toFixed(4))}`,
        },
        {
          descricao: 'Calculamos o perímetro da circunferência inteira.',
          tex: `C = 2\\pi r = 2\\pi \\cdot ${raio} = ${Number(perimetro.toFixed(4))}`,
        },
        {
          descricao: 'O arco é essa fração do perímetro.',
          tex:
            `\\ell = ${Number(perimetro.toFixed(4))} \\cdot ` +
            `\\frac{${anguloGraus}}{360} = ${Number(resultado.toFixed(4))}`,
          nota: 'O arco é um comprimento — mede-se em cm, não em cm².',
        },
      ],
    },
    conceitos: ['circulo.pi', 'circulo.area'],
    armadilhas: semColisoes(
      [
        {
          resposta: (Math.PI * raio * raio * anguloGraus) / 360,
          diagnostico:
            'Essa é a área do SETOR, que se mede em cm². O arco é a borda curva, e sai do ' +
            'perímetro 2πr.',
          passo: 1,
          conceito: 'circulo.area',
        },
        {
          resposta: perimetro,
          diagnostico: 'Esse é o perímetro INTEIRO. O arco é só a fração θ/360 dele.',
          passo: 0,
          conceito: 'circulo.pi',
        },
        {
          resposta: (perimetro * anguloGraus) / 180,
          diagnostico: 'A volta completa tem 360°, não 180°. Dividir por 180 dobra o arco.',
          passo: 0,
          conceito: 'circulo.pi',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'O arco é 2πr vezes θ/360.' : undefined,
  };
}

/** Coroa circular: a área entre dois círculos concêntricos. */
function exercicioCoroa(nivel: Nivel, rng: Rng): Exercicio<number> {
  const menor = rng.inteiro(2, 20);
  const maior = menor + rng.inteiro(1, 15);

  const areaMaior = Math.PI * maior * maior;
  const areaMenor = Math.PI * menor * menor;
  const resultado = areaMaior - areaMenor;

  return {
    id: `circ-coroa-${menor}-${maior}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Dois círculos concêntricos têm raios ${menor} cm e ${maior} cm. Qual é a área da ` +
      'coroa entre eles? (em cm², 2 casas decimais)',
    enunciadoTex: `R = ${maior} \\qquad r = ${menor}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'A coroa é o que sobra do círculo maior ao tirar o menor.',
          tex: `A = \\pi R^{2} - \\pi r^{2}`,
        },
        {
          descricao: 'Calculamos as duas áreas com os raios dados.',
          tex:
            `\\pi \\cdot ${maior}^{2} = ${Number(areaMaior.toFixed(4))} \\qquad ` +
            `\\pi \\cdot ${menor}^{2} = ${Number(areaMenor.toFixed(4))}`,
        },
        {
          descricao: 'A diferença é a área procurada.',
          tex:
            `A = ${Number(areaMaior.toFixed(4))} - ${Number(areaMenor.toFixed(4))} = ` +
            `${Number(resultado.toFixed(4))}`,
          nota: `Em fator comum: π(R² − r²) = π(${maior}² − ${menor}²).`,
        },
      ],
    },
    conceitos: ['circulo.area'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.PI * (maior - menor) ** 2,
          diagnostico:
            'Subtrair os RAIOS e depois elevar ao quadrado dá outra coisa: π(R − r)² não é ' +
            'πR² − πr². O que se subtrai são as áreas.',
          passo: 0,
          conceito: 'circulo.area',
        },
        {
          resposta: areaMaior,
          diagnostico: 'Essa é a área do círculo maior inteiro, com o buraco do meio incluído.',
          passo: 2,
          conceito: 'circulo.area',
        },
        {
          resposta: 2 * Math.PI * (maior - menor),
          diagnostico: 'Isso é um comprimento, em cm. A coroa é uma área, em cm².',
          passo: 0,
          conceito: 'circulo.area',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'dificil' ? 'Área da coroa = πR² − πr².' : undefined,
  };
}

/** Ângulo inscrito: metade do central que enxerga o mesmo arco. */
function exercicioAnguloInscrito(nivel: Nivel, rng: Rng): Exercicio<number> {
  const doCentral = rng.escolher([true, false]);
  const central = rng.inteiro(2, 35) * 5;
  const inscrito = central / 2;

  const resultado = doCentral ? inscrito : central;

  return {
    id: `circ-inscrito-${central}-${doCentral ? 'i' : 'c'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: doCentral
      ? `Um ângulo central mede ${central}°. Quanto mede o ângulo inscrito que enxerga o ` +
        'mesmo arco? (em graus)'
      : `Um ângulo inscrito mede ${inscrito}°. Quanto mede o ângulo central que enxerga o ` +
        'mesmo arco? (em graus)',
    enunciadoTex: doCentral ? `\\hat{C} = ${central}^\\circ` : `\\hat{I} = ${inscrito}^\\circ`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Os dois ângulos enxergam o mesmo arco, e o inscrito vale metade.',
          tex: '\\hat{I} = \\frac{\\hat{C}}{2}',
          nota: 'O vértice do central é o centro; o do inscrito está na própria circunferência.',
        },
        {
          descricao: doCentral
            ? 'Com o central conhecido, basta dividir por dois.'
            : 'Com o inscrito conhecido, o central é o dobro.',
          tex: doCentral
            ? `\\hat{I} = \\frac{${central}^\\circ}{2} = ${inscrito}^\\circ`
            : `\\hat{C} = 2 \\cdot ${inscrito}^\\circ = ${central}^\\circ`,
        },
      ],
    },
    conceitos: ['circulo.angulos'],
    armadilhas: semColisoes(
      [
        {
          resposta: doCentral ? central : inscrito,
          diagnostico: 'Essa é a medida que o enunciado já deu. O outro ângulo é a metade dela.',
          passo: 1,
          conceito: 'circulo.angulos',
        },
        {
          resposta: doCentral ? central * 2 : inscrito / 2,
          diagnostico:
            'A relação está invertida: quem vale o DOBRO é o central. O inscrito, com o ' +
            'vértice na circunferência, enxerga o mesmo arco por metade do ângulo.',
          passo: 0,
          conceito: 'circulo.angulos',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'medio' ? 'O inscrito é metade do central que vê o mesmo arco.' : undefined,
  };
}
