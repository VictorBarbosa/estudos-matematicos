import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorLimitante } from '@features/quimica/limitante-e-rendimento/limitante-e-rendimento.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(515);
  return Array.from({ length: quantidade }, () => geradorLimitante.gerar(nivel, rng));
}

describe('geradorLimitante', () => {
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
            geradorLimitante.saoEquivalentes!(armadilha.resposta, exercicio.gabarito),
            `${exercicio.enunciado} → ${armadilha.resposta}`,
          ).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito exibido é aceito de volta`, () => {
      for (const exercicio of amostra(nivel, 30)) {
        const escrito = geradorLimitante.formatar(exercicio.gabarito);
        expect(corrigir(geradorLimitante, exercicio, escrito).veredito, escrito).toBe('correto');
      }
    });
  }

  /**
   * O sorteio tem de deixar um reagente limitar com folga.
   *
   * Com as duas «receitas» quase iguais, a resposta passaria a depender da
   * terceira casa decimal, e o exercício viraria teste de arredondamento em
   * vez de teste de conceito. A folga mínima sorteada é de 1,5 vez.
   */
  it('um reagente sempre limita com folga', () => {
    const massas = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('lim-prod') || e.id.startsWith('lim-sobra')),
    );

    expect(massas.length).toBeGreaterThan(40);

    for (const exercicio of massas) {
      // A resolução mostra as duas razões; a quarta linha anuncia o limitante.
      const [primeira, segunda] = exercicio.resolucao!.passos.slice(1, 3).map((passo) => {
        const [, valor] = / = ([\d.]+)$/.exec(passo.tex!)!;
        return Number(valor);
      });

      const maior = Math.max(primeira!, segunda!);
      const menor = Math.min(primeira!, segunda!);

      expect(maior / menor, exercicio.enunciado).toBeGreaterThan(1.4);
    }
  });

  /**
   * A sobra é sempre positiva e menor que o que havia.
   *
   * Sobra negativa denunciaria limitante escolhido errado; sobra igual ao
   * disponível denunciaria consumo zero.
   */
  it('a sobra fica entre zero e a massa disponível', () => {
    const sobras = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('lim-sobra')),
    );

    expect(sobras.length).toBeGreaterThan(20);

    for (const exercicio of sobras) {
      const massas = [...exercicio.enunciado.matchAll(/([\d,]+) g/g)].map((m) =>
        Number(m[1]!.replace(',', '.')),
      );

      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(0);
      expect(exercicio.gabarito, exercicio.enunciado).toBeLessThan(Math.max(...massas));
    }
  });

  /** Rendimento de bancada: nunca acima de 100%, nunca perto de zero. */
  it('o rendimento fica entre 50% e 100%', () => {
    const rendimentos = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('lim-rend')),
    );

    expect(rendimentos.length).toBeGreaterThan(20);

    for (const exercicio of rendimentos) {
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(50);
      expect(exercicio.gabarito, exercicio.enunciado).toBeLessThanOrEqual(100);
    }
  });

  /**
   * O erro central do tópico: usar como base o reagente que sobra.
   *
   * É o que acontece quando se escolhe o limitante pela massa, e o número que
   * sai é plausível — por isso merece diagnóstico próprio.
   */
  it('diagnostica o uso do reagente em excesso como base', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('SOBRA')),
    )!;

    expect(exercicio, 'nenhum exercício de produto na amostra').toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('SOBRA'))!;
    const resultado = corrigir(
      geradorLimitante,
      exercicio,
      armadilha.resposta.toFixed(2).replace('.', ','),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('acaba primeiro');
  });

  it('diagnostica a fração do rendimento invertida', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('invertida')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('invertida'))!;
    const resultado = corrigir(
      geradorLimitante,
      exercicio,
      armadilha.resposta.toFixed(2).replace('.', ','),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('100%');
  });

  it('o enunciado vem nas três línguas, com dica', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      expect(exercicio.traducoes?.fr?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.en?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.fr?.dica, exercicio.enunciado).toBeTruthy();
      expect(exercicio.dica, exercicio.enunciado).toBeTruthy();
    }
  });

  it('as três perguntas aparecem', () => {
    const tipos = new Set(
      NIVEIS.flatMap((nivel) => amostra(nivel, 60)).map((e) => e.id.split('-')[1]),
    );

    expect(tipos).toEqual(new Set(['prod', 'sobra', 'rend']));
  });
});
