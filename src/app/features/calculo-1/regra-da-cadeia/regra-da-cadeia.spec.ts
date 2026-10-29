import { derivadaNumerica } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorCadeia } from '@features/calculo-1/regra-da-cadeia/regra-da-cadeia.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2828);
  return Array.from({ length: quantidade }, () => geradorCadeia.gerar(nivel, rng));
}

describe('geradorCadeia', () => {
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

  it('o gabarito confere com a derivada numérica', () => {
    for (const exercicio of amostra('medio', 40)) {
      const [, aTexto, sinal, bTexto, nTexto] =
        /\\left\((\d*)x ([+-]) (\d+)\\right\)\^\{(\d+)\}/.exec(exercicio.enunciadoTex)!;
      const [, ponto] = /f'\((-?\d+)\)/.exec(exercicio.enunciado)!;

      const a = aTexto === '' ? 1 : Number(aTexto);
      const b = sinal === '+' ? Number(bTexto) : -Number(bTexto);
      const n = Number(nTexto);

      const numerica = derivadaNumerica((x) => (a * x + b) ** n, Number(ponto), 1e-5);
      expect(exercicio.gabarito).toBeCloseTo(numerica, 2);
    }
  });

  it('diagnostica quem esquece o fator interno', () => {
    const exercicio = amostra('facil', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('derivada interna')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('derivada interna'),
    )!;

    const resultado = corrigir(geradorCadeia, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('cadeia.erro-comum');
  });

  it('diagnostica quem mantém o expoente', () => {
    const exercicio = amostra('medio', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('DIMINUIR em um')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('cadeia.regra');
  });
});
