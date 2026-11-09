import { Matriz, determinante } from '@core/math/algebra/matrizes/matrizes';
import { TipoSistema } from '@core/math/algebra/sistema-linear/sistema-linear';
import { Fracao } from '@core/math/numeros/fracao/fracao';
import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';

/**
 * Escalonamento (Gauss e Gauss-Jordan) e matriz inversa.
 *
 * Tudo em frações exatas: dividir uma linha por 3 deixa 1/3 na tabela, e o
 * aluno precisa VER 1/3 — o decimal 0,3333 esconde que a conta fecha.
 */

/** Matriz de frações, linhas por colunas. */
export type MatrizFracao = readonly (readonly Fracao[])[];

/** Os índices de linha, como o aluno os escreve: L₁, L₂, L₃… */
const INDICE = ['₁', '₂', '₃', '₄', '₅', '₆'];

/** `L₂` para a linha de índice 1. */
export function nomeDaLinha(indice: number): string {
  return `L${INDICE[indice] ?? String(indice + 1)}`;
}

export function paraFracoes(m: Matriz): Fracao[][] {
  return m.map((linha) => linha.map((valor) => Fracao.deInteiro(valor)));
}

/**
 * Matriz em TeX com uma barra vertical antes da coluna `barra`.
 *
 * `barra` igual ao número de colunas omite a barra. É a matriz aumentada
 * `(A | b)` do sistema, ou `(A | I)` no cálculo da inversa.
 */
export function aumentadaParaTex(m: MatrizFracao, barra: number): string {
  const colunas = m[0]?.length ?? 0;
  const formato =
    barra >= colunas ? 'c'.repeat(colunas) : `${'c'.repeat(barra)}|${'c'.repeat(colunas - barra)}`;
  const corpo = m.map((linha) => linha.map((valor) => valor.paraTex()).join(' & ')).join(' \\\\ ');
  return `\\left(\\begin{array}{${formato}} ${corpo} \\end{array}\\right)`;
}

/** `L₂ − 3L₁`, `L₂ + 1/2·L₁`: a operação como texto para a descrição. */
function combinacaoTexto(destino: number, origem: number, fator: Fracao): string {
  const sinal = fator.ehNegativa ? '+' : '−';
  const modulo = fator.ehNegativa ? fator.negar() : fator;
  const multiplo = modulo.igualA(Fracao.UM) ? '' : `${modulo.toString()}·`;
  return `${nomeDaLinha(destino)} ← ${nomeDaLinha(destino)} ${sinal} ${multiplo}${nomeDaLinha(origem)}`;
}

/** A mesma operação em TeX, para acompanhar a matriz. */
function combinacaoTex(destino: number, origem: number, fator: Fracao): string {
  const sinal = fator.ehNegativa ? '+' : '-';
  const modulo = fator.ehNegativa ? fator.negar() : fator;
  const multiplo = modulo.igualA(Fracao.UM) ? '' : modulo.paraTex();
  return `L_{${destino + 1}} \\to L_{${destino + 1}} ${sinal} ${multiplo}L_{${origem + 1}}`;
}

export interface Reducao {
  /** A forma escalonada reduzida. */
  readonly forma: MatrizFracao;
  /** As colunas em que ficou um pivô. */
  readonly pivos: readonly number[];
}

/**
 * Gauss-Jordan coluna a coluna, registrando cada etapa.
 *
 * Por coluna: troca de linhas se o pivô for zero, divisão da linha do pivô
 * para que ele vire 1, e eliminação da coluna nas demais linhas — esta última
 * num passo só, porque são operações independentes entre si.
 *
 * `colunasPivo` limita onde procurar pivôs: num sistema, a coluna dos termos
 * independentes nunca é coluna de pivô; em `(A | I)`, as colunas de I também
 * não.
 */
