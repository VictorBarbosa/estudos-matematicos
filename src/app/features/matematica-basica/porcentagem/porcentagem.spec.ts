import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorPorcentagem } from '@features/matematica-basica/porcentagem/porcentagem.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(555);
  return Array.from({ length: quantidade }, () => geradorPorcentagem.gerar(nivel, rng));
}

describe('geradorPorcentagem', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere com a própria resolução`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeCloseTo(exercicio.resolucao.resultado, 6);
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(1e-4);
        }
      }
    });
  }

  it('aceita vírgula decimal, espaços e o símbolo de porcentagem', () => {
    expect(geradorPorcentagem.analisar('36')).toBe(36);
    expect(geradorPorcentagem.analisar(' 1234,50 ')).toBeCloseTo(1234.5);
    expect(geradorPorcentagem.analisar('-25%')).toBe(-25);
    expect(geradorPorcentagem.analisar('R$ 80')).toBe(80);
    expect(geradorPorcentagem.analisar('abc')).toBeNull();
  });

  it('tolera diferença de arredondamento nos centavos', () => {
    const exercicio = amostra('medio', 1)[0]!;
    const quaseCerto = String(exercicio.gabarito + 1e-6).replace('.', ',');

    expect(corrigir(geradorPorcentagem, exercicio, quaseCerto).veredito).toBe('correto');
  });

  it('diagnostica quem soma os percentuais em variações sucessivas', () => {
    const exercicio = amostra('dificil', 80).find((candidato) =>
      candidato.conceitos.includes('porcentagem.sucessivas'),
    )!;

    const armadilha = exercicio.armadilhas[0]!;
    const resultado = corrigir(geradorPorcentagem, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('não se somam');
  });
});
