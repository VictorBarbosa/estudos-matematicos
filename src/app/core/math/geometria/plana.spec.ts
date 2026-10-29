import { ErroMatematico } from '@core/math/tipos';
import {
  anguloInternoRegular,
  areaComPassos,
  catetoComPassos,
  classificarTriangulo,
  desigualdadeTriangular,
  escalaComPassos,
  perimetroCirculoComPassos,
  pitagorasComPassos,
  somaAngulosInternosComPassos,
  talesComPassos,
} from './plana';

describe('ângulos de polígonos', () => {
  it('a soma dos internos é (n − 2)·180°', () => {
    expect(somaAngulosInternosComPassos(3).resultado).toBe(180);
    expect(somaAngulosInternosComPassos(4).resultado).toBe(360);
    expect(somaAngulosInternosComPassos(12).resultado).toBe(1800);
  });

  it('o ângulo interno do regular é a soma dividida por n', () => {
    expect(anguloInternoRegular(3)).toBeCloseTo(60, 9);
    expect(anguloInternoRegular(4)).toBeCloseTo(90, 9);
    expect(anguloInternoRegular(6)).toBeCloseTo(120, 9);
  });

  it('o ângulo interno cresce com o número de lados, sem chegar a 180°', () => {
    let anterior = 0;
    for (let lados = 3; lados <= 100; lados++) {
      const atual = anguloInternoRegular(lados);
      expect(atual).toBeGreaterThan(anterior);
      expect(atual).toBeLessThan(180);
      anterior = atual;
    }
  });

  it('recusa polígonos com menos de três lados', () => {
    expect(() => somaAngulosInternosComPassos(2)).toThrowError(ErroMatematico);
    expect(() => somaAngulosInternosComPassos(3.5)).toThrowError(ErroMatematico);
  });
});

describe('triângulos', () => {
  it('a desigualdade triangular reprova lados impossíveis', () => {
    expect(desigualdadeTriangular(3, 4, 5)).toBe(true);
    expect(desigualdadeTriangular(1, 2, 3)).toBe(false);
    expect(desigualdadeTriangular(1, 1, 5)).toBe(false);
  });

  it('classifica pelos lados', () => {
    expect(classificarTriangulo(5, 5, 5).forma).toBe('equilatero');
    expect(classificarTriangulo(5, 5, 7).forma).toBe('isosceles');
    expect(classificarTriangulo(4, 5, 7).forma).toBe('escaleno');
  });

  it('classifica pelos ângulos usando os quadrados dos lados', () => {
    expect(classificarTriangulo(3, 4, 5).angulo).toBe('retangulo');
    expect(classificarTriangulo(5, 5, 5).angulo).toBe('acutangulo');
    expect(classificarTriangulo(2, 3, 4).angulo).toBe('obtusangulo');
  });

  it('a ordem dos lados não muda a classificação', () => {
    expect(classificarTriangulo(5, 3, 4)).toEqual(classificarTriangulo(3, 4, 5));
    expect(classificarTriangulo(4, 5, 3)).toEqual(classificarTriangulo(3, 4, 5));
  });

  it('recusa classificar o que não é triângulo', () => {
    expect(() => classificarTriangulo(1, 2, 3)).toThrowError(ErroMatematico);
  });
});

describe('Pitágoras', () => {
  it('encontra a hipotenusa', () => {
    expect(pitagorasComPassos(3, 4).resultado).toBeCloseTo(5, 9);
    expect(pitagorasComPassos(5, 12).resultado).toBeCloseTo(13, 9);
  });

  it('encontra o cateto que falta', () => {
    expect(catetoComPassos(5, 3).resultado).toBeCloseTo(4, 9);
    expect(catetoComPassos(13, 5).resultado).toBeCloseTo(12, 9);
  });

  it('ida e volta fecha', () => {
    for (const [b, c] of [
      [3, 4],
      [7, 24],
      [1, 1],
      [2.5, 6],
    ]) {
      const hipotenusa = pitagorasComPassos(b!, c!).resultado;
      expect(catetoComPassos(hipotenusa, b!).resultado).toBeCloseTo(c!, 8);
    }
  });

  it('o triângulo obtido é de fato retângulo', () => {
    const hipotenusa = pitagorasComPassos(6, 8).resultado;
    expect(classificarTriangulo(6, 8, hipotenusa).angulo).toBe('retangulo');
  });

  it('recusa medidas impossíveis', () => {
    expect(() => pitagorasComPassos(0, 4)).toThrowError(ErroMatematico);
    expect(() => catetoComPassos(3, 5)).toThrowError(ErroMatematico);
  });
});

