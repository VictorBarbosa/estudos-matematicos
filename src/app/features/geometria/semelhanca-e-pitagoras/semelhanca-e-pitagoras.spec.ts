import { classificarTriangulo, escalaComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorSemelhanca } from '@features/geometria/semelhanca-e-pitagoras/semelhanca-e-pitagoras.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1123);
  return Array.from({ length: quantidade }, () => geradorSemelhanca.gerar(nivel, rng));
}

describe('geradorSemelhanca', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorSemelhanca.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
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

  it('a hipotenusa fecha Pitágoras e forma triângulo retângulo', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('a hipotenusa'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, b, c] = /b = (\d+) \\qquad c = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito ** 2).toBeCloseTo(Number(b) ** 2 + Number(c) ** 2, 6);
      expect(classificarTriangulo(Number(b), Number(c), exercicio.gabarito).angulo).toBe(
        'retangulo',
      );
    }
  });

  it('a hipotenusa é sempre o maior lado', () => {
    for (const exercicio of amostra('facil', 90).filter((e) =>
      e.enunciado.includes('a hipotenusa'),
    )) {
      const [, b, c] = /b = (\d+) \\qquad c = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeGreaterThan(Number(b));
      expect(exercicio.gabarito).toBeGreaterThan(Number(c));
      expect(exercicio.gabarito).toBeLessThan(Number(b) + Number(c));
    }
  });

  it('o cateto que falta confere com a subtração dos quadrados', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('outro cateto'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, a, b] = /a = (\d+) \\qquad b = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito ** 2).toBeCloseTo(Number(a) ** 2 - Number(b) ** 2, 6);
      expect(exercicio.gabarito).toBeLessThan(Number(a));
    }
  });

  it('Tales mantém a proporção', () => {
    const exercicios = amostra('medio', 120).filter((e) => e.enunciado.includes('feixe de paralelas'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, a, b, c] = /\\frac\{(\d+)\}\{(\d+)\} = \\frac\{(\d+)\}\{x\}/.exec(
        exercicio.enunciadoTex,
      )!;

      expect(Number(a) / Number(b)).toBeCloseTo(Number(c) / exercicio.gabarito, 6);
    }
  });

  it('a área escala com k² e o volume com k³', () => {
    const exercicios = amostra('dificil', 150).filter((e) => e.enunciado.includes('Ampliando'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const k = Number(/k = ([\d{},]+)/.exec(exercicio.enunciadoTex)![1].replace('{,}', '.'));
      const original = Number(/[AV] = (\d+)/.exec(exercicio.enunciadoTex)![1]);
      const dimensao = exercicio.enunciadoTex.includes('A = ') ? 2 : 3;

      expect(exercicio.gabarito).toBeCloseTo(
        original * escalaComPassos(k, dimensao as 2 | 3).resultado,
        6,
      );
    }
  });

  it('diagnostica quem soma os catetos', () => {
    const exercicio = amostra('facil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('não se somam diretamente')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('não se somam diretamente'),
    )!;

    const resultado = corrigir(geradorSemelhanca, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('semelhanca.pitagoras');
  });

  it('diagnostica quem escala a área por k em vez de k²', () => {
    const exercicio = amostra('dificil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('multiplica COMPRIMENTOS')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('multiplica COMPRIMENTOS'),
    )!;

    const resultado = corrigir(geradorSemelhanca, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('semelhanca.razao');
  });

  it('aceita decimal com vírgula e fração', () => {
    expect(geradorSemelhanca.analisar('7,5')).toBe(7.5);
    expect(geradorSemelhanca.analisar('15/2')).toBe(7.5);
    expect(geradorSemelhanca.analisar('13')).toBe(13);
    expect(geradorSemelhanca.analisar('treze')).toBeNull();
  });
});
