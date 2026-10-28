import { Polinomio, fatorarComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorFatoracao } from './fatoracao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(5150);
  return Array.from({ length: quantidade }, () => geradorFatoracao.gerar(nivel, rng));
}

describe('geradorFatoracao', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, a raiz informada realmente anula a expressão`, () => {
      for (const exercicio of amostra(nivel)) {
        // Reconstrói o polinômio a partir do enunciado para conferir de fora.
        const raiz = exercicio.gabarito;
        expect(Number.isFinite(raiz)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta).not.toBe(exercicio.gabarito);
        }
      }
    });

    it(`no nível ${nivel}, a expressão gerada é de fato fatorável`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos.length).toBeGreaterThanOrEqual(2);
      }
    });
  }

  it('no nível fácil as raízes são inteiras e positivas', () => {
    for (const exercicio of amostra('facil')) {
      expect(Number.isInteger(exercicio.gabarito)).toBe(true);
      expect(exercicio.gabarito).toBeGreaterThan(0);
    }
  });

  it('diagnostica a troca de sinal da raiz', () => {
    const exercicio = amostra('facil', 40).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('sinal está invertido')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('sinal está invertido'),
    )!;
    const resultado = corrigir(geradorFatoracao, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('(x − r)');
  });

  it('a fatoração do core reconhece cada tipo', () => {
    expect(fatorarComPassos(Polinomio.de(0, 9, 6)).resultado.tipo).toBe('fator-comum');
    expect(fatorarComPassos(Polinomio.de(-16, 0, 9)).resultado.tipo).toBe('diferenca-de-quadrados');
    expect(fatorarComPassos(Polinomio.de(9, -6, 1)).resultado.tipo).toBe(
      'trinomio-quadrado-perfeito',
    );
  });
});
