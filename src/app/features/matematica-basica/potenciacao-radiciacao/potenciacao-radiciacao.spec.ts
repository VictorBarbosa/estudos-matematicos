import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorPotencias } from '@features/matematica-basica/potenciacao-radiciacao/potenciacao-radiciacao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(909);
  return Array.from({ length: quantidade }, () => geradorPotencias.gerar(nivel, rng));
}

describe('geradorPotencias', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e bate com a resolução`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
        expect(exercicio.gabarito).toBeCloseTo(exercicio.resolucao.resultado, 9);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta).not.toBe(exercicio.gabarito);
        }
      }
    });
  }

  it('aceita inteiros, decimais e frações', () => {
    expect(geradorPotencias.analisar('64')).toBe(64);
    expect(geradorPotencias.analisar('0,25')).toBeCloseTo(0.25);
    expect(geradorPotencias.analisar('1/8')).toBeCloseTo(0.125);
    expect(geradorPotencias.analisar('1/0')).toBeNull();
    expect(geradorPotencias.analisar('oito')).toBeNull();
  });

  it('no nível difícil aparecem expoentes zero ou negativos', () => {
    const comResultadoFracionario = amostra('dificil', 120).filter(
      (exercicio) => exercicio.gabarito < 1 && exercicio.gabarito > 0,
    );

    expect(comResultadoFracionario.length).toBeGreaterThan(0);
  });

  it('diagnostica quem multiplica os expoentes no produto de potências', () => {
    const exercicio = amostra('medio', 80).find((candidato) =>
      candidato.enunciadoTex.includes('\\cdot'),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('multiplicou'))!;
    const resultado = corrigir(geradorPotencias, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toContain('potencias');
  });
});
