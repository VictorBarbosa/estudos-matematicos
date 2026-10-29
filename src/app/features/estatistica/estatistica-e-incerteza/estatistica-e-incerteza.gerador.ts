import {
  ajustarRetaComPassos,
  desvioPadraoComPassos,
  mediaComPassos,
  propagarProdutoComPassos,
  propagarSomaComPassos,
  resumirAmostra,
} from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta = 'media' | 'mediana' | 'desvio' | 'incerteza-media' | 'propagar-soma' | 'propagar-produto' | 'inclinacao';

export const geradorIncerteza: GeradorExercicio<number> = {
  topicoId: 'estatistica-e-incerteza',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'media':
        return exercicioResumo('media', nivel, rng);
      case 'mediana':
        return exercicioResumo('mediana', nivel, rng);
      case 'desvio':
        return exercicioResumo('desvio', nivel, rng);
      case 'incerteza-media':
        return exercicioResumo('incerteza', nivel, rng);
      case 'propagar-soma':
        return exercicioPropagarSoma(nivel, rng);
      case 'propagar-produto':
        return exercicioPropagarProduto(nivel, rng);
      case 'inclinacao':
        return exercicioInclinacao(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['media', 'mediana']);
    case 'medio':
      return rng.escolher<Pergunta>(['desvio', 'incerteza-media', 'propagar-soma']);
    case 'dificil':
      return rng.escolher<Pergunta>(['propagar-produto', 'inclinacao', 'desvio']);
  }
}

/** Uma série de medidas plausível: valores próximos, com uma casa decimal. */
function sortearMedidas(rng: Rng, quantidade = 0): number[] {
  const n = quantidade || rng.inteiro(4, 8);
  const base = rng.inteiro(10, 80);

  return Array.from({ length: n }, () => Number((base + rng.inteiro(-20, 20) / 10).toFixed(1)));
}

