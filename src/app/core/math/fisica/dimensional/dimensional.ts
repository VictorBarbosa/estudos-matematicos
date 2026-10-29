import { ErroMatematico, Resolucao } from '@core/math/tipos/tipos';

/**
 * Análise dimensional.
 *
 * É a primeira ferramenta de engenharia que não calcula nada e ainda assim
 * salva: conferir dimensões detecta fórmula errada antes de qualquer número
 * ser substituído. Uma equação só pode ser verdadeira se os dois lados tiverem
 * a mesma dimensão.
 */

/** Expoentes das dimensões de base usadas aqui: massa, comprimento, tempo. */
export interface Dimensao {
  readonly M: number;
  readonly L: number;
  readonly T: number;
}

export const ADIMENSIONAL: Dimensao = { M: 0, L: 0, T: 0 };

export interface Grandeza {
  readonly nome: string;
  readonly simbolo: string;
  readonly unidade: string;
  readonly dimensao: Dimensao;
}

/** As grandezas que o currículo usa, com dimensão e unidade do SI. */
export const GRANDEZAS: readonly Grandeza[] = [
  { nome: 'comprimento', simbolo: 'L', unidade: 'm', dimensao: { M: 0, L: 1, T: 0 } },
  { nome: 'massa', simbolo: 'm', unidade: 'kg', dimensao: { M: 1, L: 0, T: 0 } },
  { nome: 'tempo', simbolo: 't', unidade: 's', dimensao: { M: 0, L: 0, T: 1 } },
  { nome: 'área', simbolo: 'A', unidade: 'm²', dimensao: { M: 0, L: 2, T: 0 } },
  { nome: 'volume', simbolo: 'V', unidade: 'm³', dimensao: { M: 0, L: 3, T: 0 } },
  { nome: 'velocidade', simbolo: 'v', unidade: 'm/s', dimensao: { M: 0, L: 1, T: -1 } },
  { nome: 'aceleração', simbolo: 'a', unidade: 'm/s²', dimensao: { M: 0, L: 1, T: -2 } },
  { nome: 'força', simbolo: 'F', unidade: 'N', dimensao: { M: 1, L: 1, T: -2 } },
  { nome: 'pressão', simbolo: 'p', unidade: 'Pa', dimensao: { M: 1, L: -1, T: -2 } },
  { nome: 'energia', simbolo: 'E', unidade: 'J', dimensao: { M: 1, L: 2, T: -2 } },
  { nome: 'potência', simbolo: 'P', unidade: 'W', dimensao: { M: 1, L: 2, T: -3 } },
  { nome: 'momento linear', simbolo: 'p', unidade: 'kg·m/s', dimensao: { M: 1, L: 1, T: -1 } },
  { nome: 'densidade', simbolo: 'ρ', unidade: 'kg/m³', dimensao: { M: 1, L: -3, T: 0 } },
  { nome: 'frequência', simbolo: 'f', unidade: 'Hz', dimensao: { M: 0, L: 0, T: -1 } },
  { nome: 'torque', simbolo: 'τ', unidade: 'N·m', dimensao: { M: 1, L: 2, T: -2 } },
  { nome: 'impulso', simbolo: 'J', unidade: 'N·s', dimensao: { M: 1, L: 1, T: -1 } },
  { nome: 'vazão', simbolo: 'Q', unidade: 'm³/s', dimensao: { M: 0, L: 3, T: -1 } },
  { nome: 'vazão mássica', simbolo: 'ṁ', unidade: 'kg/s', dimensao: { M: 1, L: 0, T: -1 } },
  { nome: 'tensão superficial', simbolo: 'γ', unidade: 'N/m', dimensao: { M: 1, L: 0, T: -2 } },
  { nome: 'constante elástica', simbolo: 'k', unidade: 'N/m', dimensao: { M: 1, L: 0, T: -2 } },
  { nome: 'densidade superficial', simbolo: 'σ', unidade: 'kg/m²', dimensao: { M: 1, L: -2, T: 0 } },
  { nome: 'aceleração angular', simbolo: 'α', unidade: 'rad/s²', dimensao: { M: 0, L: 0, T: -2 } },
  { nome: 'momento de inércia', simbolo: 'I', unidade: 'kg·m²', dimensao: { M: 1, L: 2, T: 0 } },
];

