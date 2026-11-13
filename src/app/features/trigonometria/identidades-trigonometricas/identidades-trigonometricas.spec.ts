import { paraRadianos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorIdentidades } from '@features/trigonometria/identidades-trigonometricas/identidades-trigonometricas.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1717);
  return Array.from({ length: quantidade }, () => geradorIdentidades.gerar(nivel, rng));
}

describe('geradorIdentidades', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito está no intervalo possível de um seno ou cosseno`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThanOrEqual(-1.0001);
        expect(exercicio.gabarito).toBeLessThanOrEqual(1.0001);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.02);
        }
      }
    });
  }

  it('o seno da soma confere com o valor real', () => {
    const exercicios = amostra('facil', 80).filter((e) => e.enunciado.includes('soma de arcos'));

    for (const exercicio of exercicios) {
      const [, a, b] = /\\sin\((\d+)° \+ (\d+)°\)/.exec(exercicio.enunciadoTex)!;
      const esperado = Math.sin(paraRadianos(Number(a) + Number(b)));

      expect(exercicio.gabarito).toBeCloseTo(esperado, 9);
    }
  });

  it('o arco duplo confere com o seno do ângulo dobrado', () => {
    const exercicios = amostra('dificil', 90).filter((e) => e.enunciado.includes('arco duplo'));

    for (const exercicio of exercicios) {
      const [, dobro] = /\\sin (\d+)°/.exec(exercicio.enunciadoTex)!;
      expect(exercicio.gabarito).toBeCloseTo(Math.sin(paraRadianos(Number(dobro))), 9);
    }
  });

  it('diagnostica quem distribui o seno sobre a soma', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('NÃO se distribui')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('NÃO se distribui'))!;

    const resultado = corrigir(geradorIdentidades, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('contraexemplo');
  });

  it('diagnostica quem escreve sen 2a como 2 sen a', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('multiplica o ÂNGULO')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('identidades.arco-duplo');
  });
});

/**
 * A resposta segue do dado como ele foi escrito.
 *
 * Era o defeito mais silencioso do tópico: o gabarito vinha do ângulo exato
 * enquanto o aluno recebia o seno arredondado em duas casas. Perto de 90° os
 * dois caminhos se separam — em 84° o seno 0,9945 aparece como 0,99, de onde
 * cos θ = 0,1411, mas o gabarito era cos 84° = 0,1045 —, e a diferença
 * estourava a tolerância de 0,02. Em 80°, 84° e 85° o aluno raciocinava certo e
 * era marcado como errado.
 */
describe('geradorIdentidades: o cosseno segue do seno exibido', () => {
  // A identidade fundamental é pergunta de Fácil e Médio; no Difícil a rotação
  // passa a soma de arcos e arco duplo.
  const comSeno = amostra('medio', 200).filter((e) => e.enunciado.includes('Se sen θ'));

  it('há exercícios desse tipo na amostra', () => {
    expect(comSeno.length).toBeGreaterThan(0);
  });

  it('refazer a conta a partir do enunciado dá exatamente o gabarito', () => {
    for (const exercicio of comSeno) {
      const senoDado = Number(/sen θ = ([\d,.]+)/.exec(exercicio.enunciado)![1].replace(',', '.'));
      const cossenoDoAluno = Math.sqrt(1 - senoDado * senoDado);

      expect(exercicio.gabarito).toBeCloseTo(cossenoDoAluno, 12);
    }
  });

  it('a resposta que o aluno escreveria é aceita', () => {
    for (const exercicio of comSeno) {
      const senoDado = Number(/sen θ = ([\d,.]+)/.exec(exercicio.enunciado)![1].replace(',', '.'));
      const escrita = Math.sqrt(1 - senoDado * senoDado).toFixed(2);

      expect(corrigir(geradorIdentidades, exercicio, escrita).veredito).toBe('correto');
    }
  });

  it('o seno dado nunca é 1, que no 1º quadrante seria 90°', () => {
    for (const exercicio of comSeno) {
      const senoDado = Number(/sen θ = ([\d,.]+)/.exec(exercicio.enunciado)![1].replace(',', '.'));

      expect(senoDado).toBeLessThan(1);
      expect(senoDado).toBeGreaterThan(0);
    }
  });

  it('o enunciado diz quantas casas quer', () => {
    for (const exercicio of comSeno) {
      expect(exercicio.enunciado).toContain('2 casas');
    }
  });
});
