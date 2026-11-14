import { Fracao, mmcLista, observarSimplificacao, resolverLinearComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  pedindoFracao,
  semColisoes,
} from '@core/treino/models/treino.model';

const saoEquivalentes = (a: Fracao, b: Fracao): boolean => a.igualA(b);

/** Constrói a fração da armadilha, ou null quando ela não existe (denominador zero). */
function tentar(construir: () => Fracao): Fracao | null {
  try {
    return construir();
  } catch {
    return null;
  }
}

/** Monta uma armadilha apenas se a resposta errada for representável. */
function armadilha(
  resposta: Fracao | null,
  diagnostico: string,
  passo: number,
): readonly [Armadilha<Fracao>] | readonly [] {
  return resposta === null
    ? []
    : [{ resposta, diagnostico, passo, conceito: 'equacao1.igualdade' }];
}

/**
 * Exercícios de equação do 1º grau.
 *
 * As armadilhas reproduzem os erros de sinal — somar onde se deveria subtrair,
 * trocar a ordem da divisão — que são a causa de quase todo erro no tema.
 */
export const geradorEquacao1: GeradorExercicio<Fracao> = {
  topicoId: 'equacao-primeiro-grau',
  // «um número» convidava a responder 0,83 para 5/6 — e 5/6 não tem
  // decimal exato, então a resposta certa era recusada sem explicação.
  formatoResposta: 'inteiro ou fração, ex.: 4 ou -3/2 — decimal só se for exato',

  /**
   * A história que uma LLM local pode escrever em volta de `ax + b = c`.
   *
   * Só os três coeficientes vão para ela, e só quando servem para uma
   * contagem: `a` positivo, `b` positivo, `c` maior que `b` e raiz inteira
   * positiva. Sem essas condições a história ficaria absurda — «montou −3
   * kits», «sobrou 2,5 peças» —, e quem sabe isso é o gerador, não o
   * validador de texto.
   */
  problemaDeTexto: {
    forma: 'ax-mais-b',
    pedido: {
      topico: 'Equação do primeiro grau',
      oQueExercita: 'resolver ax + b = c, achando o valor de x',
      dados: [
        {
          indice: 0,
          significado: 'o valor que se repete a cada unidade',
          tipo: 'inteiro',
          faixa: [2, 12],
        },
        {
          indice: 1,
          significado: 'uma parcela fixa, que entra uma vez só',
          tipo: 'inteiro',
          faixa: [1, 20],
        },
        { indice: 2, significado: 'o total alcançado no fim', tipo: 'inteiro', faixa: [20, 200] },
      ],
      pergunta: 'quantas unidades da grandeza que se repete',
      contextos: ['oficina', 'transporte de carga', 'obra', 'linha de montagem'],
    },
  },

  gerar(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
    const pergunta = sortearPergunta(nivel, rng);
    if (pergunta === 'fracoes') {
      return exercicioFracoes(nivel, rng);
    }
    if (pergunta === 'problema') {
      return exercicioProblema(nivel, rng);
    }

    const { a, b, c } = sortear(nivel, rng);

    const resolucao = resolverLinearComPassos(a, b, c);
    const gabarito = resolucao.resultado.raiz;

    return {
      id: `equacao1-${nivel}-${a}-${b}-${c}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: pedindoFracao('Resolva a equação e informe o valor exato de x.', gabarito),
      enunciadoTex: `${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${c}`,
      gabarito,
      resolucao: { resultado: gabarito, passos: resolucao.passos },
      conceitos: ['equacao1.igualdade', 'equacao1.verificacao'],
      // A história só serve para contagem: coeficientes positivos, total
      // acima da parcela fixa e raiz inteira positiva.
      dadosDoProblema:
        a > 0 && b > 0 && c > b && gabarito.ehInteira && gabarito.numerador > 0
          ? [a, b, c]
          : undefined,
      armadilhas: semColisoes(
        [
          // Somou b em vez de subtrair.
          ...armadilha(
            tentar(() => Fracao.criar(c + b, a).simplificar()),
            `Você somou ${Math.abs(b)} em vez de subtrair. Para isolar o termo com x, a ` +
              `operação tem de DESFAZER o que está na equação: se aparece ${b >= 0 ? '+' : '-'}` +
              `${Math.abs(b)}, subtraímos ${b >= 0 ? '' : '-'}${Math.abs(b)} dos dois lados.`,
            1,
          ),
          // Dividiu na ordem errada. Não existe quando o lado direito zera.
          ...armadilha(
            tentar(() => Fracao.criar(a, c - b).simplificar()),
            'A divisão ficou invertida. Dividimos o lado independente PELO coeficiente de x, ' +
              'não o contrário.',
            2,
          ),
          // Esqueceu de dividir pelo coeficiente.
          ...armadilha(
            Fracao.deInteiro(c - b),
            `Falta dividir por ${a}, o coeficiente de x. O que foi encontrado é o valor de ` +
              `${a}x, não o de x.`,
            2,
          ),
        ],
        gabarito,
        saoEquivalentes,
      ),
      dica: nivel === 'facil' ? 'Primeiro isole o termo com x, depois divida.' : undefined,
    };
  },

  analisar: (entrada) => Fracao.analisar(entrada),
  saoEquivalentes,
  formatar: (valor) => valor.toString(),
  // Resposta certa em forma ampliada conta como acerto e ganha o recado de
  // que existe uma menor — a mesma regra de Frações.
  observarResposta: observarSimplificacao,
};

type Pergunta = 'linear' | 'fracoes' | 'problema';

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['linear', 'problema']);
    case 'medio':
    case 'dificil':
      return rng.escolher<Pergunta>(['linear', 'fracoes', 'problema']);
    // No Extremo, a equação com três denominadores — só ele a pede — ao lado
    // da linear de coeficientes primos.
    case 'extremo':
      return rng.escolher<Pergunta>(['linear', 'fracoes']);
  }
}

/** `+ 3` ou `- 3`, para emendar um termo numa expressão. */
const sg = (v: number): string => (v >= 0 ? `+ ${v}` : `- ${Math.abs(v)}`);
/** `x + 3` ou `x - 3`. */
const binomio = (m: number): string => `x ${sg(m)}`;

function armadilhaDe(
  construir: () => Fracao,
  diagnostico: string,
  passo: number,
  conceito: string,
): Armadilha<Fracao>[] {
  const resposta = tentar(() => construir().simplificar());
  return resposta === null ? [] : [{ resposta, diagnostico, passo, conceito }];
}

/**
 * Equação com frações: o mmc dos denominadores transforma tudo em inteiros.
 *
 * - Médio: x/p + x/r = k, com raiz inteira.
 * - Difícil: (x + m)/p − (x + n)/r = k — o menos antes da fração vale para o
 *   numerador inteiro, e é aí que o sinal se perde.
 * - Extremo: três denominadores, com x também do lado direito.
 */
function exercicioFracoes(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
  if (nivel === 'medio') {
    const [p, r] = rng.embaralhar([2, 3, 4, 5, 6]).slice(0, 2) as [number, number];
    const L = mmcLista([p, r]);
    const x = L * (rng.inteiro(1, 6) * (rng.booleano(0.8) ? 1 : -1));
    const k = x / p + x / r;
    const [A, B] = [L / p, L / r];
    const gabarito = Fracao.deInteiro(x);

    return {
      id: `equacao1-fracoes-${p}${r}-${k}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Resolva a equação e informe o valor exato de x.',
      enunciadoTex: `\\frac{x}{${p}} + \\frac{x}{${r}} = ${k}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: `Os denominadores são ${p} e ${r}: o mmc deles é ${L}.`,
            tex: `\\text{mmc}(${p}, ${r}) = ${L}`,
          },
          {
            descricao: `Multiplicamos TODOS os termos, dos dois lados, por ${L}: as frações somem.`,
            tex: `${L} \\cdot \\frac{x}{${p}} + ${L} \\cdot \\frac{x}{${r}} = ${L} \\cdot ${k} \\;\\Rightarrow\\; ${A}x + ${B}x = ${L * k}`,
          },
          {
            descricao: 'Juntamos os termos em x.',
            tex: `${A + B}x = ${L * k}`,
          },
          {
            descricao: `Dividimos por ${A + B}.`,
            tex: `x = \\frac{${L * k}}{${A + B}} = ${x}`,
          },
        ],
      },
      conceitos: ['equacao1.fracoes', 'equacao1.igualdade'],
      armadilhas: semColisoes(
        [
          ...armadilhaDe(
            () => Fracao.criar(k, A + B),
            `Faltou multiplicar o lado direito por ${L}: o mmc multiplica TODOS os termos, dos dois lados.`,
            1,
            'equacao1.fracoes',
          ),
          ...armadilhaDe(
            () => Fracao.deInteiro(k * (p + r)),
            'Frações não se somam juntando os denominadores: x/p + x/r não é x/(p + r). Use o mmc.',
            0,
            'equacao1.fracoes',
          ),
        ],
        gabarito,
        saoEquivalentes,
      ),
      dica: `Multiplique os dois lados pelo mmc de ${p} e ${r}: as frações viram números inteiros.`,
    };
  }

  const extremo = nivel === 'extremo';
  const denominadores = rng.embaralhar(extremo ? [2, 3, 4, 5, 6, 8, 10, 12] : [2, 3, 4, 5, 6]);
  let p = 2;
  let r = 3;
  let t = 4;
  let m = 1;
  let n = 1;
  let k = 1;
  let A = 0;
  let B = 0;
  let C = 0;
  let L = 1;
  let coef = 0;
  // Sorteia até o coeficiente de x não se anular.
  for (let tentativa = 0; tentativa < 50 && coef === 0; tentativa++) {
    [p, r, t] = rng.embaralhar(denominadores).slice(0, 3) as [number, number, number];
    m = rng.inteiro(-9, 9) || 1;
    n = rng.inteiro(-9, 9) || -1;
    k = rng.inteiro(-6, 6);
    L = mmcLista(extremo ? [p, r, t] : [p, r]);
    [A, B, C] = [L / p, L / r, extremo ? L / t : 0];
    coef = A - B - C;
  }

  // A(x + m) − B(x + n) = Cx + kL  ⇒  (A − B − C)x = kL − Am + Bn
  const direita = k * L - A * m + B * n;
  const gabarito = Fracao.criar(direita, coef).simplificar();
  const ladoDireitoTex = extremo ? `\\frac{x}{${t}} ${k === 0 ? '' : sg(k)}` : `${k}`;
  const ladoDireitoMult = extremo ? `${C}x ${k === 0 ? '' : sg(k * L)}` : `${k * L}`;

  return {
    id: `equacao1-fracoes-${p}${r}${extremo ? t : ''}-${m}${n}${k}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: pedindoFracao('Resolva a equação e informe o valor exato de x.', gabarito),
    enunciadoTex: `\\frac{${binomio(m)}}{${p}} - \\frac{${binomio(n)}}{${r}} = ${ladoDireitoTex}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Os denominadores são ${extremo ? `${p}, ${r} e ${t}` : `${p} e ${r}`}: o mmc é ${L}.`,
          tex: `\\text{mmc}(${extremo ? `${p}, ${r}, ${t}` : `${p}, ${r}`}) = ${L}`,
        },
        {
          descricao: `Multiplicamos todos os termos por ${L}. Cada fração vira o numerador vezes ${L} dividido pelo seu denominador.`,
          tex: `${A}(${binomio(m)}) - ${B}(${binomio(n)}) = ${ladoDireitoMult}`,
          nota: 'O parêntese é obrigatório: o menos antes da segunda fração vale para o numerador inteiro.',
        },
        {
          descricao: 'Distribuímos — o menos troca o sinal dos DOIS termos do segundo parêntese.',
          tex: `${A}x ${sg(A * m)} - ${B}x ${sg(-B * n)} = ${ladoDireitoMult}`,
        },
        {
          descricao: 'Termos em x de um lado, números do outro.',
          tex: `${coef}x = ${direita}`,
        },
        {
          descricao: `Dividimos por ${coef}.`,
          tex: `x = \\frac{${direita}}{${coef}} = ${gabarito.paraTex()}`,
        },
      ],
    },
    conceitos: ['equacao1.fracoes', 'equacao1.igualdade'],
    armadilhas: semColisoes(
      [
        ...armadilhaDe(
          () => Fracao.criar(k * L - A * m - B * n, coef),
          `O menos antes da segunda fração não chegou ao ${Math.abs(n)}: −${B}(${binomio(n)}) = ` +
            `−${B}x ${sg(-B * n)}. O sinal troca nos dois termos do parêntese.`,
          2,
          'equacao1.fracoes',
        ),
        ...armadilhaDe(
          () => Fracao.criar(k - A * m + B * n, coef),
          `Faltou multiplicar o número solto do lado direito (${k}) por ${L}: o mmc multiplica TODOS os termos.`,
          1,
          'equacao1.fracoes',
        ),
      ],
      gabarito,
      saoEquivalentes,
    ),
    dica:
      nivel === 'dificil'
        ? 'Multiplique tudo pelo mmc dos denominadores. O menos antes de uma fração vale para o numerador INTEIRO: use parênteses.'
        : undefined,
  };
}