export function grandezaPorNome(nome: string): Grandeza | undefined {
  return GRANDEZAS.find((grandeza) => grandeza.nome === nome);
}

export function multiplicarDimensoes(a: Dimensao, b: Dimensao): Dimensao {
  return { M: a.M + b.M, L: a.L + b.L, T: a.T + b.T };
}

export function dividirDimensoes(a: Dimensao, b: Dimensao): Dimensao {
  return { M: a.M - b.M, L: a.L - b.L, T: a.T - b.T };
}

export function elevarDimensao(a: Dimensao, expoente: number): Dimensao {
  return { M: a.M * expoente, L: a.L * expoente, T: a.T * expoente };
}

export function dimensoesIguais(a: Dimensao, b: Dimensao): boolean {
  return a.M === b.M && a.L === b.L && a.T === b.T;
}

/** Notação [M¹L²T⁻²], omitindo expoentes nulos. */
export function dimensaoParaTex({ M, L, T }: Dimensao): string {
  const partes: string[] = [];

  for (const [simbolo, expoente] of [
    ['M', M],
    ['L', L],
    ['T', T],
  ] as const) {
    if (expoente !== 0) {
      partes.push(expoente === 1 ? simbolo : `${simbolo}^{${expoente}}`);
    }
  }

  return partes.length === 0 ? '1' : partes.join('');
}

/**
 * Deduz a dimensão de uma grandeza derivada a partir de sua definição.
 *
 * O ponto pedagógico é que nenhuma dessas dimensões precisa ser memorizada:
 * todas saem da definição física da grandeza.
 */
export function deduzirDimensaoComPassos(
  nome: 'velocidade' | 'aceleracao' | 'forca' | 'energia' | 'potencia' | 'pressao',
): Resolucao<Dimensao> {
  const L: Dimensao = { M: 0, L: 1, T: 0 };
  const T: Dimensao = { M: 0, L: 0, T: 1 };
  const M: Dimensao = { M: 1, L: 0, T: 0 };

  switch (nome) {
    case 'velocidade': {
      const resultado = dividirDimensoes(L, T);
      return {
        resultado,
        passos: [
          { descricao: 'Velocidade é deslocamento por tempo.', tex: 'v = \\frac{\\Delta s}{\\Delta t}' },
          {
            descricao: 'Em dimensões, a divisão subtrai os expoentes.',
            tex: `[v] = \\frac{L}{T} = ${dimensaoParaTex(resultado)}`,
          },
        ],
      };
    }

    case 'aceleracao': {
      const velocidade = dividirDimensoes(L, T);
      const resultado = dividirDimensoes(velocidade, T);
      return {
        resultado,
        passos: [
          { descricao: 'Aceleração é variação de velocidade por tempo.', tex: 'a = \\frac{\\Delta v}{\\Delta t}' },
          {
            descricao: 'Substituímos a dimensão de velocidade.',
            tex: `[a] = \\frac{LT^{-1}}{T} = ${dimensaoParaTex(resultado)}`,
            nota: 'Daí a unidade m/s²: o tempo aparece duas vezes no denominador.',
          },
        ],
      };
    }

    case 'forca': {
      const aceleracao = { M: 0, L: 1, T: -2 };
      const resultado = multiplicarDimensoes(M, aceleracao);
      return {
        resultado,
        passos: [
          { descricao: 'Pela segunda lei de Newton, força é massa vezes aceleração.', tex: 'F = ma' },
          {
            descricao: 'Multiplicar dimensões soma os expoentes.',
            tex: `[F] = M \\cdot LT^{-2} = ${dimensaoParaTex(resultado)}`,
            nota: 'É isso que o newton significa: kg·m/s².',
          },
        ],
      };
    }

    case 'energia': {
      const forca = { M: 1, L: 1, T: -2 };
      const resultado = multiplicarDimensoes(forca, L);
      return {
        resultado,
        passos: [
          { descricao: 'Trabalho é força vezes deslocamento.', tex: 'W = F \\cdot d' },
          {
            descricao: 'Somando os expoentes.',
            tex: `[E] = MLT^{-2} \\cdot L = ${dimensaoParaTex(resultado)}`,
            nota: 'Energia cinética mv²/2 tem a mesma dimensão — como tem de ser.',
          },
        ],
      };
    }

    case 'potencia': {
      const energia = { M: 1, L: 2, T: -2 };
      const resultado = dividirDimensoes(energia, T);
      return {
        resultado,
        passos: [
          { descricao: 'Potência é energia por tempo.', tex: 'P = \\frac{E}{\\Delta t}' },
          {
            descricao: 'Subtraindo o expoente do tempo.',
            tex: `[P] = \\frac{ML^{2}T^{-2}}{T} = ${dimensaoParaTex(resultado)}`,
          },
        ],
      };
    }

    case 'pressao': {
      const forca = { M: 1, L: 1, T: -2 };
      const area = { M: 0, L: 2, T: 0 };
      const resultado = dividirDimensoes(forca, area);
      return {
        resultado,
        passos: [
          { descricao: 'Pressão é força por área.', tex: 'p = \\frac{F}{A}' },
          {
            descricao: 'Dividindo as dimensões.',
            tex: `[p] = \\frac{MLT^{-2}}{L^{2}} = ${dimensaoParaTex(resultado)}`,
            nota: 'O expoente negativo de L mostra que pressão cai quando a área cresce.',
          },
        ],
      };
    }
  }
}

