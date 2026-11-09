import {
  INVERSA_TEX,
  INVERSA_TEXTO,
  IMAGEM_DA_INVERSA,
  RAZAO_TEX,
  RazaoTrig,
  ValorNotavel,
  VALORES_NOTAVEIS,
  grausTex,
  inversaEmGraus,
  naPrimeiraVolta,
  resolverEquacaoTrigComPassos,
  solucoesNaVolta,
} from '@core/math';
import { Passo } from '@core/math/tipos/tipos';
import { Rng } from '@core/treino/rng/rng';
import {
  analisarNumero,
  formatarNumero,
  proximosEmCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  semColisoes,
} from '@core/treino/models/treino.model';

const proximos = proximosEmCasas(1);

type Pergunta =
  'inversa' | 'basica' | 'linear' | 'inversa-decimal' | 'decimal' | 'arco-multiplo' | 'quadratica';

/** O que se pede de um conjunto de soluções: um número só, para caber no campo. */
type Pedido = 'menor' | 'maior' | 'soma' | 'quantas';

const PEDIDO_TEXTO: Readonly<Record<Pedido, string>> = {
  menor: 'a menor solução, em graus',
  maior: 'a maior solução, em graus',
  soma: 'a soma de todas as soluções, em graus',
  quantas: 'quantas soluções existem',
};

const NOME_TEXTO: Readonly<Record<RazaoTrig, string>> = { sen: 'sen', cos: 'cos', tg: 'tg' };

const NOME_LONGO: Readonly<Record<RazaoTrig, string>> = {
  sen: 'seno',
  cos: 'cosseno',
  tg: 'tangente',
};

const CONCEITO_DA_RAZAO: Readonly<Record<RazaoTrig, string>> = {
  sen: 'eqtrig.seno-cosseno',
  cos: 'eqtrig.seno-cosseno',
  tg: 'eqtrig.tangente',
};

const INTERVALO = 'em [0°, 360°)';

/**
 * Exercícios de equações trigonométricas e funções inversas.
 *
 * A resposta é sempre um número em graus — a menor, a maior, a soma das
 * soluções ou quantas são —, porque o assunto do tópico é justamente que a
 * equação tem MAIS de uma solução e a inversa devolve só uma.
 */
export const geradorEquacoesTrig: GeradorExercicio<number> = {
  topicoId: 'equacoes-trigonometricas',
  formatoResposta: 'um número, ex.: 150 ou 2',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'inversa':
        return exercicioInversa(nivel, rng);
      case 'inversa-decimal':
        return exercicioInversaDecimal(nivel, rng);
      case 'basica':
        return exercicioBasica(nivel, rng);
      case 'linear':
        return exercicioLinear(nivel, rng);
      case 'decimal':
        return exercicioDecimal(nivel, rng);
      case 'arco-multiplo':
        return exercicioArcoMultiplo(nivel, rng);
      case 'quadratica':
        return exercicioQuadratica(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar: (valor) => formatarNumero(valor, 2),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['inversa', 'basica']);
    case 'medio':
      return rng.escolher<Pergunta>(['basica', 'linear', 'inversa-decimal']);
    case 'dificil':
      return rng.escolher<Pergunta>(['linear', 'decimal', 'arco-multiplo']);
    // A equação do 2º grau em sen x só existe aqui; o arco múltiplo vem com
    // três ou quatro voltas e pede a soma, não a menor.
    case 'extremo':
      return rng.escolher<Pergunta>(['quadratica', 'arco-multiplo']);
  }
}

// ── Utilidades ───────────────────────────────────────────────────────────────

function responder(pedido: Pedido, solucoes: readonly number[]): number {
  switch (pedido) {
    case 'menor':
      return Math.min(...solucoes);
    case 'maior':
      return Math.max(...solucoes);
    case 'soma':
      return solucoes.reduce((total, s) => total + s, 0);
    case 'quantas':
      return solucoes.length;
  }
}

