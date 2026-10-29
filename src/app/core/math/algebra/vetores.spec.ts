import { ErroMatematico } from '@core/math/tipos';
import {
  anguloEntreComPassos,
  areaParalelogramoComPassos,
  decomporComPassos,
  deModuloEAngulo,
  direcaoGraus,
  modulo,
  normalizar,
  produtoEscalar,
  produtoVetorialZ,
  projecaoComPassos,
  somarComPassos,
  vetoresParalelos,
  vetoresPerpendiculares,
} from './vetores';

describe('vetores no plano', () => {
  it('o módulo é a hipotenusa das componentes', () => {
    expect(modulo({ x: 3, y: 4 })).toBeCloseTo(5, 9);
    expect(modulo({ x: 0, y: -7 })).toBeCloseTo(7, 9);
  });

  it('a direção fica sempre em [0, 360)', () => {
    expect(direcaoGraus({ x: 1, y: 0 })).toBeCloseTo(0, 9);
    expect(direcaoGraus({ x: 0, y: 1 })).toBeCloseTo(90, 9);
    expect(direcaoGraus({ x: -1, y: 0 })).toBeCloseTo(180, 9);
    expect(direcaoGraus({ x: 0, y: -1 })).toBeCloseTo(270, 9);
  });

  it('decompor e recompor devolve o mesmo vetor', () => {
    for (const [comprimento, angulo] of [
      [10, 30],
      [5, 135],
      [7.5, 200],
      [1, 359],
    ]) {
      const { resultado } = decomporComPassos(comprimento!, angulo!);

      expect(modulo(resultado)).toBeCloseTo(comprimento!, 9);
      expect(direcaoGraus(resultado)).toBeCloseTo(angulo!, 6);
    }
  });

  it('a decomposição usa cosseno no x e seno no y', () => {
    const { resultado } = decomporComPassos(10, 60);

    expect(resultado.x).toBeCloseTo(10 * Math.cos(Math.PI / 3), 9);
    expect(resultado.y).toBeCloseTo(10 * Math.sin(Math.PI / 3), 9);
  });

  it('recusa módulo negativo', () => {
    expect(() => decomporComPassos(-1, 30)).toThrowError(ErroMatematico);
  });

  it('normalizar mantém a direção e põe o módulo em 1', () => {
    const unitario = normalizar({ x: 3, y: 4 });

    expect(modulo(unitario)).toBeCloseTo(1, 9);
    expect(direcaoGraus(unitario)).toBeCloseTo(direcaoGraus({ x: 3, y: 4 }), 9);
  });

  it('não normaliza o vetor nulo', () => {
    expect(() => normalizar({ x: 0, y: 0 })).toThrowError(ErroMatematico);
  });

  it('o módulo da soma não é a soma dos módulos', () => {
    const a = { x: 3, y: 0 };
    const b = { x: 0, y: 4 };
    const { resultado } = somarComPassos(a, b);

    expect(modulo(resultado)).toBeCloseTo(5, 9);
    expect(modulo(resultado)).toBeLessThan(modulo(a) + modulo(b));
  });

  it('os módulos só somam quando a direção é a mesma', () => {
    const { resultado, passos } = somarComPassos({ x: 2, y: 0 }, { x: 3, y: 0 });

    expect(modulo(resultado)).toBeCloseTo(5, 9);
    expect(passos.at(-1)?.nota).toContain('mesma direção');
  });

  it('a soma é comutativa', () => {
    const a = { x: -2, y: 5 };
    const b = { x: 7, y: 1 };

    expect(somarComPassos(a, b).resultado).toEqual(somarComPassos(b, a).resultado);
  });
});

describe('produto escalar e vetorial', () => {
  it('o produto escalar zera em vetores perpendiculares', () => {
    expect(produtoEscalar({ x: 1, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(0, 9);
    expect(vetoresPerpendiculares({ x: 2, y: 3 }, { x: -3, y: 2 })).toBe(true);
  });

  it('o produto vetorial zera em vetores paralelos', () => {
    expect(produtoVetorialZ({ x: 2, y: 4 }, { x: 1, y: 2 })).toBeCloseTo(0, 9);
    expect(vetoresParalelos({ x: 2, y: 4 }, { x: -1, y: -2 })).toBe(true);
  });

  it('o ângulo entre vetores confere com casos conhecidos', () => {
    expect(anguloEntreComPassos({ x: 1, y: 0 }, { x: 0, y: 1 }).resultado).toBeCloseTo(90, 6);
    expect(anguloEntreComPassos({ x: 1, y: 0 }, { x: 1, y: 1 }).resultado).toBeCloseTo(45, 6);
    expect(anguloEntreComPassos({ x: 1, y: 0 }, { x: -1, y: 0 }).resultado).toBeCloseTo(180, 6);
  });

  it('o ângulo entre vetores iguais é zero, mesmo com erro de ponto flutuante', () => {
    const v = { x: 0.1, y: 0.3 };
    expect(anguloEntreComPassos(v, v).resultado).toBeCloseTo(0, 6);
  });

  it('não há ângulo com o vetor nulo', () => {
    expect(() => anguloEntreComPassos({ x: 0, y: 0 }, { x: 1, y: 1 })).toThrowError(ErroMatematico);
  });

  it('a projeção é o módulo vezes o cosseno do ângulo', () => {
    const a = { x: 3, y: 4 };
    const b = { x: 1, y: 0 };

    expect(projecaoComPassos(a, b).resultado).toBeCloseTo(3, 9);

    const angulo = anguloEntreComPassos(a, b).resultado;
    expect(projecaoComPassos(a, b).resultado).toBeCloseTo(
      modulo(a) * Math.cos((angulo * Math.PI) / 180),
      6,
    );
  });

  it('a projeção não depende do comprimento do vetor de referência', () => {
    const a = { x: 2, y: 5 };

    expect(projecaoComPassos(a, { x: 1, y: 0 }).resultado).toBeCloseTo(
      projecaoComPassos(a, { x: 100, y: 0 }).resultado,
      9,
    );
  });

  it('a projeção é negativa quando o ângulo é obtuso', () => {
    expect(projecaoComPassos({ x: -3, y: 0 }, { x: 1, y: 0 }).resultado).toBeCloseTo(-3, 9);
  });

  it('a área do paralelogramo é o módulo do produto vetorial', () => {
    expect(areaParalelogramoComPassos({ x: 3, y: 0 }, { x: 0, y: 4 }).resultado).toBeCloseTo(12, 9);
  });

  it('a área é zero quando os vetores são paralelos', () => {
    const { resultado, passos } = areaParalelogramoComPassos({ x: 2, y: 4 }, { x: 1, y: 2 });

    expect(resultado).toBeCloseTo(0, 9);
    expect(passos.at(-1)?.nota).toContain('paralelos');
  });

  it('a área independe da ordem dos vetores', () => {
    const a = { x: 3, y: 1 };
    const b = { x: -2, y: 5 };

    expect(areaParalelogramoComPassos(a, b).resultado).toBeCloseTo(
      areaParalelogramoComPassos(b, a).resultado,
      9,
    );
  });

  it('a área também é |a||b|sen(θ)', () => {
    const a = deModuloEAngulo(5, 20);
    const b = deModuloEAngulo(3, 80);
    const angulo = anguloEntreComPassos(a, b).resultado;

    expect(areaParalelogramoComPassos(a, b).resultado).toBeCloseTo(
      5 * 3 * Math.sin((angulo * Math.PI) / 180),
      6,
    );
  });
});
