import { ErroMatematico, Resolucao } from '@core/math/tipos';

/**
 * Notação científica, prefixos do SI e algarismos significativos.
 *
 * É o primeiro contato com a disciplina que a engenharia exige dos números:
 * um resultado não é só o valor, é o valor com a unidade certa e com a
 * precisão que a medida realmente tem.
 */

/** Um número escrito como mantissa × 10^expoente, com 1 ≤ |mantissa| < 10. */
export interface NotacaoCientifica {
  readonly mantissa: number;
  readonly expoente: number;
}

export function notacaoParaTex({ mantissa, expoente }: NotacaoCientifica): string {
  const corpo = formatarMantissa(mantissa);
  return expoente === 0 ? corpo : `${corpo} \\times 10^{${expoente}}`;
}

export function avaliarNotacao({ mantissa, expoente }: NotacaoCientifica): number {
  return mantissa * 10 ** expoente;
}

/**
 * Escreve um número em notação científica.
 *
 * O expoente conta quantas casas a vírgula andou — para a esquerda em números
 * grandes, para a direita em números pequenos.
 */
export function paraNotacaoCientificaComPassos(valor: number): Resolucao<NotacaoCientifica> {
  if (!Number.isFinite(valor)) {
    throw new ErroMatematico(`Não há notação científica para ${valor}.`);
  }

  if (valor === 0) {
    return {
      resultado: { mantissa: 0, expoente: 0 },
      passos: [
        {
          descricao: 'O zero é o único número sem notação científica própria.',
          tex: '0',
          nota: 'Não existe mantissa entre 1 e 10 que multiplicada por potência de dez dê zero.',
        },
      ],
    };
  }

  const expoente = Math.floor(Math.log10(Math.abs(valor)));
  // Dividir por 10^e reintroduz erro binário; arredondar na 12ª casa devolve
  // a mantissa que a pessoa escreveria à mão.
  const mantissa = Number((valor / 10 ** expoente).toPrecision(12));

  const casas = Math.abs(expoente);
  const direcao = expoente > 0 ? 'esquerda' : 'direita';

  return {
    resultado: { mantissa, expoente },
    passos: [
      {
        descricao: 'Partimos do número como ele foi escrito.',
        tex: String(valor),
      },
      {
        descricao:
          expoente === 0
            ? 'O número já está entre 1 e 10: a vírgula não precisa andar.'
            : `Andamos com a vírgula ${casas} casa(s) para a ${direcao}, até sobrar um dígito antes dela.`,
        tex: `${formatarMantissa(mantissa)} \\times 10^{${expoente}}`,
        nota:
          expoente === 0
            ? undefined
            : 'Cada casa andada é um fator 10 — o expoente só devolve o que a vírgula tirou.',
      },
      {
        descricao: 'Conferindo: a mantissa fica no intervalo exigido.',
        tex: `1 \\le ${formatarMantissa(Math.abs(mantissa))} < 10`,
      },
    ],
  };
}

/** Multiplica dois números em notação científica, mostrando as duas metades. */
export function multiplicarNotacaoComPassos(
  a: NotacaoCientifica,
  b: NotacaoCientifica,
): Resolucao<NotacaoCientifica> {
  const mantissaBruta = a.mantissa * b.mantissa;
  const expoenteBruto = a.expoente + b.expoente;

  const ajuste = paraNotacaoCientificaComPassos(mantissaBruta).resultado;
  const resultado: NotacaoCientifica = {
    mantissa: ajuste.mantissa,
    expoente: expoenteBruto + ajuste.expoente,
  };

  const passos = [
    {
      descricao: 'Separamos mantissas de potências — a multiplicação permite reagrupar.',
      tex:
        `(${formatarMantissa(a.mantissa)} \\times ${formatarMantissa(b.mantissa)})` +
        ` \\times (10^{${a.expoente}} \\times 10^{${b.expoente}})`,
    },
    {
      descricao: 'Multiplicamos as mantissas e somamos os expoentes.',
      tex: `${formatarMantissa(mantissaBruta)} \\times 10^{${expoenteBruto}}`,
      nota: 'Somar expoentes é a propriedade das potências de mesma base.',
    },
  ];

  if (ajuste.expoente !== 0) {
    passos.push({
      descricao: 'A mantissa saiu do intervalo [1, 10): normalizamos de novo.',
      tex: notacaoParaTex(resultado),
      nota: 'Cada casa que a vírgula anda compensa uma unidade no expoente.',
    });
  }

  return { resultado, passos };
}

