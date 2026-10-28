import { ErroMatematico } from '@core/math/tipos';
import {
  circunferenciaComPassos,
  conicaComPassos,
  distanciaComPassos,
  pontoMedio,
  posicaoRelativa,
  retaPorDoisPontosComPassos,
  saoParalelas,
  saoPerpendiculares,
} from './analitica';

describe('distância e ponto médio', () => {
  it('aplica Pitágoras às diferenças de coordenadas', () => {
    expect(distanciaComPassos({ x: 0, y: 0 }, { x: 3, y: 4 }).resultado).toBe(5);
  });

  it('não depende da ordem dos pontos', () => {
    const ida = distanciaComPassos({ x: 1, y: 2 }, { x: 4, y: 6 }).resultado;
    const volta = distanciaComPassos({ x: 4, y: 6 }, { x: 1, y: 2 }).resultado;

    expect(ida).toBeCloseTo(volta, 12);
  });

  it('calcula o ponto médio como média das coordenadas', () => {
    expect(pontoMedio({ x: 0, y: 0 }, { x: 4, y: 6 })).toEqual({ x: 2, y: 3 });
  });
});

describe('reta por dois pontos', () => {
  it('encontra a equação reduzida', () => {
    const { resultado } = retaPorDoisPontosComPassos({ x: 0, y: 1 }, { x: 2, y: 5 });

    expect(resultado.coeficienteAngular).toBe(2);
    expect(resultado.coeficienteLinear).toBe(1);
  });

  it('reconhece a reta vertical, que não tem coeficiente angular', () => {
    const { resultado } = retaPorDoisPontosComPassos({ x: 3, y: 0 }, { x: 3, y: 9 });

    expect(resultado.vertical).toBe(true);
    expect(resultado.coeficienteAngular).toBeNull();
    expect(resultado.xFixo).toBe(3);
  });

  it('recusa dois pontos coincidentes', () => {
    expect(() => retaPorDoisPontosComPassos({ x: 1, y: 1 }, { x: 1, y: 1 })).toThrow(
      ErroMatematico,
    );
  });

  it('identifica paralelismo e perpendicularidade', () => {
    expect(saoParalelas(2, 2)).toBe(true);
    expect(saoParalelas(2, 3)).toBe(false);
    expect(saoPerpendiculares(2, -0.5)).toBe(true);
    expect(saoPerpendiculares(2, 2)).toBe(false);
  });
});

describe('circunferência', () => {
  it('completa quadrados para achar centro e raio', () => {
    // x² + y² - 6x - 8y = 0  ->  centro (3,4), raio 5
    const { resultado } = circunferenciaComPassos(-6, -8, 0);

    expect(resultado.centro).toEqual({ x: 3, y: 4 });
    expect(resultado.raio).toBe(5);
  });

  it('recusa coeficientes que não geram círculo real', () => {
    expect(() => circunferenciaComPassos(0, 0, 4)).toThrow(ErroMatematico);
  });

  it('classifica a posição de um ponto', () => {
    const circulo = { centro: { x: 0, y: 0 }, raio: 5 };

    expect(posicaoRelativa({ x: 0, y: 0 }, circulo)).toBe('dentro');
    expect(posicaoRelativa({ x: 3, y: 4 }, circulo)).toBe('sobre');
    expect(posicaoRelativa({ x: 10, y: 0 }, circulo)).toBe('fora');
  });
});

describe('cônicas', () => {
  it('a elipse tem excentricidade entre 0 e 1', () => {
    const { resultado } = conicaComPassos(5, 3, false);

    expect(resultado.tipo).toBe('elipse');
    expect(resultado.excentricidade).toBeGreaterThan(0);
    expect(resultado.excentricidade).toBeLessThan(1);
    expect(resultado.focos).toHaveLength(2);
  });

  it('semieixos iguais dão uma circunferência, de excentricidade zero', () => {
    const { resultado } = conicaComPassos(4, 4, false);

    expect(resultado.tipo).toBe('circunferencia');
    expect(resultado.excentricidade).toBeCloseTo(0, 12);
  });

  it('a hipérbole tem excentricidade maior que 1', () => {
    const { resultado } = conicaComPassos(3, 4, true);

    expect(resultado.tipo).toBe('hiperbole');
    expect(resultado.excentricidade).toBeGreaterThan(1);
    // c² = a² + b² -> c = 5
    expect(resultado.focos[1]!.x).toBeCloseTo(5, 12);
  });

  it('recusa semieixos não positivos', () => {
    expect(() => conicaComPassos(0, 3, false)).toThrow(ErroMatematico);
  });
});
