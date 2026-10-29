import { ErroMatematico } from '@core/math/tipos';
import { Fracao } from './fracao';

describe('criação', () => {
  it('normaliza o sinal para o numerador', () => {
    const fracao = Fracao.criar(1, -2);
    expect(fracao.numerador).toBe(-1);
    expect(fracao.denominador).toBe(2);
  });

  it('transforma dois sinais negativos em positivo', () => {
    const fracao = Fracao.criar(-3, -4);
    expect(fracao.numerador).toBe(3);
    expect(fracao.denominador).toBe(4);
  });

  it('recusa denominador zero', () => {
    expect(() => Fracao.criar(1, 0)).toThrowError(ErroMatematico);
  });

  it('recusa valores não inteiros', () => {
    expect(() => Fracao.criar(1.5, 2)).toThrowError(ErroMatematico);
  });

  it('não simplifica automaticamente: simplificar é um passo a mostrar', () => {
    const fracao = Fracao.criar(6, 8);
    expect(fracao.numerador).toBe(6);
    expect(fracao.denominador).toBe(8);
  });
});

describe('simplificação', () => {
  it('reduz à forma irredutível', () => {
    expect(Fracao.criar(18, 24).simplificar().toString()).toBe('3/4');
    expect(Fracao.criar(-6, 8).simplificar().toString()).toBe('-3/4');
  });

  it('leva o zero à forma canônica 0/1', () => {
    const zero = Fracao.criar(0, 7).simplificar();
    expect(zero.numerador).toBe(0);
    expect(zero.denominador).toBe(1);
  });

  it('reconhece frações já irredutíveis', () => {
    expect(Fracao.criar(3, 4).estaSimplificada).toBe(true);
    expect(Fracao.criar(6, 8).estaSimplificada).toBe(false);
  });
});

describe('operações', () => {
  it('soma usando o denominador comum', () => {
    expect(Fracao.criar(1, 4).somar(Fracao.criar(1, 6)).toString()).toBe('5/12');
    expect(Fracao.criar(1, 2).somar(Fracao.criar(1, 2)).toString()).toBe('1');
  });

  it('subtrai, inclusive resultando em negativo', () => {
    expect(Fracao.criar(1, 4).subtrair(Fracao.criar(1, 6)).toString()).toBe('1/12');
    expect(Fracao.criar(1, 6).subtrair(Fracao.criar(1, 4)).toString()).toBe('-1/12');
  });

  it('multiplica em linha e simplifica', () => {
    expect(Fracao.criar(2, 3).multiplicar(Fracao.criar(3, 4)).toString()).toBe('1/2');
  });

  it('divide multiplicando pelo inverso', () => {
    expect(Fracao.criar(2, 3).dividir(Fracao.criar(4, 9)).toString()).toBe('3/2');
  });

  it('recusa divisão por zero', () => {
    expect(() => Fracao.criar(1, 2).dividir(Fracao.ZERO)).toThrowError(ErroMatematico);
  });

  it('recusa o inverso de zero', () => {
    expect(() => Fracao.ZERO.inverter()).toThrowError(ErroMatematico);
  });

  it('eleva a expoentes positivos, negativos e zero', () => {
    expect(Fracao.criar(2, 3).elevar(2).toString()).toBe('4/9');
    expect(Fracao.criar(2, 3).elevar(-1).toString()).toBe('3/2');
    expect(Fracao.criar(2, 3).elevar(0).toString()).toBe('1');
  });
});

describe('comparação', () => {
  it('compara frações de denominadores diferentes', () => {
    expect(Fracao.criar(1, 3).comparar(Fracao.criar(1, 2))).toBe(-1);
    expect(Fracao.criar(1, 2).comparar(Fracao.criar(1, 3))).toBe(1);
    expect(Fracao.criar(2, 4).comparar(Fracao.criar(1, 2))).toBe(0);
  });

  it('considera iguais as frações equivalentes, ainda que escritas diferente', () => {
    expect(Fracao.criar(6, 8).igualA(Fracao.criar(3, 4))).toBe(true);
    expect(Fracao.criar(-1, 2).igualA(Fracao.criar(1, -2))).toBe(true);
    expect(Fracao.criar(2, 3).igualA(Fracao.criar(3, 4))).toBe(false);
  });
});

describe('conversão de denominador', () => {
  it('reescreve com um múltiplo do denominador atual', () => {
    expect(Fracao.criar(1, 4).comDenominador(12).toString()).toBe('3/12');
  });

  it('recusa um denominador que mudaria o valor da fração', () => {
    expect(() => Fracao.criar(1, 4).comDenominador(10)).toThrowError(ErroMatematico);
  });
});

