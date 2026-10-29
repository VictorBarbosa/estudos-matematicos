import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorSistemas } from '@features/algebra/sistemas-lineares/sistemas-lineares.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(999);
  return Array.from({ length: quantidade }, () => geradorSistemas.gerar(nivel, rng));
}

describe('geradorSistemas', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o sistema gerado é sempre determinado`, () => {
      for (const exercicio of amostra(nivel)) {
        // Um sistema determinado resolve em passos que chegam ao ponto.
        expect(exercicio.resolucao.passos.at(-1)?.descricao).toContain('cruzam');
      }
    });

    it(`no nível ${nivel}, x é inteiro, porque a solução é sorteada antes`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(1e-9);
        }
      }
    });
  }

  it('o enunciado apresenta o sistema com as duas equações', () => {
    for (const exercicio of amostra('medio', 10)) {
      expect(exercicio.enunciadoTex).toContain('\\begin{cases}');
      expect(exercicio.enunciadoTex.split('\\\\').length).toBe(2);
    }
  });

  it('avisa quando o aluno responde o y', () => {
    const exercicio = amostra('medio', 40).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('valor de y')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('valor de y'))!;
    const resultado = corrigir(geradorSistemas, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('sistemas.metodos');
  });
});
