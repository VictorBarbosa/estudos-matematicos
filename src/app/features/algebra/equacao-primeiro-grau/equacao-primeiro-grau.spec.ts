import { Fracao } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEquacao1 } from '@features/algebra/equacao-primeiro-grau/equacao-primeiro-grau.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2718);
  return Array.from({ length: quantidade }, () => geradorEquacao1.gerar(nivel, rng));
}

describe('geradorEquacao1', () => {
  it('diz no campo que decimal só vale quando é exato', () => {
    // «um número ou fração» convidava a responder 0,83 para 5/6 — e aí a
    // resposta certa era recusada sem que nada tivesse avisado.
    expect(geradorEquacao1.formatoResposta).toContain('inteiro ou fração');
    expect(geradorEquacao1.formatoResposta).toContain('decimal só se for exato');
  });

  it('pede o valor exato no enunciado', () => {
    const [exercicio] = amostra('facil', 1);
    expect(exercicio!.enunciado).toBe('Resolva a equação e informe o valor exato de x.');
  });

  it('aceita o decimal quando ele é exato, e recusa o arredondado', () => {
    const exercicio = {
      ...amostra('facil', 1)[0]!,
      gabarito: Fracao.criar(3, 4),
      armadilhas: [],
    };

    for (const certa of ['3/4', '0,75', '0.75', '6/8']) {
      expect(corrigir(geradorEquacao1, exercicio, certa).veredito).toBe('correto');
    }

    // 5/6 não tem decimal exato: nenhum arredondamento passa, e é por isso
    // que o campo precisa dizer que a fração é o caminho.
    const dizima = { ...exercicio, gabarito: Fracao.criar(5, 6) };
    expect(corrigir(geradorEquacao1, dizima, '5/6').veredito).toBe('correto');
    for (const errada of ['0,83', '0,8333', '0,833333333']) {
      expect(corrigir(geradorEquacao1, dizima, errada).veredito).toBe('incorreto');
    }
  });

  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, a raiz satisfaz a equação gerada`, () => {
      for (const exercicio of amostra(nivel)) {
        const [, aTexto, sinal, bTexto, cTexto] = /^(-?\d*)x ([+-]) (\d+) = (-?\d+)$/.exec(
          exercicio.enunciadoTex,
        )!;

        const a = aTexto === '' ? 1 : aTexto === '-' ? -1 : Number(aTexto);
        const b = sinal === '+' ? Number(bTexto) : -Number(bTexto);
        const c = Number(cTexto);

        // a·x + b deve dar exatamente c.
        const verificacao = exercicio.gabarito
          .multiplicar(Fracao.deInteiro(a))
          .somar(Fracao.deInteiro(b));

        expect(verificacao.igualA(Fracao.deInteiro(c))).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta.igualA(exercicio.gabarito)).toBe(false);
        }
      }
    });
  }

  it('no nível fácil a raiz é sempre inteira e positiva', () => {
    for (const exercicio of amostra('facil')) {
      expect(exercicio.gabarito.ehInteira).toBe(true);
      expect(exercicio.gabarito.ehNegativa).toBe(false);
    }
  });

  it('no nível difícil aparecem raízes fracionárias', () => {
    const fracionarias = amostra('dificil').filter((e) => !e.gabarito.ehInteira);
    expect(fracionarias.length).toBeGreaterThan(0);
  });

  it('aceita a resposta escrita como fração equivalente', () => {
    const exercicio = amostra('facil', 1)[0]!;
    const equivalente = Fracao.criar(
      exercicio.gabarito.numerador * 2,
      exercicio.gabarito.denominador * 2,
    );

    expect(corrigir(geradorEquacao1, exercicio, equivalente.toString()).veredito).toBe('correto');
  });

  it('diagnostica o erro de somar em vez de subtrair', () => {
    const exercicio = amostra('medio', 40).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('somou')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('somou'))!;
    const resultado = corrigir(geradorEquacao1, exercicio, armadilha.resposta.toString());

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('equacao1.igualdade');
  });
});