function exercicioResumo(
  oque: 'media' | 'mediana' | 'desvio' | 'incerteza',
  nivel: Nivel,
  rng: Rng,
): Exercicio<number> {
  const medidas = sortearMedidas(rng);
  const resumo = resumirAmostra(medidas);

  const gabarito =
    oque === 'media'
      ? resumo.media
      : oque === 'mediana'
        ? resumo.mediana
        : oque === 'desvio'
          ? resumo.desvioPadrao
          : resumo.incertezaDaMedia;

  const rotulo = {
    media: 'a média',
    mediana: 'a mediana',
    desvio: 'o desvio padrão amostral',
    incerteza: 'a incerteza da média (desvio padrão da média)',
  }[oque];

  const passos =
    oque === 'media'
      ? mediaComPassos(medidas).passos
      : oque === 'desvio' || oque === 'incerteza'
        ? desvioPadraoComPassos(medidas).passos
        : [
            {
              descricao: 'Ordenamos as medidas.',
              tex: [...medidas].sort((a, b) => a - b).join(',\\; '),
            },
            {
              descricao:
                medidas.length % 2 === 0
                  ? 'Com quantidade par, a mediana é a média dos dois centrais.'
                  : 'Com quantidade ímpar, a mediana é o valor central.',
              tex: `\\text{mediana} = ${Number(resumo.mediana.toFixed(4))}`,
              nota: 'A mediana não se deixa arrastar por um valor extremo.',
            },
          ];

  const completos =
    oque === 'incerteza'
      ? [
          ...passos,
          {
            descricao: 'A incerteza da média divide o desvio pela raiz do número de medidas.',
            tex: `\\sigma_{\\bar{x}} = \\frac{${Number(resumo.desvioPadrao.toFixed(4))}}{\\sqrt{${medidas.length}}} = ${Number(resumo.incertezaDaMedia.toFixed(4))}`,
            nota: 'Mais medidas melhoram a média, mesmo sem reduzir a dispersão.',
          },
        ]
      : passos;

  return {
    id: `inc-${oque}-${medidas.join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Para as medidas ${medidas.join('; ')}, qual é ${rotulo}? (2 casas decimais)`,
    enunciadoTex: medidas.map((valor) => String(valor).replace('.', '{,}')).join(',\\; '),
    gabarito,
    resolucao: { resultado: gabarito, passos: completos },
    conceitos: ['incerteza.dispersao'],
    armadilhas: semColisoes(
      [
        {
          resposta: oque === 'media' ? resumo.mediana : resumo.media,
          diagnostico:
            oque === 'media'
              ? 'Essa é a MEDIANA, o valor central. A média soma tudo e divide pela quantidade.'
              : 'Essa é a MÉDIA. A pergunta pedia outra medida da amostra.',
          passo: 0,
          conceito: 'incerteza.dispersao',
        },
        {
          resposta: oque === 'desvio' ? resumo.incertezaDaMedia : resumo.desvioPadrao,
          diagnostico:
            oque === 'desvio'
              ? 'Essa é a incerteza da MÉDIA, que já foi dividida por √n. O desvio padrão ' +
                'descreve a dispersão das medidas individuais.'
              : 'Esse é o desvio padrão das medidas. A incerteza da média ainda divide por √n.',
          passo: 1,
          conceito: 'incerteza.dispersao',
        },
        {
          resposta: resumo.amplitude,
          diagnostico:
            'Essa é a amplitude (maior menos menor). Ela usa só dois valores e ignora como os ' +
            'demais se distribuem.',
          passo: 0,
          conceito: 'incerteza.dispersao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' && oque === 'media' ? 'Some tudo e divida pela quantidade.' : undefined,
  };
}

function exercicioPropagarSoma(nivel: Nivel, rng: Rng): Exercicio<number> {
  const incertezas = [rng.inteiro(1, 9) / 10, rng.inteiro(1, 9) / 10];
  const { resultado, passos } = propagarSomaComPassos(incertezas);

  const texto = incertezas.map((valor) => valor.toLocaleString('pt-BR')).join(' e ');

  return {
    id: `inc-soma-${incertezas.join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Dois comprimentos são medidos com incertezas de ${texto} cm. Somando os dois, qual é a ` +
      'incerteza do resultado, em cm? (2 casas decimais)',
    enunciadoTex: incertezas
      .map((valor, indice) => `\\sigma_${indice + 1} = ${String(valor).replace('.', '{,}')}`)
      .join(' \\qquad '),
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['incerteza.propagacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: incertezas[0]! + incertezas[1]!,
          diagnostico:
            'Somar as incertezas diretamente supõe que as duas medidas erram para o mesmo ' +
            'lado. Sendo independentes, elas se combinam em quadratura, e o total é menor.',
          passo: 0,
          conceito: 'incerteza.propagacao',
        },
        {
          resposta: Math.abs(incertezas[0]! - incertezas[1]!),
          diagnostico:
            'Incertezas nunca se cancelam: elas sempre aumentam a incerteza do resultado, ' +
            'jamais a reduzem.',
          passo: 1,
          conceito: 'incerteza.propagacao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'σ = √(σ₁² + σ₂²)' : undefined,
  };
}

function exercicioPropagarProduto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const base = rng.inteiro(5, 30);
  const altura = rng.inteiro(5, 30);
  const incertezaBase = rng.inteiro(1, 5) / 10;
  const incertezaAltura = rng.inteiro(1, 5) / 10;

  const area = base * altura;
  const { resultado, passos } = propagarProdutoComPassos(
    [
      { valor: base, incerteza: incertezaBase },
      { valor: altura, incerteza: incertezaAltura },
    ],
    area,
  );

  return {
    id: `inc-prod-${base}_${altura}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um retângulo tem base ${base} ± ${incertezaBase.toLocaleString('pt-BR')} cm e altura ` +
      `${altura} ± ${incertezaAltura.toLocaleString('pt-BR')} cm. Qual é a incerteza da área, ` +
      'em cm²? (2 casas decimais)',
    enunciadoTex:
      `b = ${base} \\pm ${String(incertezaBase).replace('.', '{,}')} \\qquad ` +
      `h = ${altura} \\pm ${String(incertezaAltura).replace('.', '{,}')}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['incerteza.propagacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: incertezaBase * incertezaAltura,
          diagnostico:
            'Multiplicar as incertezas não tem sentido dimensional nem numérico. Num produto, ' +
            'somam-se em quadratura as incertezas RELATIVAS.',
          passo: 0,
          conceito: 'incerteza.propagacao',
        },
        {
          resposta: incertezaBase + incertezaAltura,
          diagnostico:
            'Somar incertezas absolutas é a regra da SOMA, não do produto. Aqui o que se ' +
            'combina são os erros proporcionais.',
          passo: 0,
          conceito: 'incerteza.propagacao',
        },
        {
          resposta: area * (incertezaBase / base),
          diagnostico:
            'Você usou só a incerteza relativa da base. A da altura também contribui, em ' +
            'quadratura.',
          passo: 1,
          conceito: 'incerteza.propagacao',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioInclinacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const inclinacao = rng.inteiro(2, 9);
  const intercepto = rng.inteiro(-5, 5);

  // Pontos exatamente colineares: a inclinação é a grandeza procurada.
  const pontos = [1, 2, 3, 4, 5].map((x) => ({ x, y: inclinacao * x + intercepto }));
  const { resultado, passos } = ajustarRetaComPassos(pontos);

  return {
    id: `inc-reta-${inclinacao}-${intercepto}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um experimento produziu os pares (x, y): ${pontos.map((p) => `(${p.x}; ${p.y})`).join(', ')}. ` +
      'Qual é a inclinação da reta ajustada?',
    enunciadoTex: pontos.map((p) => `(${p.x},\\, ${p.y})`).join(' \\quad '),
    gabarito: resultado.inclinacao,
    resolucao: { resultado: resultado.inclinacao, passos },
    conceitos: ['incerteza.ajuste'],
    armadilhas: semColisoes(
      [
        {
          resposta: resultado.intercepto,
          diagnostico:
            'Esse é o INTERCEPTO, onde a reta corta o eixo y. A inclinação é a taxa de ' +
            'variação de y por x.',
          passo: 2,
          conceito: 'incerteza.ajuste',
        },
        {
          resposta: pontos[0]!.y / pontos[0]!.x,
          diagnostico:
            'Dividir y por x de um único ponto só daria a inclinação se a reta passasse pela ' +
            'origem. Com intercepto não nulo, é preciso comparar variações.',
          passo: 1,
          conceito: 'incerteza.ajuste',
        },
      ],
      resultado.inclinacao,
      proximos,
    ),
    dica: nivel === 'facil' ? 'A inclinação é Δy/Δx entre dois pontos quaisquer da reta.' : undefined,
  };
}
