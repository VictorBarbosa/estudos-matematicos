import { expandirComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorProdutos } from './produtos-notaveis.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(8080);
  return Array.from({ length: quantidade }, () => geradorProdutos.gerar(nivel, rng));
}

describe('geradorProdutos (produtos notáveis)', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é inteiro`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito)).toBe(true);
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

  it('o coeficiente do termo do meio de um quadrado é 2ab', () => {
    // (2x + 3)² = 4x² + 12x + 9
    expect(expandirComPassos('quadrado-da-soma', 2, 3).resultado.coeficiente(1)).toBe(12);
  });

  it('na diferença de quadrados o termo do meio é zero', () => {
    const exercicio = amostra('medio', 80).find((candidato) =>
      candidato.enunciadoTex.includes(')\\left('),
    );

    if (exercicio) {
      expect(exercicio.gabarito).toBe(0);
    }
  });

  it('diagnostica quem conta o termo cruzado uma vez só', () => {
    const exercicio = amostra('facil', 40).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('uma vez só')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('uma vez só'))!;
    const resultado = corrigir(geradorProdutos, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('DUAS vezes');
  });

  it('diagnostica quem esquece o termo do meio por completo', () => {
    const exercicio = amostra('facil', 40).find((candidato) =>
      candidato.armadilhas.some((a) => a.resposta === 0),
    )!;

    const resultado = corrigir(geradorProdutos, exercicio, '0');

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('produtos.quadrado');
  });
});
