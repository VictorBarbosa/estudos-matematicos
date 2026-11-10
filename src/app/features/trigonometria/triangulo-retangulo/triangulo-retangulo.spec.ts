import { paraRadianos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorTriangulo } from '@features/trigonometria/triangulo-retangulo/triangulo-retangulo.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(6060);
  return Array.from({ length: quantidade }, () => geradorTriangulo.gerar(nivel, rng));
}

/** A pergunta de entrada: o cateto pela hipotenusa e um ângulo qualquer. */
const ehCateto = (e: { enunciado: string }): boolean =>
  e.enunciado.startsWith('Num triângulo retângulo com hipotenusa');

describe('geradorTriangulo', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o cateto é menor que a hipotenusa`, () => {
      // A pergunta do ângulo (só no Extremo) não tem hipotenusa no enunciado.
      for (const exercicio of amostra(nivel).filter(ehCateto)) {
        const [, hipotenusa] = /h = (\d+)/.exec(exercicio.enunciadoTex)!;
        expect(exercicio.gabarito).toBeLessThan(Number(hipotenusa));
        expect(exercicio.gabarito).toBeGreaterThan(0);
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

  it('o cateto calculado confere com a trigonometria', () => {
    for (const exercicio of amostra('medio', 80).filter(ehCateto)) {
      const [, hipotenusa, angulo] = /h = (\d+) \\qquad \\theta = (\d+)/.exec(
        exercicio.enunciadoTex,
      )!;

      const radianos = paraRadianos(Number(angulo));
      const oposto = Number(hipotenusa) * Math.sin(radianos);
      const adjacente = Number(hipotenusa) * Math.cos(radianos);

      const bateComAlgum =
        Math.abs(exercicio.gabarito - oposto) < 1e-9 ||
        Math.abs(exercicio.gabarito - adjacente) < 1e-9;

      expect(bateComAlgum).toBe(true);
    }
  });

  it('no nível fácil os ângulos são redondos e agudos', () => {
    // Múltiplos de 5° entre 15° e 75°: amigáveis de situar mentalmente, e em
    // quantidade suficiente para o aluno não reencontrar o mesmo exercício.
    const vistos = new Set<number>();

    for (const exercicio of amostra('facil', 240).filter(ehCateto)) {
      const [, angulo] = /\\theta = (\d+)/.exec(exercicio.enunciadoTex)!;
      const graus = Number(angulo);

      expect(graus % 5).toBe(0);
      expect(graus).toBeGreaterThanOrEqual(15);
      expect(graus).toBeLessThanOrEqual(75);
      vistos.add(graus);
    }

    expect(vistos.size).toBeGreaterThan(8);
  });

  it('tolera arredondamento de duas casas', () => {
    const exercicio = amostra('facil', 20).find(ehCateto)!;
    const arredondado = exercicio.gabarito.toFixed(2).replace('.', ',');

    expect(corrigir(geradorTriangulo, exercicio, arredondado).veredito).toBe('correto');
  });

  it('diagnostica a troca entre seno e cosseno', () => {
    const exercicio = amostra('medio', 40).find((candidato) =>
      candidato.armadilhas.some(
        (a) =>
          a.diagnostico.includes('cateto OPOSTO') || a.diagnostico.includes('cateto ADJACENTE'),
      ),
    )!;

    const armadilha = exercicio.armadilhas[0]!;
    const resultado = corrigir(geradorTriangulo, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('triangulo.razoes');
  });
});

describe('o ângulo pelos catetos (Extremo)', () => {
  it('sai do arco-tangente de oposto sobre adjacente', () => {
    const angulos = amostra('extremo', 120).filter((e) =>
      e.enunciado.includes('Quanto mede esse ângulo'),
    );
    expect(angulos.length).toBeGreaterThan(0);

    for (const exercicio of angulos) {
      const [, op, adj] = /oposto a um ângulo mede (\d+) e o adjacente mede (\d+)/.exec(
        exercicio.enunciado,
      )!;
      expect(exercicio.gabarito).toBeCloseTo(
        (Math.atan(Number(op) / Number(adj)) * 180) / Math.PI,
        9,
      );
    }
  });
});

describe('geradorTriangulo — notáveis e alturas', () => {
  const rng = criarRng(6161);
  const lote = (nivel: Nivel) =>
    Array.from({ length: 300 }, () => geradorTriangulo.gerar(nivel, rng));
  const rad = (g: number) => (g * Math.PI) / 180;

  it('nos notáveis, o lado confere com a proporção e a forma exata com √ é aceita', () => {
    const casos = [...lote('facil'), ...lote('medio')].filter(
      (e) => e.conceitos[0] === 'triangulo.notaveis' && e.id.startsWith('triangulo-notavel'),
    );
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const k = Number(/notavel-(?:30|45)-(\d+)/.exec(e.id)![1]);
      const esperado = e.id.includes('-45-')
        ? e.id.endsWith('c') || /-c-/.test(e.id)
          ? k
          : k * Math.SQRT2
        : /-curto-/.test(e.id)
          ? k
          : k * Math.sqrt(3);
      expect(e.gabarito).toBeCloseTo(esperado, 9);
      const exata = Number.isInteger(e.gabarito)
        ? String(e.gabarito)
        : e.id.includes('-45-')
          ? `${k}√2`
          : `${k}√3`;
      expect(corrigir(geradorTriangulo, e, exata).veredito).toBe('correto');
    }
  });

  it('a altura pela tangente confere, inclusive com a altura dos olhos', () => {
    const casos = [...lote('medio'), ...lote('dificil')].filter((e) =>
      e.id.startsWith('triangulo-altura'),
    );
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [, ang, dist, olho] = /altura-(\d+)-(\d+)-([\d.]+)/.exec(e.id)!;
      expect(e.gabarito).toBeCloseTo(Number(dist) * Math.tan(rad(Number(ang))) + Number(olho), 9);
    }
  });

  it('nas duas visadas, a altura satisfaz as duas equações', () => {
    const casos = lote('extremo').filter((e) => e.id.startsWith('triangulo-duas'));
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [, a, b, d] = /duas-(\d+)-(\d+)-(\d+)/.exec(e.id)!;
      const x = e.gabarito / Math.tan(rad(Number(b)));
      expect(e.gabarito).toBeCloseTo((x + Number(d)) * Math.tan(rad(Number(a))), 6);
    }
  });
});
