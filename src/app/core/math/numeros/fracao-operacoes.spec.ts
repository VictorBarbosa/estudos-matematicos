import { Fracao } from './fracao';
import { operacaoParaTex, resolverComPassos } from './fracao-operacoes';

describe('resolverComPassos', () => {
  it('chega ao mesmo resultado que a operação direta', () => {
    const a = Fracao.criar(1, 4);
    const b = Fracao.criar(1, 6);

    expect(resolverComPassos(a, 'somar', b).resultado.igualA(a.somar(b))).toBe(true);
    expect(resolverComPassos(a, 'subtrair', b).resultado.igualA(a.subtrair(b))).toBe(true);
    expect(resolverComPassos(a, 'multiplicar', b).resultado.igualA(a.multiplicar(b))).toBe(true);
    expect(resolverComPassos(a, 'dividir', b).resultado.igualA(a.dividir(b))).toBe(true);
  });

  it('abre a soma de denominadores diferentes em cinco etapas', () => {
    const { passos } = resolverComPassos(Fracao.criar(1, 4), 'somar', Fracao.criar(1, 6));

    // enunciado, MMC, conversão, soma dos numeradores e simplificação
    expect(passos.length).toBe(5);
    expect(passos[1]?.tex).toContain('\\operatorname{mmc}(4, 6) = 12');
  });

  it('pula a conversão quando os denominadores já são iguais', () => {
    const { passos } = resolverComPassos(Fracao.criar(1, 5), 'somar', Fracao.criar(2, 5));

    expect(passos.length).toBe(4);
    expect(passos[1]?.descricao).toContain('já são iguais');
  });

  it('explica a divisão pelo inverso', () => {
    const { passos, resultado } = resolverComPassos(
      Fracao.criar(2, 3),
      'dividir',
      Fracao.criar(4, 9),
    );

    expect(resultado.toString()).toBe('3/2');
    expect(passos[1]?.descricao).toContain('inverso');
  });

  it('informa quando o resultado já é irredutível', () => {
    const { passos } = resolverComPassos(Fracao.criar(1, 3), 'somar', Fracao.criar(1, 4));
    expect(passos.at(-1)?.descricao).toContain('irredutível');
  });

  it('mostra a simplificação quando ela é necessária', () => {
    const { passos, resultado } = resolverComPassos(
      Fracao.criar(1, 4),
      'somar',
      Fracao.criar(1, 4),
    );

    expect(resultado.toString()).toBe('1/2');
    expect(passos.at(-1)?.descricao).toContain('Simplificamos');
  });

  it('todo passo tem descrição e expressão preenchidas', () => {
    const { passos } = resolverComPassos(Fracao.criar(3, 8), 'multiplicar', Fracao.criar(2, 5));

    for (const passo of passos) {
      expect(passo.descricao.length).toBeGreaterThan(0);
      expect(passo.tex.length).toBeGreaterThan(0);
    }
  });
});

describe('operacaoParaTex', () => {
  it('escreve a expressão com o símbolo da operação', () => {
    const a = Fracao.criar(1, 2);
    const b = Fracao.criar(3, 4);

    expect(operacaoParaTex(a, 'somar', b)).toBe('\\frac{1}{2} + \\frac{3}{4}');
    expect(operacaoParaTex(a, 'multiplicar', b)).toBe('\\frac{1}{2} \\times \\frac{3}{4}');
  });
});