describe('leitura de texto digitado', () => {
  it('entende frações, inteiros e decimais', () => {
    expect(Fracao.analisar('3/4')?.toString()).toBe('3/4');
    expect(Fracao.analisar(' -2 / 5 ')?.toString()).toBe('-2/5');
    expect(Fracao.analisar('7')?.toString()).toBe('7');
    expect(Fracao.analisar('0,5')?.igualA(Fracao.criar(1, 2))).toBe(true);
    expect(Fracao.analisar('0.75')?.igualA(Fracao.criar(3, 4))).toBe(true);
    expect(Fracao.analisar('-1,25')?.igualA(Fracao.criar(-5, 4))).toBe(true);
  });

  it('devolve null para o que não é fração', () => {
    expect(Fracao.analisar('')).toBeNull();
    expect(Fracao.analisar('abc')).toBeNull();
    expect(Fracao.analisar('3/')).toBeNull();
    expect(Fracao.analisar('1/0')).toBeNull();
  });
});

describe('apresentação', () => {
  it('escreve em LaTeX, omitindo o denominador 1', () => {
    expect(Fracao.criar(3, 4).paraTex()).toBe('\\frac{3}{4}');
    expect(Fracao.criar(-3, 4).paraTex()).toBe('-\\frac{3}{4}');
    expect(Fracao.criar(5, 1).paraTex()).toBe('5');
  });

  it('converte para decimal', () => {
    expect(Fracao.criar(1, 4).paraDecimal()).toBe(0.25);
  });
});

describe('números mistos', () => {
  it('lê o número misto, que o espaço é quem define', () => {
    // Sem tratar o espaço, "1 1/2" virava "11/2" — onze meios.
    expect(Fracao.analisar('1 1/2')?.igualA(Fracao.criar(3, 2))).toBe(true);
    expect(Fracao.analisar('2 1/3')?.igualA(Fracao.criar(7, 3))).toBe(true);
    expect(Fracao.analisar('10 3/4')?.igualA(Fracao.criar(43, 4))).toBe(true);
  });

  it('o sinal do misto vale para o número inteiro', () => {
    // −2 1/3 é −(2 + 1/3), e não −2 + 1/3.
    expect(Fracao.analisar('-2 1/3')?.igualA(Fracao.criar(-7, 3))).toBe(true);
    expect(Fracao.analisar('-1 1/2')?.igualA(Fracao.criar(-3, 2))).toBe(true);
  });

  it('continua lendo as formas de sempre', () => {
    expect(Fracao.analisar('3/4')?.igualA(Fracao.criar(3, 4))).toBe(true);
    expect(Fracao.analisar('-2/5')?.igualA(Fracao.criar(-2, 5))).toBe(true);
    expect(Fracao.analisar('7')?.igualA(Fracao.deInteiro(7))).toBe(true);
    expect(Fracao.analisar('0,5')?.igualA(Fracao.criar(1, 2))).toBe(true);
  });

  it('recusa um misto malformado', () => {
    expect(Fracao.analisar('2 1/0')).toBeNull();
    expect(Fracao.analisar('2 1/')).toBeNull();
    expect(Fracao.analisar('1 2 1/2')).toBeNull();
  });

  it('espaço solto não vira parte inteira', () => {
    // "2 /3" é dois terços digitado com folga, não um misto: só conta como
    // parte inteira o número que vem antes de uma fração completa.
    expect(Fracao.analisar('2 /3')?.igualA(Fracao.criar(2, 3))).toBe(true);
    expect(Fracao.analisar(' 3 / 4 ')?.igualA(Fracao.criar(3, 4))).toBe(true);
  });

  it('separa a parte inteira do que sobra', () => {
    expect(Fracao.criar(7, 3).paraMista()).toEqual({ inteiro: 2, numerador: 1, denominador: 3 });
    expect(Fracao.criar(-7, 3).paraMista()).toEqual({ inteiro: -2, numerador: 1, denominador: 3 });
    expect(Fracao.criar(3, 4).paraMista()).toEqual({ inteiro: 0, numerador: 3, denominador: 4 });
    expect(Fracao.criar(6, 3).paraMista()).toEqual({ inteiro: 2, numerador: 0, denominador: 1 });
  });

  it('escreve o misto em texto e em LaTeX', () => {
    expect(Fracao.criar(7, 3).toStringMisto()).toBe('2 1/3');
    expect(Fracao.criar(-7, 3).toStringMisto()).toBe('-2 1/3');
    expect(Fracao.criar(3, 4).toStringMisto()).toBe('3/4');
    expect(Fracao.criar(6, 3).toStringMisto()).toBe('2');

    expect(Fracao.criar(7, 3).paraTexMisto()).toBe('2\\frac{1}{3}');
    expect(Fracao.criar(-7, 3).paraTexMisto()).toBe('-2\\frac{1}{3}');
    expect(Fracao.criar(3, 4).paraTexMisto()).toBe('\\frac{3}{4}');
  });

  it('a forma mista é lida de volta no mesmo valor', () => {
    for (const [n, d] of [[7, 3], [-7, 3], [43, 4], [-11, 4], [3, 4], [5, 1]]) {
      const original = Fracao.criar(n!, d!);
      const relido = Fracao.analisar(original.toStringMisto());

      expect(relido, `${original.toStringMisto()} não voltou`).not.toBeNull();
      expect(relido!.igualA(original)).toBe(true);
    }
  });
});
