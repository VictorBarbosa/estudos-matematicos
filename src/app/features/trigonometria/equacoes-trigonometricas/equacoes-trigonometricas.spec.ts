import { inversaEmGraus, naPrimeiraVolta, solucoesNaVolta } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEquacoesTrig } from '@features/trigonometria/equacoes-trigonometricas/equacoes-trigonometricas.gerador';

function amostra(nivel: Nivel, quantidade = 120) {
  const rng = criarRng(5151);
  return Array.from({ length: quantidade }, () => geradorEquacoesTrig.gerar(nivel, rng));
}

const radianos = (graus: number): number => (graus * Math.PI) / 180;

describe('equações trigonométricas — núcleo', () => {
  it('as inversas devolvem ângulos dentro da imagem restrita', () => {
    expect(inversaEmGraus('sen', -0.5)).toBe(-30);
    expect(inversaEmGraus('cos', -0.5)).toBe(120);
    expect(inversaEmGraus('tg', -1)).toBe(-45);
    expect(inversaEmGraus('sen', 1.2)).toBeNull();
  });

  it('as soluções na volta satisfazem a equação e não se repetem', () => {
    for (const razao of ['sen', 'cos', 'tg'] as const) {
      for (let k = -30; k <= 30; k++) {
        const valor = k / 10;
        const f = razao === 'sen' ? Math.sin : razao === 'cos' ? Math.cos : Math.tan;
        const solucoes = solucoesNaVolta(razao, valor);

        if (razao !== 'tg' && Math.abs(valor) > 1) {
          expect(solucoes).toEqual([]);
          continue;
        }

        expect(new Set(solucoes).size).toBe(solucoes.length);
        expect(solucoes.length).toBe(razao !== 'tg' && Math.abs(valor) === 1 ? 1 : 2);
        for (const s of solucoes) {
          expect(s).toBeGreaterThanOrEqual(0);
          expect(s).toBeLessThan(360);
          expect(f(radianos(s))).toBeCloseTo(valor, 6);
        }
      }
    }
  });

  it('reduz ângulos à primeira volta', () => {
    expect(naPrimeiraVolta(-30)).toBe(330);
    expect(naPrimeiraVolta(720)).toBe(0);
  });
});

describe('geradorEquacoesTrig', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como resposta`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
        const resposta = geradorEquacoesTrig.formatar(exercicio.gabarito);
        expect(corrigir(geradorEquacoesTrig, exercicio, resposta).veredito).toBe('correto');
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorEquacoesTrig.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
        }
      }
    });

    it(`no nível ${nivel}, há mais de um tipo de pergunta`, () => {
      const tipos = new Set(amostra(nivel).map((e) => e.id.split('-')[1]));
      expect(tipos.size).toBeGreaterThan(1);
    });
  }

  it('o Extremo traz a equação do 2º grau, que o Difícil não tem', () => {
    const extremo = new Set(amostra('extremo').map((e) => e.id.split('-')[1]));
    const dificil = new Set(amostra('dificil').map((e) => e.id.split('-')[1]));
    expect(extremo.has('quadratica')).toBe(true);
    expect(dificil.has('quadratica')).toBe(false);
  });

  it('a soma das soluções da básica confere com a equação', () => {
    const somas = amostra('facil', 300).filter(
      (e) => e.id.startsWith('eqtrig-basica') && e.enunciado.includes('soma'),
    );
    expect(somas.length).toBeGreaterThan(0);

    for (const exercicio of somas) {
      const razao = exercicio.enunciadoTex!.startsWith('\\sin')
        ? 'sen'
        : exercicio.enunciadoTex!.startsWith('\\cos')
          ? 'cos'
          : 'tg';
      // O próprio passo final lista as parcelas da soma.
      const parcelas = exercicio.resolucao.passos.at(-1)!.tex.split('=')[0]!.split('+');
      const f = razao === 'sen' ? Math.sin : razao === 'cos' ? Math.cos : Math.tan;
      const valores = parcelas.map((p) => Number(p.replace('°', '').replace('{,}', '.').trim()));
      const primeiro = f(radianos(valores[0]!));
      for (const v of valores) {
        expect(f(radianos(v))).toBeCloseTo(primeiro, 6);
      }
    }
  });

  it('na equação do 2º grau, cada solução zera o polinômio em sen x ou cos x', () => {
    const quadraticas = amostra('extremo', 300).filter((e) => e.id.startsWith('eqtrig-quadratica'));
    expect(quadraticas.length).toBeGreaterThan(0);

    for (const exercicio of quadraticas) {
      const lista = exercicio.resolucao.passos.at(-2)!.tex;
      const angulos = [...lista.matchAll(/(\d+(?:\{,\}\d+)?)°/g)].map((m) =>
        Number(m[1]!.replace('{,}', '.')),
      );
      const ehSeno = exercicio.enunciadoTex!.includes('\\sin');
      const [, a, b, c] =
        /quadratica-(?:sen|cos)-(-?\d+)_(-?\d+)_(-?\d+)-/.exec(exercicio.id) ?? [];
      expect(a, exercicio.id).toBeDefined();

      for (const graus of angulos) {
        const s = ehSeno ? Math.sin(radianos(graus)) : Math.cos(radianos(graus));
        expect(Number(a) * s * s + Number(b) * s + Number(c!)).toBeCloseTo(0, 6);
      }
    }
  });

  it('diagnostica quem esquece a segunda solução', () => {
    const exercicio = amostra('facil', 300).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('Faltou a segunda solução')),
    )!;
    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('Faltou a segunda solução'),
    )!;
    const resultado = corrigir(geradorEquacoesTrig, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
  });
});