export interface VerificacaoDimensional {
  readonly consistente: boolean;
  readonly esquerda: Dimensao;
  readonly direita: Dimensao;
}

/**
 * Confere se os dois lados de uma equação têm a mesma dimensão.
 *
 * Dimensão igual não garante que a fórmula está certa — um fator numérico
 * errado passa pelo teste. Mas dimensão diferente garante que está errada.
 */
export function verificarEquacaoComPassos(
  esquerda: Dimensao,
  direita: Dimensao,
  descricaoEsquerda: string,
  descricaoDireita: string,
): Resolucao<VerificacaoDimensional> {
  const consistente = dimensoesIguais(esquerda, direita);

  return {
    resultado: { consistente, esquerda, direita },
    passos: [
      {
        descricao: `Dimensão do lado esquerdo (${descricaoEsquerda}).`,
        tex: `[${descricaoEsquerda}] = ${dimensaoParaTex(esquerda)}`,
      },
      {
        descricao: `Dimensão do lado direito (${descricaoDireita}).`,
        tex: `[${descricaoDireita}] = ${dimensaoParaTex(direita)}`,
      },
      {
        descricao: consistente
          ? 'As dimensões coincidem: a equação passa no teste.'
          : 'As dimensões diferem: a equação está necessariamente errada.',
        tex: consistente
          ? `${dimensaoParaTex(esquerda)} = ${dimensaoParaTex(direita)}`
          : `${dimensaoParaTex(esquerda)} \\ne ${dimensaoParaTex(direita)}`,
        nota: consistente
          ? 'Atenção: o teste não detecta erro em fatores numéricos, como um 2 fora de lugar.'
          : 'Nenhuma substituição numérica consertaria isso.',
      },
    ],
  };
}

/** Converte uma unidade composta pela potência dos fatores de conversão. */
export function converterUnidadeComPassos(
  valor: number,
  fatores: readonly { readonly fator: number; readonly expoente: number; readonly descricao: string }[],
): Resolucao<number> {
  if (fatores.length === 0) {
    throw new ErroMatematico('Informe ao menos um fator de conversão.');
  }

  const multiplicador = fatores.reduce(
    (produto, { fator, expoente }) => produto * fator ** expoente,
    1,
  );

  const resultado = valor * multiplicador;

  return {
    resultado,
    passos: [
      {
        descricao: 'Cada unidade composta converte-se pela potência do seu fator.',
        tex: fatores
          .map(({ fator, expoente }) => (expoente === 1 ? String(fator) : `${fator}^{${expoente}}`))
          .join(' \\cdot '),
      },
      {
        descricao: 'Multiplicando os fatores.',
        tex: `\\text{fator total} = ${Number(multiplicador.toPrecision(10))}`,
        nota: fatores.map(({ descricao }) => descricao).join('; '),
      },
      {
        descricao: 'Aplicamos ao valor.',
        tex: `${valor} \\to ${Number(resultado.toPrecision(10))}`,
      },
    ],
  };
}
