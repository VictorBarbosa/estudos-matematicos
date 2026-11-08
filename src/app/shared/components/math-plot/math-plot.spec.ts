import {
  Projecao,
  desenharArco,
  construirPathCurva,
  corCss,
  deduzirLimitesVerticais,
  formatarNumero,
  gerarMarcacoes,
  passoBonito,
} from '@shared/components/math-plot/models/math-plot.model';

const MARGENS = { topo: 10, direita: 10, baixo: 10, esquerda: 10 };

describe('corCss', () => {
  it('traduz o nome do token para a variável CSS', () => {
    expect(corCss('serie-2')).toBe('var(--serie-2)');
    expect(corCss(undefined)).toBe('var(--serie-1)');
    expect(corCss(undefined, 'acento')).toBe('var(--acento)');
  });
});

describe('passoBonito', () => {
  it('escolhe passos redondos: 1, 2 ou 5 vezes uma potência de dez', () => {
    expect(passoBonito(10, 10)).toBe(1);
    expect(passoBonito(100, 10)).toBe(10);
    expect(passoBonito(1, 10)).toBeCloseTo(0.1);
    expect(passoBonito(37, 10)).toBe(5);
  });

  it('não quebra com intervalo zero ou inválido', () => {
    expect(passoBonito(0, 10)).toBe(1);
    expect(passoBonito(Number.NaN, 10)).toBe(1);
  });
});

describe('gerarMarcacoes', () => {
  it('alinha as marcações a múltiplos do passo', () => {
    expect(gerarMarcacoes(-2, 2, 1)).toEqual([-2, -1, 0, 1, 2]);
    expect(gerarMarcacoes(0.5, 2.5, 0.5)).toEqual([0.5, 1, 1.5, 2, 2.5]);
  });

  it('não perde a última marcação por erro de ponto flutuante', () => {
    expect(gerarMarcacoes(0, 0.3, 0.1).length).toBe(4);
  });

  it('devolve lista vazia para passo inválido', () => {
    expect(gerarMarcacoes(0, 1, 0)).toEqual([]);
  });
});

describe('formatarNumero', () => {
  it('usa a vírgula decimal e as casas que o passo exige', () => {
    expect(formatarNumero(1.5, 0.5)).toBe('1,5');
    expect(formatarNumero(3, 1)).toBe('3');
    expect(formatarNumero(0.25, 0.25)).toBe('0,25');
  });

  it('nunca exibe "menos zero"', () => {
    expect(formatarNumero(-0.0001, 1)).toBe('0');
  });
});

describe('Projecao', () => {
  const projecao = new Projecao({ xMin: 0, xMax: 10, yMin: 0, yMax: 10 }, 110, 110, MARGENS);

  it('mapeia o canto inferior esquerdo do domínio no canto correspondente da tela', () => {
    expect(projecao.px(0)).toBe(10);
    // O eixo y da tela cresce para baixo, então yMin fica embaixo.
    expect(projecao.py(0)).toBe(100);
  });

  it('mapeia o ponto médio no centro', () => {
    expect(projecao.px(5)).toBe(55);
    expect(projecao.py(5)).toBe(55);
  });
});

describe('deduzirLimitesVerticais', () => {
  it('respeita os limites quando ambos são informados', () => {
    const limites = deduzirLimitesVerticais({ xMin: -1, xMax: 1, yMin: -5, yMax: 5 }, [], []);
    expect(limites).toEqual({ yMin: -5, yMax: 5 });
  });

  it('deduz a escala a partir da curva, incluindo o zero', () => {
    const { yMin, yMax } = deduzirLimitesVerticais({ xMin: 0, xMax: 10 }, [{ fn: (x) => x }], []);

    expect(yMin).toBeLessThanOrEqual(0);
    expect(yMax).toBeGreaterThan(9);
  });

  it('não deixa uma assíntota achatar o resto do gráfico', () => {
    // Sem o corte por percentis, 1/x levaria yMax a milhares.
    const { yMax } = deduzirLimitesVerticais({ xMin: 0.001, xMax: 5 }, [{ fn: (x) => 1 / x }], []);
    expect(yMax).toBeLessThan(100);
  });

  it('abre uma janela utilizável quando não há nada a desenhar', () => {
    const { yMin, yMax } = deduzirLimitesVerticais({ xMin: -1, xMax: 1 }, [], []);
    expect(yMax).toBeGreaterThan(yMin);
  });
});

