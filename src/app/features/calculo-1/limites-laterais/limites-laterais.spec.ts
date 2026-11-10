import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorLaterais } from '@features/calculo-1/limites-laterais/limites-laterais.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(7474);
  return Array.from({ length: quantidade }, () => geradorLaterais.gerar(nivel, rng));
}

describe('geradorLaterais', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é inteiro`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.01);
        }
      }
    });

    it(`no nível ${nivel}, a função por partes apresenta as duas sentenças`, () => {
      // Só as perguntas de função por partes; módulo e infinito têm fórmula única.
      for (const exercicio of amostra(nivel).filter(
        (e) => !e.id.startsWith('laterais-modulo') && !e.id.startsWith('laterais-infinito'),
      )) {
        expect(exercicio.enunciadoTex).toContain('\\begin{cases}');
        expect(exercicio.enunciadoTex).toContain('\\\\');
      }
    });
  }

  it('no nível fácil as sentenças emendam, e o limite existe', () => {
    // Só a função por partes; o módulo tem os laterais opostos de propósito.
    for (const exercicio of amostra('facil').filter((e) => e.enunciadoTex.includes('\\begin{cases}'))) {
      const ultimoPasso = exercicio.resolucao.passos.at(-1)!;
      expect(ultimoPasso.descricao).toContain('coincidem');
    }
  });

  it('nos níveis seguintes aparecem saltos', () => {
    const comSalto = amostra('dificil', 90).filter((e) =>
      e.resolucao.passos.at(-1)!.descricao.includes('discordam'),
    );

    expect(comSalto.length).toBeGreaterThan(0);
  });

  it('diagnostica quem usa a sentença do lado errado', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('lado errado')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('lado errado'))!;
    const resultado = corrigir(geradorLaterais, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('laterais.por-partes');
  });
});
