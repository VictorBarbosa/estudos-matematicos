import { divisaoProporcionalComPassos, regraDeTresComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const TOLERANCIA = 1e-6;
const proximos = (a: number, b: number): boolean => Math.abs(a - b) < TOLERANCIA;

interface Contexto {
  readonly enunciado: (a: number, b: number, c: number) => string;
  readonly unidade: string;
}

/** Contextos concretos, para que a escolha entre direta e inversa tenha sentido. */
const CONTEXTOS_DIRETOS: readonly Contexto[] = [
  {
    enunciado: (a: number, b: number, c: number) =>
      `Se ${a} kg de farinha custam R$ ${b},00, quanto custam ${c} kg?`,
    unidade: 'reais',
  },
  {
    enunciado: (a: number, b: number, c: number) =>
      `Um carro percorre ${b} km com ${a} litros. Quantos km percorre com ${c} litros?`,
    unidade: 'km',
  },
  {
    enunciado: (a: number, b: number, c: number) =>
      `Se ${a} cadernos custam R$ ${b},00, quanto custam ${c} cadernos?`,
    unidade: 'reais',
  },
];

const CONTEXTOS_INVERSOS: readonly Contexto[] = [
  {
    enunciado: (a: number, b: number, c: number) =>
      `Se ${a} operários fazem uma obra em ${b} dias, em quantos dias ${c} operários fazem a mesma obra?`,
    unidade: 'dias',
  },
  {
    enunciado: (a: number, b: number, c: number) =>
      `Se ${a} torneiras enchem um tanque em ${b} minutos, em quantos minutos ${c} torneiras enchem o mesmo tanque?`,
    unidade: 'minutos',
  },
  {
    enunciado: (a: number, b: number, c: number) =>
      `Viajando a ${a} km/h leva-se ${b} horas. Quantas horas leva a ${c} km/h?`,
    unidade: 'horas',
  },
];

export const geradorProporcao: GeradorExercicio<number> = {
  topicoId: 'razao-proporcao',
  formatoResposta: 'um número, ex.: 18 ou 7,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    if (nivel === 'dificil' && rng.booleano(0.4)) {
      return exercicioDivisao(nivel, rng);
    }

    // No fácil só direta; depois as duas, para forçar a decisão.
    const inversa = nivel === 'facil' ? false : rng.booleano();
    return exercicioRegraDeTres(nivel, rng, inversa);
  },

  analisar: (entrada) => {
    const limpo = entrada
      .trim()
      .replace(/\s|R\$/g, '')
      .replace(',', '.');
    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function exercicioRegraDeTres(nivel: Nivel, rng: Rng, inversa: boolean): Exercicio<number> {
  const contexto = rng.escolher(inversa ? CONTEXTOS_INVERSOS : CONTEXTOS_DIRETOS);

  // Para a inversa, escolhemos a e c como divisores de um produto fixo, de modo
  // que o resultado saia "redondo" e o foco fique no raciocínio.
  const a = rng.inteiro(2, nivel === 'facil' ? 6 : 12);
  const b = rng.inteiro(2, nivel === 'facil' ? 12 : 60) * (nivel === 'facil' ? 1 : 2);
  const c = rng.inteiro(2, nivel === 'facil' ? 10 : 20);

  const resolucao = regraDeTresComPassos(a, b, c, inversa);
  const direta = regraDeTresComPassos(a, b, c, false).resultado;
  const inversaValor = regraDeTresComPassos(a, b, c, true).resultado;

  return {
    id: `proporcao-${inversa ? 'inversa' : 'direta'}-${a}-${b}-${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: contexto.enunciado(a, b, c),
    enunciadoTex: inversa
      ? `${a} \\cdot ${b} = ${c} \\cdot x \\qquad x = \;?`
      : `\\frac{${a}}{${b}} = \\frac{${c}}{x} \\qquad x = \;?`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['proporcao.regra-de-tres', 'proporcao.proporcao'],
    armadilhas: semColisoes(
      [
        {
          resposta: inversa ? direta : inversaValor,
          diagnostico: inversa
            ? 'Estas grandezas são INVERSAMENTE proporcionais: quando uma aumenta, a outra ' +
              'diminui. Você montou a proporção direta. Aqui o que se conserva é o produto, ' +
              'não a razão.'
            : 'Estas grandezas são DIRETAMENTE proporcionais: as duas crescem juntas. Você ' +
              'montou a regra inversa, que vale quando uma aumenta e a outra diminui.',
          passo: 0,
          conceito: 'proporcao.regra-de-tres',
        },
        {
          resposta: (a * c) / b,
          diagnostico:
            'Os termos foram trocados de lugar na montagem. Confira qual grandeza corresponde ' +
            'a qual: o x precisa ficar do mesmo lado que a grandeza do mesmo tipo.',
          passo: 1,
          conceito: 'proporcao.proporcao',
        },
      ],
      resolucao.resultado,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? 'Se a primeira grandeza dobra, a segunda dobra também?'
        : 'Antes de montar: as grandezas crescem juntas ou em sentidos opostos?',
  };
}

function exercicioDivisao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p1 = rng.inteiro(1, 5);
  const p2 = rng.inteiro(1, 5);
  const total = (p1 + p2) * rng.inteiro(10, 60);

  const resolucao = divisaoProporcionalComPassos(total, [p1, p2]);
  const maior = Math.max(...resolucao.resultado);
  const partes = resolucao.resultado;

  return {
    id: `proporcao-divisao-${total}-${p1}-${p2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Dividindo R$ ${total},00 em partes proporcionais a ${p1} e ${p2}, qual é a MAIOR das partes?`,
    enunciadoTex: `${total} = x_1 + x_2 \\quad \\text{com} \\quad \\frac{x_1}{${p1}} = \\frac{x_2}{${p2}}`,
    gabarito: maior,
    resolucao: { resultado: maior, passos: resolucao.passos },
    conceitos: ['proporcao.divisao', 'proporcao.razao'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.min(...partes),
          diagnostico:
            'Esse é o valor da MENOR parte. A maior corresponde ao maior peso — confira qual ' +
            'dos dois pesos é o maior antes de responder.',
          passo: 2,
          conceito: 'proporcao.divisao',
        },
        {
          resposta: total / 2,
          diagnostico:
            'Você dividiu o total em duas partes iguais. A divisão é PROPORCIONAL aos pesos: ' +
            'só daria metade para cada se os dois pesos fossem iguais.',
          passo: 0,
          conceito: 'proporcao.divisao',
        },
      ],
      maior,
      proximos,
    ),
  };
}
