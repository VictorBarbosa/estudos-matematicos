import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, SEM_FORMULA, corrigir } from '@core/treino/models/treino.model';
import { geradorQuadratica } from '@features/funcoes/funcao-quadratica/funcao-quadratica.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(7007);
  return Array.from({ length: quantidade }, () => geradorQuadratica.gerar(nivel, rng));
}

describe('geradorQuadratica', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(1e-9);
        }
      }
    });
  }

  it('alterna entre perguntas sobre vértice e valor', () => {
    const enunciados = new Set(amostra('medio', 80).map((e) => e.enunciado.slice(0, 20)));
    expect(enunciados.size).toBeGreaterThanOrEqual(3);
  });

  it('no nível fácil o vértice cai em valor inteiro', () => {
    const sobreVertice = amostra('facil', 80).filter((e) => e.enunciado.includes('vértice'));

    for (const exercicio of sobreVertice) {
      expect(Number.isInteger(exercicio.gabarito)).toBe(true);
    }
  });

  it('diagnostica quem confunde vértice com raiz', () => {
    const exercicio = amostra('medio', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('RAIZ')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('RAIZ'))!;
    const resultado = corrigir(geradorQuadratica, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('meio caminho');
  });

  it('diagnostica a troca entre abscissa e ordenada do vértice', () => {
    const exercicio = amostra('dificil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('abscissa')),
    )!;

    expect(exercicio).toBeDefined();
  });
});

/**
 * A parábola que vem de uma história.
 *
 * Lucro, projétil, cerca e custo: as quatro situações em que «qual é o maior»
 * ou «qual é o menor» tem resposta. O que a história acrescenta é o
 * SIGNIFICADO do vértice — a conta é a mesma da versão simbólica.
 */
describe('as histórias de função quadrática', () => {
  it('metade dos exercícios vem de uma situação, sem mostrar f(x)', () => {
    for (const nivel of NIVEIS) {
      const exercicios = amostra(nivel, 120);
      const comHistoria = exercicios.filter((e) => e.id.includes('historia'));

      expect(comHistoria.length, nivel).toBeGreaterThan(30);
      expect(comHistoria.length, nivel).toBeLessThan(90);

      for (const exercicio of comHistoria) {
        expect(exercicio.enunciadoTex, exercicio.enunciado).toBe(SEM_FORMULA);
        expect(exercicio.traducoes?.fr?.enunciado.length ?? 0).toBeGreaterThan(30);
        expect(exercicio.traducoes?.en?.enunciado.length ?? 0).toBeGreaterThan(30);
      }
    }
  });

  it('a resolução diz o que o vértice significa na história', () => {
    const notaIngles = ['preço', 'lucro', 'instante', 'largura', 'quantidade'];

    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 60).filter((e) => e.id.includes('historia'))) {
        if (exercicio.id.includes('-valor-')) {
          continue;
        }

        const nota = exercicio.resolucao.passos.map((passo) => passo.nota ?? '').join(' ');

        expect(
          notaIngles.some((termo) => nota.includes(termo)),
          `${exercicio.enunciado}\nnota: ${nota}`,
        ).toBe(true);
      }
    }
  });

  it('nenhuma história produz custo negativo', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 120).filter((e) => e.id.includes('historia'))) {
        if (exercicio.enunciado.includes('custo')) {
          expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(0);
        }
      }
    }
  });
});
