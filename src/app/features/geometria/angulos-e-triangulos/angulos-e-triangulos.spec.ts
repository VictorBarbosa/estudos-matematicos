import { anguloInternoRegular, somaAngulosInternosComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorAngulos } from '@features/geometria/angulos-e-triangulos/angulos-e-triangulos.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2718);
  return Array.from({ length: quantidade }, () => geradorAngulos.gerar(nivel, rng));
}

describe('geradorAngulos', () => {
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

  it('a soma dos internos confere com (n − 2)·180°', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('soma dos ângulos'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const lados = Number(/n = (\d+)/.exec(exercicio.enunciadoTex)![1]);
      expect(exercicio.gabarito).toBe(somaAngulosInternosComPassos(lados).resultado);
    }
  });

  it('o ângulo interno regular confere com a soma dividida por n', () => {
    const exercicios = amostra('medio', 120).filter((e) =>
      e.enunciado.includes('cada ângulo interno'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const lados = Number(/n = (\d+)/.exec(exercicio.enunciadoTex)![1]);
      expect(exercicio.gabarito).toBeCloseTo(anguloInternoRegular(lados), 9);
      expect(exercicio.gabarito).toBeLessThan(180);
    }
  });

  it('o terceiro ângulo fecha 180° com os outros dois', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('terceiro'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, primeiro, segundo] = /(\d+)° e (\d+)°/.exec(exercicio.enunciado)!;

      expect(Number(primeiro) + Number(segundo) + exercicio.gabarito).toBeCloseTo(180, 9);
      expect(exercicio.gabarito).toBeGreaterThan(0);
    }
  });

  it('o número de lados pedido reproduz o ângulo dado', () => {
    const exercicios = amostra('dificil', 120).filter((e) => e.enunciado.includes('Quantos lados'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const angulo = Number(/de ([\d,.]+)°/.exec(exercicio.enunciado)![1].replace(',', '.'));

      expect(Number.isInteger(exercicio.gabarito)).toBe(true);
      expect(exercicio.gabarito).toBeGreaterThanOrEqual(3);
      expect(anguloInternoRegular(exercicio.gabarito)).toBeCloseTo(angulo, 1);
    }
  });

  it('diagnostica quem usa n triângulos em vez de n − 2', () => {
    const exercicio = amostra('facil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('n − 2 triângulos')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('n − 2 triângulos'))!;

    const resultado = corrigir(geradorAngulos, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('angulos.soma');
  });

  it('diagnostica quem confunde a soma dos externos com a dos internos', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('EXTERNOS é sempre 360')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('EXTERNOS é sempre 360'),
    )!;

    const resultado = corrigir(geradorAngulos, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
  });

  it('aceita o símbolo de grau na resposta', () => {
    expect(geradorAngulos.analisar('120°')).toBe(120);
    expect(geradorAngulos.analisar(' 60 ')).toBe(60);
    expect(geradorAngulos.analisar('112,5')).toBe(112.5);
    expect(geradorAngulos.analisar('reto')).toBeNull();
  });
});

describe('geradorAngulos — congruência, quadriláteros e diagonais', () => {
  const lote = (nivel: Nivel) => {
    const rng = criarRng(1414);
    return Array.from({ length: 300 }, () => geradorAngulos.gerar(nivel, rng));
  };
  const num = (t: string) => Number(t.replace(',', '.'));

  it('na congruência, a medida pedida é a do elemento correspondente', () => {
    for (const nivel of ['facil', 'dificil'] as const) {
      const casos = lote(nivel).filter((e) => e.conceitos.includes('angulos.congruencia'));
      expect(casos.length).toBeGreaterThan(0);
      for (const e of casos) {
        let m = /BC = (\d+) cm/.exec(e.enunciado);
        if (m) {
          expect(e.gabarito).toBe(Number(m[1]));
          continue;
        }
        m = /AB = (\d*)x \+ (\d+) cm e DE = (\d+)x ([+−]) (\d+) cm/.exec(e.enunciado);
        if (m) {
          const p = m[1] === '' ? 1 : Number(m[1]);
          const s = (m[4] === '−' ? -1 : 1) * Number(m[5]);
          const x = (s - Number(m[2])) / (p - Number(m[3]));
          expect(e.gabarito).toBeCloseTo(p * x + Number(m[2]), 9);
          continue;
        }
        m = /ângulo A mede (\d+)° e o ângulo E mede (\d+)°/.exec(e.enunciado)!;
        expect(e.gabarito).toBe(180 - Number(m[1]) - Number(m[2]));
      }
    }
  });

  it('nos quadriláteros, os ângulos fecham 360° e os consecutivos 180°', () => {
    const casos = [...lote('medio'), ...lote('dificil')].filter((e) =>
      e.conceitos.includes('angulos.quadrilateros'),
    );
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const nums = [...e.enunciado.matchAll(/(\d+)°/g)].map((m) => Number(m[1]));
      if (e.enunciado.startsWith('Três ângulos')) {
        expect(nums.reduce((a, b) => a + b, 0) + e.gabarito).toBe(360);
      } else if (e.enunciado.includes('losango')) {
        expect(e.gabarito).toBeCloseTo((180 - nums[0]!) / 2, 9);
      } else {
        expect(e.gabarito + nums[0]!).toBe(180);
      }
    }
  });

  it('as diagonais conferem com n(n − 3)/2 do polígono do ângulo dado', () => {
    const casos = [...lote('medio'), ...lote('extremo')].filter((e) =>
      e.conceitos.includes('angulos.poligono-regular'),
    );
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [, tipo, ang] = /ângulo (interno|externo) de ([\d,]+)°/.exec(e.enunciado)!;
      const externo = tipo === 'externo' ? num(ang!) : 180 - num(ang!);
      const n = Math.round(360 / externo);
      expect(e.gabarito).toBe((n * (n - 3)) / 2);
    }
  });
});
