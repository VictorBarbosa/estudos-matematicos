import { Fracao } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorAfim } from '@features/funcoes/funcao-afim/funcao-afim.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(4004);
  return Array.from({ length: quantidade }, () => geradorAfim.gerar(nivel, rng));
}

describe('geradorAfim', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é uma fração válida`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito.denominador).toBeGreaterThan(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta.igualA(exercicio.gabarito)).toBe(false);
        }
      }
    });
  }

  it('alterna entre perguntas de raiz, taxa e valor', () => {
    const enunciados = new Set(amostra('medio', 80).map((e) => e.enunciado));
    expect(enunciados.size).toBeGreaterThanOrEqual(3);
  });

  it('a raiz informada realmente anula a função', () => {
    const exercicios = amostra('medio', 80).filter((e) => e.enunciado.includes('raiz'));

    for (const exercicio of exercicios) {
      const [, aTexto, sinal, bTexto] = /f\(x\) = (-?\d*)x ([+-]) (\d+)/.exec(
        exercicio.enunciadoTex,
      )!;

      const a = aTexto === '' ? 1 : aTexto === '-' ? -1 : Number(aTexto);
      const b = sinal === '+' ? Number(bTexto) : -Number(bTexto);

      const valor = exercicio.gabarito.multiplicar(Fracao.deInteiro(a)).somar(Fracao.deInteiro(b));
      expect(valor.ehZero).toBe(true);
    }
  });

  it('diagnostica quem confunde a raiz com o intercepto y', () => {
    const exercicio = amostra('facil', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('eixo VERTICAL')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('eixo VERTICAL'),
    )!;

    const resultado = corrigir(geradorAfim, exercicio, armadilha.resposta.toString());
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('afim.raiz');
  });
});
