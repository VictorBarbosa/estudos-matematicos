import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { Fracao } from '@core/math/numeros/fracao/fracao';
import { fatoracaoParaTexto, mdc, mmc } from '@core/math/numeros/inteiros/inteiros';

/** As quatro operações elementares com frações. */
export type OperacaoFracao = 'somar' | 'subtrair' | 'multiplicar' | 'dividir';

/** Símbolo LaTeX de cada operação. */
export const SIMBOLO_TEX: Readonly<Record<OperacaoFracao, string>> = {
  somar: '+',
  subtrair: '-',
  multiplicar: '\\times',
  dividir: '\\div',
};

/** Nome da operação em português, para enunciados. */
export const NOME_OPERACAO: Readonly<Record<OperacaoFracao, string>> = {
  somar: 'soma',
  subtrair: 'subtração',
  multiplicar: 'multiplicação',
  dividir: 'divisão',
};

/**
 * Escreve `a ⊕ b` em LaTeX.
 *
 * O segundo operando ganha parênteses quando é negativo: sem eles, a
 * subtração de um número negativo sai como "3/4 − −2/3", dois sinais colados
 * que ninguém escreve à mão e que atrapalham justamente onde o erro de sinal
 * já é comum.
 *
 * `misto` troca a fração imprópria pelo número misto — `2\frac{1}{3}` no lugar
 * de `\frac{7}{3}` —, que é a forma em que a quantidade se lê em voz alta.
 */
export function operacaoParaTex(
  a: Fracao,
  operacao: OperacaoFracao,
  b: Fracao,
  misto = false,
): string {
  const escrever = (fracao: Fracao): string => (misto ? fracao.paraTexMisto() : fracao.paraTex());

  return `${escrever(a)} ${SIMBOLO_TEX[operacao]} ${aDireita(escrever(b), b.ehNegativa)}`;
}

/**
 * Parentiza o que vem depois do sinal da operação, quando for negativo.
 *
 * Vale para a resolução inteira, e não só para o enunciado: os passos
 * intermediários também escreviam `+ -\frac{93}{24}`, dois sinais colados que
 * ninguém escreve à mão — e justamente onde o erro de sinal já é comum.
 */
function aDireita(tex: string, negativo: boolean): string {
  return negativo ? `\\left(${tex}\\right)` : tex;
}

/**
 * Resolve a operação registrando cada etapa.
 *
 * É esta função que alimenta ao mesmo tempo a explicação interativa e o
 * gabarito comentado do treino — por isso os passos são escritos para serem
 * lidos por quem está aprendendo, não apenas conferidos.
 */
export function resolverComPassos(
  entradaA: Fracao,
  operacao: OperacaoFracao,
  entradaB: Fracao,
  misto = false,
): Resolucao<Fracao> {
  /*
   * Em forma mista o enunciado já mostra a fração reduzida — `2\frac{1}{2}`,
   * nunca `\frac{10}{4}`. Reduzir os operandos aqui é o que mantém a conta
   * escrita com os mesmos números que o aluno está lendo.
   */
  const a = misto ? entradaA.simplificar() : entradaA;
  const b = misto ? entradaB.simplificar() : entradaB;

  const passos: Passo[] = [
    {
      descricao: `Partimos da ${NOME_OPERACAO[operacao]} proposta.`,
      tex: operacaoParaTex(a, operacao, b, misto),
    },
  ];

  if (misto) {
    const conversao = passoDeConversao(a, b);
    if (conversao !== null) {
      passos.push(conversao);
    }
  }

  const resultado =
    operacao === 'somar' || operacao === 'subtrair'
      ? resolverAditiva(a, b, operacao, passos)
      : operacao === 'multiplicar'
        ? resolverMultiplicacao(a, b, passos)
        : resolverDivisao(a, b, passos);

  if (misto) {
    const volta = passoDeVolta(resultado);
    if (volta !== null) {
      passos.push(volta);
    }
  }

  return { resultado, passos };
}

/** A fração se escreve como número misto, isto é, tem parte inteira e sobra? */
export function ehNumeroMisto(fracao: Fracao): boolean {
  const { inteiro, numerador } = fracao.paraMista();
  return inteiro !== 0 && numerador !== 0;
}

/**
 * A conversão que o enunciado em forma mista exige antes de qualquer conta.
 *
 * Sem este passo a resolução começava já com `\frac{14}{9}`, um número que não
 * aparece em lugar nenhum do enunciado — justamente a passagem que o aluno
 * precisa ver, e a que ele erra. Mostrar `1\frac{5}{9} = \frac{1 \times 9 + 5}{9}`
 * é mostrar de onde vêm os quatorze nonos.
 */