export function reduzirComPassos(
  inicial: MatrizFracao,
  colunasPivo: number,
  barra: number,
): Resolucao<Reducao> {
  const m = inicial.map((linha) => [...linha]);
  const linhas = m.length;
  const pivos: number[] = [];
  const passos: Passo[] = [
    {
      descricao: 'A matriz de partida.',
      tex: aumentadaParaTex(m, barra),
    },
  ];

  let linha = 0;
  for (let coluna = 0; coluna < colunasPivo && linha < linhas; coluna++) {
    let candidata = linha;
    while (candidata < linhas && m[candidata]![coluna]!.ehZero) {
      candidata++;
    }

    if (candidata === linhas) {
      continue;
    }

    if (candidata !== linha) {
      [m[linha], m[candidata]] = [m[candidata]!, m[linha]!];
      passos.push({
        descricao:
          `Na coluna ${coluna + 1}, a ${nomeDaLinha(linha)} tem zero onde deveria estar o pivô: ` +
          `trocamos ${nomeDaLinha(linha)} ↔ ${nomeDaLinha(candidata)}.`,
        tex: `L_{${linha + 1}} \\leftrightarrow L_{${candidata + 1}} \\qquad ${aumentadaParaTex(m, barra)}`,
        nota: 'Trocar a ordem das equações não muda as soluções.',
      });
    }

    const pivo = m[linha]![coluna]!;
    if (!pivo.igualA(Fracao.UM)) {
      m[linha] = m[linha]!.map((valor) => valor.dividir(pivo));
      passos.push({
        descricao: `Dividimos a ${nomeDaLinha(linha)} por ${pivo.toString()}, para o pivô virar 1.`,
        tex: `L_{${linha + 1}} \\to \\frac{L_{${linha + 1}}}{${pivo.paraTex()}} \\qquad ${aumentadaParaTex(m, barra)}`,
      });
    }

    const operacoes: string[] = [];
    const operacoesTex: string[] = [];
    for (let outra = 0; outra < linhas; outra++) {
      const fator = m[outra]![coluna]!;
      if (outra === linha || fator.ehZero) {
        continue;
      }

      m[outra] = m[outra]!.map((valor, j) => valor.subtrair(fator.multiplicar(m[linha]![j]!)));
      operacoes.push(combinacaoTexto(outra, linha, fator));
      operacoesTex.push(combinacaoTex(outra, linha, fator));
    }

    if (operacoes.length > 0) {
      passos.push({
        descricao: `Zeramos o resto da coluna ${coluna + 1}: ${operacoes.join('; ')}.`,
        tex: `${operacoesTex.join(',\\; ')} \\qquad ${aumentadaParaTex(m, barra)}`,
      });
    }

    pivos.push(coluna);
    linha++;
  }

  return { resultado: { forma: m, pivos }, passos };
}

export interface Escalonamento {
  readonly forma: MatrizFracao;
  readonly tipo: TipoSistema;
  /** A solução, quando única. */
  readonly solucao: readonly Fracao[] | null;
}

/**
 * O tipo do sistema lido na forma escalonada.
 *
 * Uma linha `0 0 0 | c` com c ≠ 0 diz 0 = c: impossível. Sem ela, falta de
 * pivô em alguma coluna deixa uma variável livre: infinitas soluções.
 */
export function classificarForma(forma: MatrizFracao, incognitas: number): TipoSistema {
  const contradicao = forma.some(
    (linha) => linha.slice(0, incognitas).every((v) => v.ehZero) && !linha[incognitas]!.ehZero,
  );
  if (contradicao) {
    return 'impossivel';
  }

  const pivos = forma.filter((linha) => linha.slice(0, incognitas).some((v) => !v.ehZero)).length;
  return pivos === incognitas ? 'determinado' : 'indeterminado';
}

const NOMES = ['x', 'y', 'z', 'w'];

