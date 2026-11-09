import { Polinomio, TipoProdutoNotavel, enunciadoParaTex, expandirComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Exercícios de produtos notáveis.
 *
 * A resposta pedida é o COEFICIENTE DO TERMO DO MEIO — justamente o que se
 * perde quando alguém escreve (a+b)² = a² + b². Um único número mantém a
 * correção objetiva e aponta direto para o erro clássico.
 */
export const geradorProdutos: GeradorExercicio<number> = {
  topicoId: 'produtos-notaveis',
  formatoResposta: 'um número inteiro, ex.: 12',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearTipo(nivel, rng);
    if (
      pergunta === 'inverso-quadrado' ||
      pergunta === 'inverso-diferenca' ||
      pergunta === 'inverso-cubo'
    ) {
      return exercicioInverso(nivel, rng, pergunta);
    }
    const tipo: TipoProdutoNotavel = pergunta;
    // Fixar a = 1 no fácil deixava o tópico com pouquíssimos produtos.
    // No extremo os dois coeficientes crescem, e `a` passa a poder ser
    // negativo: no cubo isso troca o sinal de dois dos quatro termos.
    const a =
      nivel === 'facil'
        ? rng.inteiro(1, 4)
        : nivel === 'extremo'
          ? rng.inteiro(2, 15) * rng.sinal()
          : rng.inteiro(1, 9);
    const b =
      rng.inteiro(1, nivel === 'extremo' ? 20 : 14) * (tipo === 'quadrado-da-diferenca' ? -1 : 1);

    const resolucao = expandirComPassos(tipo, a, b);
    const expandido = resolucao.resultado;

    // Em todos os casos perguntamos pelo coeficiente de x.
    const gabarito = expandido.coeficiente(1);

    return {
      id: `produtos-${tipo}-${a}-${b}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        tipo === 'diferenca-de-quadrados'
          ? 'Expanda e informe o coeficiente de x no resultado.'
          : 'Expanda e informe o coeficiente do termo em x (o termo do meio).',
      enunciadoTex: `${enunciadoParaTex(tipo, a, b)} = \\;?`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          ...resolucao.passos,
          {
            descricao: 'O enunciado pede apenas o coeficiente do termo em x.',
            tex: `${expandido.paraTex()} \\Rightarrow \\text{coef. de } x = ${gabarito}`,
          },
        ],
      },
      conceitos: [conceitoDe(tipo)],
      armadilhas: semColisoes(
        [
          {
            resposta: 0,
            diagnostico:
              'Zero seria o caso de a identidade não ter termo do meio — o que só acontece na ' +
              'diferença de quadrados. No quadrado de um binômio, os dois termos cruzados se ' +
              'SOMAM em vez de se cancelar.',
            passo: 2,
            conceito: 'produtos.quadrado',
          },
          {
            resposta: a * b,
            diagnostico:
              'Você contou o termo cruzado uma vez só. Na distribuição ele aparece DUAS vezes ' +
              `— por isso o coeficiente é 2ab = ${2 * a * b}, e não ab.`,
            passo: 1,
            conceito: 'produtos.quadrado',
          },
          {
            resposta: -2 * a * b,
            diagnostico:
              'O sinal do termo do meio acompanha o sinal da parcela do binômio. Confira se ' +
              'está diante de uma soma ou de uma diferença.',
            passo: 2,
            conceito: 'produtos.quadrado',
          },
        ],
        gabarito,
        (x, y) => x === y,
      ),
      dica:
        nivel === 'facil'
          ? 'Multiplique o binômio por ele mesmo e some os termos semelhantes.'
          : undefined,
    };
  },

  analisar: analisarNumero,

  saoEquivalentes: (a, b) => a === b,
  formatar: (valor) => String(valor),
};

/** As perguntas «de trás para frente»: dado o resultado, achar o produto. */
type Inverso = 'inverso-quadrado' | 'inverso-diferenca' | 'inverso-cubo';
type Pergunta = TipoProdutoNotavel | Inverso;

function sortearTipo(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['quadrado-da-soma', 'quadrado-da-diferenca']);
    case 'medio':
      return rng.escolher<Pergunta>([
        'quadrado-da-soma',
        'quadrado-da-diferenca',
        'diferenca-de-quadrados',
        'inverso-quadrado',
      ]);
    case 'dificil':
      return rng.escolher<Pergunta>([
        'quadrado-da-soma',
        'diferenca-de-quadrados',
        'cubo-da-soma',
        'inverso-quadrado',
        'inverso-diferenca',
      ]);
    /*
     * No extremo, o cubo nos dois sentidos: expandir, com coeficientes
     * maiores, e reconhecer um cubo perfeito de quatro termos — o caminho
     * inverso, que só o Extremo pede.
     */
    case 'extremo':
      return rng.escolher<Pergunta>(['cubo-da-soma', 'inverso-cubo', 'inverso-diferenca']);
  }
}

const comSinal = (v: number): string => (v >= 0 ? `+ ${v}` : `- ${Math.abs(v)}`);
const termoX = (p: number): string => (p === 1 ? 'x' : `${p}x`);

/**
 * Produto notável na direção inversa: reconhecer o resultado e voltar à forma
 * compacta. É a mesma identidade lida da direita para a esquerda — e é assim
 * que ela aparece na fatoração e em completar quadrados.
 */
function exercicioInverso(nivel: Nivel, rng: Rng, forma: Inverso): Exercicio<number> {
  if (forma === 'inverso-diferenca') {
    const p = rng.inteiro(2, nivel === 'extremo' ? 12 : 9);
    const q = rng.inteiro(1, nivel === 'extremo' ? 15 : 12);
    const polinomio = Polinomio.de(-q * q, 0, p * p);
    return {
      id: `produtos-inv-dif-${p}-${q}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Escreva a expressão como (px + q)(px − q), com p e q positivos, e informe q.',
      enunciadoTex: `${polinomio.paraTex()} = (px + q)(px - q)`,
      gabarito: q,
      resolucao: {
        resultado: q,
        passos: [
          {
            descricao:
              'Dois termos, os dois quadrados perfeitos, subtraídos: é diferença de quadrados.',
            tex: `${polinomio.paraTex()} = (${p}x)^{2} - ${q}^{2}`,
          },
          {
            descricao: 'A identidade lida de trás para frente.',
            tex: 'u^{2} - v^{2} = (u + v)(u - v)',
          },
          {
            descricao: `Com u = ${p}x e v = ${q}.`,
            tex: `(${p}x + ${q})(${p}x - ${q}) \\;\\Rightarrow\\; q = ${q}`,
          },
        ],
      },
      conceitos: ['produtos.inverso', 'produtos.diferenca-de-quadrados'],
      armadilhas: semColisoes(
        [
          {
            resposta: q * q,
            diagnostico: `${q * q} é q², o termo solto. q é o número que, ao quadrado, dá ${q * q}.`,
            passo: 0,
            conceito: 'produtos.inverso',
          },
          {
            resposta: p,
            diagnostico: `${p} é p, o que multiplica x (${p * p}x² = (${p}x)²). O pedido é q.`,
            passo: 2,
            conceito: 'produtos.inverso',
          },
        ],
        q,
        (x, y) => x === y,
      ),
      dica:
        nivel === 'dificil'
          ? `Dois quadrados subtraídos: ${p * p}x² é (${p}x)² e ${q * q} é o quadrado de quem?`
          : undefined,
    };
  }

  if (forma === 'inverso-cubo') {
    const p = rng.inteiro(1, 3);
    const q = rng.inteiro(1, 6) * rng.sinal();
    // (px + q)³ = p³x³ + 3p²q x² + 3pq² x + q³
    const polinomio = Polinomio.de(q ** 3, 3 * p * q * q, 3 * p * p * q, p ** 3);
    return {
      id: `produtos-inv-cubo-${p}-${q}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        'Essa expressão é um cubo perfeito. Escreva-a como (px + q)³, com p positivo, e informe q.',
      enunciadoTex: `${polinomio.paraTex()} = \\left(${p === 1 ? '' : 'p'}x + q\\right)^{3}`,
      gabarito: q,
      resolucao: {
        resultado: q,
        passos: [
          {
            descricao: 'O primeiro e o último termo são cubos. A raiz cúbica conserva o sinal.',
            tex: `${p ** 3 === 1 ? '' : p ** 3}x^{3} = (${termoX(p)})^{3} \\qquad ${q ** 3} = (${q})^{3}`,
          },
          {
            descricao: 'Conferimos os termos do meio com 3u²v e 3uv².',
            tex:
              `3 \\cdot (${termoX(p)})^{2} \\cdot (${q}) = ${3 * p * p * q}x^{2} \\qquad ` +
              `3 \\cdot ${termoX(p)} \\cdot (${q})^{2} = ${3 * p * q * q}x`,
          },
          {
            descricao: 'Batem os quatro termos: é o cubo do binômio.',
            tex: `${polinomio.paraTex()} = \\left(${termoX(p)} ${comSinal(q)}\\right)^{3} \\;\\Rightarrow\\; q = ${q}`,
          },
        ],
      },
      conceitos: ['produtos.inverso', 'produtos.cubo'],
      armadilhas: semColisoes(
        [
          {
            resposta: q ** 3,
            diagnostico: `${q ** 3} é q³, o termo solto. q é a sua raiz CÚBICA.`,
            passo: 0,
            conceito: 'produtos.inverso',
          },
          {
            resposta: -q,
            diagnostico:
              'A raiz cúbica conserva o sinal: o cubo de um negativo é negativo. Confira o sinal do termo solto.',
            passo: 0,
            conceito: 'produtos.cubo',
          },
          {
            resposta: 3 * p * p * q,
            diagnostico: 'Esse é o coeficiente de x², que vale 3p²q. O pedido é o próprio q.',
            passo: 1,
            conceito: 'produtos.cubo',
          },
        ],
        q,
        (x, y) => x === y,
      ),
      dica:
        nivel === 'extremo'
          ? `Tire a raiz cúbica do primeiro e do último termo, mantendo o sinal; depois confira os do meio com 3u²v e 3uv².`
          : undefined,
    };
  }

  // inverso-quadrado: a²x² + 2abx + b² = (ax + b)²
  const p = nivel === 'medio' ? 1 : rng.inteiro(2, 6);
  const q = rng.inteiro(1, 12) * rng.sinal();
  const polinomio = Polinomio.de(q * q, 2 * p * q, p * p);
  return {
    id: `produtos-inv-quad-${p}-${q}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Esse trinômio é um quadrado perfeito. Escreva-o como ' +
      `${p === 1 ? '(x + q)²' : '(px + q)², com p positivo,'} e informe q.`,
    enunciadoTex: `${polinomio.paraTex()} = \\left(${p === 1 ? '' : 'p'}x + q\\right)^{2}`,
    gabarito: q,
    resolucao: {
      resultado: q,
      passos: [
        {
          descricao: 'O primeiro e o último termo são quadrados perfeitos.',
          tex: `${p * p === 1 ? '' : p * p}x^{2} = (${termoX(p)})^{2} \\qquad ${q * q} = ${Math.abs(q)}^{2}`,
        },
        {
          descricao: `O termo do meio confirma: 2 vezes ${termoX(p)} vezes ${Math.abs(q)}.`,
          tex: `2 \\cdot ${termoX(p)} \\cdot ${Math.abs(q)} = ${2 * p * Math.abs(q)}x`,
        },
        {
          descricao: 'O sinal de q é o sinal do termo do meio.',
          tex: `${polinomio.paraTex()} = \\left(${termoX(p)} ${comSinal(q)}\\right)^{2} \\;\\Rightarrow\\; q = ${q}`,
        },
      ],
    },
    conceitos: ['produtos.inverso', 'produtos.quadrado'],
    armadilhas: semColisoes(
      [
        {
          resposta: -q,
          diagnostico: `O termo do meio é ${q > 0 ? 'positivo' : 'negativo'}, então o binômio é uma ${q > 0 ? 'SOMA' : 'DIFERENÇA'}: q tem esse sinal.`,
          passo: 2,
          conceito: 'produtos.quadrado',
        },
        {
          resposta: q * q,
          diagnostico: `${q * q} é q², o termo solto. q é a sua raiz quadrada, com o sinal do termo do meio.`,
          passo: 0,
          conceito: 'produtos.inverso',
        },
        {
          resposta: 2 * p * q,
          diagnostico: `${2 * p * q} é o coeficiente do termo do meio, 2pq. Divida por 2p para chegar a q.`,
          passo: 1,
          conceito: 'produtos.quadrado',
        },
      ],
      q,
      (x, y) => x === y,
    ),
    dica:
      nivel === 'medio'
        ? 'O último termo é q²: tire a raiz quadrada. O sinal de q é o sinal do termo do meio.'
        : undefined,
  };
}

function conceitoDe(tipo: TipoProdutoNotavel): string {
  switch (tipo) {
    case 'diferenca-de-quadrados':
      return 'produtos.diferenca-de-quadrados';
    case 'cubo-da-soma':
      return 'produtos.cubo';
    default:
      return 'produtos.quadrado';
  }
}

/** Reexportado para o componente montar a grade de identidades. */
export const TIPOS_DISPONIVEIS: readonly TipoProdutoNotavel[] = [
  'quadrado-da-soma',
  'quadrado-da-diferenca',
  'diferenca-de-quadrados',
  'cubo-da-soma',
];

export const polinomioDoTipo = (tipo: TipoProdutoNotavel, a: number, b: number): Polinomio =>
  expandirComPassos(tipo, a, b).resultado;
