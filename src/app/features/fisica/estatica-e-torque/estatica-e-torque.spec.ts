import { centroDeMassaComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorTorque } from './estatica-e-torque.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(9314);
  return Array.from({ length: quantidade }, () => geradorTorque.gerar(nivel, rng));
}

describe('geradorTorque', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorTorque.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(false);
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

  it('o torque usa seno e zera quando a força é paralela ao braço', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('Qual é o torque'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, forca, braco, angulo] =
        /F = (\d+)\\,\\text\{N\} \\qquad r = ([\d{},]+)\\,\\text\{m\} \\qquad \\theta = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const r = Number(braco.replace('{,}', '.'));
      const esperado = Number(forca) * r * Math.sin((Number(angulo) * Math.PI) / 180);

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);

      if (Number(angulo) === 0 || Number(angulo) === 180) {
        expect(Math.abs(exercicio.gabarito)).toBeLessThan(1e-9);
      }
    }
  });

  it('o torque nunca passa de F·r', () => {
    for (const exercicio of amostra('medio', 150).filter((e) =>
      e.enunciado.includes('Qual é o torque'),
    )) {
      const [, forca, braco] =
        /F = (\d+)\\,\\text\{N\} \\qquad r = ([\d{},]+)/.exec(exercicio.enunciadoTex)!;

      const maximo = Number(forca) * Number(braco.replace('{,}', '.'));
      expect(Math.abs(exercicio.gabarito)).toBeLessThanOrEqual(maximo + 1e-9);
    }
  });

  it('a alavanca equilibra os torques dos dois lados', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('Numa alavanca'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, forcaA, distanciaA, forcaB] =
        /F_A = (\d+)\\,\\text\{N\} \\qquad d_A = ([\d{},]+)\\,\\text\{m\} \\qquad F_B = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const dA = Number(distanciaA.replace('{,}', '.'));

      expect(Number(forcaA) * dA).toBeCloseTo(Number(forcaB) * exercicio.gabarito, 6);
      // Força menor exige braço maior.
      if (Number(forcaB) < Number(forcaA)) {
        expect(exercicio.gabarito).toBeGreaterThan(dA);
      }
    }
  });

  it('o centro de massa fica entre os corpos e confere com o core', () => {
    const exercicios = amostra('medio', 180).filter((e) => e.enunciado.includes('centro de massa'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const corpos = [...exercicio.enunciado.matchAll(/(\d+) kg em x = (\d+) m/g)].map((m) => ({
        massa: Number(m[1]),
        posicao: Number(m[2]),
      }));

      expect(corpos.length).toBe(3);

      const esperado = centroDeMassaComPassos(corpos).resultado;
      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);

      const posicoes = corpos.map((c) => c.posicao);
      expect(exercicio.gabarito).toBeGreaterThanOrEqual(Math.min(...posicoes));
      expect(exercicio.gabarito).toBeLessThanOrEqual(Math.max(...posicoes));
    }
  });

  it('a força de equilíbrio da barra inclui o peso dela', () => {
    const exercicios = amostra('dificil', 200).filter((e) => e.enunciado.includes('barra homogênea'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, comprimento, peso, carga, distancia] =
        /L = (\d+)\\,\\text\{m\} \\qquad P = (\d+)\\,\\text\{N\} \\qquad Q = (\d+)\\,\\text\{N\} \\qquad d = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const esperado =
        (Number(carga) * Number(distancia) + (Number(peso) * Number(comprimento)) / 2) /
        Number(comprimento);

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);
      // Ignorar o peso da barra daria um valor menor.
      expect(exercicio.gabarito).toBeGreaterThan(
        (Number(carga) * Number(distancia)) / Number(comprimento),
      );
    }
  });

  it('diagnostica quem usa cosseno no torque', () => {
    const exercicio = amostra('medio', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('O torque usa SENO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('O torque usa SENO'),
    )!;

    const resultado = corrigir(geradorTorque, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('torque.definicao');
  });

  it('diagnostica quem usa média simples no centro de massa', () => {
    const exercicio = amostra('medio', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('média simples das POSIÇÕES')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('média simples das POSIÇÕES'),
    )!;

    const resultado = corrigir(geradorTorque, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('torque.centro-massa');
  });

  it('aceita decimais com vírgula', () => {
    expect(geradorTorque.analisar('2,5')).toBe(2.5);
    expect(geradorTorque.analisar('100')).toBe(100);
    expect(geradorTorque.analisar('gira')).toBeNull();
  });
});