/** Resolve um sistema a partir da matriz aumentada `(A | b)`, por Gauss-Jordan. */
export function gaussJordanComPassos(aumentada: Matriz): Resolucao<Escalonamento> {
  const incognitas = (aumentada[0]?.length ?? 1) - 1;
  if (incognitas < 1 || aumentada.some((linha) => linha.length !== incognitas + 1)) {
    throw new ErroMatematico(
      'A matriz aumentada precisa de uma coluna a mais que o número de incógnitas.',
    );
  }

  const reducao = reduzirComPassos(paraFracoes(aumentada), incognitas, incognitas);
  const { forma } = reducao.resultado;
  const tipo = classificarForma(forma, incognitas);
  const passos = [...reducao.passos];

  if (tipo === 'impossivel') {
    passos.push({
      descricao: 'Sobrou uma linha que diz 0 = número diferente de zero: o sistema é impossível.',
      tex: '0x + 0y + 0z = c \\neq 0 \\;\\Rightarrow\\; S = \\varnothing',
      nota: 'Os planos não têm ponto comum aos três.',
    });
    return { resultado: { forma, tipo, solucao: null }, passos };
  }

  if (tipo === 'indeterminado') {
    passos.push({
      descricao:
        'Alguma coluna ficou sem pivô: a variável dela é livre, e o sistema tem infinitas soluções.',
      tex: '\\text{posto}(A) = \\text{posto}(A|b) < n',
      nota: 'Uma das equações era combinação das outras e não trouxe informação nova.',
    });
    return { resultado: { forma, tipo, solucao: null }, passos };
  }

  const solucao = forma.slice(0, incognitas).map((linha) => linha[incognitas]!);
  passos.push({
    descricao: 'Com a identidade à esquerda, cada linha já é uma variável isolada.',
    tex: solucao
      .map((valor, i) => `${NOMES[i] ?? `x_{${i + 1}}`} = ${valor.paraTex()}`)
      .join(',\\; '),
  });

  return { resultado: { forma, tipo, solucao }, passos };
}

/**
 * Matriz inversa: pela fórmula da adjunta na 2×2, por `(A | I)` nas maiores.
 *
 * Lança {@link ErroMatematico} quando det A = 0 — não existe inversa, e dizer
 * isso é a resposta, não uma falha.
 */
export function inversaComPassos(a: Matriz): Resolucao<MatrizFracao> {
  const ordem = a.length;
  if (ordem === 0 || a.some((linha) => linha.length !== ordem)) {
    throw new ErroMatematico('Só matrizes quadradas podem ter inversa.');
  }

  const det = determinante(a);
  if (Math.abs(det) < 1e-9) {
    throw new ErroMatematico('O determinante é zero: a matriz não tem inversa.');
  }

  if (ordem === 2) {
    const [[p, q], [r, s]] = a as [[number, number], [number, number]];
    const d = Fracao.deInteiro(Math.round(det));
    const inversa = [
      [Fracao.criar(s, 1).dividir(d), Fracao.criar(-q, 1).dividir(d)],
      [Fracao.criar(-r, 1).dividir(d), Fracao.criar(p, 1).dividir(d)],
    ];

    return {
      resultado: inversa,
      passos: [
        {
          descricao: 'O determinante não é zero, então a inversa existe.',
          tex: `\\det A = (${p})(${s}) - (${q})(${r}) = ${Math.round(det)}`,
        },
        {
          descricao:
            'A adjunta da 2×2: troca os elementos da diagonal principal e muda o sinal dos outros dois.',
          tex: `\\text{adj}\\,A = \\begin{pmatrix} ${s} & ${-q} \\\\ ${-r} & ${p} \\end{pmatrix}`,
        },
        {
          descricao: 'Dividimos tudo pelo determinante.',
          tex: `A^{-1} = \\frac{1}{${Math.round(det)}}\\,\\text{adj}\\,A = ${aumentadaParaTex(inversa, 2)}`,
        },
      ],
    };
  }

  const identidade = a.map((linha, i) => [
    ...linha.map((valor) => Fracao.deInteiro(valor)),
    ...a.map((_, j) => (i === j ? Fracao.UM : Fracao.ZERO)),
  ]);
  const reducao = reduzirComPassos(identidade, ordem, ordem);
  const inversa = reducao.resultado.forma.map((linha) => linha.slice(ordem));

  return {
    resultado: inversa,
    passos: [
      {
        descricao: `O determinante vale ${Math.round(det * 1e6) / 1e6}, diferente de zero: a inversa existe.`,
        tex: `\\det A = ${Math.round(det * 1e6) / 1e6} \\neq 0`,
      },
      {
        descricao: 'Escrevemos A ao lado da identidade e escalonamos as duas juntas.',
        tex: '(A \\mid I) \\;\\to\\; (I \\mid A^{-1})',
        nota: 'Cada operação de linha que transforma A em I transforma I em A⁻¹.',
      },
      ...reducao.passos,
      {
        descricao: 'À esquerda ficou a identidade; à direita, a inversa.',
        tex: `A^{-1} = ${aumentadaParaTex(inversa, ordem)}`,
      },
    ],
  };
}
