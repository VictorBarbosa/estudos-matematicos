import { somaComPassos, termoGeral } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorProgressoes } from './progressoes.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(4417);
  return Array.from({ length: quantidade }, () => geradorProgressoes.gerar(nivel, rng));
}

/** Lê a₁, a razão e n do enunciado em TeX. A razão pode vir como fração. */
function dados(enunciadoTex: string): { primeiro: number; razao: number; n: number } {
  const primeiro = Number(/a_1 = (-?[\d{},.]+)/.exec(enunciadoTex)![1].replace('{,}', '.'));
  const n = Number(/n = (\d+)/.exec(enunciadoTex)?.[1] ?? '0');

  const fracao = /[qr] = (-?)\\frac\{(\d+)\}\{(\d+)\}/.exec(enunciadoTex);
  const razao = fracao
    ? (fracao[1] === '-' ? -1 : 1) * (Number(fracao[2]) / Number(fracao[3]))
    : Number(/[qr] = (-?[\d{},.]+)/.exec(enunciadoTex)![1].replace('{,}', '.'));

  return { primeiro, razao, n };
}

describe('geradorProgressoes', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThanOrEqual(1e-6);
        }
      }
    });

    it(`no nível ${nivel}, todo exercício traz resolução e conceitos`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(1);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
        expect(exercicio.resolucao.resultado).toBe(exercicio.gabarito);
      }
    });
  }

  it('o termo pedido confere com o termo geral', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('º termo?'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const { primeiro, razao, n } = dados(exercicio.enunciadoTex);
      const geometrica = exercicio.enunciado.includes('PG');

      expect(exercicio.gabarito).toBeCloseTo(
        termoGeral({ primeiro, razao, geometrica }, n),
        6,
      );
    }
  });

  it('a soma pedida confere com a fórmula da soma', () => {
    const exercicios = amostra('medio', 120).filter((e) =>
      e.enunciado.includes('soma dos'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const { primeiro, razao, n } = dados(exercicio.enunciadoTex);
      const geometrica = exercicio.enunciado.includes('PG');

      expect(exercicio.gabarito).toBeCloseTo(
        somaComPassos({ primeiro, razao, geometrica }, n).resultado,
        6,
      );
    }
  });

  it('a soma pedida também confere com a soma termo a termo', () => {
    for (const exercicio of amostra('medio', 120).filter((e) => e.enunciado.includes('soma dos'))) {
      const { primeiro, razao, n } = dados(exercicio.enunciadoTex);
      const geometrica = exercicio.enunciado.includes('PG');

      let total = 0;
      for (let i = 1; i <= n; i++) {
        total += termoGeral({ primeiro, razao, geometrica }, i);
      }

      expect(exercicio.gabarito).toBeCloseTo(total, 6);
    }
  });

  it('a soma infinita só é pedida para PG convergente', () => {
    const exercicios = amostra('dificil', 120).filter((e) =>
      e.enunciado.includes('infinitos termos'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const { primeiro, razao } = dados(exercicio.enunciadoTex);

      expect(Math.abs(razao)).toBeLessThan(1);
      expect(exercicio.gabarito).toBeCloseTo(primeiro / (1 - razao), 9);
      // A razão aparece como fração exata, nunca truncada em decimal.
      expect(exercicio.enunciadoTex).toContain('\\frac');
    }
  });

  it('diagnostica quem usa a fórmula da PA numa PG', () => {
    const exercicio = amostra('medio', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('fórmula da PA')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('fórmula da PA'))!;
    const resultado = corrigir(geradorProgressoes, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('progressoes.geometrica');
  });

  it('diagnostica quem usa n em vez de n − 1', () => {
    const exercicio = amostra('facil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('n − 1')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('n − 1'))!;
    const resultado = corrigir(geradorProgressoes, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('n − 1');
  });

  it('aceita fração, para somas infinitas como 3/2', () => {
    expect(geradorProgressoes.analisar('3/2')).toBe(1.5);
    expect(geradorProgressoes.analisar('48')).toBe(48);
    expect(geradorProgressoes.analisar('1,5')).toBe(1.5);
    expect(geradorProgressoes.analisar('oito')).toBeNull();
  });
});