/** Prefixos do SI, do nano ao giga — a faixa que a engenharia usa no dia a dia. */
export interface PrefixoSI {
  readonly simbolo: string;
  readonly nome: string;
  readonly expoente: number;
}

export const PREFIXOS_SI: readonly PrefixoSI[] = [
  { simbolo: 'n', nome: 'nano', expoente: -9 },
  { simbolo: 'μ', nome: 'micro', expoente: -6 },
  { simbolo: 'm', nome: 'mili', expoente: -3 },
  { simbolo: 'c', nome: 'centi', expoente: -2 },
  { simbolo: '', nome: 'unidade', expoente: 0 },
  { simbolo: 'k', nome: 'quilo', expoente: 3 },
  { simbolo: 'M', nome: 'mega', expoente: 6 },
  { simbolo: 'G', nome: 'giga', expoente: 9 },
];

export function prefixoPorSimbolo(simbolo: string): PrefixoSI | undefined {
  return PREFIXOS_SI.find((prefixo) => prefixo.simbolo === simbolo);
}

/**
 * Converte entre prefixos do SI.
 *
 * A conta é sempre a mesma: a diferença de expoentes diz quantas casas o valor
 * anda. O erro clássico é inverter o sentido, e é por isso que o passo a passo
 * mostra a diferença explicitamente.
 */
export function converterPrefixoComPassos(
  valor: number,
  de: PrefixoSI,
  para: PrefixoSI,
): Resolucao<number> {
  const diferenca = de.expoente - para.expoente;
  const resultado = valor * 10 ** diferenca;

  return {
    resultado,
    passos: [
      {
        descricao: 'Escrevemos as duas unidades como potências da unidade base.',
        tex: `1\\,\\text{${de.simbolo}} = 10^{${de.expoente}} \\qquad 1\\,\\text{${para.simbolo}} = 10^{${para.expoente}}`,
      },
      {
        descricao: 'A diferença entre os expoentes é o fator da conversão.',
        tex: `10^{${de.expoente} - (${para.expoente})} = 10^{${diferenca}}`,
        nota:
          diferenca > 0
            ? 'A unidade de origem é maior, então o número cresce.'
            : diferenca < 0
              ? 'A unidade de origem é menor, então o número diminui.'
              : 'Mesma ordem de grandeza: o número não muda.',
      },
      {
        descricao: 'Multiplicamos o valor por esse fator.',
        tex: `${valor} \\times 10^{${diferenca}} = ${Number(resultado.toPrecision(12))}`,
      },
    ],
  };
}

/**
 * Conta os algarismos significativos de um número escrito.
 *
 * Trabalha sobre o texto, e não sobre o valor, porque "1,50" e "1,5" valem o
 * mesmo mas não dizem a mesma coisa sobre a medida: o zero à direita é um
 * algarismo medido.
 */
export function algarismosSignificativos(escrito: string): number {
  const limpo = escrito.trim().replace(/\s/g, '').replace(',', '.').replace(/^[+-]/, '');

  if (!/^\d*\.?\d+$/.test(limpo)) {
    throw new ErroMatematico(`"${escrito}" não é um número decimal reconhecível.`);
  }

  const temVirgula = limpo.includes('.');
  const digitos = limpo.replace('.', '');

  // Zeros à esquerda só posicionam a vírgula; nunca são significativos.
  const semZerosIniciais = digitos.replace(/^0+/, '');

  if (semZerosIniciais === '') {
    return 1;
  }

  // Sem parte decimal, zeros à direita são ambíguos; a convenção escolar é
  // não contá-los, e é a que o treino cobra.
  return temVirgula ? semZerosIniciais.length : semZerosIniciais.replace(/0+$/, '').length;
}

/** Arredonda para uma quantidade de algarismos significativos. */
export function arredondarParaSignificativos(valor: number, significativos: number): number {
  if (significativos < 1 || !Number.isInteger(significativos)) {
    throw new ErroMatematico('A quantidade de algarismos significativos deve ser inteira e ≥ 1.');
  }

  return valor === 0 ? 0 : Number(valor.toPrecision(significativos));
}

/** Mantissa sem casas decimais inúteis, com vírgula à brasileira no TeX. */
function formatarMantissa(valor: number): string {
  return String(Number(valor.toPrecision(12))).replace('.', '{,}');
}
