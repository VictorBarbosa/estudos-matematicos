import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorSolucoes } from '@features/quimica/solucoes-e-concentracao/solucoes-e-concentracao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(727);
  return Array.from({ length: quantidade }, () => geradorSolucoes.gerar(nivel, rng));
}

describe('geradorSolucoes', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e positivo`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);
        expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorSolucoes.saoEquivalentes!(armadilha.resposta, exercicio.gabarito),
            `${exercicio.enunciado} → ${armadilha.resposta}`,
          ).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito exibido é aceito de volta`, () => {
      for (const exercicio of amostra(nivel, 30)) {
        const escrito = geradorSolucoes.formatar(exercicio.gabarito);
        expect(corrigir(geradorSolucoes, exercicio, escrito).veredito, escrito).toBe('correto');
      }
    });
  }

  /**
   * O volume vem sempre em mililitros — e isso é a metade do tópico.
   *
   * Dar o volume já em litros pouparia o aluno do erro de fator mil que ele
   * precisa aprender a não cometer, e por isso há guarda.
   */
  it('o volume do enunciado está em mililitros', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      expect(exercicio.enunciado, exercicio.enunciado).toContain('mL');
      expect(exercicio.enunciado, exercicio.enunciado).not.toMatch(/\d L\b/);
    }
  });

  /** Concentrações de bancada: nem traço, nem solução impossível. */
  it('as concentrações ficam numa faixa plausível', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      if (!exercicio.id.startsWith('sol-massa')) {
        expect(exercicio.gabarito, exercicio.enunciado).toBeLessThan(500);
      }
    }
  });

  /** Diluir baixa a concentração: nunca o contrário. */
  it('a diluição sempre reduz a concentração de partida', () => {
    const diluicoes = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('sol-dil')),
    );

    expect(diluicoes.length).toBeGreaterThan(20);

    for (const exercicio of diluicoes) {
      const [, inicial] = /a ([\d,]+) mol\/L/.exec(exercicio.enunciado)!;

      expect(exercicio.gabarito, exercicio.enunciado).toBeLessThan(
        Number(inicial!.replace(',', '.')),
      );
    }
  });

  /**
   * A mistura tem de ficar ENTRE as duas concentrações de partida, e os
   * volumes têm de ser diferentes — sem isso a média simples acertaria e a
   * armadilha central do tópico não existiria.
   */
  it('a mistura fica entre as duas concentrações, com volumes diferentes', () => {
    const misturas = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('sol-mist')),
    );

    expect(misturas.length).toBeGreaterThan(20);

    for (const exercicio of misturas) {
      const concentracoes = [...exercicio.enunciado.matchAll(/([\d,]+) mol\/L/g)].map((m) =>
        Number(m[1]!.replace(',', '.')),
      );
      const volumes = [...exercicio.enunciado.matchAll(/([\d,]+) mL/g)].map((m) =>
        Number(m[1]!.replace(',', '.')),
      );

      expect(volumes[0], exercicio.enunciado).not.toBe(volumes[1]);
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(Math.min(...concentracoes));
      expect(exercicio.gabarito, exercicio.enunciado).toBeLessThan(Math.max(...concentracoes));
    }
  });

  it('diagnostica o volume deixado em mililitros', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('mililitros')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('mililitros'))!;
    const resultado = corrigir(
      geradorSolucoes,
      exercicio,
      armadilha.resposta.toFixed(2).replace('.', ','),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('1000');
  });

  it('diagnostica a média simples na mistura', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('média SIMPLES')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('média SIMPLES'))!;
    const resultado = corrigir(
      geradorSolucoes,
      exercicio,
      armadilha.resposta.toFixed(2).replace('.', ','),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('volumes');
  });

  it('o enunciado vem nas três línguas, com dica', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      expect(exercicio.traducoes?.fr?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.en?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.fr?.dica, exercicio.enunciado).toBeTruthy();
      expect(exercicio.dica, exercicio.enunciado).toBeTruthy();
    }
  });

  it('as quatro perguntas aparecem', () => {
    const tipos = new Set(
      NIVEIS.flatMap((nivel) => amostra(nivel, 60)).map((e) => e.id.split('-')[1]),
    );

    expect(tipos).toEqual(new Set(['molar', 'massa', 'dil', 'mist']));
  });
});
