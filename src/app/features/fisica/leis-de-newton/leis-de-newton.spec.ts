import { GRAVIDADE_PADRAO, planoInclinadoComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorNewton } from '@features/fisica/leis-de-newton/leis-de-newton.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1687);
  return Array.from({ length: quantidade }, () => geradorNewton.gerar(nivel, rng));
}

describe('geradorNewton', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorNewton.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(false);
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

  it('a resultante subtrai o atrito da força aplicada', () => {
    // A pergunta pela resultante, não o enunciado que a fornece como dado.
    const exercicios = amostra('facil', 90).filter((e) =>
      e.enunciado.includes('Qual é a força resultante'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, forca, atrito] =
        /F = (\d+)\\,\\text\{N\} \\qquad f = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBe(Number(forca) - Number(atrito));
      expect(exercicio.gabarito).toBeGreaterThan(0);
    }
  });

  it('a aceleração é a resultante dividida pela massa', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('age sobre um corpo'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, forca, massa] =
        /F_R = (\d+)\\,\\text\{N\} \\qquad m = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeCloseTo(Number(forca) / Number(massa), 9);
    }
  });

  it('a normal no plano é mg·cos(θ), menor que o peso quando inclinado', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('força normal'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, massa, angulo] =
        /m = (\d+)\\,\\text\{kg\} \\qquad \\theta = (\d+)/.exec(exercicio.enunciadoTex)!;

      const peso = Number(massa) * GRAVIDADE_PADRAO;
      const esperado = peso * Math.cos((Number(angulo) * Math.PI) / 180);

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);
      expect(exercicio.gabarito).toBeLessThanOrEqual(peso + 1e-9);
    }
  });

  it('a aceleração no plano não depende da massa', () => {
    const exercicios = amostra('dificil', 180).filter((e) => e.enunciado.includes('desliza num plano'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, massa, angulo, mu] =
        /m = (\d+) \\qquad \\theta = (\d+)\^\\circ \\qquad \\mu = ([\d{},]+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const coeficiente = Number(mu.replace('{,}', '.'));

      // Mesma configuração com massa diferente: aceleração idêntica.
      const comOutraMassa = planoInclinadoComPassos(
        Number(massa) * 7,
        Number(angulo),
        coeficiente,
      ).resultado.aceleracao;

      expect(exercicio.gabarito).toBeCloseTo(comOutraMassa, 8);
      expect(exercicio.gabarito).toBeLessThanOrEqual(GRAVIDADE_PADRAO + 1e-9);
    }
  });

  it('o ângulo crítico satisfaz tan(θ) = μ', () => {
    const exercicios = amostra('dificil', 180).filter((e) =>
      e.enunciado.includes('começa a deslizar'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const mu = Number(/\\mu = ([\d{},]+)/.exec(exercicio.enunciadoTex)![1].replace('{,}', '.'));

      expect(Math.tan((exercicio.gabarito * Math.PI) / 180)).toBeCloseTo(mu, 6);
    }
  });

  it('diagnostica quem soma o atrito à força aplicada', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('age CONTRA o movimento')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('age CONTRA o movimento'),
    )!;

    const resultado = corrigir(geradorNewton, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('newton.leis');
  });

  it('diagnostica quem iguala a normal ao peso num plano inclinado', () => {
    const exercicio = amostra('medio', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('plano HORIZONTAL')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('plano HORIZONTAL'),
    )!;

    const resultado = corrigir(geradorNewton, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('newton.plano');
  });

  it('aceita graus e decimais', () => {
    expect(geradorNewton.analisar('21,8°')).toBeCloseTo(21.8, 9);
    expect(geradorNewton.analisar('3,5')).toBe(3.5);
    expect(geradorNewton.analisar('forte')).toBeNull();
  });
});
