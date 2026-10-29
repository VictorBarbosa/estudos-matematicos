import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorLogaritmica } from '@features/funcoes/funcao-logaritmica/funcao-logaritmica.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1010);
  return Array.from({ length: quantidade }, () => geradorLogaritmica.gerar(nivel, rng));
}

describe('geradorLogaritmica', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é inteiro — sem precisar de calculadora`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(1e-6);
        }
      }
    });
  }

  it('no nível difícil aparecem logaritmos negativos', () => {
    const negativos = amostra('dificil', 120).filter((e) => e.gabarito < 0);
    expect(negativos.length).toBeGreaterThan(0);
  });

  it('diagnostica quem repete o argumento em vez de dar o expoente', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('repetiu o argumento')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('repetiu o argumento'),
    )!;

    const resultado = corrigir(geradorLogaritmica, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('logaritmica.definicao');
  });

  it('diagnostica quem multiplica em vez de somar na propriedade do produto', () => {
    const exercicio = amostra('medio', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('vira SOMA')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('logaritmica.propriedades');
  });

  it('as equações logarítmicas pedem o argumento, não o expoente', () => {
    const equacoes = amostra('facil', 80).filter((e) => e.enunciado.includes('equação'));

    for (const exercicio of equacoes) {
      expect(exercicio.gabarito).toBeGreaterThan(1);
    }
  });
});
