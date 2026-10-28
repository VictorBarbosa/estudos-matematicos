import { Fracao, comporComPassos, inverterComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorComposicao } from './composicao-inversa.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(8181);
  return Array.from({ length: quantidade }, () => geradorComposicao.gerar(nivel, rng));
}

describe('geradorComposicao', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta.igualA(exercicio.gabarito)).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, todo exercício mostra as funções envolvidas`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.enunciadoTex).toContain('f(x)');
      }
    });
  }

  it('diagnostica a composição na ordem contrária', () => {
    const exercicio = amostra('medio', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('ordem contrária')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('ordem contrária'),
    )!;

    const resultado = corrigir(geradorComposicao, exercicio, armadilha.resposta.toString());
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('composicao.encadear');
  });

  it('diagnostica quem confunde inversa com inverso multiplicativo', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('NÃO significa 1/f')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('composicao.inversa');
  });
});

describe('core de composição', () => {
  it('compor f com g dá resultado diferente de g com f', () => {
    const f = { a: 2, b: 0 };
    const g = { a: 1, b: 3 };

    expect(comporComPassos(f, g).resultado).toEqual({ a: 2, b: 6 });
    expect(comporComPassos(g, f).resultado).toEqual({ a: 2, b: 3 });
  });

  it('a inversa desfaz a função', () => {
    const f = { a: 3, b: -6 };
    const inversa = inverterComPassos(f).resultado;

    for (const x of [-2, 0, 1, 5]) {
      const ida = f.a * x + f.b;
      const volta = inversa.a * ida + inversa.b;
      expect(volta).toBeCloseTo(x, 9);
    }
  });

  it('a inversa de uma função constante não existe', () => {
    expect(() => inverterComPassos({ a: 0, b: 3 })).toThrow();
  });

  it('a inversa avaliada confere com a fração do gerador', () => {
    const exercicio = amostra('facil', 90).find((e) => e.enunciado.includes('inversa'))!;
    expect(exercicio.gabarito).toBeInstanceOf(Fracao);
  });
});
