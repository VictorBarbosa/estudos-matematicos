import { DENSIDADE_AR, empuxoArquimedesComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorFluidos } from './fluidos-e-aerodinamica.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1225);
  return Array.from({ length: quantidade }, () => geradorFluidos.gerar(nivel, rng));
}

describe('geradorFluidos', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorFluidos.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(false);
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

  it('a pressão total inclui a atmosfera e cresce 1 atm a cada 10 m', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('pressão total'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const h = Number(/h = (\d+)/.exec(exercicio.enunciadoTex)![1]);
      const esperado = (101325 + 1000 * 9.81 * h) / 1000;

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);
      expect(exercicio.gabarito).toBeGreaterThan(101.3);
    }
  });

  it('o empuxo usa a densidade do fluido, não a do corpo', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('que empuxo'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const litros = Number(/V = (\d+)\\,\\text\{L\}/.exec(exercicio.enunciadoTex)![1]);
      const esperado = 1000 * (litros / 1000) * 9.81;

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);
    }
  });

  it('a fração submersa é a razão das densidades e fica entre 0 e 1', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('fração do seu volume'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const densidade = Number(/\\rho_\{corpo\} = (\d+)/.exec(exercicio.enunciadoTex)![1]);

      expect(exercicio.gabarito).toBeCloseTo(densidade / 1000, 9);
      expect(exercicio.gabarito).toBeGreaterThan(0);
      expect(exercicio.gabarito).toBeLessThan(1);
    }
  });

  it('a fração submersa confere com o core', () => {
    for (const exercicio of amostra('medio', 150).filter((e) =>
      e.enunciado.includes('fração do seu volume'),
    )) {
      const densidade = Number(/\\rho_\{corpo\} = (\d+)/.exec(exercicio.enunciadoTex)![1]);
      const { resultado } = empuxoArquimedesComPassos(1, densidade);

      expect(exercicio.gabarito).toBeCloseTo(resultado.fracaoSubmersa, 9);
      expect(resultado.flutua).toBe(true);
    }
  });

  it('a sustentação usa a diferença dos quadrados e cresce com v²', () => {
    const exercicios = amostra('medio', 180).filter((e) => e.enunciado.includes('sustentação'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, area, superior, inferior] =
        /A = (\d+)\\,\\text\{m\}\^\{2\} \\qquad v_\{sup\} = (\d+) \\qquad v_\{inf\} = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const esperado =
        (DENSIDADE_AR * (Number(superior) ** 2 - Number(inferior) ** 2) * Number(area)) / 2;

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);

      // Dobrando as duas velocidades, a sustentação quadruplica.
      const dobrada =
        (DENSIDADE_AR *
          ((2 * Number(superior)) ** 2 - (2 * Number(inferior)) ** 2) *
          Number(area)) /
        2;
      expect(dobrada / esperado).toBeCloseTo(4, 6);
    }
  });

  it('acelerando o ar, a pressão cai', () => {
    const exercicios = amostra('dificil', 200).filter((e) => e.enunciado.includes('nova pressão'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, vA, vB] = /v_A = (\d+) \\qquad v_B = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(Number(vB)).toBeGreaterThan(Number(vA));
      // Fluido mais rápido, pressão menor que a atmosférica.
      expect(exercicio.gabarito).toBeLessThan(101.325);
    }
  });

  it('diagnostica quem esquece a pressão atmosférica', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('pressão da COLUNA')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('pressão da COLUNA'),
    )!;

    const resultado = corrigir(geradorFluidos, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('fluidos.pressao');
  });

  it('diagnostica quem usa o quadrado da diferença na sustentação', () => {
    const exercicio = amostra('medio', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('diferença dos QUADRADOS')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('diferença dos QUADRADOS'),
    )!;

    const resultado = corrigir(geradorFluidos, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('fluidos.sustentacao');
  });

  it('aceita decimal e exponencial', () => {
    expect(geradorFluidos.analisar('199,43')).toBeCloseTo(199.43, 9);
    expect(geradorFluidos.analisar('1.2e3')).toBeCloseTo(1200, 9);
    expect(geradorFluidos.analisar('flutua')).toBeNull();
  });
});
