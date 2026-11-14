import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorGases } from '@features/quimica/gases-ideais/gases-ideais.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(909);
  return Array.from({ length: quantidade }, () => geradorGases.gerar(nivel, rng));
}

describe('geradorGases', () => {
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
            geradorGases.saoEquivalentes!(armadilha.resposta, exercicio.gabarito),
            `${exercicio.enunciado} → ${armadilha.resposta}`,
          ).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito exibido é aceito de volta`, () => {
      for (const exercicio of amostra(nivel, 30)) {
        const escrito = geradorGases.formatar(exercicio.gabarito);
        expect(corrigir(geradorGases, exercicio, escrito).veredito, escrito).toBe('correto');
      }
    });
  }

  /**
   * A temperatura vem em graus Celsius, e isso é metade do tópico.
   *
   * Dá-la em kelvin pouparia o aluno do passo que a equação dos gases mais
   * cobra, e por isso há guarda.
   */
  it('a temperatura do enunciado está em graus Celsius', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      if (exercicio.id.startsWith('gas-parc')) {
        continue;
      }

      expect(exercicio.enunciado, exercicio.enunciado).toContain('°C');
      expect(exercicio.enunciado, exercicio.enunciado).not.toContain(' K');
    }
  });

  /**
   * Temperaturas sempre positivas: com 0 °C a armadilha de deixar em Celsius
   * dividiria por zero, e com temperatura negativa devolveria volume negativo
   * — um absurdo que entregaria o erro antes de o aluno pensar.
   */
  it('as temperaturas são positivas, e as armadilhas finitas', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      for (const armadilha of exercicio.armadilhas) {
        expect(Number.isFinite(armadilha.resposta), exercicio.enunciado).toBe(true);
        expect(armadilha.resposta, exercicio.enunciado).toBeGreaterThan(0);
      }
    }
  });

  /** A pressão parcial nunca passa da total, e nunca é zero. */
  it('a pressão parcial fica abaixo da total', () => {
    const parciais = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('gas-parc')),
    );

    expect(parciais.length).toBeGreaterThan(20);

    for (const exercicio of parciais) {
      const [, total] = /de ([\d,]+) atm/.exec(exercicio.enunciado)!;

      expect(exercicio.gabarito, exercicio.enunciado).toBeLessThan(
        Number(total!.replace(',', '.')),
      );
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(0);
    }
  });

  /** Os dois gases da mistura são sempre diferentes: é o que separa as frações. */
  it('a mistura tem dois gases distintos', () => {
    const parciais = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('gas-parc')),
    );

    for (const exercicio of parciais) {
      const [, primeiro, segundo] = /mol de (\S+) e [\d,]+ mol de (\S+)/.exec(exercicio.enunciado)!;

      expect(primeiro, exercicio.enunciado).not.toBe(segundo);
    }
  });

  it('diagnostica a temperatura deixada em graus Celsius', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('Celsius')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('Celsius'))!;
    const resultado = corrigir(
      geradorGases,
      exercicio,
      armadilha.resposta.toFixed(2).replace('.', ','),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('273');
  });

  it('diagnostica a fração em massa na pressão parcial', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('fração em MASSA')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('fração em MASSA'))!;
    const resultado = corrigir(
      geradorGases,
      exercicio,
      armadilha.resposta.toFixed(2).replace('.', ','),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('molar');
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

    expect(tipos).toEqual(new Set(['vol', 'mols', 'transf', 'parc']));
  });
});
