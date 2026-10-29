import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';
import { Fracao } from '@core/math/numeros/fracao/fracao';
import { mdc } from '@core/math/numeros/inteiros/inteiros';

/**
 * Números decimais e sua relação exata com as frações.
 *
 * Um decimal finito é apenas uma fração de denominador potência de dez. Uma
 * dízima periódica também é uma fração — e descobrir qual é um dos resultados
 * mais surpreendentes da matemática básica.
 */

/** Decimal finito para fração: 0,75 = 75/100 = 3/4. */
export function decimalParaFracaoComPassos(decimal: number): Resolucao<Fracao> {
  const texto = String(decimal);
  const separador = texto.indexOf('.');
  const casas = separador === -1 ? 0 : texto.length - separador - 1;
  const potencia = 10 ** casas;
  const numerador = Math.round(decimal * potencia);

  const bruta = Fracao.criar(numerador, potencia);
  const resultado = bruta.simplificar();

  const passos: Passo[] = [
    {
      descricao:
        casas === 0
          ? 'O número já é inteiro, então o denominador é 1.'
          : `Há ${casas} casa${casas > 1 ? 's' : ''} decimal${casas > 1 ? 'is' : ''}, então o denominador é 10 elevado a ${casas}.`,
      tex: `${String(decimal).replace('.', '{,}')} = \\frac{${numerador}}{${potencia}}`,
      nota:
        casas === 0
          ? undefined
          : 'Cada casa decimal vale uma divisão por dez: décimos, centésimos, milésimos.',
    },
  ];

  if (!bruta.estaSimplificada) {
    const divisor = mdc(numerador, potencia);
    passos.push({
      descricao: 'Simplificamos dividindo pelo mdc.',
      tex: `\\frac{${numerador} \\div ${divisor}}{${potencia} \\div ${divisor}} = ${resultado.paraTex()}`,
    });
  } else {
    passos.push({
      descricao: 'A fração já está na forma irredutível.',
      tex: resultado.paraTex(),
    });
  }

  return { resultado, passos };
}

/**
 * Dízima periódica para fração.
 *
 * `inteira` é a parte antes da vírgula, `naoPeriodica` os dígitos que não
 * repetem e `periodo` o bloco que se repete. Por exemplo 0,1666… se escreve
 * como `(0, '1', '6')`.
 */
export function dizimaParaFracaoComPassos(
  inteira: number,
  naoPeriodica: string,
  periodo: string,
): Resolucao<Fracao> {
  if (periodo === '' || !/^\d+$/.test(periodo)) {
    throw new ErroMatematico('O período precisa ter ao menos um dígito.');
  }
  if (naoPeriodica !== '' && !/^\d+$/.test(naoPeriodica)) {
    throw new ErroMatematico('A parte não periódica só pode conter dígitos.');
  }

  const k = naoPeriodica.length;
  const p = periodo.length;

  // Todos os dígitos decimais até o fim do primeiro período, e só até o começo dele.
  const comPeriodo = Number(`${naoPeriodica}${periodo}`);
  const semPeriodo = naoPeriodica === '' ? 0 : Number(naoPeriodica);

  const numerador = comPeriodo - semPeriodo;
  const denominador = Number(`${'9'.repeat(p)}${'0'.repeat(k)}`);

  const parteDecimal = Fracao.criar(numerador, denominador);
  const resultado = parteDecimal.somar(Fracao.deInteiro(inteira));

  const escrita = `${inteira}{,}${naoPeriodica}\\overline{${periodo}}`;
  const deslocado = `10^{${k + p}}`;

  const passos: Passo[] = [
    {
      descricao: 'Chamamos a dízima de x.',
      tex: `x = ${escrita}`,
    },
    {
      descricao:
        'Multiplicamos x por potências de dez escolhidas para alinhar as caudas periódicas.',
      tex:
        `${deslocado} \\, x = ${inteira}${naoPeriodica}${periodo}{,}\\overline{${periodo}} ` +
        `\\qquad 10^{${k}} \\, x = ${inteira}${naoPeriodica}{,}\\overline{${periodo}}`,
      nota: 'As duas têm exatamente a mesma parte decimal infinita.',
    },
    {
      descricao: 'Subtraindo uma da outra, a parte infinita se cancela.',
      tex: `(${deslocado} - 10^{${k}}) \\, x = ${comPeriodo + inteira * 10 ** (k + p)} - ${semPeriodo + inteira * 10 ** k}`,
      nota: 'É este cancelamento que transforma um problema infinito numa equação simples.',
    },
    {
      descricao:
        'Isolamos x. O denominador fica com um 9 por dígito do período e um 0 por dígito não periódico.',
      tex: `x = \\frac{${numerador + inteira * denominador}}{${denominador}}`,
    },
    {
      descricao: 'Simplificando, chegamos à fração geratriz.',
      tex: `x = ${resultado.paraTex()}`,
    },
  ];

  return { resultado, passos };
}

