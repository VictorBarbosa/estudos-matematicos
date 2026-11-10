import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorConicas } from '@features/geometria-analitica/conicas/conicas.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(8383);
  return Array.from({ length: quantidade }, () => geradorConicas.gerar(nivel, rng));
}

describe('geradorConicas', () => {
  it('a dica da excentricidade chega à tela', () => {
    // Presa no Fácil, onde só caem semieixo e distância focal, ela nunca
    // aparecia — o tópico inteiro passava sem dica nenhuma.
    const comDica = amostra('medio', 200).filter((e) => e.enunciado.includes('excentricidade'));

    expect(comDica.length).toBeGreaterThan(0);
    expect(comDica[0]!.dica).toContain('encontre c');
  });

  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito de elipse e hipérbole é positivo e finito`, () => {
      for (const exercicio of amostra(nivel).filter(
        (e) => !e.conceitos.includes('conicas.parabola'),
      )) {
        expect(exercicio.gabarito).toBeGreaterThan(0);
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
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

  it('a excentricidade da elipse fica entre 0 e 1', () => {
    const elipses = amostra('medio', 120).filter(
      (e) => e.enunciado.includes('excentricidade') && e.enunciado.includes('elipse'),
    );

    for (const exercicio of elipses) {
      expect(exercicio.gabarito).toBeGreaterThan(0);
      expect(exercicio.gabarito).toBeLessThan(1);
    }
  });

  it('a excentricidade da hipérbole é maior que 1', () => {
    const hiperboles = amostra('dificil', 120).filter(
      (e) => e.enunciado.includes('excentricidade') && e.enunciado.includes('hipérbole'),
    );

    for (const exercicio of hiperboles) {
      expect(exercicio.gabarito).toBeGreaterThan(1);
    }
  });

  it('no nível fácil só aparecem elipses', () => {
    for (const exercicio of amostra('facil')) {
      expect(exercicio.enunciado).not.toContain('hipérbole');
    }
  });

  it('diagnostica quem troca a relação da elipse pela da hipérbole', () => {
    const exercicio = amostra('medio', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('relação da hipérbole')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('relação da hipérbole'),
    )!;

    const resultado = corrigir(geradorConicas, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
  });
});

describe('geradorConicas — parábola', () => {
  const rng = criarRng(9191);
  const lote = (nivel: Nivel) =>
    Array.from({ length: 200 }, () => geradorConicas.gerar(nivel, rng));

  /** Foco e diretriz por fora: acha p e o vértice a partir de pontos da curva. */
  function focoEDiretriz(tex: string): { foco: number; diretriz: number } {
    // y(x) a partir das quatro formas geradas.
    let y: (x: number) => number;
    let m = /^x\^\{2\} = (-?\d+)y$/.exec(tex);
    if (m) y = (x) => (x * x) / Number(m![1]);
    else if ((m = /^y = \\frac\{x\^\{2\}\}\{(-?\d+)\}$/.exec(tex)))
      y = (x) => (x * x) / Number(m![1]);
    else if (
      (m = /^(?:\(x ([+-]) (\d+)\)\^\{2\}|x\^\{2\}) = (-?\d+)(?:\(y ([+-]) (\d+)\)|y)$/.exec(tex))
    ) {
      const h = m[2] ? (m[1] === '-' ? 1 : -1) * Number(m[2]) : 0;
      const k = m[5] ? (m[4] === '-' ? 1 : -1) * Number(m[5]) : 0;
      const q = Number(m[3]);
      y = (x) => (x - h) ** 2 / q + k;
    } else {
      m = /^y = \\frac\{x\^\{2\}(?: ([+-]) (\d+)x)?(?: ([+-]) (\d+))?\}\{(-?\d+)\}$/.exec(tex)!;
      const b = m[2] ? (m[1] === '-' ? -1 : 1) * Number(m[2]) : 0;
      const c = m[4] ? (m[3] === '-' ? -1 : 1) * Number(m[4]) : 0;
      const q = Number(m[5]);
      y = (x) => (x * x + b * x + c) / q;
    }
    // y = a(x − h)² + k: a pela segunda diferença, vértice pela simetria.
    const a = (y(1) - 2 * y(0) + y(-1)) / 2;
    const h = -(y(1) - y(-1)) / (4 * a);
    const k = y(h);
    const p = 1 / (4 * a);
    return { foco: k + p, diretriz: k - p };
  }

  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, foco e diretriz conferem com a equação`, () => {
      const casos = lote(nivel).filter((e) => e.conceitos.includes('conicas.parabola'));
      expect(casos.length).toBeGreaterThan(0);
      for (const e of casos) {
        const { foco, diretriz } = focoEDiretriz(e.enunciadoTex!);
        const esperado = e.enunciado.includes('diretriz') ? diretriz : foco;
        expect(e.gabarito, e.enunciadoTex).toBeCloseTo(esperado, 9);
        expect(corrigir(geradorConicas, e, String(e.gabarito)).veredito).toBe('correto');
      }
    });
  }
});
