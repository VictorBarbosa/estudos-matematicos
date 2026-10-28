import { Polinomio } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorRegras } from './regras-de-derivacao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1515);
  return Array.from({ length: quantidade }, () => geradorRegras.gerar(nivel, rng));
}

describe('geradorRegras', () => {
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
  }

  it('a regra do produto aparece nos níveis mais altos', () => {
    const comProduto = amostra('dificil', 90).filter((e) =>
      e.conceitos.includes('regras.produto'),
    );

    expect(comProduto.length).toBeGreaterThan(0);
  });

  it('diagnostica quem multiplica as derivadas', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('NÃO é o produto das derivadas')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('NÃO é o produto das derivadas'),
    )!;

    const resultado = corrigir(geradorRegras, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('regras.produto');
  });

  it('diagnostica quem mantém o termo constante na derivada', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('termo constante some')),
    )!;

    expect(exercicio).toBeDefined();
  });

  it('a regra do produto confere com a derivada do polinômio expandido', () => {
    // (2x + 1)(3x − 4) = 6x² − 5x − 4, derivada 12x − 5.
    const expandido = Polinomio.de(-4, -5, 6);
    expect(expandido.derivar().avaliar(2)).toBe(19);
  });
});
