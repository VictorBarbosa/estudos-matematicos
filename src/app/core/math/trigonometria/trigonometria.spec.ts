import { ErroMatematico } from '@core/math/tipos';
import {
  ANGULOS_NOTAVEIS,
  analisarOndaComPassos,
  anguloNotavel,
  leiDosCossenosComPassos,
  leiDosSenosComPassos,
  paraGraus,
  paraRadianos,
  quadrante,
  resolverTrianguloComPassos,
  sinaisNoQuadrante,
} from './trigonometria';

describe('conversão de ângulos', () => {
  it('converte graus para radianos e de volta', () => {
    expect(paraRadianos(180)).toBeCloseTo(Math.PI);
    expect(paraRadianos(90)).toBeCloseTo(Math.PI / 2);
    expect(paraGraus(Math.PI)).toBeCloseTo(180);
    expect(paraGraus(paraRadianos(37))).toBeCloseTo(37);
  });
});

describe('ângulos notáveis', () => {
  it('traz os cinco ângulos da primeira volta', () => {
    expect(ANGULOS_NOTAVEIS.map((a) => a.graus)).toEqual([0, 30, 45, 60, 90]);
  });

  it('sen 30° e cos 60° são ambos 1/2', () => {
    expect(anguloNotavel(30)?.senoTex).toBe('\\frac{1}{2}');
    expect(anguloNotavel(60)?.cossenoTex).toBe('\\frac{1}{2}');
  });

  it('a tangente de 90° não existe', () => {
    expect(anguloNotavel(90)?.tangenteTex).toBeNull();
  });
});

describe('quadrantes', () => {
  it('identifica o quadrante de cada ângulo', () => {
    expect(quadrante(45)).toBe(1);
    expect(quadrante(135)).toBe(2);
    expect(quadrante(200)).toBe(3);
    expect(quadrante(300)).toBe(4);
  });

  it('normaliza ângulos fora da primeira volta', () => {
    expect(quadrante(405)).toBe(1);
    expect(quadrante(-45)).toBe(4);
  });

  it('o seno é positivo acima do eixo e o cosseno à direita', () => {
    expect(sinaisNoQuadrante(45)).toMatchObject({ seno: 1, cosseno: 1 });
    expect(sinaisNoQuadrante(135)).toMatchObject({ seno: 1, cosseno: -1 });
    expect(sinaisNoQuadrante(225)).toMatchObject({ seno: -1, cosseno: -1 });
    expect(sinaisNoQuadrante(315)).toMatchObject({ seno: -1, cosseno: 1 });
  });
});

describe('triângulo retângulo', () => {
  it('encontra os catetos a partir do ângulo e da hipotenusa', () => {
    const { resultado } = resolverTrianguloComPassos(30, 10);

    expect(resultado.oposto).toBeCloseTo(5);
    expect(resultado.adjacente).toBeCloseTo(8.6603, 3);
  });

  it('os catetos satisfazem Pitágoras', () => {
    const { resultado } = resolverTrianguloComPassos(37, 12);
    const hipotenusa = Math.hypot(resultado.oposto, resultado.adjacente);

    expect(hipotenusa).toBeCloseTo(12, 9);
  });

  it('recusa ângulos fora do intervalo agudo', () => {
    expect(() => resolverTrianguloComPassos(0, 10)).toThrow(ErroMatematico);
    expect(() => resolverTrianguloComPassos(90, 10)).toThrow(ErroMatematico);
  });
});

describe('leis dos senos e dos cossenos', () => {
  it('a lei dos cossenos vira Pitágoras no ângulo reto', () => {
    const { resultado } = leiDosCossenosComPassos(3, 4, 90);
    expect(resultado).toBeCloseTo(5);
  });

  it('calcula o terceiro lado de um triângulo qualquer', () => {
    const { resultado } = leiDosCossenosComPassos(5, 7, 60);
    expect(resultado).toBeCloseTo(Math.sqrt(25 + 49 - 35), 6);
  });

  it('a lei dos senos mantém a proporção', () => {
    const { resultado } = leiDosSenosComPassos(10, 30, 90);
    expect(resultado).toBeCloseTo(20);
  });
});

describe('onda senoidal', () => {
  it('o período é 2π dividido pela frequência', () => {
    expect(analisarOndaComPassos(1, 1, 0, 0).resultado.periodo).toBeCloseTo(2 * Math.PI);
    expect(analisarOndaComPassos(1, 2, 0, 0).resultado.periodo).toBeCloseTo(Math.PI);
  });

  it('guarda amplitude, fase e deslocamento', () => {
    const { resultado } = analisarOndaComPassos(3, 2, 1, -4);

    expect(resultado.amplitude).toBe(3);
    expect(resultado.fase).toBe(1);
    expect(resultado.deslocamento).toBe(-4);
  });
});