function passoDoPedido(pedido: Pedido, solucoes: readonly number[]): Passo {
  const resposta = responder(pedido, solucoes);
  switch (pedido) {
    case 'menor':
      return { descricao: 'A menor delas.', tex: `x = ${grausTex(resposta)}°` };
    case 'maior':
      return { descricao: 'A maior delas.', tex: `x = ${grausTex(resposta)}°` };
    case 'soma':
      return {
        descricao: 'Somamos todas.',
        tex: `${solucoes.map((s) => `${grausTex(s)}°`).join(' + ')} = ${grausTex(resposta)}°`,
      };
    case 'quantas':
      return {
        descricao: 'Contamos as soluções.',
        tex: `${resposta}\\text{ ${resposta === 1 ? 'solução' : 'soluções'}}`,
      };
  }
}

/** Casas decimais pedidas no enunciado, quando a resposta não é inteira. */
function avisoDeCasas(valor: number): string {
  if (Math.abs(valor - Math.round(valor)) < 1e-9) return '';
  return Math.abs(valor * 10 - Math.round(valor * 10)) < 1e-9
    ? ' (1 casa decimal)'
    : ' (2 casas decimais)';
}

const radianos = (graus: number): number => (graus * Math.PI) / 180;

const ARMADILHA_RADIANOS = (graus: number, conceito: string): Armadilha<number> => ({
  resposta: radianos(graus),
  diagnostico:
    'Esse é o ângulo em RADIANOS. O enunciado pede graus: confira o modo da calculadora ' +
    '(DEG, e não RAD).',
  passo: 0,
  conceito,
});

/**
 * Armadilhas comuns a toda equação resolvida na volta: esquecer a segunda
 * solução e usar a simetria da função errada.
 */
function armadilhasDaVolta(
  razao: RazaoTrig,
  valor: number,
  pedido: Pedido,
  solucoes: readonly number[],
  passoBase: number,
): Armadilha<number>[] {
  const principal = inversaEmGraus(razao, valor)!;
  const conceito = CONCEITO_DA_RAZAO[razao];
  const armadilhas: Armadilha<number>[] = [];

  if (solucoes.length > 1) {
    armadilhas.push({
      resposta: responder(pedido, [naPrimeiraVolta(principal)]),
      diagnostico:
        razao === 'tg'
          ? 'Faltou a segunda solução: a tangente se repete a cada 180°, então x₀ + 180° também serve.'
          : `Faltou a segunda solução. A calculadora devolve só uma, dentro de ${IMAGEM_DA_INVERSA[razao]}; ` +
            `na volta inteira o ${NOME_LONGO[razao]} assume esse valor em DOIS ângulos.`,
      passo: passoBase + 1,
      conceito,
    });
  }

  if (razao !== 'tg') {
    // A simetria da outra função: 360° − x₀ para o seno, 180° − x₀ para o cosseno.
    const errada = razao === 'sen' ? 360 - principal : 180 - principal;
    const conjunto = [...new Set([naPrimeiraVolta(principal), naPrimeiraVolta(errada)])];
    armadilhas.push({
      resposta: responder(pedido, conjunto),
      diagnostico:
        razao === 'sen'
          ? 'O seno se repete em 180° − x₀ (simétrico pelo eixo vertical), não em 360° − x₀, que é a regra do cosseno.'
          : 'O cosseno se repete em 360° − x₀ (simétrico pelo eixo horizontal), não em 180° − x₀, que é a regra do seno.',
      passo: passoBase + 1,
      conceito,
    });
  }

  if (pedido !== 'quantas' && pedido !== 'soma') {
    armadilhas.push(ARMADILHA_RADIANOS(responder(pedido, solucoes), conceito));
  }

  return armadilhas;
}

function sortearPedido(
  rng: Rng,
  solucoes: readonly number[],
  permitidos: readonly Pedido[],
): Pedido {
  // Com uma solução só, «a menor» e «a maior» são a mesma pergunta.
  if (solucoes.length === 1) return 'menor';
  return rng.escolher(permitidos);
}

