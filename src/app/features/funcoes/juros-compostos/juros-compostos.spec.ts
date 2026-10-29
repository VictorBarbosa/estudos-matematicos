import { jurosCompostosComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorJuros } from '@features/funcoes/juros-compostos/juros-compostos.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(3355);
  return Array.from({ length: quantidade }, () => geradorJuros.gerar(nivel, rng));
}

describe('geradorJuros', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é positivo`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThan(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.05);
        }
      }
    });
  }

  it('o montante confere com a fórmula dos compostos', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('montante'));

    for (const exercicio of exercicios) {
      const [, capital, taxa, periodos] = /C = (\d+) \\qquad i = (\d+)\\% \\qquad n = (\d+)/.exec(
        exercicio.enunciadoTex,
      )!;

      const esperado = jurosCompostosComPassos(
        Number(capital),
        Number(taxa),
        Number(periodos),
      ).resultado;

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);
    }
  });

  it('o tempo para dobrar não depende do capital', () => {
    const umMil = Math.log(2) / Math.log(1.1);
    const cemMil = Math.log(2) / Math.log(1.1);

    expect(umMil).toBeCloseTo(cemMil, 12);
  });

  it('aceita valores com separador de milhar e vírgula decimal', () => {
    expect(geradorJuros.analisar('1.610,51')).toBeCloseTo(1610.51);
    expect(geradorJuros.analisar('R$ 2500')).toBe(2500);
  });

  it('entende o ponto como casa decimal quando não há vírgula', () => {
    expect(geradorJuros.analisar('1610.51')).toBeCloseTo(1610.51);
    expect(geradorJuros.analisar('33.333333333333336')).toBeCloseTo(100 / 3);
    // Com três dígitos à direita e sem vírgula, continua valendo como milhar.
    expect(geradorJuros.analisar('1.500')).toBe(1500);
  });

  it('diagnostica quem aplica juros simples', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('juros SIMPLES')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('juros SIMPLES'),
    )!;

    const resultado = corrigir(geradorJuros, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('juros.simples');
  });

  it('diagnostica quem esquece o 1 no fator', () => {
    const exercicio = amostra('medio', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('fator é (1 + i)')),
    )!;

    expect(exercicio).toBeDefined();
  });
});
