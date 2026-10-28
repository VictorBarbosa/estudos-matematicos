import { movimentoUniformementeVariado } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorCinematica } from './cinematica-escalar.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(3030);
  return Array.from({ length: quantidade }, () => geradorCinematica.gerar(nivel, rng));
}

describe('geradorCinematica', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorCinematica.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
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

  it('a velocidade confere com v = v₀ + at', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('sua velocidade'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, v0, a, t] =
        /v_0 = (\d+)\\,\\text\{m\/s\} \\qquad a = (\d+)\\,\\text\{m\/s\}\^\{2\} \\qquad t = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      expect(exercicio.gabarito).toBeCloseTo(Number(v0) + Number(a) * Number(t), 9);
    }
  });

  it('o deslocamento confere com a área sob a velocidade', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('se desloca'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, v0, a, t] =
        /v_0 = (\d+)\\,\\text\{m\/s\} \\qquad a = (\d+)\\,\\text\{m\/s\}\^\{2\} \\qquad t = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const esperado = movimentoUniformementeVariado(0, Number(v0), Number(a), Number(t)).posicao;
      expect(exercicio.gabarito).toBeCloseTo(esperado, 9);
    }
  });

  it('Torricelli confere com o cálculo por tempo', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('após percorrer'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, v0, a, deslocamento] =
        /v_0 = (\d+) \\qquad a = (\d+) \\qquad \\Delta s = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito ** 2).toBeCloseTo(
        Number(v0) ** 2 + 2 * Number(a) * Number(deslocamento),
        6,
      );
      expect(exercicio.gabarito).toBeGreaterThanOrEqual(Number(v0));
    }
  });

  it('o tempo de parada é v₀ sobre a desaceleração', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('tempo ele para'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, v0, a] =
        /v_0 = (\d+)\\,\\text\{m\/s\} \\qquad a = -(\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeCloseTo(Number(v0) / Number(a), 9);
      expect(exercicio.gabarito).toBeGreaterThan(0);
    }
  });

  it('a distância de frenagem cresce com o quadrado da velocidade', () => {
    const exercicios = amostra('dificil', 180).filter((e) =>
      e.enunciado.includes('distância ele percorre'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, v0, a] =
        /v_0 = (\d+)\\,\\text\{m\/s\} \\qquad a = -(\d+)/.exec(exercicio.enunciadoTex)!;

      const esperado = Number(v0) ** 2 / (2 * Number(a));
      expect(exercicio.gabarito).toBeCloseTo(esperado, 9);

      // Dobrar a velocidade quadruplicaria a distância.
      const dobrada = (2 * Number(v0)) ** 2 / (2 * Number(a));
      expect(dobrada / esperado).toBeCloseTo(4, 9);
    }
  });

  it('diagnostica quem confunde posição com velocidade', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('Essa é a POSIÇÃO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('Essa é a POSIÇÃO'),
    )!;

    const resultado = corrigir(geradorCinematica, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('cinematica.equacoes');
  });

  it('diagnostica quem ignora a aceleração no deslocamento', () => {
    const exercicio = amostra('facil', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('como se o movimento fosse uniforme')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('como se o movimento fosse uniforme'),
    )!;

    const resultado = corrigir(geradorCinematica, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('cinematica.graficos');
  });

  it('aceita decimal com vírgula', () => {
    expect(geradorCinematica.analisar('13,33')).toBeCloseTo(13.33, 9);
    expect(geradorCinematica.analisar('26')).toBe(26);
    expect(geradorCinematica.analisar('rápido')).toBeNull();
  });
});
