import { Passo, Resolucao } from '@core/math/tipos';
import { Fracao } from './fracao';
import { fatoracaoParaTex, mdc, mmc } from './inteiros';

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
  const direita = b.ehNegativa ? `\\left(${escrever(b)}\\right)` : escrever(b);

  return `${escrever(a)} ${SIMBOLO_TEX[operacao]} ${direita}`;
}

/**
 * Resolve a operação registrando cada etapa.
 *
 * É esta função que alimenta ao mesmo tempo a explicação interativa e o
 * gabarito comentado do treino — por isso os passos são escritos para serem
 * lidos por quem está aprendendo, não apenas conferidos.
 */
export function resolverComPassos(
  a: Fracao,
  operacao: OperacaoFracao,
  b: Fracao,
): Resolucao<Fracao> {
  switch (operacao) {
    case 'somar':
    case 'subtrair':
      return resolverAditiva(a, b, operacao);
    case 'multiplicar':
      return resolverMultiplicacao(a, b);
    case 'dividir':
      return resolverDivisao(a, b);
  }
}

/**
 * Soma e subtração compartilham toda a estrutura: o que muda é apenas o sinal
 * aplicado aos numeradores depois de igualar os denominadores.
 */
function resolverAditiva(a: Fracao, b: Fracao, operacao: 'somar' | 'subtrair'): Resolucao<Fracao> {
  const simbolo = SIMBOLO_TEX[operacao];
  const passos: Passo[] = [
    {
      descricao: `Partimos da ${NOME_OPERACAO[operacao]} proposta.`,
      tex: operacaoParaTex(a, operacao, b),
    },
  ];

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
      nota:
        `${a.denominador} = ${fatoracaoParaTex(a.denominador)} e ` +
        `${b.denominador} = ${fatoracaoParaTex(b.denominador)}. ` +
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
        `${b.comDenominador(denominadorComum).paraTex()}`,
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
      `\\frac{${esquerda.numerador} ${simbolo} ${direita.numerador}}{${denominadorComum}} = ` +
      bruto.paraTex(),
    nota: 'O denominador é mantido: o tamanho das partes não mudou.',
  });

  return { resultado: concluirSimplificacao(bruto, passos), passos };
}

function resolverMultiplicacao(a: Fracao, b: Fracao): Resolucao<Fracao> {
  const passos: Passo[] = [
    {
      descricao: 'Partimos da multiplicação proposta.',
      tex: operacaoParaTex(a, 'multiplicar', b),
    },
    {
      descricao: 'Na multiplicação não é preciso denominador comum: multiplicamos em linha.',
      tex:
        `\\frac{${a.numerador} \\times ${b.numerador}}{${a.denominador} \\times ${b.denominador}} = ` +
        Fracao.criar(a.numerador * b.numerador, a.denominador * b.denominador).paraTex(),
      nota: 'Numerador com numerador, denominador com denominador.',
    },
  ];

  const bruto = Fracao.criar(a.numerador * b.numerador, a.denominador * b.denominador);
  return { resultado: concluirSimplificacao(bruto, passos), passos };
}

function resolverDivisao(a: Fracao, b: Fracao): Resolucao<Fracao> {
  const inversa = b.inverter();
  const bruto = Fracao.criar(a.numerador * inversa.numerador, a.denominador * inversa.denominador);

  const passos: Passo[] = [
    {
      descricao: 'Partimos da divisão proposta.',
      tex: operacaoParaTex(a, 'dividir', b),
    },
    {
      descricao: 'Dividir por uma fração é o mesmo que multiplicar pelo seu inverso.',
      tex: `${a.paraTex()} \\times ${inversa.paraTex()}`,
      nota: `Invertemos a segunda fração: ${b.paraTex()} vira ${inversa.paraTex()}.`,
    },
    {
      descricao: 'Agora multiplicamos em linha.',
      tex:
        `\\frac{${a.numerador} \\times ${inversa.numerador}}{${a.denominador} \\times ${inversa.denominador}} = ` +
        bruto.paraTex(),
    },
  ];

  return { resultado: concluirSimplificacao(bruto, passos), passos };
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
