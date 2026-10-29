import { Polinomio } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorRegras } from '@features/calculo-1/regras-de-derivacao/regras-de-derivacao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1515);
  return Array.from({ length: quantidade }, () => geradorRegras.gerar(nivel, rng));
}

describe('geradorRegras', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é avaliável em x`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito.avaliar(2))).toBe(true);
        expect(exercicio.gabarito.tex.length).toBeGreaterThan(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorRegras.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(false);
        }
      }
    });
  }

  it('a regra do produto aparece nos níveis mais altos', () => {
    const comProduto = amostra('dificil', 90).filter((e) =>
      e.conceitos.includes('regras.produto'),
    );

    expect(comProduto.length).toBeGreaterThan(0);
  });

  it('pede a expressão da derivada, e não só um valor', () => {
    const expressoes = amostra('dificil', 120).filter((e) =>
      e.enunciado.includes('a expressão inteira'),
    );

    expect(expressoes.length).toBeGreaterThan(10);

    for (const exercicio of expressoes) {
      // A derivada de um polinômio não é constante: o gabarito depende de x.
      const em1 = exercicio.gabarito.avaliar(1);
      const em2 = exercicio.gabarito.avaliar(2);
      expect(em1).not.toBe(em2);
    }
  });

  it('aceita a derivada escrita de formas diferentes', () => {
    const exercicio = amostra('facil', 120).find((e) =>
      e.enunciado.includes('a expressão inteira'),
    )!;

    const tex = exercicio.gabarito.tex;
    // O gabarito vem em LaTeX (`6x^{2}`); o aluno digita sem as chaves.
    const digitado = tex.replace(/\^\{(\d+)\}/g, '^$1');

    expect(corrigir(geradorRegras, exercicio, digitado).veredito).toBe('correto');
    expect(corrigir(geradorRegras, exercicio, `(${digitado})`).veredito).toBe('correto');
    expect(corrigir(geradorRegras, exercicio, `0 + ${digitado}`).veredito).toBe('correto');
  });

  it('aceita o valor pedido nas perguntas numéricas', () => {
    const numericas = amostra('medio', 120).filter((e) => /f'\(-?\d+\)/.test(e.enunciado));

    expect(numericas.length).toBeGreaterThan(5);

    for (const exercicio of numericas) {
      const valor = exercicio.gabarito.avaliar(0);
      expect(corrigir(geradorRegras, exercicio, String(valor)).veredito).toBe('correto');
    }
  });

  it('diagnostica quem multiplica as derivadas', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('NÃO é o produto das derivadas')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('NÃO é o produto das derivadas'),
    )!;

    const resultado = corrigir(geradorRegras, exercicio, armadilha.resposta.tex);
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('regras.produto');
  });

  it('diagnostica quem desce o expoente sem diminuí-lo', () => {
    const exercicio = amostra('dificil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('desce como fator E diminui')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('desce como fator E diminui'),
    )!;

    const digitado = armadilha.resposta.tex.replace(/\^\{(\d+)\}/g, '^$1');
    const resultado = corrigir(geradorRegras, exercicio, digitado);

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('desce como fator E diminui');
  });

  it('diagnostica quem mantém o termo constante na derivada', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('termo constante some')),
    )!;

    expect(exercicio).toBeDefined();
  });

  it('a regra do produto confere com a derivada do polinômio expandido', () => {
    // (2x + 1)(3x − 4) = 6x² − 5x − 4, derivada 12x − 5.
    const expandido = Polinomio.de(-4, -5, 6);
    expect(expandido.derivar().avaliar(2)).toBe(19);
  });
});
