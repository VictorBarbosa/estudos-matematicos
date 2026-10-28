import { colisaoComPassos, energiaCinetica, momentoLinear } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorMomento } from './impulso-e-momento.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(8628);
  return Array.from({ length: quantidade }, () => geradorMomento.gerar(nivel, rng));
}

describe('geradorMomento', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorMomento.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(false);
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

  it('o momento linear é mv', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('momento linear'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, massa, velocidade] =
        /m = (\d+)\\,\\text\{kg\} \\qquad v = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBe(momentoLinear(Number(massa), Number(velocidade)));
    }
  });

  it('o impulso é força vezes tempo', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('Qual é o impulso'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, forca, tempo] =
        /F = (\d+)\\,\\text\{N\} \\qquad \\Delta t = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBe(Number(forca) * Number(tempo));
    }
  });

  it('a força média cresce quando o tempo de parada diminui', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('força média'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, massa, velocidade, tempo] =
        /m = (\d+)\\,\\text\{kg\} \\qquad v = (\d+)\\,\\text\{m\/s\} \\qquad \\Delta t = ([\d{},]+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const deltaT = Number(tempo.replace('{,}', '.'));
      const esperado = (Number(massa) * Number(velocidade)) / deltaT;

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);
      // Dobrar o tempo corta a força pela metade.
      expect((Number(massa) * Number(velocidade)) / (2 * deltaT)).toBeCloseTo(esperado / 2, 6);
    }
  });

  it('a colisão inelástica conserva o momento', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('seguem juntos'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, mA, vA, mB, vB] =
        /m_A = (\d+) \\quad v_A = (-?\d+) \\quad m_B = (\d+) \\quad v_B = (-?\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      if (exercicio.enunciado.includes('Quanta energia')) {
        continue;
      }

      const momentoAntes = Number(mA) * Number(vA) + Number(mB) * Number(vB);
      const momentoDepois = (Number(mA) + Number(mB)) * exercicio.gabarito;

      expect(momentoDepois).toBeCloseTo(momentoAntes, 6);
    }
  });

  it('a energia perdida na inelástica é positiva e menor que a inicial', () => {
    const exercicios = amostra('dificil', 180).filter((e) => e.enunciado.includes('Quanta energia'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, mA, vA, mB] =
        /m_A = (\d+) \\quad v_A = (\d+) \\quad m_B = (\d+)/.exec(exercicio.enunciadoTex)!;

      const inicial = energiaCinetica(Number(mA), Number(vA));
      const { resultado } = colisaoComPassos(
        Number(mA),
        Number(vA),
        Number(mB),
        0,
        'perfeitamente-inelastica',
      );

      expect(exercicio.gabarito).toBeCloseTo(resultado.energiaAntes - resultado.energiaDepois, 6);
      expect(exercicio.gabarito).toBeGreaterThan(0);
      expect(exercicio.gabarito).toBeLessThan(inicial);
    }
  });

  it('diagnostica quem confunde momento com energia cinética', () => {
    const exercicio = amostra('facil', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('ENERGIA CINÉTICA')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('ENERGIA CINÉTICA'),
    )!;

    const resultado = corrigir(geradorMomento, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('momento.impulso');
  });

  it('diagnostica quem usa a média simples das velocidades na colisão', () => {
    const exercicio = amostra('medio', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('ponderada pelas massas')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('ponderada pelas massas'),
    )!;

    const resultado = corrigir(geradorMomento, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('momento.colisoes');
  });

  it('aceita negativos, para momento em sentido oposto', () => {
    expect(geradorMomento.analisar('-30')).toBe(-30);
    expect(geradorMomento.analisar('5250,00')).toBeCloseTo(5250, 9);
    expect(geradorMomento.analisar('bate')).toBeNull();
  });
});
