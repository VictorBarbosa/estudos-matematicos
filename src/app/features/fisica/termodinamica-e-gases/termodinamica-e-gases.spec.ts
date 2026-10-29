import { R_GASES } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorTermo } from '@features/fisica/termodinamica-e-gases/termodinamica-e-gases.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(8314);
  return Array.from({ length: quantidade }, () => geradorTermo.gerar(nivel, rng));
}

describe('geradorTermo', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorTermo.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(false);
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

  it('o volume molar a 0 °C e 1 atm fica perto de 22,4 L', () => {
    const exercicio = amostra('facil', 200).find(
      (e) =>
        e.enunciado.includes('Que volume ocupam 1 mol') && e.enunciado.includes('a 0 °C'),
    );

    expect(exercicio).toBeDefined();
    expect(exercicio!.gabarito).toBeCloseTo(22.4, 0);
  });

  it('o volume do gás confere com pV = nRT', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('Que volume ocupam'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, mols, celsius] =
        /n = (\d+)\\,\\text\{mol\} \\qquad T = (-?\d+)/.exec(exercicio.enunciadoTex)!;

      const esperado = ((Number(mols) * R_GASES * (Number(celsius) + 273.15)) / 101325) * 1000;
      expect(exercicio.gabarito).toBeCloseTo(esperado, 4);
    }
  });

  it('a pressão do gás usa volume em m³ e temperatura em kelvin', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('Qual é a pressão'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, mols, litros, celsius] =
        /n = (\d+) \\qquad V = (\d+)\\,\\text\{L\} \\qquad T = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const esperado =
        (Number(mols) * R_GASES * (Number(celsius) + 273.15)) / (Number(litros) / 1000) / 1000;

      expect(exercicio.gabarito).toBeCloseTo(esperado, 4);
    }
  });

  it('a transformação conserva pV/T', () => {
    const exercicios = amostra('dificil', 180).filter((e) => e.enunciado.includes('que volume passa'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, p1, v1, t1, p2, t2] =
        /p_1 = (\d+) \\quad V_1 = (\d+) \\quad T_1 = (\d+) \\quad p_2 = (\d+) \\quad T_2 = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const antes = (Number(p1) * Number(v1)) / Number(t1);
      const depois = (Number(p2) * exercicio.gabarito) / Number(t2);

      expect(depois).toBeCloseTo(antes, 6);
    }
  });

  it('a primeira lei subtrai o trabalho do calor', () => {
    const exercicios = amostra('facil', 120).filter((e) =>
      e.enunciado.includes('variação da energia interna'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, calor, trabalho] =
        /Q = (-?\d+)\\,\\text\{J\} \\qquad W = (-?\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBe(Number(calor) - Number(trabalho));
    }
  });

  it('o trabalho isobárico é p·ΔV em unidades do SI', () => {
    const exercicios = amostra('medio', 180).filter((e) => e.enunciado.includes('trabalho realizado pelo gás'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, atm, vi, vf] =
        /p = (\d+)\\,\\text\{atm\} \\qquad V_i = (\d+)\\,\\text\{L\} \\qquad V_f = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const esperado = Number(atm) * 101325 * ((Number(vf) - Number(vi)) / 1000);

      expect(exercicio.gabarito).toBeCloseTo(esperado, 4);
      // Expansão sempre realiza trabalho positivo.
      expect(exercicio.gabarito).toBeGreaterThan(0);
    }
  });

  it('diagnostica quem usa celsius na equação de estado', () => {
    const exercicio = amostra('medio', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('em kelvin')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('em kelvin'))!;
    const resultado = corrigir(geradorTermo, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('termo.gas-ideal');
  });

  it('diagnostica quem soma o trabalho na primeira lei', () => {
    const exercicio = amostra('facil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('entra subtraindo')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('entra subtraindo'),
    )!;

    const resultado = corrigir(geradorTermo, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('termo.primeira-lei');
  });

  it('aceita negativos, para energia interna que diminui', () => {
    expect(geradorTermo.analisar('-300')).toBe(-300);
    expect(geradorTermo.analisar('2026,50')).toBeCloseTo(2026.5, 9);
    expect(geradorTermo.analisar('quente')).toBeNull();
  });
});
