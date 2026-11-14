import { Figura, NOME_FIGURA, areaComPassos } from '@core/math';
import { numeroEmPortugues } from '@core/treino/textos/numero-escrito';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta = 'area' | 'altura-faltante' | 'escala' | 'losango' | 'composta';

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
      case 'losango':
        return exercicioLosango(nivel, rng);
      case 'composta':
        return exercicioComposta(nivel, rng);
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
      return rng.escolher<Pergunta>(['area', 'losango']);
    case 'medio':
      return rng.escolher<Pergunta>(['area', 'altura-faltante', 'losango', 'composta']);
    case 'dificil':
      return rng.escolher<Pergunta>(['altura-faltante', 'escala', 'area', 'composta']);
    // As duas que desfazem a fórmula: achar a medida que falta e a razão de
    // áreas numa escala. Aplicar a fórmula direto sai de cena.
    case 'extremo':
      return rng.escolher<Pergunta>(['altura-faltante', 'escala', 'composta']);
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
      ? `Um trapézio tem bases ${base} cm e ${baseMenor} cm e altura ${altura} cm. ` +
        'Qual é sua área, em cm²?'
      : `Um ${NOME_FIGURA[figura]} tem base ${base} cm e altura ${altura} cm. ` +
        'Qual é sua área, em cm²?';

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
    conceitos:
      figura === 'triangulo' || figura === 'trapezio' ? ['areas.deducao'] : ['areas.origem'],
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
    // O trapézio só entra do Médio em diante: ele estreia ali, com a sua dica.
    dica:
      nivel === 'facil'
        ? figura === 'triangulo'
          ? 'A = b·h / 2'
          : 'A = b·h'
        : nivel === 'medio' && figura === 'trapezio'
          ? `Trapézio: some as bases (${base} + ${baseMenor}), multiplique pela altura ${altura} e divida por 2.`
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
      `Um ${triangulo ? 'triângulo' : 'retângulo'} tem área ${numeroEmPortugues(area)} cm² e base ` +
      `${numeroEmPortugues(base)} cm. ` +
      'Qual é sua altura, em cm?',
    enunciadoTex: `A = ${area} \\qquad b = ${base}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Partimos da fórmula da área e isolamos a altura.',
          tex: triangulo
            ? 'A = \\frac{bh}{2} \\;\\Rightarrow\\; h = \\frac{2A}{b}'
            : 'h = \\frac{A}{b}',
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
    dica:
      nivel === 'medio'
        ? triangulo
          ? `A = b·h / 2, então h = 2·A / b = 2 · ${area} / ${base}.`
          : `A = b·h, então h = A / b = ${area} / ${base}.`
        : undefined,
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
    /*
     * A dica vem no Difícil, que é onde esta pergunta estreia — no Fácil, onde
     * ela estava, `sortearPergunta` só gera o cálculo direto de área, e a dica
     * nunca chegava à tela. E traz o número: «A' = k² · A» não diz o que fazer
     * com o k do enunciado.
     */
    dica: nivel === 'dificil' ? `A' = k² · A, e aqui k = ${k}: o fator é ${k}².` : undefined,
  };
}

/**
 * Losango pelas diagonais: a fórmula que não é base vezes altura.
 *
 * `D·d/2` costuma ser decorada sem motivo. O motivo é que o losango cabe
 * exatamente na metade do retângulo que tem as diagonais por lados.
 */