type Cenario = 'taxi' | 'idades' | 'perimetro' | 'consecutivos';

const VEZES = ['dobro', 'triplo', 'quádruplo'] as const;

/**
 * Problema de enunciado que vira equação do 1º grau.
 *
 * A conta é fácil; o que se treina é traduzir o texto — escolher o que é x,
 * escrever a relação e só então resolver.
 */
function exercicioProblema(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
  const cenario = rng.escolher<Cenario>(
    nivel === 'facil'
      ? ['taxi', 'idades']
      : nivel === 'medio'
        ? ['taxi', 'idades', 'perimetro']
        : ['perimetro', 'consecutivos', 'idades'],
  );

  let enunciado: string;
  let resposta: number;
  let passos: { descricao: string; tex: string; nota?: string }[];
  let erradas: Armadilha<Fracao>[];
  let dica: string | undefined;
  // Os dados do enunciado, resumidos em uma linha — o que vai para a equação.
  let dados: string;

  switch (cenario) {
    case 'taxi': {
      const b = rng.inteiro(3, 9);
      const p = rng.inteiro(2, 5);
      const x = rng.inteiro(3, 25);
      const T = b + p * x;
      resposta = x;
      enunciado =
        `Uma corrida de táxi custa $ ${b},00 de bandeirada mais $ ${p},00 por quilômetro rodado. ` +
        `Uma corrida custou $ ${T},00. Quantos quilômetros foram rodados?`;
      dados =
        `\\text{bandeirada} = \\text{R}\\$\\,${b} \\qquad \\text{por km} = \\text{R}\\$\\,${p} ` +
        `\\qquad \\text{total} = \\text{R}\\$\\,${T}`;
      passos = [
        {
          descricao: `Chamamos de x os quilômetros rodados. O preço é a bandeirada mais ${p} reais por km.`,
          tex: `${b} + ${p}x = ${T}`,
        },
        { descricao: `Subtraímos a bandeirada dos dois lados.`, tex: `${p}x = ${T - b}` },
        { descricao: `Dividimos por ${p}.`, tex: `x = \\frac{${T - b}}{${p}} = ${x}` },
      ];
      erradas = [
        ...armadilhaDe(
          () => Fracao.criar(T, p),
          `Você dividiu o total por ${p} sem descontar a bandeirada de $ ${b},00, que é paga uma vez só.`,
          1,
          'equacao1.problemas',
        ),
        ...armadilhaDe(
          () => Fracao.criar(T + b, p),
          'A bandeirada se SUBTRAI do total antes de dividir — ela foi acrescentada em vez de tirada.',
          1,
          'equacao1.problemas',
        ),
      ];
      dica =
        nivel === 'facil'
          ? 'Chame de x os quilômetros: o preço é bandeirada + (preço por km)·x. Iguale ao total e resolva.'
          : undefined;
      break;
    }
    case 'idades': {
      const m = rng.inteiro(2, 4);
      const x = rng.inteiro(3, 15);
      const k = rng.inteiro(2, 10);
      const S = (m + 1) * x + 2 * k;
      resposta = x;
      enunciado =
        `Ana tem o ${VEZES[m - 2]} da idade de Bia. Daqui a ${k} anos, a soma das idades das ` +
        `duas será ${S} anos. Quantos anos Bia tem hoje?`;
      dados = `\\text{Ana} = ${m} \\times \\text{Bia} \\qquad \\text{daqui a } ${k} \\text{ anos: soma} = ${S} \\text{ anos}`;
      passos = [
        {
          descricao: `Chamamos de x a idade de Bia hoje; Ana tem ${m} vezes isso.`,
          tex: `\\text{Bia} = x \\qquad \\text{Ana} = ${m}x`,
        },
        {
          descricao: `Daqui a ${k} anos, CADA uma terá ${k} anos a mais.`,
          tex: `(x + ${k}) + (${m}x + ${k}) = ${S}`,
        },
        { descricao: 'Juntando os termos semelhantes.', tex: `${m + 1}x + ${2 * k} = ${S}` },
        {
          descricao: 'Isolando x.',
          tex: `${m + 1}x = ${S - 2 * k} \\;\\Rightarrow\\; x = ${x}`,
        },
      ];
      erradas = [
        ...armadilhaDe(
          () => Fracao.criar(S - k, m + 1),
          `Os ${k} anos passam para as DUAS: somam-se ${2 * k} anos, não ${k}.`,
          1,
          'equacao1.problemas',
        ),
        ...armadilhaDe(
          () => Fracao.deInteiro(m * x),
          'Essa é a idade de Ana. A pergunta é a idade de Bia.',
          0,
          'equacao1.problemas',
        ),
        ...armadilhaDe(
          () => Fracao.criar(S, m + 1),
          `A soma ${S} é a de daqui a ${k} anos, não a de hoje: os anos que vão passar entram na equação.`,
          1,
          'equacao1.problemas',
        ),
      ];
      dica =
        nivel === 'facil'
          ? 'Chame de x a idade de Bia. Daqui a alguns anos, os anos passam para as duas.'
          : undefined;
      break;
    }
    case 'perimetro': {
      const d = rng.inteiro(1, 9);
      const x = rng.inteiro(2, 20);
      const P = 4 * x + 2 * d;
      resposta = x;
      enunciado =
        `Um retângulo tem o comprimento ${d} cm maior que a largura, e o perímetro mede ${P} cm. ` +
        'Qual é a largura, em cm?';
      dados = `\\text{comprimento} = \\text{largura} + ${d}\\,\\text{cm} \\qquad P = ${P}\\,\\text{cm}`;
      passos = [
        {
          descricao: 'Chamamos de x a largura.',
          tex: `\\text{largura} = x \\qquad \\text{comprimento} = x + ${d}`,
        },
        {
          descricao: 'O perímetro soma os QUATRO lados: duas larguras e dois comprimentos.',
          tex: `2x + 2(x + ${d}) = ${P}`,
        },
        { descricao: 'Distribuindo e juntando.', tex: `4x + ${2 * d} = ${P}` },
        {
          descricao: 'Isolando x.',
          tex: `4x = ${P - 2 * d} \\;\\Rightarrow\\; x = ${x}`,
        },
      ];
      erradas = [
        ...armadilhaDe(
          () => Fracao.deInteiro(x + d),
          'Esse é o comprimento. A pergunta é a largura.',
          0,
          'equacao1.problemas',
        ),
        ...armadilhaDe(
          () => Fracao.criar(P - d, 2),
          'Você somou só dois lados. O perímetro é a volta inteira: duas larguras e dois comprimentos.',
          1,
          'equacao1.problemas',
        ),
      ];
      dica =
        nivel === 'medio'
          ? 'Com largura x, o comprimento é x mais a diferença. O perímetro soma os quatro lados.'
          : undefined;
      break;
    }
    case 'consecutivos': {
      const x = rng.inteiro(3, 40);
      const S = 3 * x + 3;
      resposta = x + 2;
      enunciado =
        `Três prateleiras têm quantidades consecutivas de livros e, juntas, guardam ${S} livros. ` +
        'Quantos livros tem a prateleira mais cheia?';
      dados = `\\text{3 quantidades consecutivas} \\qquad \\text{soma} = ${S} \\text{ livros}`;
      passos = [
        {
          descricao: 'Quantidades consecutivas: x, x + 1 e x + 2.',
          tex: `x + (x + 1) + (x + 2) = ${S}`,
        },
        { descricao: 'Juntando os termos.', tex: `3x + 3 = ${S}` },
        {
          descricao: 'Isolando x, a menor quantidade.',
          tex: `3x = ${S - 3} \\;\\Rightarrow\\; x = ${x}`,
        },
        {
          descricao: 'A prateleira mais cheia tem x + 2.',
          tex: `x + 2 = ${x + 2}`,
        },
      ];
      erradas = [
        ...armadilhaDe(
          () => Fracao.deInteiro(x),
          'Esse x é a prateleira MENOS cheia. A mais cheia tem x + 2.',
          3,
          'equacao1.problemas',
        ),
        ...armadilhaDe(
          () => Fracao.deInteiro(x + 1),
          'Essa é a do meio — a média das três. A mais cheia tem dois livros a mais que a menor.',
          3,
          'equacao1.problemas',
        ),
      ];
      dica =
        nivel === 'dificil'
          ? 'Consecutivos são x, x + 1 e x + 2. Ache x e não esqueça que a pergunta é pelo maior.'
          : undefined;
      break;
    }
  }

  const gabarito = Fracao.deInteiro(resposta);
  return {
    id: `equacao1-problema-${cenario}-${resposta}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado,
    enunciadoTex: dados,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['equacao1.problemas', 'equacao1.igualdade'],
    armadilhas: semColisoes(erradas, gabarito, saoEquivalentes),
    dica,
  };
}

function sortear(nivel: Nivel, rng: Rng): { a: number; b: number; c: number } {
  switch (nivel) {
    case 'facil': {
      // Coeficiente positivo e raiz inteira.
      const a = rng.inteiro(2, 6);
      const raiz = rng.inteiro(1, 10);
      const b = rng.inteiro(1, 12);
      return { a, b, c: a * raiz + b };
    }
    case 'medio': {
      // Coeficiente pode ser negativo; raiz ainda inteira.
      const a = rng.inteiro(2, 9) * rng.sinal();
      const raiz = rng.inteiro(-8, 8);
      const b = rng.inteiro(-15, 15);
      return { a, b, c: a * raiz + b };
    }
    case 'dificil': {
      // Raiz fracionária, que obriga a resposta exata em fração.
      const a = rng.inteiro(2, 12) * rng.sinal();
      const b = rng.inteiro(-20, 20);
      const c = rng.inteiro(-20, 20);
      return { a, b, c };
    }
    case 'extremo': {
      /*
       * Coeficientes de dois algarismos e primos entre si.
       *
       * A raiz sai uma fração que não simplifica — 47/23, não 3/2 —, e é aí
       * que a resposta exata deixa de poder ser adivinhada por tentativa.
       */
      const PRIMOS = [13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
      const a = rng.escolher(PRIMOS) * rng.sinal();
      const b = rng.inteiro(-99, 99);
      const c = rng.inteiro(-99, 99);
      return { a, b, c };
    }
  }
}
