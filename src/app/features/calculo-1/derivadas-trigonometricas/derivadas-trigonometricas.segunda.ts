import {
  ARCOS_DA_DERIVADA,
  FuncaoTrig,
  arcoTex,
  arcoTexto,
  arcoValor,
  arcoVezes,
  cossenoExato,
  exatoTex,
  exatoValor,
  senoExato,
  trigParaTex,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes, formatar } = numeroComCasas(3);
const dec = (v: number): string => formatar(v).replace(',', '{,}');
const PEDIDO = 'Responda na forma exata ou com 3 casas decimais.';

const nomeTex = (f: FuncaoTrig): string => (f === 'sen' ? '\\sin' : '\\cos');
const valorTrig = (f: FuncaoTrig, arco: Parameters<typeof senoExato>[0]) =>
  f === 'sen' ? senoExato(arco) : cossenoExato(arco);

/**
 * A derivada segunda de a·sen(bx) ou a·cos(bx) num arco notável.
 *
 * Derivar duas vezes devolve a própria função com o sinal trocado e o fator
 * b ao QUADRADO: f″ = −b²·f. É a equação do oscilador harmônico, vista pelo
 * lado da derivada.
 */
export function exercicioSegundaTrig(nivel: Nivel, rng: Rng): Exercicio<number> {
  const funcao: FuncaoTrig = rng.booleano() ? 'sen' : 'cos';
  const a = rng.inteiro(1, 5);
  const b = nivel === 'facil' ? 1 : rng.inteiro(2, 3);
  const arco = rng.escolher(ARCOS_DA_DERIVADA);
  const interno = arcoVezes(arco, b);
  const valor = valorTrig(funcao, interno);
  const fator = -a * b * b;
  const gabarito = fator * exatoValor(valor);
  const primeira =
    funcao === 'sen'
      ? a * b * exatoValor(cossenoExato(interno))
      : -a * b * exatoValor(senoExato(interno));
  const exato = exatoTex({ ...valor, num: valor.num * fator });

  return {
    id: `trig-segunda-${funcao}-${a}${b}-${arco.k}${arco.m}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule a derivada SEGUNDA f''(${arcoTexto(arco)}). ${PEDIDO}`,
    enunciadoTex: `f(x) = ${trigParaTex(funcao, a, b)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `A primeira derivada: pela tabela, e com o fator ${b} da cadeia.`,
          tex:
            funcao === 'sen'
              ? `f'(x) = ${a * b}\\cos(${b === 1 ? '' : b}x)`
              : `f'(x) = -${a * b}\\sin(${b === 1 ? '' : b}x)`,
        },
        {
          descricao: `Derivando de novo, sai outro fator ${b} e o sinal troca: f″ = −${b}²·f.`,
          tex: `f''(x) = ${fator}${nomeTex(funcao)}(${b === 1 ? '' : b}x)`,
        },
        {
          descricao: `Em x = ${arcoTexto(arco)}, o argumento vale ${arcoTexto(interno)}.`,
          tex: `f''\\left(${arcoTex(arco)}\\right) = ${fator} \\cdot ${nomeTex(funcao)}\\left(${arcoTex(interno)}\\right) = ${fator} \\cdot ${exatoTex(valor)} = ${exato} \\approx ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['trig-derivada.tabela', 'trig-derivada.cadeia'],
    armadilhas: semColisoes(
      [
        {
          resposta: primeira,
          diagnostico: 'Esse é o valor da derivada PRIMEIRA. Falta derivar mais uma vez.',
          passo: 1,
          conceito: 'trig-derivada.tabela',
        },
        ...(b > 1
          ? [
              {
                resposta: -a * b * exatoValor(valor),
                diagnostico: `Cada derivada traz um fator ${b} da cadeia; duas derivadas trazem ${b}² = ${b * b}.`,
                passo: 1,
                conceito: 'trig-derivada.cadeia',
              },
            ]
          : []),
        {
          resposta: -gabarito,
          diagnostico:
            'O sinal: duas derivadas de seno (ou de cosseno) devolvem a função com o sinal TROCADO — ' +
            'seno → cosseno → −seno.',
          passo: 1,
          conceito: 'trig-derivada.tabela',
        },
      ],
      gabarito,
      saoEquivalentes,
    ),
    dica:
      `Derive duas vezes: ${funcao === 'sen' ? 'seno vira cosseno e depois −seno' : 'cosseno vira −seno e depois −cosseno'}` +
      (b > 1 ? `, e cada derivada traz um fator ${b} (ao todo ${b}² = ${b * b}).` : '.'),
  };
}

/**
 * Onde a reta tangente a a·sen(bx) num arco notável corta o eixo y.
 *
 * f e f′ saem da tabela; o coeficiente linear é f(x₀) − f′(x₀)·x₀, e como x₀
 * é um múltiplo de π, a resposta junta a tabela com um número irracional.
 */
export function exercicioRetaTangenteTrig(nivel: Nivel, rng: Rng): Exercicio<number> {
  const funcao: FuncaoTrig = rng.booleano() ? 'sen' : 'cos';
  const a = rng.inteiro(1, 5);
  const b = rng.inteiro(1, 2);
  const arco = rng.escolher(ARCOS_DA_DERIVADA.filter((x) => x.k !== 0));
  const interno = arcoVezes(arco, b);
  const x0 = arcoValor(arco);
  const f0 = a * exatoValor(valorTrig(funcao, interno));
  const m =
    funcao === 'sen'
      ? a * b * exatoValor(cossenoExato(interno))
      : -a * b * exatoValor(senoExato(interno));
  const gabarito = f0 - m * x0;

  return {
    id: `trig-reta-${funcao}-${a}${b}-${arco.k}${arco.m}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Encontre a reta tangente ao gráfico em x = ${arcoTexto(arco)} e informe onde ela corta o eixo y. ` +
      '(3 casas decimais)',
    enunciadoTex: `f(x) = ${trigParaTex(funcao, a, b)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O ponto de tangência: o valor da função no arco.',
          tex: `f\\left(${arcoTex(arco)}\\right) = ${a} ${nomeTex(funcao)}\\left(${arcoTex(interno)}\\right) = ${dec(f0)}`,
        },
        {
          descricao: 'A inclinação: a derivada no mesmo arco.',
          tex: `m = f'\\left(${arcoTex(arco)}\\right) = ${dec(m)}`,
        },
        {
          descricao: 'A reta y = f(x₀) + m(x − x₀) corta o eixo y em x = 0.',
          tex: `y(0) = ${dec(f0)} - ${m < 0 ? `(${dec(m)})` : dec(m)} \\cdot ${dec(x0)} = ${dec(gabarito)}`,
          nota: `O x₀ = ${arcoTexto(arco)} entra em radianos: ${formatar(x0)}.`,
        },
      ],
    },
    conceitos: ['trig-derivada.tabela'],
    armadilhas: semColisoes(
      [
        {
          resposta: f0,
          diagnostico: 'Esse é o valor da função no ponto. A reta só corta o eixo y ali se x₀ = 0.',
          passo: 2,
          conceito: 'trig-derivada.tabela',
        },
        {
          resposta: f0 + m * x0,
          diagnostico: 'O sinal ficou trocado: em x = 0, y = f(x₀) − m·x₀.',
          passo: 2,
          conceito: 'trig-derivada.tabela',
        },
        {
          resposta: f0 - (m * (arcoValor(arco) * 180)) / Math.PI,
          diagnostico: 'O x₀ precisa estar em RADIANOS na reta, não em graus.',
          passo: 2,
          conceito: 'trig-derivada.tabela',
        },
      ],
      gabarito,
      saoEquivalentes,
    ),
    dica: `A reta passa por (x₀, f(x₀)) com inclinação f′(x₀). Em x = 0: y = f(x₀) − f′(x₀)·x₀, com x₀ = ${arcoTexto(arco)} em radianos.`,
  };
}
