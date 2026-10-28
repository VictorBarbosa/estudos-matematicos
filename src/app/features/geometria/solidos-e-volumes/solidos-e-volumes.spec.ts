import { volumeComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorSolidos } from './solidos-e-volumes.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(8125);
  return Array.from({ length: quantidade }, () => geradorSolidos.gerar(nivel, rng));
}

describe('geradorSolidos', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorSolidos.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito é positivo e documentado`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThan(0);
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(1);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
      }
    });
  }

  it('o volume do cilindro é πr²h', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('cilindro de raio'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, raio, altura] = /r = (\d+) \\qquad h = (\d+)/.exec(exercicio.enunciadoTex)!;
      expect(exercicio.gabarito).toBeCloseTo(Math.PI * Number(raio) ** 2 * Number(altura), 6);
    }
  });

  it('o cone vale exatamente um terço do cilindro de mesma base e altura', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('cone de raio'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, raio, altura] = /r = (\d+) \\qquad h = (\d+)/.exec(exercicio.enunciadoTex)!;
      const cilindro = volumeComPassos('cilindro', {
        raio: Number(raio),
        altura: Number(altura),
      }).resultado;

      expect(exercicio.gabarito).toBeCloseTo(cilindro / 3, 6);
    }
  });

  it('a esfera vale 4πr³/3', () => {
    const exercicios = amostra('facil', 120).filter((e) =>
      e.enunciado.includes('volume de uma esfera'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const raio = Number(/r = (\d+)/.exec(exercicio.enunciadoTex)![1]);
      expect(exercicio.gabarito).toBeCloseTo((4 / 3) * Math.PI * raio ** 3, 5);
    }
  });

  it('a superfície da esfera é 4πr²', () => {
    const exercicios = amostra('medio', 150).filter((e) =>
      e.enunciado.includes('superfície de uma esfera'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const raio = Number(/r = (\d+)/.exec(exercicio.enunciadoTex)![1]);
      expect(exercicio.gabarito).toBeCloseTo(4 * Math.PI * raio ** 2, 6);
    }
  });

  it('o volume ampliado usa k³', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('ampliado'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, volume, k] = /V = (\d+) \\qquad k = (\d+)/.exec(exercicio.enunciadoTex)!;
      expect(exercicio.gabarito).toBe(Number(volume) * Number(k) ** 3);
    }
  });

  it('a altura pedida reconstrói o volume informado', () => {
    const exercicios = amostra('dificil', 150).filter((e) => e.enunciado.includes('Qual é sua altura'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, raio, volume] = /r = (\d+) \\qquad V = ([\d.]+)/.exec(exercicio.enunciadoTex)!;
      const cone = exercicio.enunciado.includes('cone');

      const reconstruido = volumeComPassos(cone ? 'cone' : 'cilindro', {
        raio: Number(raio),
        altura: exercicio.gabarito,
      }).resultado;

      expect(reconstruido).toBeCloseTo(Number(volume), 1);
    }
  });

  it('diagnostica quem esquece o terço do cone', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('Faltou o terço')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('Faltou o terço'))!;
    const resultado = corrigir(geradorSolidos, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('solidos.terco');
  });

  it('diagnostica quem escala o volume por k em vez de k³', () => {
    const exercicio = amostra('medio', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('multiplica COMPRIMENTOS')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('multiplica COMPRIMENTOS'),
    )!;

    const resultado = corrigir(geradorSolidos, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('solidos.escala');
  });

  it('aceita duas casas decimais com vírgula', () => {
    expect(geradorSolidos.analisar('113,10')).toBeCloseTo(113.1, 9);
    expect(geradorSolidos.analisar('64')).toBe(64);
    expect(geradorSolidos.analisar('muito')).toBeNull();
  });
});