describe('Tales', () => {
  it('resolve a quarta proporcional', () => {
    // 2/3 = 4/x → x = 6
    expect(talesComPassos(2, 3, 4).resultado).toBeCloseTo(6, 9);
  });

  it('o resultado mantém a proporção', () => {
    const casos: readonly [number, number, number][] = [
      [2, 3, 4],
      [5, 8, 15],
      [1.5, 2, 6],
    ];

    for (const [a, b, c] of casos) {
      const x = talesComPassos(a, b, c).resultado;
      expect(a / b).toBeCloseTo(c / x, 9);
    }
  });

  it('recusa segmento nulo', () => {
    expect(() => talesComPassos(0, 3, 4)).toThrowError(ErroMatematico);
  });
});

describe('escala e semelhança', () => {
  it('comprimento, área e volume escalam com k, k² e k³', () => {
    expect(escalaComPassos(2, 1).resultado).toBe(2);
    expect(escalaComPassos(2, 2).resultado).toBe(4);
    expect(escalaComPassos(2, 3).resultado).toBe(8);
    expect(escalaComPassos(3, 2).resultado).toBe(9);
  });

  it('os passos explicam a dimensão pedida', () => {
    expect(escalaComPassos(2, 3).passos.some((p) => p.tex.includes('k^{3}'))).toBe(true);
    expect(escalaComPassos(2, 1).passos.some((p) => p.tex.includes('k^{3}'))).toBe(false);
  });

  it('recusa razão não positiva', () => {
    expect(() => escalaComPassos(0, 2)).toThrowError(ErroMatematico);
  });
});

describe('áreas', () => {
  it('retângulo, triângulo e paralelogramo', () => {
    expect(areaComPassos('retangulo', { base: 5, altura: 3 }).resultado).toBe(15);
    expect(areaComPassos('triangulo', { base: 5, altura: 3 }).resultado).toBe(7.5);
    expect(areaComPassos('paralelogramo', { base: 5, altura: 3 }).resultado).toBe(15);
  });

  it('o triângulo é metade do paralelogramo de mesma base e altura', () => {
    const paralelogramo = areaComPassos('paralelogramo', { base: 7, altura: 4 }).resultado;
    const triangulo = areaComPassos('triangulo', { base: 7, altura: 4 }).resultado;

    expect(triangulo * 2).toBeCloseTo(paralelogramo, 9);
  });

  it('o trapézio é a média das bases vezes a altura', () => {
    expect(areaComPassos('trapezio', { base: 8, baseMenor: 4, altura: 3 }).resultado).toBe(18);
  });

  it('o trapézio de bases iguais vira paralelogramo', () => {
    const trapezio = areaComPassos('trapezio', { base: 5, baseMenor: 5, altura: 3 }).resultado;
    expect(trapezio).toBeCloseTo(areaComPassos('paralelogramo', { base: 5, altura: 3 }).resultado, 9);
  });

  it('círculo e setor', () => {
    expect(areaComPassos('circulo', { raio: 2 }).resultado).toBeCloseTo(4 * Math.PI, 9);
    expect(areaComPassos('setor', { raio: 2, anguloGraus: 90 }).resultado).toBeCloseTo(Math.PI, 9);
  });

  it('o setor de 360° é o círculo inteiro', () => {
    const setor = areaComPassos('setor', { raio: 3, anguloGraus: 360 }).resultado;
    expect(setor).toBeCloseTo(areaComPassos('circulo', { raio: 3 }).resultado, 9);
  });

  it('o polígono regular é perímetro vezes apótema, pela metade', () => {
    // Hexágono de lado 2: apótema √3, área 6√3.
    const area = areaComPassos('poligono-regular', {
      lados: 6,
      base: 2,
      apotema: Math.sqrt(3),
    }).resultado;

    expect(area).toBeCloseTo(6 * Math.sqrt(3), 9);
  });

  it('polígono regular com muitos lados tende ao círculo', () => {
    const raio = 1;
    const lados = 2000;
    const lado = 2 * raio * Math.sin(Math.PI / lados);
    const apotema = raio * Math.cos(Math.PI / lados);

    const area = areaComPassos('poligono-regular', { lados, base: lado, apotema }).resultado;

    expect(area).toBeCloseTo(Math.PI * raio * raio, 4);
  });

  it('recusa medidas faltantes ou inválidas', () => {
    expect(() => areaComPassos('retangulo', { base: 5 })).toThrowError(ErroMatematico);
    expect(() => areaComPassos('circulo', { raio: -1 })).toThrowError(ErroMatematico);
  });
});

describe('perímetro do círculo', () => {
  it('é 2πr', () => {
    expect(perimetroCirculoComPassos(1).resultado).toBeCloseTo(2 * Math.PI, 9);
    expect(perimetroCirculoComPassos(5).resultado).toBeCloseTo(10 * Math.PI, 9);
  });

  it('a razão entre comprimento e diâmetro é π, qualquer que seja o raio', () => {
    for (const raio of [0.5, 1, 7, 1000]) {
      const comprimento = perimetroCirculoComPassos(raio).resultado;
      expect(comprimento / (2 * raio)).toBeCloseTo(Math.PI, 12);
    }
  });
});
