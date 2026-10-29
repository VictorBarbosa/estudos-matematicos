import { areaComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorCirculo } from '@features/geometria/circulo-e-poligonos/circulo-e-poligonos.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(3141);
  return Array.from({ length: quantidade }, () => geradorCirculo.gerar(nivel, rng));
}

describe('geradorCirculo (círculo e polígonos)', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorCirculo.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito é positivo e documentado`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThan(0);
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(1);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
      }
    });
  }

  it('o comprimento é 2πr', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('comprimento'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const raio = Number(/r = (\d+)/.exec(exercicio.enunciadoTex)![1]);
      expect(exercicio.gabarito).toBeCloseTo(2 * Math.PI * raio, 9);
    }
  });

  it('a área do círculo é πr²', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('área de um círculo'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const raio = Number(/r = (\d+)/.exec(exercicio.enunciadoTex)![1]);
      expect(exercicio.gabarito).toBeCloseTo(Math.PI * raio * raio, 9);
    }
  });

  it('o raio pedido reconstrói a área dada', () => {
    const exercicios = amostra('dificil', 150).filter((e) => e.enunciado.includes('Qual é o seu raio'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const area = Number(/A = ([\d.]+)/.exec(exercicio.enunciadoTex)![1]);
      expect(Math.PI * exercicio.gabarito ** 2).toBeCloseTo(area, 1);
      expect(Number.isInteger(exercicio.gabarito)).toBe(true);
    }
  });

  it('o setor é a fração do círculo correspondente ao ângulo', () => {
    const exercicios = amostra('medio', 120).filter((e) => e.enunciado.includes('setor circular'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, raio, angulo] =
        /r = (\d+) \\qquad \\theta = (\d+)/.exec(exercicio.enunciadoTex)!;

      const total = Math.PI * Number(raio) ** 2;
      expect(exercicio.gabarito).toBeCloseTo((total * Number(angulo)) / 360, 9);
      expect(exercicio.gabarito).toBeLessThanOrEqual(total + 1e-9);
    }
  });

  it('a área do polígono regular bate com perímetro × apótema / 2', () => {
    const exercicios = amostra('dificil', 150).filter((e) => e.enunciado.includes('polígono regular'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, lados, lado, apotema] =
        /n = (\d+) \\qquad \\ell = (\d+) \\qquad a = ([\d.]+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeCloseTo(
        areaComPassos('poligono-regular', {
          lados: Number(lados),
          base: Number(lado),
          apotema: Number(apotema),
        }).resultado,
        1,
      );
    }
  });

  it('o polígono inscrito tem área menor que o círculo de mesmo raio', () => {
    for (const exercicio of amostra('dificil', 150).filter((e) =>
      e.enunciado.includes('polígono regular'),
    )) {
      const [, lados, lado] = /n = (\d+) \\qquad \\ell = (\d+)/.exec(exercicio.enunciadoTex)!;

      // Raio do círculo circunscrito ao polígono.
      const raio = Number(lado) / (2 * Math.sin(Math.PI / Number(lados)));
      expect(exercicio.gabarito).toBeLessThan(Math.PI * raio * raio);
    }
  });

  it('diagnostica quem troca área por comprimento', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('unidades quadradas')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('unidades quadradas'),
    )!;

    const resultado = corrigir(geradorCirculo, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('circulo.area');
  });

  it('diagnostica quem esquece o 2 no comprimento', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('Faltou o 2')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('Faltou o 2'))!;
    const resultado = corrigir(geradorCirculo, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('circulo.pi');
  });

  it('aceita duas casas decimais com vírgula', () => {
    expect(geradorCirculo.analisar('18,85')).toBeCloseTo(18.85, 9);
    expect(geradorCirculo.analisar('28.27')).toBeCloseTo(28.27, 9);
    expect(geradorCirculo.analisar('pi')).toBeCloseTo(Math.PI, 9);
    expect(geradorCirculo.analisar('2pi')).toBeCloseTo(2 * Math.PI, 9);
    expect(geradorCirculo.analisar('circunferência')).toBeNull();
  });
});