function passoDeConversao(a: Fracao, b: Fracao): Passo | null {
  const mistos = [a, b].filter(ehNumeroMisto);
  if (mistos.length === 0) {
    return null;
  }

  const negativo = mistos.find((fracao) => fracao.ehNegativa);

  return {
    descricao:
      mistos.length === 2
        ? 'Cada número misto vira uma fração imprópria: o inteiro multiplica o denominador e o numerador se soma a ele.'
        : 'O número misto vira uma fração imprópria: o inteiro multiplica o denominador e o numerador se soma a ele.',
    tex: mistos.map(conversaoParaTex).join(' \\qquad '),
    nota:
      negativo === undefined
        ? 'A parte inteira não pode ficar de fora: é ela que some quando o resultado vem pequeno demais.'
        : notaDoMistoNegativo(negativo),
  };
}

/** O sinal do misto vale para o número inteiro — e é aí que ele se perde. */
function notaDoMistoNegativo(fracao: Fracao): string {
  const { inteiro, numerador, denominador } = fracao.paraMista();
  const positivo = `${Math.abs(inteiro)} + ${numerador}/${denominador}`;

  return (
    `No misto negativo o sinal vale para o número todo: ${fracao.toStringMisto()} é ` +
    `-(${positivo}), ou seja ${fracao.simplificar().toString()} — e não ` +
    `-${Math.abs(inteiro)} + ${numerador}/${denominador}.`
  );
}

/** `2\frac{1}{3} = \frac{2 \times 3 + 1}{3} = \frac{7}{3}`. */
function conversaoParaTex(fracao: Fracao): string {
  const { inteiro, numerador, denominador } = fracao.paraMista();
  const sinal = inteiro < 0 ? '-' : '';

  return (
    `${fracao.paraTexMisto()} = ` +
    `${sinal}\\frac{${Math.abs(inteiro)} \\times ${denominador} + ${numerador}}{${denominador}} = ` +
    `${fracao.simplificar().paraTex()}`
  );
}

/**
 * O caminho de volta: resultado impróprio relido como número misto.
 *
 * O campo de resposta aceita as duas formas, mas é a mista que o gabarito
 * exibe — terminar a resolução na imprópria deixava o último passo e a
 * resposta certa parecendo dois números diferentes.
 */
function passoDeVolta(resultado: Fracao): Passo | null {
  if (!ehNumeroMisto(resultado)) {
    return null;
  }

  const simplificada = resultado.simplificar();
  const { inteiro, numerador, denominador } = resultado.paraMista();

  return {
    descricao: 'Por fim, o resultado volta à forma mista — que é como a quantidade se lê.',
    tex: `${simplificada.paraTex()} = ${resultado.paraTexMisto()}`,
    nota:
      `${Math.abs(simplificada.numerador)} dividido por ${denominador} dá ` +
      `${Math.abs(inteiro)} com resto ${numerador}. As duas formas valem como resposta: ` +
      `${simplificada.toString()} ou ${resultado.toStringMisto()}.`,
  };
}

/**
 * Soma e subtração compartilham toda a estrutura: o que muda é apenas o sinal
 * aplicado aos numeradores depois de igualar os denominadores.
 */
