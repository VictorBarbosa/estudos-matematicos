import {
  avaliarSegundaOrdem,
  periodoAmortecidoComPassos,
  raizesCaracteristicas,
  segundaOrdemComPassos,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEdoSegundaOrdem } from '@features/calculo-4/edo-segunda-ordem/edo-segunda-ordem.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(72_727);
  return Array.from({ length: quantidade }, () => geradorEdoSegundaOrdem.gerar(nivel, rng));
}

describe('geradorEdoSegundaOrdem', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorEdoSegundaOrdem.formatar(exercicio.gabarito);
        expect(corrigir(geradorEdoSegundaOrdem, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorEdoSegundaOrdem.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o período só é pedido quando há oscilação', () => {
    for (const exercicio of amostra('dificil', 250)) {
      if (!exercicio.enunciado.includes('período')) {
        continue;
      }
      expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(0);
    }
  });

  it('o Difícil cobra oscilação', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('edo2.oscilacao')).toBe(true);
    expect(conceitos.has('edo2.duas-condicoes')).toBe(true);
  });

  it('diagnostica quem ignora a velocidade inicial', () => {
    const exercicio = amostra('medio', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('velocidade inicial foi ignorada')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('velocidade inicial foi ignorada'),
    )!;
    const resultado = corrigir(
      geradorEdoSegundaOrdem,
      exercicio,
      geradorEdoSegundaOrdem.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('edo2.duas-condicoes');
  });
});

/**
 * O motor das EDO de segunda ordem.
 *
 * Cada regime é conferido pelo que o define, e a solução é testada contra a
 * própria equação por diferença finita.
 */
describe('EDO de segunda ordem', () => {
  it('discriminante positivo dá duas raízes reais', () => {
    const raizes = raizesCaracteristicas(5, 4);

    expect(raizes.regime).toBe('superamortecido');
    expect(raizes.r1).toBeCloseTo(-1, 12);
    expect(raizes.r2).toBeCloseTo(-4, 12);
  });

  it('discriminante nulo dá raiz dupla', () => {
    const raizes = raizesCaracteristicas(4, 4);

    expect(raizes.regime).toBe('criticamente-amortecido');
    expect(raizes.r1).toBeCloseTo(-2, 12);
  });

  it('discriminante negativo dá raízes complexas', () => {
    const raizes = raizesCaracteristicas(2, 10);

    expect(raizes.regime).toBe('subamortecido');
    expect(raizes.real).toBeCloseTo(-1, 12);
    expect(raizes.imaginaria).toBeCloseTo(3, 12);
  });

  it('a solução respeita as duas condições iniciais', () => {
    const raizes = raizesCaracteristicas(2, 10);
    const h = 1e-6;

    expect(avaliarSegundaOrdem(raizes, 5, -3, 0)).toBeCloseTo(5, 10);

    const derivada =
      (avaliarSegundaOrdem(raizes, 5, -3, h) - avaliarSegundaOrdem(raizes, 5, -3, -h)) / (2 * h);
    expect(derivada).toBeCloseTo(-3, 4);
  });

  it('e satisfaz a própria equação', () => {
    const [b, c] = [2, 10];
    const raizes = raizesCaracteristicas(b, c);
    const y = (t: number) => avaliarSegundaOrdem(raizes, 1, 0, t);
    const [t, h] = [1.5, 1e-4];

    const primeira = (y(t + h) - y(t - h)) / (2 * h);
    const segunda = (y(t + h) - 2 * y(t) + y(t - h)) / (h * h);

    expect(segunda + b * primeira + c * y(t)).toBeCloseTo(0, 4);
  });

  it('o mesmo vale no regime superamortecido', () => {
    const [b, c] = [5, 4];
    const raizes = raizesCaracteristicas(b, c);
    const y = (t: number) => avaliarSegundaOrdem(raizes, 2, 1, t);
    const [t, h] = [0.8, 1e-4];

    const primeira = (y(t + h) - y(t - h)) / (2 * h);
    const segunda = (y(t + h) - 2 * y(t) + y(t - h)) / (h * h);

    expect(segunda + b * primeira + c * y(t)).toBeCloseTo(0, 4);
  });

  it('e no criticamente amortecido, que tem o fator t', () => {
    const [b, c] = [4, 4];
    const raizes = raizesCaracteristicas(b, c);
    const y = (t: number) => avaliarSegundaOrdem(raizes, 1, 2, t);
    const [t, h] = [1, 1e-4];

    const primeira = (y(t + h) - y(t - h)) / (2 * h);
    const segunda = (y(t + h) - 2 * y(t) + y(t - h)) / (h * h);

    expect(segunda + b * primeira + c * y(t)).toBeCloseTo(0, 3);
  });

  it('o amortecimento alonga o período', () => {
    const semAtrito = (2 * Math.PI) / Math.sqrt(25);
    const comAtrito = periodoAmortecidoComPassos(6, 25).resultado;

    expect(comAtrito).toBeGreaterThan(semAtrito);
  });

  it('sem oscilação, não há período', () => {
    expect(Number.isFinite(periodoAmortecidoComPassos(5, 4).resultado)).toBe(false);
  });

  it('a resolução nomeia o regime encontrado', () => {
    const { passos } = segundaOrdemComPassos(2, 10, 1, 0, 1);

    expect(passos[2]!.descricao).toContain('complexas');
    expect(passos[2]!.nota).toContain('parte real controla o decaimento');
  });
});

describe('geradorEdoSegundaOrdem — regime de amortecimento', () => {
  const rng = criarRng(6611);
  const lote = (nivel: Nivel) =>
    Array.from({ length: 300 }, () => geradorEdoSegundaOrdem.gerar(nivel, rng)).filter((e) =>
      e.conceitos.includes('edo2.amortecimento'),
    );
  const numeros = (texto: string) =>
    [...texto.matchAll(/(\d+) (kg|N\/m|N·s\/m)/g)].map((m) => Number(m[1]));

  it('o c crítico zera o discriminante', () => {
    const casos = lote('medio');
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [m, k] = numeros(e.enunciado);
      expect(e.gabarito ** 2 - 4 * m! * k!).toBeCloseTo(0, 9);
    }
  });

  it('a rigidez-limite zera o discriminante', () => {
    const casos = lote('dificil');
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [m, c] = numeros(e.enunciado);
      expect(c! ** 2 - 4 * m! * e.gabarito).toBeCloseTo(0, 9);
    }
  });

  it('na meia-amplitude, a envoltória e^(−ct/2m) vale 1/2 no tempo informado', () => {
    const casos = lote('extremo');
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [m, k, c] = numeros(e.enunciado);
      expect(c! ** 2).toBeLessThan(4 * m! * k!);
      expect(Math.exp((-c! * e.gabarito) / (2 * m!))).toBeCloseTo(0.5, 9);
    }
  });
});