// ── Inversas ─────────────────────────────────────────────────────────────────

function exercicioInversa(nivel: Nivel, rng: Rng): Exercicio<number> {
  const razao = rng.escolher<RazaoTrig>(['sen', 'cos', 'tg']);
  const notavel = rng.escolher(VALORES_NOTAVEIS[razao]);
  const gabarito = inversaEmGraus(razao, notavel.valor)!;
  const inversa = INVERSA_TEX[razao];
  const funcao = RAZAO_TEX[razao];

  const armadilhas: Armadilha<number>[] = [];
  if (gabarito !== 0) {
    armadilhas.push(ARMADILHA_RADIANOS(gabarito, 'eqtrig.inversas'));
  }

  if (notavel.valor < 0) {
    // O ângulo «certo» na volta, mas fora da imagem da inversa.
    const foraDaImagem =
      razao === 'cos' ? -(180 - gabarito) : razao === 'sen' ? 360 + gabarito : 180 + gabarito;
    armadilhas.push({
      resposta: foraDaImagem,
      diagnostico:
        `Esse ângulo dá o mesmo valor de ${NOME_LONGO[razao]}, mas está fora da imagem do ` +
        `${INVERSA_TEXTO[razao]}, que é ${IMAGEM_DA_INVERSA[razao]}. A inversa devolve um ângulo só, ` +
        'o que está dentro dessa faixa.',
      passo: 0,
      conceito: 'eqtrig.inversas',
    });
  } else if (razao !== 'tg') {
    armadilhas.push({
      resposta: 90 - gabarito,
      diagnostico:
        `Esse é o ${razao === 'sen' ? 'arccos' : 'arcsen'} do valor. As duas inversas se ` +
        'completam até 90°: confira qual das duas razões foi pedida.',
      passo: 1,
      conceito: 'eqtrig.inversas',
    });
  }

  return {
    id: `eqtrig-inversa-${razao}-${notavel.texto}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule ${INVERSA_TEXTO[razao]}(${notavel.texto}), em graus.`,
    enunciadoTex: `${inversa}\\left(${notavel.tex}\\right) = \\;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `O ${INVERSA_TEXTO[razao]} devolve o ângulo da imagem ${IMAGEM_DA_INVERSA[razao]} que tem esse valor de ${NOME_LONGO[razao]}.`,
          tex: `${inversa}\\, y = \\theta \\iff ${funcao}\\theta = y`,
        },
        {
          descricao: 'Na tabela dos ângulos notáveis, com o sinal já considerado.',
          tex: `${funcao}\\left(${grausTex(gabarito)}°\\right) = ${notavel.tex}`,
          nota:
            notavel.valor < 0
              ? 'Valor negativo: o ângulo fica na parte da imagem que o sinal indica.'
              : undefined,
        },
        {
          descricao: 'Esse ângulo está dentro da imagem, então é ele.',
          tex: `${inversa}\\left(${notavel.tex}\\right) = ${grausTex(gabarito)}°`,
        },
      ],
    },
    conceitos: ['eqtrig.inversas'],
    armadilhas: semColisoes(armadilhas, gabarito, proximos),
    dica:
      nivel === 'facil'
        ? 'A imagem do arcsen e do arctg vai de −90° a 90°; a do arccos, de 0° a 180°.'
        : undefined,
  };
}

const DECIMAIS = [0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9];

function exercicioInversaDecimal(nivel: Nivel, rng: Rng): Exercicio<number> {
  const razao = rng.escolher<RazaoTrig>(['sen', 'cos', 'tg']);
  const valor =
    razao === 'tg' ? (rng.inteiro(2, 40) / 10) * rng.sinal() : rng.escolher(DECIMAIS) * rng.sinal();
  const gabarito = inversaEmGraus(razao, valor)!;
  const valorTex = grausTex(valor);
  const valorTexto = valorTex.replace('{,}', ',');

  const armadilhas: Armadilha<number>[] = [ARMADILHA_RADIANOS(gabarito, 'eqtrig.inversas')];
  if (valor < 0) {
    const espelho = razao === 'cos' ? -inversaEmGraus('cos', -valor)! : 360 + gabarito;
    armadilhas.push({
      resposta: espelho,
      diagnostico:
        razao === 'cos'
          ? 'O arccos NÃO é ímpar: arccos(−y) = 180° − arccos(y), e o resultado fica entre 0° e 180°, nunca negativo.'
          : `O ${INVERSA_TEXTO[razao]} de um valor negativo é um ângulo NEGATIVO, entre −90° e 0°. Somar 360° dá um ângulo com o mesmo valor de ${NOME_LONGO[razao]}, mas fora da imagem da inversa.`,
      passo: 0,
      conceito: 'eqtrig.inversas',
    });
  }

  return {
    id: `eqtrig-inversa-decimal-${razao}-${valor}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule ${INVERSA_TEXTO[razao]}(${valorTexto}), em graus. (1 casa decimal)`,
    enunciadoTex: `${INVERSA_TEX[razao]}\\left(${valorTex}\\right) = \\;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Não é valor notável: usamos a calculadora em graus. O resultado tem de cair em ${IMAGEM_DA_INVERSA[razao]}.`,
          tex: `${INVERSA_TEX[razao]}\\left(${valorTex}\\right)`,
        },
        {
          descricao: 'O valor da inversa.',
          tex: `${INVERSA_TEX[razao]}\\left(${valorTex}\\right) = ${grausTex(Number(gabarito.toFixed(2)))}°`,
          nota: `Conferindo: ${NOME_TEXTO[razao]}(${formatarNumero(gabarito, 1)}°) ≈ ${valorTexto}.`,
        },
      ],
    },
    conceitos: ['eqtrig.inversas'],
    armadilhas: semColisoes(armadilhas, gabarito, proximos),
    dica:
      nivel === 'medio'
        ? 'Use a calculadora no modo graus (DEG). Valor negativo no arcsen ou no arctg dá ângulo negativo.'
        : undefined,
  };
}

// ── Equações na primeira volta ───────────────────────────────────────────────

function exercicioBasica(nivel: Nivel, rng: Rng): Exercicio<number> {
  const razao = rng.escolher<RazaoTrig>(['sen', 'cos', 'tg']);
  const notavel = rng.escolher(VALORES_NOTAVEIS[razao]);
  const resolucao = resolverEquacaoTrigComPassos(razao, notavel.valor, notavel.tex);
  const solucoes = resolucao.resultado;
  const pedido = sortearPedido(rng, solucoes, ['menor', 'maior', 'soma', 'soma', 'quantas']);
  const gabarito = responder(pedido, solucoes);

  return {
    id: `eqtrig-basica-${razao}-${notavel.texto}-${pedido}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Resolva ${INTERVALO} e informe ${PEDIDO_TEXTO[pedido]}.`,
    enunciadoTex: `${RAZAO_TEX[razao]} x = ${notavel.tex}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [...resolucao.passos, passoDoPedido(pedido, solucoes)],
    },
    conceitos: [CONCEITO_DA_RAZAO[razao], 'eqtrig.inversas'],
    armadilhas: semColisoes(
      armadilhasDaVolta(razao, notavel.valor, pedido, solucoes, 0),
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? razao === 'sen'
          ? 'O seno tem o mesmo valor em x e em 180° − x.'
          : razao === 'cos'
            ? 'O cosseno tem o mesmo valor em x e em 360° − x.'
            : 'A tangente se repete a cada 180°: x e x + 180°.'
        : undefined,
  };
}

