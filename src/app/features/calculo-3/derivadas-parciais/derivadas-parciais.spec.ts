import { avaliarLinear2, linear2ParaTex, parcialComPassos, parcialX, parcialY } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorDerivadasParciais } from '@features/calculo-3/derivadas-parciais/derivadas-parciais.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(90_210);
  return Array.from({ length: quantidade }, () => geradorDerivadasParciais.gerar(nivel, rng));
}

describe('geradorDerivadasParciais', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorDerivadasParciais.formatar(exercicio.gabarito);
        expect(corrigir(geradorDerivadasParciais, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorDerivadasParciais.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Fácil não traz termo misto', () => {
    // Ele é a fonte do erro que o Médio existe para treinar.
    for (const exercicio of amostra('facil', 150)) {
      expect(exercicio.enunciadoTex, exercicio.enunciadoTex).not.toContain('xy');
    }
  });

  it('o Difícil cobra segunda ordem e mista', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('parciais.segunda-ordem')).toBe(true);
    expect(conceitos.has('parciais.mista')).toBe(true);
  });

  it('diagnostica quem deriva na variável errada', () => {
    const exercicio = amostra('medio', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('OUTRA variável')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('OUTRA variável'),
    )!;
    const resultado = corrigir(
      geradorDerivadasParciais,
      exercicio,
      geradorDerivadasParciais.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('parciais.uma-de-cada-vez');
  });
});

/**
 * O motor das derivadas parciais.
 *
 * O que ele precisa acertar é o tratamento do termo misto: é ele que acopla as
 * duas direções, e é dele que vem quase todo erro do assunto.
 */
describe('derivadas parciais', () => {
  const q = { a: 3, b: 2, c: 5, d: -4, e: 1, f0: 7 };

  it('a parcial em x trata y como constante', () => {
    // ∂/∂x (3x² + 2y² + 5xy − 4x + y + 7) = 6x + 5y − 4
    expect(parcialX(q)).toEqual({ kx: 6, ky: 5, k0: -4 });
  });

  it('a parcial em y trata x como constante', () => {
    expect(parcialY(q)).toEqual({ kx: 5, ky: 4, k0: 1 });
  });

  it('o termo constante é o único que some nas duas', () => {
    const soConstante = { a: 0, b: 0, c: 0, d: 0, e: 0, f0: 9 };

    expect(parcialX(soConstante)).toEqual({ kx: 0, ky: 0, k0: 0 });
    expect(parcialY(soConstante)).toEqual({ kx: 0, ky: 0, k0: 0 });
  });

  it('o termo misto aparece nas duas parciais, com a outra variável', () => {
    const soMisto = { a: 0, b: 0, c: 4, d: 0, e: 0, f0: 0 };

    expect(parcialX(soMisto).ky).toBe(4);
    expect(parcialY(soMisto).kx).toBe(4);
  });

  it('as duas parciais costumam discordar no mesmo ponto', () => {
    const fx = avaliarLinear2(parcialX(q), 1, 1);
    const fy = avaliarLinear2(parcialY(q), 1, 1);

    expect(fx).toBe(7);
    expect(fy).toBe(10);
  });

  it('a resolução diz, no primeiro passo, o que fica constante', () => {
    const { passos } = parcialComPassos(q, 1, 1, true);

    expect(passos[0]!.descricao).toContain('tratando y como constante');
    expect(passos[2]!.nota).toContain('andar só na direção de x');
  });

  it('a escrita da linear omite o que vale zero', () => {
    expect(linear2ParaTex({ kx: 2, ky: 0, k0: -3 })).toBe('2x - 3');
    expect(linear2ParaTex({ kx: 0, ky: 0, k0: 0 })).toBe('0');
    expect(linear2ParaTex({ kx: 1, ky: 1, k0: 0 })).toBe('x + y');
  });
});
