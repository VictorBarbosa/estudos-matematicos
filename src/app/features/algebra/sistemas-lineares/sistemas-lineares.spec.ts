import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorSistemas } from '@features/algebra/sistemas-lineares/sistemas-lineares.gerador';

/** A pergunta de entrada: o sistema montado, pedindo x. As novas têm testes próprios abaixo. */
function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(999);
  return Array.from({ length: quantidade * 3 }, () => geradorSistemas.gerar(nivel, rng))
    .filter((e) => e.enunciado.startsWith('Resolva o sistema'))
    .slice(0, quantidade);
}

describe('geradorSistemas', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o sistema gerado é sempre determinado`, () => {
      for (const exercicio of amostra(nivel)) {
        // Um sistema determinado resolve em passos que chegam ao ponto.
        expect(exercicio.resolucao.passos.at(-1)?.descricao).toContain('cruzam');
      }
    });

    it(`no nível ${nivel}, x é inteiro, porque a solução é sorteada antes`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito)).toBe(true);
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

  it('o enunciado apresenta o sistema com as duas equações', () => {
    for (const exercicio of amostra('medio', 10)) {
      expect(exercicio.enunciadoTex).toContain('\\begin{cases}');
      expect(exercicio.enunciadoTex.split('\\\\').length).toBe(2);
    }
  });

  it('avisa quando o aluno responde o y', () => {
    const exercicio = amostra('medio', 40).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('valor de y')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('valor de y'))!;
    const resultado = corrigir(geradorSistemas, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('sistemas.metodos');
  });
});

describe('geradorSistemas — problema e classificação', () => {
  const rng = criarRng(7171);
  const lote = (nivel: Nivel) =>
    Array.from({ length: 200 }, () => geradorSistemas.gerar(nivel, rng));

  it('no problema, x e o que sobra para y satisfazem as duas equações do enunciado', () => {
    const casos = lote('medio').filter((e) => e.enunciado.startsWith('Há '));
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [, total] = /^Há (\d+)/.exec(e.enunciado)!;
      const [, p, q, t] = /vale (-?\d+) .*?, (-?\d+) [a-z]+; .*? é (-?\d+)/.exec(e.enunciado)!;
      const x = e.gabarito;
      const y = Number(total) - x;
      expect(y).toBeGreaterThan(0);
      expect(Number(p) * x + Number(q) * y).toBe(Number(t));
    }
  });

  it('o k do sistema impossível zera o determinante e o m do indeterminado mantém a proporção', () => {
    for (const nivel of ['dificil', 'extremo'] as const) {
      const casos = lote(nivel).filter((e) => e.conceitos.includes('sistemas.classificacao'));
      expect(casos.length).toBeGreaterThan(0);
      for (const e of casos) {
        expect(Number.isInteger(e.gabarito)).toBe(true);
        expect(e.resolucao.passos.at(-1)!.tex).toContain(String(e.gabarito));
      }
    }
  });
});
