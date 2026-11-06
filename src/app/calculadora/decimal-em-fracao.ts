import { ErroDaConta } from '@core/calculadora/models/calculadora.model';

/**
 * Decimal exato em fração, inclusive dízima periódica.
 *
 * O site converte decimais que terminam, e recebe um `number` para isso —
 * o que basta lá e não basta aqui: `0,333…` não existe como `number`, e é
 * justamente a dízima que o aluno não sabe converter. Por isso a entrada
 * aqui é TEXTO, com o período entre parênteses: `0,(3)`, `1,2(45)`.
 *
 * A conta da dízima é a de sempre, a que se demonstra no quadro: multiplica-se
 * por potências de dez até dois números terem a mesma cauda infinita, e a
 * subtração a elimina.
 */

/** Uma fração exata, já simplificada. */
export interface FracaoExata {
  readonly numerador: number;
  readonly denominador: number;
}

/** Uma linha do caminho até a resposta. */
export interface PassoDaConversao {
  readonly descricao: string;
  readonly conta: string;
}

export interface ContaDeDecimal {
  /** O decimal como foi lido, normalizado. */
  readonly decimal: string | null;
  readonly fracao: FracaoExata | null;
  /** O decimal tem período? Muda o caminho mostrado. */
  readonly periodica: boolean;
  readonly passos: readonly PassoDaConversao[];
  readonly erro: ErroDaConta | null;
}

const VAZIO: ContaDeDecimal = {
  decimal: null,
  fracao: null,
  periodica: false,
  passos: [],
  erro: null,
};

/**
 * `-1,2(45)`: sinal, parte inteira, parte decimal fixa e período.
 *
 * O período entre parênteses é a notação da escola, e é a única sem
 * ambiguidade: em `0,1212…` não dá para saber se o que repete é `12` ou `2`.
 */
const DECIMAL = /^([+-]?)(\d+)(?:[.,](\d*))?(?:\((\d+)\))?$/;

/** Acima disto o `number` deixa de representar o inteiro exatamente. */
const ALGARISMOS_SEGUROS = 15;

export function decimalEmFracao(entrada: string): ContaDeDecimal {
  const texto = entrada.trim().replace(/\s+/g, '');
  if (texto === '') {
    return VAZIO;
  }

  if (texto.includes('…') || texto.includes('...')) {
    return { ...VAZIO, erro: { chave: 'decimal.useParenteses' } };
  }

  const achado = DECIMAL.exec(texto);
  if (achado === null) {
    return { ...VAZIO, erro: { chave: 'decimal.naoEntendi' } };
  }

  const [, sinal, inteira, fixa = '', periodo = ''] = achado;
  const negativo = sinal === '-';

  if (inteira!.length + fixa.length + periodo.length > ALGARISMOS_SEGUROS) {
    return { ...VAZIO, erro: { chave: 'decimal.algarismosDemais' } };
  }
  if (periodo !== '' && /^0+$/.test(periodo)) {
    // `0,1(0)` é `0,1`: um período de zeros não é dízima, é o fim do número.
    return decimalEmFracao(`${sinal}${inteira}${fixa === '' ? '' : `,${fixa}`}`);
  }

  const decimal = escrever(negativo, inteira!, fixa, periodo);
  const passos: PassoDaConversao[] = [];

  let numerador: number;
  let denominador: number;

  if (periodo === '') {
    denominador = 10 ** fixa.length;
    numerador = Number(`${inteira}${fixa}`);

    passos.push({
      descricao:
        fixa.length === 0
          ? 'O número já é inteiro: o denominador é 1.'
          : `São ${fixa.length} casa${fixa.length > 1 ? 's' : ''} depois da vírgula, então o denominador é 10 elevado a ${fixa.length}.`,
      conta: `${escrever(false, inteira!, fixa, '')} = ${numerador}/${denominador}`,
    });
  } else {
    /*
     * x = a,b(c). Multiplicar por 10^(b) põe a vírgula logo antes do período;
     * multiplicar por 10^(b+c) põe-na logo depois. Os dois números têm a
     * mesma cauda infinita, e a subtração a mata.
     */
    const antes = fixa.length;
    const depois = fixa.length + periodo.length;

    numerador = Number(`${inteira}${fixa}${periodo}`) - Number(`${inteira}${fixa}`);
    denominador = 10 ** depois - 10 ** antes;

    /*
     * O número com a vírgula já andada, sem o zero da frente: multiplicar
     * `0,1(6)` por dez dá `1,(6)`, e não `01,(6)`.
     */
    const semVirgula = (potencia: number): string => {
      const digitos = `${inteira}${(fixa + periodo).slice(0, potencia)}`.replace(/^0+(?=\d)/, '');
      return `${digitos},(${periodo})`;
    };

    passos.push({
      descricao: 'Chamamos o número de x.',
      conta: `x = ${escrever(false, inteira!, fixa, periodo)}`,
    });
    if (antes > 0) {
      passos.push({
        descricao: `Multiplicamos por 10^${antes} para a vírgula parar bem antes do período.`,
        conta: `${10 ** antes}x = ${semVirgula(antes)}`,
      });
    }
    passos.push({
      descricao: `Multiplicamos por 10^${depois}, e a vírgula passa o período uma vez.`,
      conta: `${10 ** depois}x = ${semVirgula(depois)}`,
    });
    passos.push({
      descricao: 'Os dois têm a MESMA cauda infinita: subtraindo, ela some.',
      conta: `${denominador}x = ${numerador}`,
    });
  }

  if (!Number.isSafeInteger(numerador) || !Number.isSafeInteger(denominador)) {
    return { ...VAZIO, erro: { chave: 'decimal.algarismosDemais' } };
  }

  const divisor = mdc(Math.abs(numerador), denominador);
  const simplificado: FracaoExata = {
    numerador: (negativo ? -1 : 1) * (numerador / divisor),
    denominador: denominador / divisor,
  };

  if (divisor > 1) {
    passos.push({
      descricao: `Simplificamos dividindo os dois por ${divisor}.`,
      conta: `${numerador}/${denominador} = ${numerador / divisor}/${denominador / divisor}`,
    });
  }

  return { decimal, fracao: simplificado, periodica: periodo !== '', passos, erro: null };
}

/** `-1,2(45)` a partir das partes. */
function escrever(negativo: boolean, inteira: string, fixa: string, periodo: string): string {
  const casas = fixa === '' && periodo === '' ? '' : `,${fixa}${periodo === '' ? '' : `(${periodo})`}`;
  return `${negativo ? '-' : ''}${inteira}${casas}`;
}

function mdc(a: number, b: number): number {
  return b === 0 ? a || 1 : mdc(b, a % b);
}
