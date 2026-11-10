import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorCircunferencia } from '@features/geometria-analitica/circunferencia/circunferencia.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2626);
  return Array.from({ length: quantidade }, () => geradorCircunferencia.gerar(nivel, rng));
}

describe('geradorCircunferencia', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é inteiro (fora a tangente, que pode ser fração)`, () => {
      for (const exercicio of amostra(nivel).filter(
        (e) => !e.conceitos.includes('circunferencia.tangente'),
      )) {
        expect(Number.isInteger(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.02);
        }
      }
    });
  }

  it('o raio pedido é sempre positivo', () => {
    const exercicios = amostra('medio', 90).filter((e) => e.enunciado.includes('raio'));

    for (const exercicio of exercicios) {
      expect(exercicio.gabarito).toBeGreaterThan(0);
    }
  });

  it('no nível fácil a equação vem na forma reduzida', () => {
    for (const exercicio of amostra('facil')) {
      const reduzida = exercicio.enunciadoTex.includes('(x');
      const geral = exercicio.enunciadoTex.startsWith('x^{2} + y^{2}');
      expect(reduzida || geral).toBe(true);
    }
  });

  it('diagnostica quem confunde r com r²', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('RAIZ')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('RAIZ'))!;
    const resultado = corrigir(geradorCircunferencia, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('circunferencia.definicao');
  });

  it('diagnostica quem lê D como a abscissa do centro', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('coeficiente D')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('circunferencia.geral');
  });
});

describe('geradorCircunferencia — tangente e coeficiente', () => {
  const rng = criarRng(9393);
  const lote = (nivel: Nivel) =>
    Array.from({ length: 300 }, () => geradorCircunferencia.gerar(nivel, rng));

  it('a tangente é perpendicular ao raio e passa por P', () => {
    const casos = [...lote('dificil'), ...lote('extremo')].filter((e) =>
      e.conceitos.includes('circunferencia.tangente'),
    );
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [, sa, a, sb, b, r2] =
        /\(x ([+-]) (\d+)\)\^\{2\} \+ \(y ([+-]) (\d+)\)\^\{2\} = (\d+)/.exec(e.enunciadoTex)!;
      const cx = (sa === '-' ? 1 : -1) * Number(a);
      const cy = (sb === '-' ? 1 : -1) * Number(b);
      const [, px, py] = /P\((-?\d+), (-?\d+)\)/.exec(e.enunciado)!.map(Number);
      expect((px! - cx) ** 2 + (py! - cy) ** 2).toBe(Number(r2));
      const m = -(px! - cx) / (py! - cy);
      if (e.enunciado.includes('valor q')) expect(e.gabarito).toBeCloseTo(py! - m * px!, 9);
      else expect(e.gabarito).toBeCloseTo(m, 9);
    }
  });

  it('com coeficiente em x² e y², o raio confere depois de dividir', () => {
    const casos = lote('extremo').filter((e) => e.id.startsWith('circunf-raio-k'));
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [, k, a, b, r] = /raio-k-(\d+)-(-?\d)(-?\d)(\d)-/.exec(e.id)!.map(Number);
      expect(e.enunciadoTex.startsWith(`${k}x^{2}`)).toBe(true);
      expect(e.gabarito).toBe(r);
      expect(Number.isInteger(a) && Number.isInteger(b)).toBe(true);
    }
  });
});
