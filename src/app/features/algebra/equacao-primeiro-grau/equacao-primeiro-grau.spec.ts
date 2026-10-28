import { Fracao } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorEquacao1 } from './equacao-primeiro-grau.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2718);
  return Array.from({ length: quantidade }, () => geradorEquacao1.gerar(nivel, rng));
}

describe('geradorEquacao1', () => {
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
