import { Polinomio } from '@core/math/algebra/polinomio';
import { ErroMatematico } from '@core/math/tipos';
import {
  analisarMovimentoComPassos,
  aproximacoesDaTaxa,
  taxaMediaComPassos,
} from './movimento';
import {
  GRAVIDADE,
  alturaEmFuncaoDeX,
  jurosCompostosComPassos,
  posicao,
  resolverLancamentoComPassos,
  resolverOscilacaoComPassos,
} from './cinematica';

const base = { velocidadeInicial: 20, anguloGraus: 45, alturaInicial: 0, gravidade: GRAVIDADE };

describe('lançamento oblíquo', () => {
  it('decompõe a velocidade nas duas componentes', () => {
    const { resultado } = resolverLancamentoComPassos(base);

    expect(resultado.vx).toBeCloseTo(20 * Math.cos(Math.PI / 4), 6);
    expect(resultado.vy).toBeCloseTo(20 * Math.sin(Math.PI / 4), 6);
  });

  it('o alcance é máximo em 45° quando a altura inicial é zero', () => {
    const alcances = [30, 40, 45, 50, 60].map(
      (anguloGraus) => resolverLancamentoComPassos({ ...base, anguloGraus }).resultado.alcance,
    );

    const maior = Math.max(...alcances);
    expect(alcances[2]).toBeCloseTo(maior, 6);
  });

  it('ângulos complementares dão o mesmo alcance', () => {
    const a30 = resolverLancamentoComPassos({ ...base, anguloGraus: 30 }).resultado.alcance;
    const a60 = resolverLancamentoComPassos({ ...base, anguloGraus: 60 }).resultado.alcance;

    expect(a30).toBeCloseTo(a60, 6);
  });

  it('o projétil está no chão no fim do tempo de voo', () => {
    const { resultado } = resolverLancamentoComPassos(base);
    const { y } = posicao(base, resultado.tempoDeVoo);

    expect(y).toBeCloseTo(0, 6);
  });

  it('a altura máxima ocorre na metade do voo, sem altura inicial', () => {
    const { resultado } = resolverLancamentoComPassos(base);
    expect(resultado.tempoNoApice).toBeCloseTo(resultado.tempoDeVoo / 2, 6);
  });

  it('a altura inicial aumenta o tempo de voo', () => {
    const noChao = resolverLancamentoComPassos(base).resultado.tempoDeVoo;
    const elevado = resolverLancamentoComPassos({ ...base, alturaInicial: 20 }).resultado
      .tempoDeVoo;

    expect(elevado).toBeGreaterThan(noChao);
  });

  it('a trajetória em função de x é uma parábola', () => {
    const f = alturaEmFuncaoDeX(base);
    const { resultado } = resolverLancamentoComPassos(base);

    expect(f(0)).toBeCloseTo(0, 6);
    expect(f(resultado.alcance)).toBeCloseTo(0, 4);
    expect(f(resultado.alcance / 2)).toBeCloseTo(resultado.alturaMaxima, 4);
  });

  it('recusa velocidade não positiva', () => {
    expect(() => resolverLancamentoComPassos({ ...base, velocidadeInicial: 0 })).toThrow(
      ErroMatematico,
    );
  });
});

describe('movimento harmônico', () => {
  it('o período depende de k e m, não da amplitude', () => {
    const pequena = resolverOscilacaoComPassos(1, 10, 2).resultado.periodo;
    const grande = resolverOscilacaoComPassos(50, 10, 2).resultado.periodo;

    expect(pequena).toBeCloseTo(grande, 12);
  });

  it('calcula a frequência angular como raiz de k sobre m', () => {
    const { resultado } = resolverOscilacaoComPassos(1, 8, 2);
    expect(resultado.frequenciaAngular).toBeCloseTo(2, 9);
  });

  it('frequência é o inverso do período', () => {
    const { resultado } = resolverOscilacaoComPassos(1, 10, 1);
    expect(resultado.frequencia).toBeCloseTo(1 / resultado.periodo, 12);
  });

  it('recusa massa ou constante não positivas', () => {
    expect(() => resolverOscilacaoComPassos(1, 10, 0)).toThrow(ErroMatematico);
    expect(() => resolverOscilacaoComPassos(1, 0, 2)).toThrow(ErroMatematico);
  });
});

describe('juros compostos', () => {
  it('aplica o fator uma vez por período', () => {
    // 1000 a 10% por 2 períodos = 1210.
    expect(jurosCompostosComPassos(1000, 10, 2).resultado).toBeCloseTo(1210, 9);
  });

  it('rende mais que os juros simples', () => {
    const { resultado } = jurosCompostosComPassos(1000, 10, 10);
    const simples = 1000 * (1 + 0.1 * 10);

    expect(resultado).toBeGreaterThan(simples);
  });

  it('com zero períodos, o montante é o capital', () => {
    expect(jurosCompostosComPassos(500, 7, 0).resultado).toBe(500);
  });
});

describe('taxa de variação', () => {
  // s(t) = t³ - 6t² + 9t → v(t) = 3t² - 12t + 9 → a(t) = 6t - 12
  const s = Polinomio.de(0, 9, -6, 1);

  it('deriva a posição em velocidade e aceleração', () => {
    const { resultado } = analisarMovimentoComPassos(s, 1);

    expect(resultado.v.toString()).toBe(Polinomio.de(9, -12, 3).toString());
    expect(resultado.a.toString()).toBe(Polinomio.de(-12, 6).toString());
  });

  it('avalia as três grandezas no instante pedido', () => {
    const { resultado } = analisarMovimentoComPassos(s, 2);

    expect(resultado.posicao).toBeCloseTo(2, 12);
    expect(resultado.velocidade).toBeCloseTo(-3, 12);
    expect(resultado.aceleracao).toBeCloseTo(0, 12);
  });

  it('reconhece o instante em que o corpo para', () => {
    const { resultado, passos } = analisarMovimentoComPassos(s, 1);

    expect(resultado.velocidade).toBeCloseTo(0, 12);
    expect(passos.at(-1)?.nota).toContain('parado');
  });

  it('a taxa média é a inclinação da secante', () => {
    const { resultado } = taxaMediaComPassos(s, 0, 3);

    // s(0) = 0 e s(3) = 0: o corpo voltou ao ponto de partida.
    expect(resultado).toBeCloseTo(0, 12);
  });

  it('recusa dois instantes iguais', () => {
    expect(() => taxaMediaComPassos(s, 2, 2)).toThrow(ErroMatematico);
  });

  it('a taxa média converge para a instantânea quando o intervalo encolhe', () => {
    const aproximacoes = aproximacoesDaTaxa(s, 4);

    // v(4) = 3·16 - 48 + 9 = 9. O resto é de primeira ordem em delta — para
    // delta = 0,001 ele vale a(4)/2 · delta = 0,006.
    expect(aproximacoes.at(-1)?.taxaMedia).toBeGreaterThan(9);
    expect(aproximacoes.at(-1)?.erro).toBeLessThan(0.01);

    for (let i = 1; i < aproximacoes.length; i++) {
      expect(aproximacoes[i].erro).toBeLessThan(aproximacoes[i - 1].erro);
    }
  });
});
