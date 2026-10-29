import { Figura, NOME_FIGURA, areaComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta = 'area' | 'altura-faltante' | 'escala';

export const geradorAreas: GeradorExercicio<number> = {
  topicoId: 'areas-de-figuras-planas',
  formatoResposta: 'um número, ex.: 24 ou 7,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'area':
        return exercicioArea(nivel, rng);
      case 'altura-faltante':
        return exercicioAlturaFaltante(nivel, rng);
      case 'escala':
        return exercicioEscala(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return 'area';
    case 'medio':
      return rng.escolher<Pergunta>(['area', 'altura-faltante']);
    case 'dificil':
      return rng.escolher<Pergunta>(['altura-faltante', 'escala', 'area']);
  }
}

function exercicioArea(nivel: Nivel, rng: Rng): Exercicio<number> {
  const figura: Figura = rng.escolher(
    nivel === 'facil'
      ? ['retangulo', 'triangulo', 'paralelogramo']
      : ['triangulo', 'trapezio', 'paralelogramo', 'retangulo'],
  );

  const base = rng.inteiro(3, 14);
  const altura = rng.inteiro(2, 12);
  const baseMenor = rng.inteiro(1, base - 1);

  const dimensoes = { base, altura, baseMenor };
  const { resultado, passos } = areaComPassos(figura, dimensoes);

  const enunciado =
    figura === 'trapezio'
      ? `Um trapézio tem bases ${base} e ${baseMenor} e altura ${altura}. Qual é sua área?`
      : `Um ${NOME_FIGURA[figura]} tem base ${base} e altura ${altura}. Qual é sua área?`;

  const enunciadoTex =
    figura === 'trapezio'
      ? `B = ${base} \\qquad b = ${baseMenor} \\qquad h = ${altura}`
      : `b = ${base} \\qquad h = ${altura}`;

  return {
    id: `area-${figura}-${base}-${altura}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado,
    enunciadoTex,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: figura === 'triangulo' || figura === 'trapezio' ? ['areas.deducao'] : ['areas.origem'],
    armadilhas: semColisoes(
      [
        {
          resposta: base * altura,
          diagnostico:
            figura === 'triangulo'
              ? 'Faltou dividir por 2: o triângulo é METADE do paralelogramo de mesma base e ' +
                'altura.'
              : figura === 'trapezio'
                ? 'Você usou só a base maior. O trapézio usa a média das duas bases.'
                : 'Esse é o produto base × altura — confira a fórmula da figura.',
          passo: 1,
          conceito: 'areas.deducao',
        },
        {
          resposta: 2 * (base + altura),
          diagnostico:
            'Esse é o PERÍMETRO (soma dos lados), não a área. Área se mede em unidades ' +
            'quadradas.',
          passo: 0,
          conceito: 'areas.origem',
        },
        {
          resposta: figura === 'trapezio' ? baseMenor * altura : (base * altura) / 4,
          diagnostico:
            figura === 'trapezio'
              ? 'Você usou apenas a base menor. Ambas as bases entram, pela média.'
              : 'A divisão é por 2, não por 4: duas cópias do triângulo formam o ' +
                'paralelogramo.',
          passo: 1,
          conceito: 'areas.deducao',
        },
      ],
      resultado,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? figura === 'triangulo'
          ? 'A = b·h / 2'
          : 'A = b·h'
        : undefined,
  };
}

function exercicioAlturaFaltante(nivel: Nivel, rng: Rng): Exercicio<number> {
  const triangulo = rng.escolher([true, false]);
  const base = rng.inteiro(4, 15);
  const altura = rng.inteiro(2, 12);

  const area = triangulo ? (base * altura) / 2 : base * altura;
  const gabarito = altura;

  return {
    id: `area-alt-${triangulo ? 'tri' : 'ret'}-${base}-${altura}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um ${triangulo ? 'triângulo' : 'retângulo'} tem área ${area} e base ${base}. Qual é ` +
      'sua altura?',
    enunciadoTex: `A = ${area} \\qquad b = ${base}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Partimos da fórmula da área e isolamos a altura.',
          tex: triangulo ? 'A = \\frac{bh}{2} \\;\\Rightarrow\\; h = \\frac{2A}{b}' : 'h = \\frac{A}{b}',
        },
        {
          descricao: 'Substituímos os valores.',
          tex: triangulo
            ? `h = \\frac{2 \\cdot ${area}}{${base}} = ${gabarito}`
            : `h = \\frac{${area}}{${base}} = ${gabarito}`,
          nota: triangulo ? 'O 2 sobe multiplicando a área, não dividindo.' : undefined,
        },
      ],
    },
    conceitos: triangulo ? ['areas.deducao'] : ['areas.origem'],
    armadilhas: semColisoes(
      [
        {
          resposta: triangulo ? area / base : (2 * area) / base,
          diagnostico: triangulo
            ? 'Faltou o fator 2: como a área já havia sido dividida por 2, ele volta ' +
              'multiplicando quando isolamos h.'
            : 'O retângulo não tem divisão por 2 — esse fator é do triângulo.',
          passo: 0,
          conceito: 'areas.deducao',
        },
        {
          resposta: area - base,
          diagnostico:
            'Área e base não se subtraem: elas têm unidades diferentes. A relação entre elas ' +
            'é um produto, então isolar h pede uma divisão.',
          passo: 0,
          conceito: 'areas.origem',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}

function exercicioEscala(nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = rng.escolher([2, 3, 4, 5, 10]);
  const area = rng.inteiro(3, 40);
  const gabarito = area * k * k;

  return {
    id: `area-escala-${k}-${area}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma figura de área ${area} cm² é ampliada de modo que todos os comprimentos fiquem ` +
      `${k} vezes maiores. Qual é a nova área, em cm²?`,
    enunciadoTex: `A = ${area} \\qquad k = ${k}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Base e altura são ambas multiplicadas por k.',
          tex: `b' = ${k}b \\qquad h' = ${k}h`,
        },
        {
          descricao: 'A área é o produto das duas, então k aparece duas vezes.',
          tex: `A' = ${k}^{2} \\cdot A = ${k * k} \\cdot ${area}`,
        },
        {
          descricao: 'Calculamos.',
          tex: `A' = ${gabarito}`,
          nota: 'Ampliar k vezes multiplica a área por k², nunca por k.',
        },
      ],
    },
    conceitos: ['areas.escala', 'semelhanca.razao'],
    armadilhas: semColisoes(
      [
        {
          resposta: area * k,
          diagnostico:
            'A razão k multiplica COMPRIMENTOS. A área, sendo produto de dois comprimentos, ' +
            'é multiplicada por k².',
          passo: 1,
          conceito: 'areas.escala',
        },
        {
          resposta: area * k ** 3,
          diagnostico: 'k³ é o fator do VOLUME. Área tem duas dimensões, então o fator é k².',
          passo: 1,
          conceito: 'areas.escala',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? "A' = k² · A" : undefined,
  };
}
