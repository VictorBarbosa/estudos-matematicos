import { combinacoes } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorProbabilidade } from '@features/estatistica/probabilidade/probabilidade.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(4242);
  return Array.from({ length: quantidade }, () => geradorProbabilidade.gerar(nivel, rng));
}

describe('geradorProbabilidade', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorProbabilidade.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
        }
      }
    });

    it(`no nível ${nivel}, todo gabarito é uma probabilidade válida`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThanOrEqual(0);
        expect(exercicio.gabarito).toBeLessThanOrEqual(1);
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(1);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
      }
    });
  }

  it('no dado, a probabilidade é favoráveis sobre possíveis', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('dado honesto'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, total, favoraveis] =
        /n\(\\Omega\) = (\d+) \\qquad n\(A\) = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeCloseTo(Number(favoraveis) / Number(total), 9);
    }
  });

  it('sem reposição dá probabilidade menor que com reposição', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('SEM'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, vermelhas, azuis] =
        /(\d+)\\text\{ vermelhas\} \\qquad (\d+)\\text\{ azuis\}/.exec(exercicio.enunciadoTex)!;

      const total = Number(vermelhas) + Number(azuis);
      const comReposicao = (Number(vermelhas) / total) ** 2;
      const esperado =
        (Number(vermelhas) / total) * ((Number(vermelhas) - 1) / (total - 1));

      expect(exercicio.gabarito).toBeCloseTo(esperado, 9);
      expect(exercicio.gabarito).toBeLessThan(comReposicao);
    }
  });

  it('ao menos um cresce com as tentativas e nunca chega a 1', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('ao menos uma vez'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, faces, tentativas] =
        /p = \\frac\{1\}\{(\d+)\} \\qquad n = (\d+)/.exec(exercicio.enunciadoTex)!;

      const p = 1 / Number(faces);
      expect(exercicio.gabarito).toBeCloseTo(1 - (1 - p) ** Number(tentativas), 9);
      expect(exercicio.gabarito).toBeLessThan(1);
      expect(exercicio.gabarito).toBeGreaterThan(p);
    }
  });

  it('o problema do lote usa combinações', () => {
    const exercicios = amostra('dificil', 180).filter((e) => e.enunciado.includes('lote'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, boas, retiradas, total] =
        /C_\{(\d+),(\d+)\} \/ C_\{(\d+),\d+\}/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeCloseTo(
        combinacoes(Number(boas), Number(retiradas)) /
          combinacoes(Number(total), Number(retiradas)),
        9,
      );
    }
  });

  it('diagnostica quem responde a contagem em vez da probabilidade', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('CONTAGEM dos casos')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('CONTAGEM dos casos'),
    )!;

    const resultado = corrigir(geradorProbabilidade, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('probabilidade.espaco');
  });

  it('diagnostica quem trata retirada sem reposição como independente', () => {
    const exercicio = amostra('medio', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('COM reposição')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('COM reposição'))!;
    const resultado = corrigir(geradorProbabilidade, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('probabilidade.independencia');
  });

  it('diagnostica quem para no complementar', () => {
    const exercicio = amostra('medio', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('NENHUM sucesso')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('NENHUM sucesso'),
    )!;

    const resultado = corrigir(geradorProbabilidade, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('probabilidade.complementar');
  });

  it('aceita decimal, fração e porcentagem', () => {
    expect(geradorProbabilidade.analisar('0,5')).toBe(0.5);
    expect(geradorProbabilidade.analisar('1/6')).toBeCloseTo(1 / 6, 9);
    expect(geradorProbabilidade.analisar('50%')).toBe(0.5);
    expect(geradorProbabilidade.analisar('meio')).toBeNull();
  });
});
