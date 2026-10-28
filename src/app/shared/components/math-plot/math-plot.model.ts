/**
 * Tipos e geometria do plano cartesiano.
 *
 * Tudo aqui é função pura: converter coordenadas matemáticas em coordenadas de
 * tela, escolher marcações de eixo e montar o `path` de uma curva. Separado do
 * componente para poder ser testado sem renderizar nada.
 */

/** Cores disponíveis, sempre referenciadas pelos tokens do tema. */
export type CorPlot =
  | 'serie-1'
  | 'serie-2'
  | 'serie-3'
  | 'serie-4'
  | 'serie-5'
  | 'serie-6'
  | 'acento'
  | 'acerto'
  | 'erro'
  | 'aviso'
  | 'texto-suave';

export interface DominioPlot {
  readonly xMin: number;
  readonly xMax: number;
  /** Quando omitidos, a escala vertical é deduzida do que está desenhado. */
  readonly yMin?: number;
  readonly yMax?: number;
}

export interface CurvaPlot {
  readonly fn: (x: number) => number;
  readonly cor?: CorPlot;
  readonly tracejada?: boolean;
  readonly rotulo?: string;
}

export interface PontoPlot {
  readonly x: number;
  readonly y: number;
  readonly rotulo?: string;
  readonly cor?: CorPlot;
  /** Círculo vazado, para indicar ponto excluído do domínio. */
  readonly vazado?: boolean;
}

export interface SegmentoPlot {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly cor?: CorPlot;
  readonly tracejado?: boolean;
  readonly seta?: boolean;
  readonly rotulo?: string;
}

/** Região sombreada entre a curva e o eixo x, para integrais definidas. */
export interface AreaPlot {
  readonly fn: (x: number) => number;
  readonly de: number;
  readonly ate: number;
  readonly cor?: CorPlot;
}

/**
 * Retângulo com base no eixo x, usado nas somas de Riemann.
 *
 * A altura pode ser negativa: nesse caso o retângulo desce abaixo do eixo,
 * que é exatamente o que significa área com sinal.
 */
export interface RetanguloPlot {
  readonly x: number;
  readonly largura: number;
  readonly altura: number;
  readonly cor?: CorPlot;
}

/** Marcação sobre o eixo x, usada em retas numéricas. */
export interface MarcaPlot {
  readonly x: number;
  readonly rotulo: string;
  readonly cor?: CorPlot;
}

export interface Margens {
  readonly topo: number;
  readonly direita: number;
  readonly baixo: number;
  readonly esquerda: number;
}

export interface Limites {
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
}

/** Converte o nome do token na expressão CSS correspondente. */
export function corCss(cor: CorPlot | undefined, padrao: CorPlot = 'serie-1'): string {
  return `var(--${cor ?? padrao})`;
}

/**
 * Escolhe um passo de marcação "redondo" — 1, 2 ou 5 vezes uma potência de dez.
 * É o que faz o eixo mostrar 0,5 / 1 / 1,5 em vez de 0,4237 / 0,8474.
 */
export function passoBonito(intervalo: number, divisoesAlvo: number): number {
  if (intervalo <= 0 || !Number.isFinite(intervalo)) {
    return 1;
  }

  const bruto = intervalo / divisoesAlvo;
  const magnitude = 10 ** Math.floor(Math.log10(bruto));
  const normalizado = bruto / magnitude;

  const fator = normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10;
  return fator * magnitude;
}

/** Valores de marcação dentro do intervalo, alinhados a múltiplos do passo. */
export function gerarMarcacoes(min: number, max: number, passo: number): readonly number[] {
  if (passo <= 0) {
    return [];
  }

  const marcas: number[] = [];
  const inicio = Math.ceil(min / passo) * passo;

  // Compara com uma folga de meio passo para não perder a última marcação por
  // erro de ponto flutuante.
  for (let valor = inicio; valor <= max + passo * 1e-9; valor += passo) {
    // Reancorar no múltiplo evita o acúmulo de erro da soma repetida.
    marcas.push(Math.round(valor / passo) * passo);
  }

  return marcas;
}

/**
 * Quantas casas decimais o passo exige para ser escrito sem perda.
 *
 * Usar `log10` aqui seria errado: um passo de 0,25 daria uma casa só, e o eixo
 * mostraria "0,3" no lugar de "0,25".
 */
function casasDecimais(passo: number): number {
  if (!Number.isFinite(passo) || passo <= 0) {
    return 0;
  }

  const texto = String(passo);

  // Passos muito pequenos aparecem como 2e-7; o expoente dá as casas.
  const expoente = texto.split('e-')[1];
  if (expoente !== undefined) {
    return Math.min(6, Number(expoente));
  }

  const separador = texto.indexOf('.');
  return separador === -1 ? 0 : Math.min(6, texto.length - separador - 1);
}

/** Formata um número com as casas decimais que o passo exige, à brasileira. */
export function formatarNumero(valor: number, passo: number): string {
  const texto = valor.toFixed(casasDecimais(passo)).replace('.', ',');
  // Evita exibir "-0" quando o arredondamento zera um valor negativo pequeno.
  return /^-0(,0+)?$/.test(texto) ? texto.slice(1) : texto;
}

/**
 * Deduz a escala vertical a partir do que será desenhado.
 *
 * Usa percentis em vez de mínimo e máximo absolutos: numa função com assíntota,
 * como 1/x ou tan(x), os valores extremos achatariam todo o resto do gráfico
 * contra o eixo.
 */
