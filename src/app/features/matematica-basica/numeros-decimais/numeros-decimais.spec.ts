import { Fracao } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorDecimais } from './numeros-decimais.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(31415);
  return Array.from({ length: quantidade }, () => geradorDecimais.gerar(nivel, rng));
}

describe('geradorDecimais', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é uma fração válida e irredutível`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito.denominador).toBeGreaterThan(0);
        expect(exercicio.gabarito.estaSimplificada).toBe(true);
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

  it('no nível fácil só aparecem decimais finitos', () => {
    for (const exercicio of amostra('facil')) {
      expect(exercicio.enunciadoTex).not.toContain('overline');
    }
  });

  it('no nível difícil aparecem dízimas', () => {
    const comDizima = amostra('dificil').filter((e) => e.enunciadoTex.includes('overline'));
    expect(comDizima.length).toBe(60);
  });

  it('aceita qualquer forma equivalente da fração', () => {
    const exercicio = amostra('facil', 1)[0]!;
    const gabarito = exercicio.gabarito;
    const equivalente = Fracao.criar(gabarito.numerador * 4, gabarito.denominador * 4);

    expect(corrigir(geradorDecimais, exercicio, equivalente.toString()).veredito).toBe('correto');
  });

  it('diagnostica quem usa potência de dez numa dízima', () => {
    const exercicio = amostra('medio', 80).find((candidato) =>
      candidato.enunciadoTex.includes('overline'),
    )!;

    const armadilha = exercicio.armadilhas[0]!;
    const resultado = corrigir(geradorDecimais, exercicio, armadilha.resposta.toString());

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('decimais.dizima');
  });
});
