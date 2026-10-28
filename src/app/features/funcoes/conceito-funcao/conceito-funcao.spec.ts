import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorConceito } from './conceito-funcao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2424);
  return Array.from({ length: quantidade }, () => geradorConceito.gerar(nivel, rng));
}

describe('geradorConceito', () => {
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

  it('cobre domínio, imagem e avaliação', () => {
    const conceitos = new Set(amostra('medio', 90).flatMap((e) => e.conceitos));

    expect(conceitos.has('conceito.dominio')).toBe(true);
    expect(conceitos.has('conceito.definicao')).toBe(true);
  });

  it('o valor excluído do domínio realmente zera o denominador', () => {
    const exercicios = amostra('medio', 90).filter((e) => e.enunciado.includes('domínio'));

    for (const exercicio of exercicios) {
      const [, sinal, valor] = /x ([+-]) (\d+)/.exec(exercicio.enunciadoTex)!;
      const k = sinal === '-' ? Number(valor) : -Number(valor);

      expect(exercicio.gabarito).toBe(k);
    }
  });

  it('diagnostica quem esquece a constante no valor mínimo', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('menor valor de x²')),
    )!;

    const resultado = corrigir(geradorConceito, exercicio, '0');

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('deslocado');
  });
});
