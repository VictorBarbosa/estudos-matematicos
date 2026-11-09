import { expandirComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorProdutos } from '@features/algebra/produtos-notaveis/produtos-notaveis.gerador';

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

describe('geradorProdutos — direção inversa', () => {
  /** Coeficientes de um polinômio em LaTeX, como Polinomio.paraTex escreve. */
  function coeficientes(tex: string): number[] {
    const coef: number[] = [];
    const limpo = tex.replace(/\s+/g, '');
    for (const [, sinal, numero, x, expoente] of limpo.matchAll(
      /([+-]?)(\d*)(x(?:\^\{(\d+)\})?)?/g,
    )) {
      if (numero === '' && x === undefined) continue;
      const grau = x === undefined ? 0 : expoente === undefined ? 1 : Number(expoente);
      const valor = (numero === '' ? 1 : Number(numero)) * (sinal === '-' ? -1 : 1);
      coef[grau] = (coef[grau] ?? 0) + valor;
    }
    return Array.from({ length: coef.length }, (_, i) => coef[i] ?? 0);
  }

  it('o q informado reconstrói o polinômio do enunciado', () => {
    let conferidos = 0;
    for (const nivel of ['medio', 'dificil', 'extremo'] as const) {
      for (const exercicio of amostra(nivel, 200).filter((e) => e.id.startsWith('produtos-inv'))) {
        const q = exercicio.gabarito;
        const c = coeficientes(exercicio.enunciadoTex.split('=')[0]!);
        if (exercicio.id.startsWith('produtos-inv-quad')) {
          const p = Math.sqrt(c[2]!);
          expect([c[0], c[1]]).toEqual([q * q, 2 * p * q]);
        } else if (exercicio.id.startsWith('produtos-inv-dif')) {
          expect(c[0]).toBe(-q * q);
          expect(q).toBeGreaterThan(0);
        } else {
          const p = Math.round(Math.cbrt(c[3]!));
          expect([c[0], c[1], c[2]]).toEqual([q ** 3, 3 * p * q * q, 3 * p * p * q]);
        }
        conferidos++;
      }
    }
    expect(conferidos).toBeGreaterThan(30);
  });

  it('o Extremo deixou de ser só o cubo: tem o cubo na direção inversa, que o Difícil não tem', () => {
    expect(amostra('extremo', 200).some((e) => e.id.startsWith('produtos-inv-cubo'))).toBe(true);
    expect(amostra('dificil', 200).some((e) => e.id.startsWith('produtos-inv-cubo'))).toBe(false);
  });
});