describe('construirPathCurva', () => {
  const projecao = new Projecao({ xMin: -5, xMax: 5, yMin: -5, yMax: 5 }, 510, 510, MARGENS);

  it('desenha uma curva contínua num único traço', () => {
    const path = construirPathCurva((x) => x, projecao, 50);

    expect(path.startsWith('M')).toBe(true);
    // Um único comando de "mover" significa que o traço não foi interrompido.
    expect(path.match(/M/g) ?? []).toEqual(['M']);
  });

  it('interrompe o traço em valores não finitos', () => {
    const path = construirPathCurva((x) => (x < 0 ? Number.NaN : x), projecao, 50);
    expect(path.match(/M/g)!.length).toBeGreaterThanOrEqual(1);
  });

  it('não liga os dois lados de uma assíntota com uma linha vertical falsa', () => {
    // Em 1/x o salto de -∞ para +∞ precisa quebrar o traço em dois.
    const path = construirPathCurva((x) => 1 / x, projecao, 201);
    expect(path.match(/M/g)!.length).toBeGreaterThanOrEqual(2);
  });

  it('devolve string vazia quando a função nunca é finita', () => {
    expect(construirPathCurva(() => Number.NaN, projecao, 10)).toBe('');
  });
});

describe('desenharArco', () => {
  // Um quadro do tamanho dos de verdade: num pequeno demais todo rótulo
  // encosta na borda, e o teste mediria o limite em vez da regra.
  const projecao = new Projecao({ xMin: 0, xMax: 10, yMin: 0, yMax: 10 }, 800, 400, {
    topo: 10,
    direita: 10,
    baixo: 10,
    esquerda: 10,
  });

  const reto = {
    x: 0,
    y: 0,
    de: { x: 1, y: 0 },
    ate: { x: 0, y: 1 },
    rotulo: '90°',
  } as const;

  it('desenha um arco de raio dado a partir do vértice', () => {
    const arco = desenharArco({ ...reto, raio: 20 }, projecao);

    expect(arco.d).toMatch(/^M [\d.-]+ [\d.-]+ A 20 20 0 0 [01] [\d.-]+ [\d.-]+$/);
    expect(arco.rotulo).toBe('90°');
  });

  it('escolhe a abertura menor, venha a ordem que vier', () => {
    // Trocar `de` por `ate` inverte o sentido, mas não o ângulo coberto.
    const direto = desenharArco(reto, projecao);
    const invertido = desenharArco({ ...reto, de: reto.ate, ate: reto.de }, projecao);

    const sentidoDe = (d: string): string => /A \d+ \d+ 0 0 ([01])/.exec(d)![1]!;
    expect(sentidoDe(direto.d)).not.toBe(sentidoDe(invertido.d));

    // E o rótulo cai na bissetriz nos dois casos, à mesma distância do vértice.
    const distancia = (a: { rotuloX: number; rotuloY: number }): number =>
      Math.hypot(a.rotuloX - projecao.px(0), a.rotuloY - 4 - projecao.py(0));
    expect(distancia(direto)).toBeCloseTo(distancia(invertido), 6);
  });

  it('afasta mais o rótulo quando o ângulo é fino', () => {
    const fino = desenharArco(
      { x: 5, y: 5, de: { x: 10, y: 5 }, ate: { x: 10, y: 5.2 } },
      projecao,
    );
    const aberto = desenharArco(
      { x: 5, y: 5, de: { x: 10, y: 5 }, ate: { x: 0, y: 5.2 } },
      projecao,
    );

    const afastamento = (a: { rotuloX: number; rotuloY: number }): number =>
      Math.hypot(a.rotuloX - projecao.px(5), a.rotuloY - 4 - projecao.py(5));
    expect(afastamento(fino)).toBeGreaterThan(afastamento(aberto));
  });

  it('prende o rótulo dentro da área de desenho', () => {
    // Um ângulo no canto superior direito escrevia a medida fora do quadro.
    const canto = desenharArco(
      { x: 10, y: 10, de: { x: 10.5, y: 10 }, ate: { x: 10, y: 10.5 } },
      projecao,
    );

    expect(canto.rotuloX).toBeLessThanOrEqual(10 + projecao.larguraUtil - 22);
    expect(canto.rotuloX).toBeGreaterThanOrEqual(10 + 22);
    expect(canto.rotuloY).toBeGreaterThanOrEqual(10 + 14);
    expect(canto.rotuloY).toBeLessThanOrEqual(10 + projecao.alturaUtil - 6);
  });
});