function resolverAditiva(
  a: Fracao,
  b: Fracao,
  operacao: 'somar' | 'subtrair',
  passos: Passo[],
): Fracao {
  const simbolo = SIMBOLO_TEX[operacao];

  const denominadorComum = mmc(a.denominador, b.denominador);
  const mesmosDenominadores = a.denominador === b.denominador;

  if (mesmosDenominadores) {
    passos.push({
      descricao: 'Os denominadores já são iguais, então nada precisa ser convertido.',
      tex: `\\text{denominador comum} = ${denominadorComum}`,
      nota: 'Só é possível somar ou subtrair partes do mesmo tamanho.',
    });
  } else {
    passos.push({
      descricao: 'Procuramos o menor denominador comum, que é o MMC dos denominadores.',
      tex: `\\operatorname{mmc}(${a.denominador}, ${b.denominador}) = ${denominadorComum}`,
      // Texto corrido, não LaTeX: a nota é renderizada como parágrafo.
      nota:
        `${a.denominador} = ${fatoracaoParaTexto(a.denominador)} e ` +
        `${b.denominador} = ${fatoracaoParaTexto(b.denominador)}. ` +
        'O MMC toma cada fator primo com o maior expoente que aparece.',
    });

    const fatorA = denominadorComum / a.denominador;
    const fatorB = denominadorComum / b.denominador;

    passos.push({
      descricao: `Reescrevemos as duas frações com denominador ${denominadorComum}.`,
      tex:
        `\\frac{${a.numerador} \\times ${fatorA}}{${a.denominador} \\times ${fatorA}} ${simbolo} ` +
        `\\frac{${b.numerador} \\times ${fatorB}}{${b.denominador} \\times ${fatorB}} = ` +
        `${a.comDenominador(denominadorComum).paraTex()} ${simbolo} ` +
        `${aDireita(b.comDenominador(denominadorComum).paraTex(), b.ehNegativa)}`,
      nota:
        'O numerador é multiplicado pelo mesmo fator que o denominador, ' +
        'por isso o valor da fração não muda.',
    });
  }

  const esquerda = a.comDenominador(denominadorComum);
  const direita = b.comDenominador(denominadorComum);
  const numeradorFinal =
    operacao === 'somar'
      ? esquerda.numerador + direita.numerador
      : esquerda.numerador - direita.numerador;
  const bruto = Fracao.criar(numeradorFinal, denominadorComum);

  passos.push({
    descricao: `Com o mesmo denominador, basta ${operacao === 'somar' ? 'somar' : 'subtrair'} os numeradores.`,
    tex:
      `\\frac{${esquerda.numerador} ${simbolo} ` +
      `${aDireita(String(direita.numerador), direita.numerador < 0)}}{${denominadorComum}} = ` +
      bruto.paraTex(),
    nota: 'O denominador é mantido: o tamanho das partes não mudou.',
  });

  return concluirSimplificacao(bruto, passos);
}

function resolverMultiplicacao(a: Fracao, b: Fracao, passos: Passo[]): Fracao {
  const bruto = Fracao.criar(a.numerador * b.numerador, a.denominador * b.denominador);

  passos.push({
    descricao: 'Na multiplicação não é preciso denominador comum: multiplicamos em linha.',
    tex:
      `\\frac{${a.numerador} \\times ${b.numerador}}{${a.denominador} \\times ${b.denominador}} = ` +
      bruto.paraTex(),
    nota: 'Numerador com numerador, denominador com denominador.',
  });

  return concluirSimplificacao(bruto, passos);
}

function resolverDivisao(a: Fracao, b: Fracao, passos: Passo[]): Fracao {
  const inversa = b.inverter();
  const bruto = Fracao.criar(a.numerador * inversa.numerador, a.denominador * inversa.denominador);

  passos.push(
    {
      descricao: 'Dividir por uma fração é o mesmo que multiplicar pelo seu inverso.',
      tex: `${a.paraTex()} \\times ${aDireita(inversa.paraTex(), inversa.ehNegativa)}`,
      // A nota é texto corrido, não LaTeX: aqui a fração se escreve 3/2.
      nota: `Invertemos a segunda fração: ${b.toString()} vira ${inversa.toString()}.`,
    },
    {
      descricao: 'Agora multiplicamos em linha.',
      tex:
        `\\frac{${a.numerador} \\times ${inversa.numerador}}{${a.denominador} \\times ${inversa.denominador}} = ` +
        bruto.paraTex(),
    },
  );

  return concluirSimplificacao(bruto, passos);
}

/**
 * Último passo comum às quatro operações: simplificar, ou constatar que a
 * fração já é irredutível. Acrescenta o passo a `passos` e devolve o resultado.
 */
function concluirSimplificacao(bruto: Fracao, passos: Passo[]): Fracao {
  const simplificada = bruto.simplificar();

  if (bruto.igualA(simplificada) && bruto.denominador === simplificada.denominador) {
    passos.push({
      descricao: 'A fração já está na forma irredutível.',
      tex: `${bruto.paraTex()}`,
      nota: `O mdc entre ${Math.abs(bruto.numerador)} e ${bruto.denominador} é 1.`,
    });
    return simplificada;
  }

  const divisor = mdc(bruto.numerador, bruto.denominador);
  passos.push({
    descricao: 'Simplificamos dividindo numerador e denominador pelo mdc.',
    tex:
      `\\frac{${bruto.numerador} \\div ${divisor}}{${bruto.denominador} \\div ${divisor}} = ` +
      simplificada.paraTex(),
    nota: `mdc(${Math.abs(bruto.numerador)}, ${bruto.denominador}) = ${divisor}.`,
  });

  return simplificada;
}