/** Valores notáveis racionais, para que a·f(x) + b = c tenha só inteiros. */
const RACIONAIS: Readonly<Record<RazaoTrig, readonly ValorNotavel[]>> = {
  sen: VALORES_NOTAVEIS.sen.filter((v) => Number.isInteger(v.valor * 2)),
  cos: VALORES_NOTAVEIS.cos.filter((v) => Number.isInteger(v.valor * 2)),
  tg: VALORES_NOTAVEIS.tg.filter((v) => Number.isInteger(v.valor)),
};

const IRRACIONAIS: Readonly<Record<RazaoTrig, readonly ValorNotavel[]>> = {
  sen: VALORES_NOTAVEIS.sen.filter((v) => !Number.isInteger(v.valor * 2)),
  cos: VALORES_NOTAVEIS.cos.filter((v) => !Number.isInteger(v.valor * 2)),
  tg: VALORES_NOTAVEIS.tg.filter((v) => !Number.isInteger(v.valor)),
};

function exercicioLinear(nivel: Nivel, rng: Rng): Exercicio<number> {
  const razao = rng.escolher<RazaoTrig>(['sen', 'cos', 'tg']);
  const funcao = `${RAZAO_TEX[razao]} x`;
  const comRaiz = nivel === 'dificil' && rng.booleano();

  let notavel: ValorNotavel;
  let equacaoTex: string;
  let isolarTex: string;
  let sinalTrocado: number | null = null;
  let b = 0;

  if (comRaiz) {
    // 2 sen x − √3 = 0, 3 tg x + √3 = 0: o valor vem com raiz, e é notável.
    notavel = rng.escolher(IRRACIONAIS[razao]);
    const m = notavel.texto.includes('√2') ? 2 : 3;
    const a = razao === 'tg' ? (notavel.texto.includes('/3') ? 3 : 1) : 2;
    const sinal = notavel.valor < 0 ? '+' : '-';
    equacaoTex = `${a === 1 ? '' : a}${funcao} ${sinal} \\sqrt{${m}} = 0`;
    isolarTex =
      `${a === 1 ? '' : a}${funcao} = ${notavel.valor < 0 ? '-' : ''}\\sqrt{${m}}` +
      (a === 1 ? '' : ` \\;\\Rightarrow\\; ${funcao} = ${notavel.tex}`);
  } else {
    notavel = rng.escolher(RACIONAIS[razao]);
    const a = Number.isInteger(notavel.valor) ? rng.inteiro(2, 5) : rng.escolher([2, 4, 6]);
    do {
      b = rng.inteiro(-7, 7);
    } while (b === 0);
    const c = a * notavel.valor + b;
    equacaoTex = `${a}${funcao} ${b > 0 ? '+' : '-'} ${Math.abs(b)} = ${c}`;
    // Com c − b = 1 e a = 2, a fração já é a forma final: não repetir «1/2 = 1/2».
    const fracao = `\\frac{${c - b}}{${a}}`;
    isolarTex =
      `${a}${funcao} = ${c} ${b > 0 ? '-' : '+'} ${Math.abs(b)} = ${c - b}` +
      ` \\;\\Rightarrow\\; ${funcao} = ${fracao}` +
      (fracao === notavel.tex ? '' : ` = ${notavel.tex}`);
    // Quem não troca o sinal de b ao passá-lo para o outro lado.
    const errado = (c + b) / a;
    if (razao === 'tg' || Math.abs(errado) <= 1) sinalTrocado = errado;
  }

  const resolucao = resolverEquacaoTrigComPassos(razao, notavel.valor, notavel.tex);
  const solucoes = resolucao.resultado;
  const pedido = sortearPedido(rng, solucoes, ['menor', 'maior', 'soma']);
  const gabarito = responder(pedido, solucoes);

  const armadilhas = armadilhasDaVolta(razao, notavel.valor, pedido, solucoes, 1);
  if (sinalTrocado !== null && Math.abs(sinalTrocado - notavel.valor) > 1e-9) {
    const outras = solucoesNaVolta(razao, sinalTrocado);
    if (outras.length > 0) {
      armadilhas.push({
        resposta: responder(pedido, outras),
        diagnostico: `Ao passar o ${Math.abs(b)} para o outro lado, o sinal dele troca. Isole ${NOME_TEXTO[razao]} x com cuidado antes de procurar os ângulos.`,
        passo: 0,
        conceito: 'eqtrig.redutiveis',
      });
    }
  }

  return {
    id: `eqtrig-linear-${razao}-${equacaoTex}-${pedido}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Resolva ${INTERVALO} e informe ${PEDIDO_TEXTO[pedido]}.`,
    enunciadoTex: equacaoTex,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Isolamos ${NOME_TEXTO[razao]} x, como numa equação do 1º grau.`,
          tex: isolarTex,
        },
        ...resolucao.passos,
        passoDoPedido(pedido, solucoes),
      ],
    },
    conceitos: ['eqtrig.redutiveis', CONCEITO_DA_RAZAO[razao]],
    armadilhas: semColisoes(armadilhas, gabarito, proximos),
    dica:
      nivel === 'medio'
        ? `Primeiro isole ${NOME_TEXTO[razao]} x: passe o número para o outro lado e divida pelo coeficiente.`
        : undefined,
  };
}

function exercicioDecimal(nivel: Nivel, rng: Rng): Exercicio<number> {
  const razao = rng.escolher<RazaoTrig>(['sen', 'cos', 'tg']);
  const valor =
    razao === 'tg'
      ? (rng.inteiro(2, 40) / 10) * rng.sinal()
      : Number((rng.inteiro(1, 19) * 0.05).toFixed(2)) * rng.sinal();
  const valorTex = grausTex(valor);
  const resolucao = resolverEquacaoTrigComPassos(razao, valor, valorTex);
  const solucoes = resolucao.resultado;
  const pedido = sortearPedido(rng, solucoes, ['menor', 'maior', 'soma']);
  const gabarito = responder(pedido, solucoes);

  return {
    id: `eqtrig-decimal-${razao}-${valor}-${pedido}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Resolva ${INTERVALO} e informe ${PEDIDO_TEXTO[pedido]}. (1 casa decimal)`,
    enunciadoTex: `${RAZAO_TEX[razao]} x = ${valorTex}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [...resolucao.passos, passoDoPedido(pedido, solucoes)],
    },
    conceitos: [CONCEITO_DA_RAZAO[razao], 'eqtrig.inversas'],
    armadilhas: semColisoes(
      armadilhasDaVolta(razao, valor, pedido, solucoes, 0),
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'dificil'
        ? 'A calculadora dá só uma solução, a da imagem da inversa. A outra vem do ângulo simétrico na volta.'
        : undefined,
  };
}

