import { ErroMatematico } from '@core/math/tipos';
import { resolverLinearComPassos } from './equacao-linear';
import {
  formaFatoradaParaTex,
  relacoesDeGirard,
  resolverQuadraticaComPassos,
} from './equacao-quadratica';

describe('resolverLinearComPassos', () => {
  it('resolve 2x + 6 = 0', () => {
    const { resultado, passos } = resolverLinearComPassos(2, 6);

    expect(resultado.valor).toBe(-3);
    expect(resultado.raiz.toString()).toBe('-3');
    expect(passos.at(-1)?.descricao).toContain('Conferindo');
  });

  it('devolve raiz fracionária exata, sem dízima', () => {
    const { resultado } = resolverLinearComPassos(3, 0, 1);
    expect(resultado.raiz.toString()).toBe('1/3');
  });

  it('resolve com os dois lados não nulos', () => {
    const { resultado } = resolverLinearComPassos(5, 2, 17);
    expect(resultado.valor).toBe(3);
  });

  it('pula o passo de subtração quando b é zero', () => {
    const semB = resolverLinearComPassos(4, 0, 8);
    const comB = resolverLinearComPassos(4, 1, 9);

    expect(semB.passos.length).toBeLessThan(comB.passos.length);
  });

  it('recusa a = 0, que não é equação do 1º grau', () => {
    expect(() => resolverLinearComPassos(0, 3, 3)).toThrow(ErroMatematico);
    expect(() => resolverLinearComPassos(0, 3, 5)).toThrow(ErroMatematico);
  });
});

describe('resolverQuadraticaComPassos', () => {
  it('encontra duas raízes quando o discriminante é positivo', () => {
    const { resultado } = resolverQuadraticaComPassos(1, -5, 6);

    expect(resultado.delta).toBe(1);
    expect(resultado.raizes).toEqual([2, 3]);
    expect(resultado.quantidadeDeRaizes).toBe(2);
  });

  it('encontra uma raiz dupla quando o discriminante é zero', () => {
    const { resultado, passos } = resolverQuadraticaComPassos(1, -4, 4);

    expect(resultado.delta).toBe(0);
    expect(resultado.raizes).toEqual([2]);
    expect(passos.some((p) => p.descricao.includes('única raiz'))).toBe(true);
  });

  it('não encontra raízes reais quando o discriminante é negativo', () => {
    const { resultado, passos } = resolverQuadraticaComPassos(1, 0, 4);

    expect(resultado.delta).toBe(-16);
    expect(resultado.raizes).toEqual([]);
    expect(passos.some((p) => p.descricao.includes('negativo'))).toBe(true);
  });

  it('calcula o vértice, que fica na média das raízes', () => {
    const { resultado } = resolverQuadraticaComPassos(1, -5, 6);

    expect(resultado.vertice.x).toBeCloseTo(2.5);
    expect(resultado.vertice.y).toBeCloseTo(-0.25);
  });

  it('recusa a = 0', () => {
    expect(() => resolverQuadraticaComPassos(0, 2, 1)).toThrow(ErroMatematico);
  });
});

describe('forma fatorada e relações de Girard', () => {
  it('escreve a forma fatorada a partir das raízes', () => {
    expect(formaFatoradaParaTex(1, [2, 3])).toBe('\\left(x - 2\\right)\\left(x - 3\\right)');
    expect(formaFatoradaParaTex(1, [2])).toBe('\\left(x - 2\\right)^{2}');
    expect(formaFatoradaParaTex(1, [])).toBeNull();
  });

  it('relaciona soma e produto com os coeficientes', () => {
    const { soma, produto } = relacoesDeGirard(1, -5, 6);

    expect(soma).toBe(5);
    expect(produto).toBe(6);
  });
});