function exercicioLosango(nivel: Nivel, rng: Rng): Exercicio<number> {
  const maior = rng.inteiro(4, 20);
  const menor = rng.inteiro(2, maior - 1);
  const gabarito = (maior * menor) / 2;

  return {
    id: `area-losango-${maior}-${menor}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um losango tem diagonais de ${maior} cm e ${menor} cm. ` + 'Qual é sua área, em cm²?',
    enunciadoTex: `D = ${maior} \\qquad d = ${menor}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'As diagonais do losango são perpendiculares e se cortam ao meio.',
          tex: `D = ${maior} \\qquad d = ${menor}`,
          nota: 'Elas dividem o losango em quatro triângulos retângulos iguais.',
        },
        {
          descricao: 'O losango ocupa metade do retângulo que tem as diagonais por lados.',
          tex: `A = \\frac{D \\cdot d}{2} = \\frac{${maior} \\cdot ${menor}}{2}`,
        },
        {
          descricao: 'Fazendo a conta.',
          tex: `A = \\frac{${maior * menor}}{2} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['areas.deducao'],
    armadilhas: semColisoes(
      [
        {
          resposta: maior * menor,
          diagnostico:
            'Esse é o retângulo que contém o losango. O losango é exatamente metade dele — ' +
            'falta dividir por 2.',
          passo: 1,
          conceito: 'areas.deducao',
        },
        {
          resposta: 2 * (maior + menor),
          diagnostico: 'Isso é uma soma de comprimentos, em cm. A área se mede em cm².',
          passo: 1,
          conceito: 'areas.origem',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? 'A = D·d/2, com D e d as diagonais.' : undefined,
  };
}

/**
 * Figura composta: um retângulo com um triângulo em cima.
 *
 * Nenhuma fórmula nova — a ideia é que área se soma, e que uma figura
 * esquisita se resolve cortando-a em figuras conhecidas.
 */
function exercicioComposta(nivel: Nivel, rng: Rng): Exercicio<number> {
  const base = rng.inteiro(4, 16);
  const alturaRetangulo = rng.inteiro(2, 12);
  const alturaTriangulo = rng.inteiro(2, 10);

  const doRetangulo = base * alturaRetangulo;
  const doTriangulo = (base * alturaTriangulo) / 2;
  const gabarito = doRetangulo + doTriangulo;

  return {
    id: `area-composta-${base}-${alturaRetangulo}-${alturaTriangulo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma figura é formada por um retângulo de ${base} cm por ${alturaRetangulo} cm com um ` +
      `triângulo de mesma base e altura ${alturaTriangulo} cm apoiado em cima. ` +
      'Qual é a área total, em cm²?',
    enunciadoTex: `b = ${base} \\qquad h_r = ${alturaRetangulo} \\qquad h_t = ${alturaTriangulo}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A figura se reparte em duas conhecidas, sem sobreposição.',
          tex: 'A = A_{\\text{retângulo}} + A_{\\text{triângulo}}',
          nota: 'Área é aditiva: partes que não se sobrepõem somam.',
        },
        {
          descricao: 'A do retângulo é base vezes altura.',
          tex: `A_r = ${base} \\cdot ${alturaRetangulo} = ${doRetangulo}`,
        },
        {
          descricao: 'A do triângulo é metade da base vezes a altura.',
          tex: `A_t = \\frac{${base} \\cdot ${alturaTriangulo}}{2} = ${doTriangulo}`,
        },
        {
          descricao: 'Somando as duas.',
          tex: `A = ${doRetangulo} + ${doTriangulo} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['areas.origem', 'areas.deducao'],
    armadilhas: semColisoes(
      [
        {
          resposta: doRetangulo + base * alturaTriangulo,
          diagnostico:
            'O triângulo entrou inteiro, como se fosse retângulo. Ele é metade da base ' +
            'vezes a altura.',
          passo: 2,
          conceito: 'areas.deducao',
        },
        {
          resposta: doRetangulo,
          diagnostico: 'Essa é só a parte de baixo. O triângulo de cima também tem área.',
          passo: 0,
          conceito: 'areas.origem',
        },
        {
          resposta: base * (alturaRetangulo + alturaTriangulo),
          diagnostico:
            'Somar as alturas e multiplicar pela base trata a figura inteira como um ' +
            'retângulo — e ela não é: o topo é um triângulo.',
          passo: 0,
          conceito: 'areas.origem',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'medio' ? 'Corte a figura em um retângulo e um triângulo.' : undefined,
  };
}
