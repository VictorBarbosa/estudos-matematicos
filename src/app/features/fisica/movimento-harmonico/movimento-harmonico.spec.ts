import { resolverOscilacaoComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorMhs } from './movimento-harmonico.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2244);
  return Array.from({ length: quantidade }, () => geradorMhs.gerar(nivel, rng));
}

describe('geradorMhs', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é positivo`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThan(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.02);
        }
      }
    });
  }

  it('o gabarito confere com o motor de oscilação', () => {
    for (const exercicio of amostra('medio', 40)) {
      const [, massa, constante, amplitude] =
        /m = (\d+)\\text\{ kg\} \\qquad k = (\d+)\\text\{ N\/m\} \\qquad A = ([\d.]+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const { resultado } = resolverOscilacaoComPassos(
        Number(amplitude),
        Number(constante),
        Number(massa),
      );

      const candidatos = [
        resultado.periodo,
        resultado.frequenciaAngular,
        Number(amplitude) * resultado.frequenciaAngular,
      ];

      expect(candidatos.some((v) => Math.abs(v - exercicio.gabarito) < 1e-9)).toBe(true);
    }
  });

  it('o período não muda com a amplitude', () => {
    const pequena = resolverOscilacaoComPassos(0.1, 10, 2).resultado.periodo;
    const grande = resolverOscilacaoComPassos(3, 10, 2).resultado.periodo;

    expect(pequena).toBeCloseTo(grande, 12);
  });

  it('diagnostica quem esquece a raiz quadrada', () => {
    const exercicio = amostra('facil', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('Faltou a raiz quadrada')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('Faltou a raiz quadrada'),
    )!;

    const resultado = corrigir(geradorMhs, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('mhs.equacao');
  });

  it('diagnostica quem acha que a amplitude afeta o período', () => {
    const exercicio = amostra('medio', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('amplitude NÃO entra')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('mhs.periodo');
  });
});
