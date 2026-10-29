import { areaComPassos, perimetroCirculoComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta = 'comprimento' | 'area-circulo' | 'raio-pela-area' | 'setor' | 'poligono';

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
      return rng.escolher<Pergunta>(['comprimento', 'area-circulo']);
    case 'medio':
      return rng.escolher<Pergunta>(['area-circulo', 'setor', 'raio-pela-area']);
    case 'dificil':
      return rng.escolher<Pergunta>(['raio-pela-area', 'setor', 'poligono']);
  }
}

function exercicioComprimento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const raio = rng.inteiro(2, 60);
  const { resultado, passos } = perimetroCirculoComPassos(raio);

  return {
    id: `circ-comp-${raio}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é o comprimento de uma circunferência de raio ${raio}? (2 casas decimais)`,
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
          diagnostico:
            'Faltou o 2: π multiplica o DIÂMETRO, que é o dobro do raio. C = πd = 2πr.',
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
    enunciado: `Qual é a área de um círculo de raio ${raio}? (2 casas decimais)`,
    enunciadoTex: `r = ${raio}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['circulo.area'],
    armadilhas: semColisoes(
      [
        {
          resposta: 2 * Math.PI * raio,
          diagnostico:
            'Esse é o COMPRIMENTO da circunferência. A área depende de r², não de r.',
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
  const raio = rng.inteiro(2, 12);
  const area = Math.PI * raio * raio;

  return {
    id: `circ-raio-${raio}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um círculo tem área ${Number(area.toFixed(2))}. Qual é o seu raio? (2 casas decimais)`,
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
          diagnostico:
            'Você parou em r². Falta extrair a raiz quadrada para chegar ao raio.',
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
      `Qual é a área de um setor circular de raio ${raio} e ângulo ${anguloGraus}°? ` +
      '(2 casas decimais)',
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
      `Um polígono regular de ${lados} lados tem lado ${base} e apótema ` +
      `${Number(apotema.toFixed(3))}. Qual é sua área? (2 casas decimais)`,
    enunciadoTex: `n = ${lados} \\qquad \\ell = ${base} \\qquad a = ${Number(apotema.toFixed(3))}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['circulo.poligonos'],
    armadilhas: semColisoes(
      [
        {
          resposta: lados * base * apotema,
          diagnostico:
            'Faltou dividir por 2: cada um dos n triângulos tem área ℓ·a/2, não ℓ·a.',
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
    dica: nivel === 'facil' ? 'A = p·a/2, com p = n·ℓ.' : undefined,
  };
}
