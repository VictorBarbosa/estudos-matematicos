import { GRAVIDADE_PADRAO, energiaCinetica } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEnergia } from '@features/fisica/trabalho-e-energia/trabalho-e-energia.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(5150);
  return Array.from({ length: quantidade }, () => geradorEnergia.gerar(nivel, rng));
}

describe('geradorEnergia', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorEnergia.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, todo exercício traz resolução e conceitos`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(1);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
        expect(exercicio.resolucao.resultado).toBe(exercicio.gabarito);
      }
    });
  }

  it('o trabalho usa cosseno e zera a 90 graus', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('trabalho realizado'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, forca, deslocamento, angulo] =
        /F = (\d+)\\,\\text\{N\} \\qquad d = (\d+)\\,\\text\{m\} \\qquad \\theta = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const esperado =
        Number(forca) * Number(deslocamento) * Math.cos((Number(angulo) * Math.PI) / 180);

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);

      if (Number(angulo) === 90) {
        expect(Math.abs(exercicio.gabarito)).toBeLessThan(1e-9);
      }
      if (Number(angulo) === 180) {
        expect(exercicio.gabarito).toBeLessThan(0);
      }
    }
  });

  it('a energia cinética é mv²/2', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('energia cinética'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, massa, velocidade] =
        /m = (\d+)\\,\\text\{kg\} \\qquad v = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeCloseTo(
        energiaCinetica(Number(massa), Number(velocidade)),
        9,
      );
    }
  });

  it('a velocidade de queda é √(2gh) e ignora a massa', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('velocidade chega'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const altura = Number(/h = (\d+)/.exec(exercicio.enunciadoTex)![1]);

      expect(exercicio.gabarito).toBeCloseTo(Math.sqrt(2 * GRAVIDADE_PADRAO * altura), 6);
    }
  });

  it('a altura máxima é v²/(2g)', () => {
    const exercicios = amostra('dificil', 180).filter((e) => e.enunciado.includes('altura máxima'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const v0 = Number(/v_0 = (\d+)/.exec(exercicio.enunciadoTex)![1]);

      expect(exercicio.gabarito).toBeCloseTo(v0 ** 2 / (2 * GRAVIDADE_PADRAO), 6);
    }
  });

  it('a potência é trabalho por tempo', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('potência média'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, trabalho, tempo] =
        /W = (\d+)\\,\\text\{J\} \\qquad \\Delta t = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeCloseTo(Number(trabalho) / Number(tempo), 9);
    }
  });

  it('diagnostica quem confunde energia cinética com momento linear', () => {
    const exercicio = amostra('facil', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('MOMENTO LINEAR')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('MOMENTO LINEAR'))!;
    const resultado = corrigir(geradorEnergia, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('energia.conservacao');
  });

  it('diagnostica quem faz a velocidade de queda depender da massa', () => {
    const exercicio = amostra('medio', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('massa se CANCELA')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('massa se CANCELA'),
    )!;

    const resultado = corrigir(geradorEnergia, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('energia.conservacao');
  });

  it('aceita decimal e negativo, para trabalho contra o movimento', () => {
    expect(geradorEnergia.analisar('-200')).toBe(-200);
    expect(geradorEnergia.analisar('19,81')).toBeCloseTo(19.81, 9);
    expect(geradorEnergia.analisar('muita')).toBeNull();
  });
});
