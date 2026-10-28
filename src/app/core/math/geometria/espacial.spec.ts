import { ErroMatematico } from '@core/math/tipos';
import { areaComPassos } from './plana';
import {
  AFINA_ATE_VERTICE,
  razaoDeVolumesComPassos,
  superficieComPassos,
  volumeComPassos,
} from './espacial';

describe('volumes', () => {
  it('prisma e cilindro são base vezes altura', () => {
    expect(volumeComPassos('prisma', { areaBase: 12, altura: 5 }).resultado).toBe(60);
    expect(volumeComPassos('cilindro', { raio: 2, altura: 5 }).resultado).toBeCloseTo(
      Math.PI * 4 * 5,
      9,
    );
  });

  it('o cilindro é o prisma de base circular', () => {
    const raio = 3;
    const altura = 7;
    const areaBase = areaComPassos('circulo', { raio }).resultado;

    expect(volumeComPassos('cilindro', { raio, altura }).resultado).toBeCloseTo(
      volumeComPassos('prisma', { areaBase, altura }).resultado,
      9,
    );
  });

  it('pirâmide e cone valem um terço do sólido reto equivalente', () => {
    const areaBase = 12;
    const altura = 5;

    expect(volumeComPassos('piramide', { areaBase, altura }).resultado).toBeCloseTo(
      volumeComPassos('prisma', { areaBase, altura }).resultado / 3,
      9,
    );

    expect(volumeComPassos('cone', { raio: 2, altura: 9 }).resultado).toBeCloseTo(
      volumeComPassos('cilindro', { raio: 2, altura: 9 }).resultado / 3,
      9,
    );
  });

  it('a lista de sólidos que afinam até um vértice bate com o fator 1/3', () => {
    for (const solido of AFINA_ATE_VERTICE) {
      const dimensoes = { areaBase: 6, raio: 2, altura: 3 };
      const reto = solido === 'cone' ? 'cilindro' : 'prisma';

      expect(volumeComPassos(solido, dimensoes).resultado).toBeCloseTo(
        volumeComPassos(reto, dimensoes).resultado / 3,
        9,
      );
    }
  });

  it('a esfera é dois terços do cilindro que a envolve', () => {
    const raio = 4;
    const cilindro = volumeComPassos('cilindro', { raio, altura: 2 * raio }).resultado;

    expect(volumeComPassos('esfera', { raio }).resultado).toBeCloseTo((2 / 3) * cilindro, 8);
  });

  it('a esfera vale 4πr³/3', () => {
    expect(volumeComPassos('esfera', { raio: 3 }).resultado).toBeCloseTo(
      (4 / 3) * Math.PI * 27,
      8,
    );
  });

  it('recusa medidas faltantes', () => {
    expect(() => volumeComPassos('cilindro', { raio: 2 })).toThrow(ErroMatematico);
    expect(() => volumeComPassos('esfera', { raio: 0 })).toThrow(ErroMatematico);
  });
});

describe('superfícies', () => {
  it('a superfície da esfera é 4πr²', () => {
    expect(superficieComPassos('esfera', { raio: 2 }).resultado).toBeCloseTo(16 * Math.PI, 9);
  });

  it('a superfície da esfera é igual à lateral do cilindro que a envolve', () => {
    const raio = 5;
    const esfera = superficieComPassos('esfera', { raio }).resultado;
    const lateralCilindro = 2 * Math.PI * raio * (2 * raio);

    expect(esfera).toBeCloseTo(lateralCilindro, 8);
  });

  it('o cilindro soma lateral e duas tampas', () => {
    const raio = 2;
    const altura = 5;
    const esperado = 2 * Math.PI * raio * raio + 2 * Math.PI * raio * altura;

    expect(superficieComPassos('cilindro', { raio, altura }).resultado).toBeCloseTo(esperado, 9);
  });

  it('o cone soma base e setor lateral', () => {
    const raio = 3;
    const geratriz = 5;
    const esperado = Math.PI * raio * raio + Math.PI * raio * geratriz;

    expect(superficieComPassos('cone', { raio, geratriz }).resultado).toBeCloseTo(esperado, 9);
  });

  it('recusa geratriz menor que o raio', () => {
    expect(() => superficieComPassos('cone', { raio: 5, geratriz: 3 })).toThrow(ErroMatematico);
  });

  it('o prisma soma lateral desenrolada e duas bases', () => {
    const resultado = superficieComPassos('prisma', {
      areaBase: 6,
      perimetroBase: 12,
      altura: 4,
    }).resultado;

    expect(resultado).toBe(2 * 6 + 12 * 4);
  });

  it('avisa que a pirâmide depende da base', () => {
    expect(() => superficieComPassos('piramide', { areaBase: 9, altura: 4 })).toThrow(
      ErroMatematico,
    );
  });
});

describe('semelhança espacial', () => {
  it('a razão de volumes é o cubo da razão linear', () => {
    expect(razaoDeVolumesComPassos(2).resultado).toBe(8);
    expect(razaoDeVolumesComPassos(3).resultado).toBe(27);
    expect(razaoDeVolumesComPassos(0.5).resultado).toBeCloseTo(0.125, 9);
  });

  it('confere com o cálculo direto em duas esferas semelhantes', () => {
    const raio = 2;
    const k = 3;

    const pequena = volumeComPassos('esfera', { raio }).resultado;
    const grande = volumeComPassos('esfera', { raio: raio * k }).resultado;

    expect(grande / pequena).toBeCloseTo(razaoDeVolumesComPassos(k).resultado, 8);
  });

  it('recusa razão não positiva', () => {
    expect(() => razaoDeVolumesComPassos(-1)).toThrow(ErroMatematico);
  });
});