// ── Equações que se reduzem às básicas ───────────────────────────────────────

function exercicioArcoMultiplo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const extremo = nivel === 'extremo';
  const razao = rng.escolher<RazaoTrig>(['sen', 'cos', 'tg']);
  const n = extremo ? rng.escolher([3, 4]) : 2;
  const notavel = rng.escolher(VALORES_NOTAVEIS[razao]);

  const base = solucoesNaVolta(razao, notavel.valor);
  const voltas = Array.from({ length: n }, (_, j) => base.map((u) => u + 360 * j)).flat();
  const solucoes = voltas.map((u) => u / n).sort((a, b) => a - b);
  const pedido: Pedido = extremo
    ? rng.escolher<Pedido>(['soma', 'quantas', 'maior'])
    : rng.escolher<Pedido>(['menor', 'maior', 'quantas']);
  const gabarito = responder(pedido, solucoes);
  const lista = (valores: readonly number[]): string =>
    valores.map((v) => `${grausTex(v)}°`).join(',\\; ');

  return {
    id: `eqtrig-multiplo-${razao}-${n}-${notavel.texto}-${pedido}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Resolva ${INTERVALO} e informe ${PEDIDO_TEXTO[pedido]}.${avisoDeCasas(gabarito)}`,
    enunciadoTex: `${RAZAO_TEX[razao]}(${n}x) = ${notavel.tex}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Chamamos u = ${n}x. Se x percorre uma volta, u percorre ${n} voltas.`,
          tex: `u = ${n}x \\qquad u \\in [0°, ${360 * n}°)`,
        },
        {
          descricao: `Na primeira volta, as soluções de ${NOME_TEXTO[razao]} u = ${notavel.texto}.`,
          tex: `u \\in \\left\\{${lista(base)}\\right\\}`,
        },
        {
          descricao: 'Somando 360° para cada volta seguinte.',
          tex: `u \\in \\left\\{${lista(voltas)}\\right\\}`,
        },
        {
          descricao: `Dividindo cada u por ${n}, voltamos para x.`,
          tex: `x \\in \\left\\{${lista(solucoes)}\\right\\}`,
        },
        passoDoPedido(pedido, solucoes),
      ],
    },
    conceitos: ['eqtrig.redutiveis', CONCEITO_DA_RAZAO[razao]],
    armadilhas: semColisoes(
      [
        {
          resposta: responder(
            pedido,
            base.map((u) => u / n),
          ),
          diagnostico: `Faltaram as voltas seguintes. Com x em [0°, 360°), o arco ${n}x dá ${n} voltas — some 360° a u antes de dividir por ${n}.`,
          passo: 2,
          conceito: 'eqtrig.redutiveis',
        },
        {
          resposta: responder(pedido, base),
          diagnostico: `Esses são os valores de u = ${n}x. Falta dividir por ${n} para chegar a x.`,
          passo: 3,
          conceito: 'eqtrig.redutiveis',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'dificil'
        ? 'Se x vai de 0° a 360°, então 2x vai de 0° a 720°: são duas voltas para procurar soluções.'
        : undefined,
  };
}

/** Raízes possíveis de s = sen x, como frações p/q — algumas fora de [−1, 1]. */
const RAIZES: readonly (readonly [number, number])[] = [
  [-2, 1],
  [-3, 2],
  [-1, 1],
  [-1, 2],
  [0, 1],
  [1, 2],
  [1, 1],
  [3, 2],
  [2, 1],
];

const fracaoTex = ([p, q]: readonly [number, number]): string =>
  q === 1 ? `${p}` : `${p < 0 ? '-' : ''}\\frac{${Math.abs(p)}}{${q}}`;

function termo(coeficiente: number, variavel: string, primeiro: boolean): string {
  if (coeficiente === 0) return '';
  const sinal = coeficiente < 0 ? '-' : primeiro ? '' : '+';
  const modulo = Math.abs(coeficiente);
  const numero = modulo === 1 && variavel !== '' ? '' : `${modulo}`;
  return `${primeiro ? sinal : ` ${sinal} `}${numero}${variavel}`;
}

function exercicioQuadratica(nivel: Nivel, rng: Rng): Exercicio<number> {
  const razao = rng.escolher<RazaoTrig>(['sen', 'cos']);
  let r1: readonly [number, number];
  let r2: readonly [number, number];
  do {
    r1 = rng.escolher(RAIZES);
    r2 = rng.escolher(RAIZES);
  } while (
    r1[0] / r1[1] === r2[0] / r2[1] ||
    (Math.abs(r1[0] / r1[1]) > 1 && Math.abs(r2[0] / r2[1]) > 1)
  );

  // (q₁s − p₁)(q₂s − p₂) = A s² + B s + C
  const [p1, q1] = r1;
  const [p2, q2] = r2;
  const A = q1 * q2;
  const B = -(q1 * p2 + q2 * p1);
  const C = p1 * p2;
  const delta = B * B - 4 * A * C;
  const raizDelta = Math.abs(q1 * p2 - q2 * p1);

  const funcao = `${RAZAO_TEX[razao]} x`;
  const polinomio = (v: string, v2: string): string =>
    `${termo(A, v2, true)}${termo(B, v, false)}${termo(C, '', false)} = 0`;
  const equacaoTex = polinomio(funcao, `${RAZAO_TEX[razao]}^{2} x`);

  const raizes = [r1, r2].map((r) => ({ r, valor: r[0] / r[1] }));
  const validas = raizes.filter(({ valor }) => Math.abs(valor) <= 1);
  const invalidas = raizes.filter(({ valor }) => Math.abs(valor) > 1);
  const porRaiz = validas.map(({ r, valor }) => ({
    r,
    solucoes: solucoesNaVolta(razao, valor),
  }));
  const solucoes = [...new Set(porRaiz.flatMap((item) => item.solucoes))].sort((a, b) => a - b);

  const pedido = rng.escolher<Pedido>(['soma', 'quantas', 'maior']);
  const gabarito = responder(pedido, solucoes);
  const lista = (valores: readonly number[]): string =>
    valores.map((v) => `${grausTex(v)}°`).join(',\\; ');

  const passos: Passo[] = [
    {
      descricao: `Trocando ${NOME_TEXTO[razao]} x por s, fica uma equação do 2º grau.`,
      tex: polinomio('s', 's^{2}'),
    },
    {
      descricao: 'Por Bhaskara: o discriminante é um quadrado perfeito.',
      tex: `\\Delta = (${B})^{2} - 4 \\cdot ${A} \\cdot (${C}) = ${delta} \\qquad s = \\frac{${-B} \\pm ${raizDelta}}{${2 * A}}`,
    },
    {
      descricao: 'As duas raízes em s.',
      tex: `s_{1} = ${fracaoTex(r1)} \\qquad s_{2} = ${fracaoTex(r2)}`,
    },
  ];

  if (invalidas.length > 0) {
    passos.push({
      descricao: `${razao === 'sen' ? 'O seno' : 'O cosseno'} nunca sai de [−1, 1]: a raiz fora desse intervalo é descartada.`,
      tex: `${fracaoTex(invalidas[0]!.r)} \\notin [-1, 1]`,
    });
  }

  for (const { r, solucoes: daRaiz } of porRaiz) {
    passos.push({
      descricao: `Resolvemos ${NOME_TEXTO[razao]} x = ${r[1] === 1 ? r[0] : `${r[0]}/${r[1]}`} na volta.`,
      tex: `${funcao} = ${fracaoTex(r)} \\;\\Rightarrow\\; x \\in \\left\\{${lista(daRaiz)}\\right\\}`,
    });
  }

  passos.push({
    descricao: 'Juntando as soluções das raízes válidas.',
    tex: `x \\in \\left\\{${lista(solucoes)}\\right\\}`,
  });
  passos.push(passoDoPedido(pedido, solucoes));

  const armadilhas: Armadilha<number>[] = [];
  if (porRaiz.length > 1) {
    armadilhas.push({
      resposta: responder(pedido, porRaiz[0]!.solucoes),
      diagnostico:
        'Faltaram as soluções da outra raiz. Cada valor válido de s dá a sua própria equação na volta.',
      passo: passos.length - 2,
      conceito: 'eqtrig.redutiveis',
    });
  }
  if (pedido === 'quantas') {
    armadilhas.push({
      resposta: porRaiz.length,
      diagnostico:
        `Você contou as raízes em s, não os ângulos. Cada valor de ${NOME_TEXTO[razao]} x ` +
        'entre −1 e 1 (sem ser ±1) aparece em DOIS ângulos da volta.',
      passo: passos.length - 2,
      conceito: 'eqtrig.redutiveis',
    });
  }

  return {
    id: `eqtrig-quadratica-${razao}-${A}_${B}_${C}-${pedido}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Resolva ${INTERVALO} e informe ${PEDIDO_TEXTO[pedido]}.`,
    enunciadoTex: equacaoTex,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['eqtrig.redutiveis', CONCEITO_DA_RAZAO[razao]],
    armadilhas: semColisoes(armadilhas, gabarito, proximos),
    dica:
      nivel === 'extremo'
        ? `Troque ${NOME_TEXTO[razao]} x por s, resolva a equação do 2º grau e descarte o s que estiver fora de [−1, 1].`
        : undefined,
  };
}
