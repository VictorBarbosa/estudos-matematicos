import { ErroMatematico } from '@core/math/tipos';
import { resolverInequacaoComPassos } from './inequacao';
import { comoFuncao, resolverSistemaComPassos } from './sistema-linear';

describe('resolverSistemaComPassos', () => {
  it('resolve um sistema determinado', () => {
    // x + y = 5 ; x - y = 1  ->  (3, 2)
    const { resultado } = resolverSistemaComPassos({ a1: 1, b1: 1, c1: 5, a2: 1, b2: -1, c2: 1 });

    expect(resultado.tipo).toBe('determinado');
    expect(resultado.x).toBeCloseTo(3);
    expect(resultado.y).toBeCloseTo(2);
  });

  it('reconhece retas paralelas como sistema impossível', () => {
    const { resultado, passos } = resolverSistemaComPassos({
      a1: 1,
      b1: 1,
      c1: 2,
      a2: 2,
      b2: 2,
      c2: 7,
    });

    expect(resultado.tipo).toBe('impossivel');
    expect(resultado.determinante).toBe(0);
    expect(passos.some((p) => p.descricao.includes('paralelas'))).toBe(true);
  });

  it('reconhece equações equivalentes como sistema indeterminado', () => {
    const { resultado } = resolverSistemaComPassos({
      a1: 1,
      b1: 1,
      c1: 2,
      a2: 2,
      b2: 2,
      c2: 4,
    });

    expect(resultado.tipo).toBe('indeterminado');
  });

  it('isola y para o desenho da reta', () => {
    const reta = comoFuncao(1, 1, 5)!;

    expect(reta(0)).toBe(5);
    expect(reta(5)).toBe(0);
    expect(comoFuncao(1, 0, 5)).toBeNull();
  });
});

describe('resolverInequacaoComPassos', () => {
  it('mantém o sentido ao dividir por positivo', () => {
    // 2x + 1 > 7  ->  x > 3
    const { resultado } = resolverInequacaoComPassos(2, 1, '>', 7);

    expect(resultado.fronteira).toBe(3);
    expect(resultado.relacao).toBe('>');
  });

  it('INVERTE o sentido ao dividir por negativo', () => {
    // -2x > 6  ->  x < -3
    const { resultado, passos } = resolverInequacaoComPassos(-2, 0, '>', 6);

    expect(resultado.fronteira).toBe(-3);
    expect(resultado.relacao).toBe('<');
    expect(passos.some((p) => p.descricao.includes('inverte'))).toBe(true);
  });

  it('marca a fronteira como inclusiva nas relações com igualdade', () => {
    expect(resolverInequacaoComPassos(1, 0, '>=', 2).resultado.inclusiva).toBe(true);
    expect(resolverInequacaoComPassos(1, 0, '>', 2).resultado.inclusiva).toBe(false);
  });

  it('escreve o intervalo com a notação certa', () => {
    expect(resolverInequacaoComPassos(1, 0, '>=', 2).resultado.intervaloTex).toContain('\\left[');
    expect(resolverInequacaoComPassos(1, 0, '<', 2).resultado.intervaloTex).toContain('\\right)');
  });

  it('recusa a = 0', () => {
    expect(() => resolverInequacaoComPassos(0, 1, '<', 2)).toThrowError(ErroMatematico);
  });
});
