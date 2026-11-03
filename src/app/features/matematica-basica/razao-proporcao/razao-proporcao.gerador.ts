import { regraDeTresComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  SEM_FORMULA,
  semColisoes,
} from '@core/treino/models/treino.model';

const TOLERANCIA = 1e-6;
const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

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
    // No fácil só direta; depois as duas, para forçar a decisão.
    const inversa = nivel === 'facil' ? false : rng.booleano();
    return exercicioRegraDeTres(nivel, rng, inversa);
  },

  analisar: (entrada) => analisarNumero(entrada.replace(/R\$/g, '')),

  ...numeroComCasas(2, 1e-4),
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
    /*
     * No Difícil, só o enunciado.
     *
     * A fórmula ao lado do texto responde a pergunta antes dela ser feita:
     * `\frac{a}{b} = \frac{c}{x}` já diz que a proporção é direta, e
     * `a \cdot b = c \cdot x` que é inversa — que é exatamente a decisão que o
     * exercício existe para treinar. Ela reaparece na resolução, depois da
     * resposta, que é quando ela ensina.
     */
    enunciadoTex:
      nivel === 'dificil'
        ? SEM_FORMULA
        : inversa
          ? `${a} \\cdot ${b} = ${c} \\cdot x \\qquad x = \\;?`
          : `\\frac{${a}}{${b}} = \\frac{${c}}{x} \\qquad x = \\;?`,
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
