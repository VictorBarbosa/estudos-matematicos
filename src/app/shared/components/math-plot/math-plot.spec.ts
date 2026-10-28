import {
  Projecao,
  construirPathCurva,
  corCss,
  deduzirLimitesVerticais,
  formatarNumero,
  gerarMarcacoes,
  passoBonito,
} from './math-plot.model';

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
    expect(gerarMarcacoes(0, 0.3, 0.1)).toHaveLength(4);
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
    expect(path.match(/M/g)).toHaveLength(1);
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