export interface DecimalDeFracao {
  /** A representação decimal, com o período entre parênteses quando houver. */
  readonly texto: string;
  /** O bloco que se repete, ou string vazia se o decimal for finito. */
  readonly periodo: string;
  readonly ehPeriodico: boolean;
}

/**
 * Fração para decimal pela divisão longa.
 *
 * Guardar os restos já vistos é o que permite detectar o período: quando um
 * resto se repete, a sequência de dígitos a partir dali também vai se repetir.
 */
export function fracaoParaDecimalComPassos(fracao: Fracao): Resolucao<DecimalDeFracao> {
  const simplificada = fracao.simplificar();
  const numerador = Math.abs(simplificada.numerador);
  const denominador = simplificada.denominador;
  const sinal = simplificada.ehNegativa ? '-' : '';

  const inteira = Math.floor(numerador / denominador);
  let resto = numerador % denominador;

  const digitos: number[] = [];
  const restosVistos = new Map<number, number>();
  let inicioPeriodo = -1;

  while (resto !== 0 && digitos.length < 40) {
    const anterior = restosVistos.get(resto);
    if (anterior !== undefined) {
      inicioPeriodo = anterior;
      break;
    }
    restosVistos.set(resto, digitos.length);

    resto *= 10;
    digitos.push(Math.floor(resto / denominador));
    resto %= denominador;
  }

  const ehPeriodico = inicioPeriodo !== -1;
  const naoPeriodica = digitos.slice(0, ehPeriodico ? inicioPeriodo : digitos.length).join('');
  const periodo = ehPeriodico ? digitos.slice(inicioPeriodo).join('') : '';

  const texto =
    `${sinal}${inteira}` +
    (digitos.length === 0 ? '' : `,${naoPeriodica}${ehPeriodico ? `(${periodo})` : ''}`);

  const passos: Passo[] = [
    {
      descricao: 'A barra da fração é uma divisão: basta efetuá-la.',
      tex: `${simplificada.paraTex()} = ${numerador} \\div ${denominador}`,
    },
  ];

  if (!ehPeriodico) {
    passos.push({
      descricao: 'A divisão termina com resto zero, então o decimal é finito.',
      tex: `${simplificada.paraTex()} = ${sinal}${inteira}${digitos.length ? `{,}${naoPeriodica}` : ''}`,
      nota:
        'Isso acontece exatamente quando o denominador irredutível só tem fatores 2 e 5, ' +
        'os primos que dividem 10.',
    });
  } else {
    passos.push({
      descricao: 'Um resto se repete, e com ele toda a sequência de dígitos seguinte.',
      tex: `\\text{resto } ${[...restosVistos.keys()][inicioPeriodo] ?? resto} \\text{ reaparece}`,
      nota: 'Há no máximo d-1 restos possíveis, então a repetição é inevitável.',
    });
    passos.push({
      descricao: 'O decimal é uma dízima periódica.',
      tex: `${simplificada.paraTex()} = ${sinal}${inteira}{,}${naoPeriodica}\\overline{${periodo}}`,
      nota: `O período é ${periodo}, com ${periodo.length} dígito${periodo.length > 1 ? 's' : ''}.`,
    });
  }

  return { resultado: { texto, periodo, ehPeriodico }, passos };
}