export function deduzirLimitesVerticais(
  dominio: DominioPlot,
  curvas: readonly CurvaPlot[],
  pontos: readonly PontoPlot[],
): { yMin: number; yMax: number } {
  if (dominio.yMin !== undefined && dominio.yMax !== undefined) {
    return { yMin: dominio.yMin, yMax: dominio.yMax };
  }

  const valores: number[] = [];
  const amostras = 200;

  for (const curva of curvas) {
    for (let i = 0; i <= amostras; i++) {
      const x = dominio.xMin + ((dominio.xMax - dominio.xMin) * i) / amostras;
      const y = curva.fn(x);
      if (Number.isFinite(y)) {
        valores.push(y);
      }
    }
  }

  for (const ponto of pontos) {
    if (Number.isFinite(ponto.y)) {
      valores.push(ponto.y);
    }
  }

  if (valores.length === 0) {
    return { yMin: dominio.yMin ?? -1, yMax: dominio.yMax ?? 1 };
  }

  valores.sort((a, b) => a - b);
  const inferior = valores[Math.floor(valores.length * 0.02)] ?? valores[0]!;
  const superior = valores[Math.ceil(valores.length * 0.98) - 1] ?? valores[valores.length - 1]!;

  let yMin = Math.min(inferior, 0);
  let yMax = Math.max(superior, 0);

  if (yMax - yMin < 1e-9) {
    yMin -= 1;
    yMax += 1;
  }

  const folga = (yMax - yMin) * 0.12;
  return {
    yMin: dominio.yMin ?? yMin - folga,
    yMax: dominio.yMax ?? yMax + folga,
  };
}

/** Projeção de coordenadas matemáticas para coordenadas do SVG. */
export class Projecao {
  constructor(
    readonly limites: Limites,
    readonly largura: number,
    readonly altura: number,
    readonly margens: Margens,
  ) {}

  get larguraUtil(): number {
    return this.largura - this.margens.esquerda - this.margens.direita;
  }

  get alturaUtil(): number {
    return this.altura - this.margens.topo - this.margens.baixo;
  }

  px(x: number): number {
    const { xMin, xMax } = this.limites;
    return this.margens.esquerda + ((x - xMin) / (xMax - xMin)) * this.larguraUtil;
  }

  py(y: number): number {
    const { yMin, yMax } = this.limites;
    return this.margens.topo + ((yMax - y) / (yMax - yMin)) * this.alturaUtil;
  }
}

/**
 * Monta o `path` de uma curva amostrando o domínio.
 *
 * Dois cuidados que separam um gráfico correto de um enganoso:
 * valores não finitos interrompem o traço em vez de virarem zero, e um salto
 * muito maior que a janela vertical também interrompe — é assim que se evita
 * a falsa linha vertical ligando +∞ a −∞ nas assíntotas da tangente.
 */
export function construirPathCurva(
  fn: (x: number) => number,
  projecao: Projecao,
  amostras = 640,
): string {
  const { xMin, xMax, yMin, yMax } = projecao.limites;
  const alturaDominio = yMax - yMin;
  const limiteSalto = alturaDominio * 2;
  // Mantém o traço um pouco além da janela para que o corte visual fique no
  // clipPath, não num fim de linha abrupto.
  const tetoAbsoluto = alturaDominio * 4;

  const partes: string[] = [];
  let anterior: number | null = null;

  for (let i = 0; i <= amostras; i++) {
    const x = xMin + ((xMax - xMin) * i) / amostras;
    const y = fn(x);

    if (!Number.isFinite(y)) {
      anterior = null;
      continue;
    }

    const houveSalto = anterior !== null && Math.abs(y - anterior) > limiteSalto;
    const foraDaVista = y > yMax + tetoAbsoluto || y < yMin - tetoAbsoluto;

    if (houveSalto || foraDaVista) {
      anterior = foraDaVista ? null : y;
      if (foraDaVista) {
        continue;
      }
    }

    const grampeado = Math.max(yMin - alturaDominio, Math.min(yMax + alturaDominio, y));
    const comando = anterior === null || houveSalto ? 'M' : 'L';
    partes.push(`${comando}${projecao.px(x).toFixed(2)},${projecao.py(grampeado).toFixed(2)}`);
    anterior = y;
  }

  return partes.join(' ');
}

/** Monta o `path` fechado da região entre a curva e o eixo x. */
export function construirPathArea(area: AreaPlot, projecao: Projecao, amostras = 240): string {
  const { de, ate, fn } = area;
  const { yMin, yMax } = projecao.limites;
  const grampear = (y: number): number => Math.max(yMin, Math.min(yMax, y));

  const pontos: string[] = [
    `M${projecao.px(de).toFixed(2)},${projecao.py(grampear(0)).toFixed(2)}`,
  ];

  for (let i = 0; i <= amostras; i++) {
    const x = de + ((ate - de) * i) / amostras;
    const y = fn(x);
    if (!Number.isFinite(y)) {
      continue;
    }
    pontos.push(`L${projecao.px(x).toFixed(2)},${projecao.py(grampear(y)).toFixed(2)}`);
  }

  pontos.push(`L${projecao.px(ate).toFixed(2)},${projecao.py(grampear(0)).toFixed(2)}`, 'Z');
  return pontos.join(' ');
}
