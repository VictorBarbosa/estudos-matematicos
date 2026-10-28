import { anguloInternoRegular, somaAngulosInternosComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorAngulos } from './angulos-e-triangulos.gerador';

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
    const exercicios = amostra('medio', 120).filter((e) => e.enunciado.includes('cada ângulo interno'));

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
      const angulo = Number(
        /de ([\d,.]+)°/.exec(exercicio.enunciado)![1].replace(',', '.'),
      );

      expect(Number.isInteger(exercicio.gabarito)).toBe(true);
      expect(exercicio.gabarito).toBeGreaterThanOrEqual(3);
      expect(anguloInternoRegular(exercicio.gabarito)).toBeCloseTo(angulo, 1);
    }
  });

  it('diagnostica quem usa n triângulos em vez de n − 2', () => {
    const exercicio = amostra('facil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('n − 2 triângulos')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('n − 2 triângulos'),
    )!;

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
