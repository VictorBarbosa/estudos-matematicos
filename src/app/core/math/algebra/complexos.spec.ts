import { ErroMatematico } from '@core/math/tipos';
import {
  argumentoGraus,
  complexoParaTex,
  conjugado,
  dePolar,
  dividirComplexosComPassos,
  moduloComplexo,
  multiplicarComplexosComPassos,
  paraPolarComPassos,
  potenciaComPassos,
  somarComplexos,
} from './complexos';

describe('números complexos', () => {
  it('escreve na forma algébrica legível', () => {
    expect(complexoParaTex({ real: 3, imaginario: 4 })).toBe('3 + 4i');
    expect(complexoParaTex({ real: 3, imaginario: -4 })).toBe('3 - 4i');
    expect(complexoParaTex({ real: 0, imaginario: 1 })).toBe('i');
    expect(complexoParaTex({ real: 0, imaginario: -1 })).toBe('-i');
    expect(complexoParaTex({ real: 5, imaginario: 0 })).toBe('5');
  });

  it('o módulo é a distância até a origem', () => {
    expect(moduloComplexo({ real: 3, imaginario: 4 })).toBeCloseTo(5, 9);
  });

  it('o argumento identifica o quadrante corretamente', () => {
    expect(argumentoGraus({ real: 1, imaginario: 1 })).toBeCloseTo(45, 9);
    expect(argumentoGraus({ real: -1, imaginario: 1 })).toBeCloseTo(135, 9);
    expect(argumentoGraus({ real: -1, imaginario: -1 })).toBeCloseTo(225, 9);
    expect(argumentoGraus({ real: 1, imaginario: -1 })).toBeCloseTo(315, 9);
  });

  it('i² = −1', () => {
    const i = { real: 0, imaginario: 1 };
    const { resultado } = multiplicarComplexosComPassos(i, i);

    expect(resultado.real).toBeCloseTo(-1, 9);
    expect(resultado.imaginario).toBeCloseTo(0, 9);
  });

  it('na multiplicação, módulos multiplicam e argumentos somam', () => {
    const a = dePolar(2, 30);
    const b = dePolar(3, 40);
    const { resultado } = multiplicarComplexosComPassos(a, b);

    expect(moduloComplexo(resultado)).toBeCloseTo(6, 8);
    expect(argumentoGraus(resultado)).toBeCloseTo(70, 6);
  });

  it('o produto pelo conjugado é real e vale o módulo ao quadrado', () => {
    const z = { real: 3, imaginario: -5 };
    const { resultado } = multiplicarComplexosComPassos(z, conjugado(z));

    expect(resultado.imaginario).toBeCloseTo(0, 9);
    expect(resultado.real).toBeCloseTo(moduloComplexo(z) ** 2, 9);
  });

  it('a soma é componente a componente', () => {
    expect(somarComplexos({ real: 1, imaginario: 2 }, { real: -3, imaginario: 5 })).toEqual({
      real: -2,
      imaginario: 7,
    });
  });

  it('a divisão é a inversa da multiplicação', () => {
    const a = { real: 7, imaginario: -4 };
    const b = { real: 2, imaginario: 3 };

    const quociente = dividirComplexosComPassos(a, b).resultado;
    const volta = multiplicarComplexosComPassos(quociente, b).resultado;

    expect(volta.real).toBeCloseTo(a.real, 8);
    expect(volta.imaginario).toBeCloseTo(a.imaginario, 8);
  });

  it('não divide por zero', () => {
    expect(() =>
      dividirComplexosComPassos({ real: 1, imaginario: 1 }, { real: 0, imaginario: 0 }),
    ).toThrow(ErroMatematico);
  });

  it('a forma polar reconstrói o número', () => {
    for (const z of [
      { real: 3, imaginario: 4 },
      { real: -2, imaginario: 7 },
      { real: -1, imaginario: -1 },
      { real: 5, imaginario: 0 },
    ]) {
      const { modulo, argumento } = paraPolarComPassos(z).resultado;
      const volta = dePolar(modulo, argumento);

      expect(volta.real).toBeCloseTo(z.real, 8);
      expect(volta.imaginario).toBeCloseTo(z.imaginario, 8);
    }
  });

  it('o zero complexo não tem argumento', () => {
    expect(() => paraPolarComPassos({ real: 0, imaginario: 0 })).toThrow(ErroMatematico);
  });

  it('De Moivre confere com a multiplicação repetida', () => {
    const z = { real: 1, imaginario: 1 };

    let repetido = z;
    for (let i = 1; i < 5; i++) {
      repetido = multiplicarComplexosComPassos(repetido, z).resultado;
    }

    const { resultado } = potenciaComPassos(z, 5);

    expect(resultado.real).toBeCloseTo(repetido.real, 6);
    expect(resultado.imaginario).toBeCloseTo(repetido.imaginario, 6);
  });

  it('i elevado a 4 volta a 1', () => {
    const { resultado } = potenciaComPassos({ real: 0, imaginario: 1 }, 4);

    expect(resultado.real).toBeCloseTo(1, 8);
    expect(resultado.imaginario).toBeCloseTo(0, 8);
  });

  it('recusa expoente negativo ou fracionário', () => {
    expect(() => potenciaComPassos({ real: 1, imaginario: 0 }, -1)).toThrow(ErroMatematico);
    expect(() => potenciaComPassos({ real: 1, imaginario: 0 }, 1.5)).toThrow(ErroMatematico);
  });
});
