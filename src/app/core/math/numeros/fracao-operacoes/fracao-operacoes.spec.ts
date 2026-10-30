import { Fracao } from '@core/math/numeros/fracao/fracao';
import { operacaoParaTex, resolverComPassos } from '@core/math/numeros/fracao-operacoes/fracao-operacoes';

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

/**
 * A resolução em forma mista.
 *
 * O enunciado mostrava `-1\\frac{5}{9} \\div 1\\frac{1}{2}` e a resolução abria
 * direto em `-\\frac{14}{9} \\div \\frac{3}{2}` — dois números que não aparecem
 * em lugar nenhum da pergunta. A conversão, que é justamente a passagem que o
 * aluno erra, ficava de fora; e o fim vinha impróprio, com o gabarito ao lado
 * dizendo `-1 1/27`.
 */
describe('resolverComPassos com números mistos', () => {
  const resolucao = resolverComPassos(Fracao.criar(-14, 9), 'dividir', Fracao.criar(3, 2), true);

  it('abre o enunciado na forma mista', () => {
    expect(resolucao.passos[0]!.tex).toBe('-1\\frac{5}{9} \\div 1\\frac{1}{2}');
  });

  it('converte cada misto em fração imprópria, mostrando a conta', () => {
    const conversao = resolucao.passos[1]!;

    expect(conversao.tex).toContain('-1\\frac{5}{9} = -\\frac{1 \\times 9 + 5}{9} = -\\frac{14}{9}');
    expect(conversao.tex).toContain('1\\frac{1}{2} = \\frac{1 \\times 2 + 1}{2} = \\frac{3}{2}');
  });

  it('avisa que o sinal do misto vale para o número todo', () => {
    // -1 5/9 é -(1 + 5/9); lido como -1 + 5/9 daria -4/9, outro número.
    expect(resolucao.passos[1]!.nota).toContain('-(1 + 5/9)');
  });

  it('termina voltando à forma mista, que é a do gabarito', () => {
    const ultimo = resolucao.passos.at(-1)!;

    expect(ultimo.tex).toBe('-\\frac{28}{27} = -1\\frac{1}{27}');
    expect(resolucao.resultado.toStringMisto()).toBe('-1 1/27');
  });

  it('sem mistos entre os operandos, nada é acrescentado', () => {
    // 1/2 ÷ 3/4 não tem parte inteira: converter o que já é próprio só
    // acrescentaria um passo vazio.
    const simples = resolverComPassos(Fracao.criar(1, 2), 'dividir', Fracao.criar(3, 4), true);

    expect(simples.passos[1]!.descricao).toContain('inverso');
  });

  it('resultado inteiro não ganha passo de volta', () => {
    // 1 1/2 × 2/3 = 1: não há forma mista de 1 para exibir.
    const inteiro = resolverComPassos(Fracao.criar(3, 2), 'multiplicar', Fracao.criar(2, 3), true);

    expect(inteiro.resultado.toString()).toBe('1');
    expect(inteiro.passos.at(-1)!.descricao).not.toContain('forma mista');
  });

  it('sem a forma mista, a resolução continua como era', () => {
    const antes = resolverComPassos(Fracao.criar(-14, 9), 'dividir', Fracao.criar(3, 2));

    expect(antes.passos[0]!.tex).toBe('-\\frac{14}{9} \\div \\frac{3}{2}');
    expect(antes.passos.some((passo) => passo.descricao.includes('forma mista'))).toBe(false);
  });
});

describe('sinais colados', () => {
  it('o operando negativo vem entre parênteses em todo passo', () => {
    // "-\frac{44}{24} + -\frac{93}{24}" tem dois sinais seguidos, que ninguém
    // escreve à mão — e é onde o erro de sinal já é o mais comum.
    const { passos } = resolverComPassos(Fracao.criar(-11, 6), 'somar', Fracao.criar(-31, 8), true);

    for (const passo of passos) {
      expect(passo.tex, passo.descricao).not.toMatch(/[+\-] -/);
      expect(passo.tex, passo.descricao).not.toMatch(/\\times -|\\div -/);
    }
  });
});
