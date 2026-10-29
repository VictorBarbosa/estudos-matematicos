import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorInequacoes } from './inequacoes.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(606);
  return Array.from({ length: quantidade }, () => geradorInequacoes.gerar(nivel, rng));
}

describe('geradorInequacoes', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito traz sentido e fronteira`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito.fronteira)).toBe(true);
        expect(['<', '<=', '>', '>=']).toContain(exercicio.gabarito.relacao);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorInequacoes.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
        }
      }
    });

    it(`no nível ${nivel}, a resolução termina descrevendo o conjunto`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos.at(-1)?.tex).toContain('S =');
      }
    });
  }

  it('no nível fácil o coeficiente é positivo e não há inversão', () => {
    for (const exercicio of amostra('facil')) {
      expect(exercicio.conceitos).not.toContain('inequacoes.inversao');
    }
  });

  it('nos níveis seguintes aparecem casos com inversão de sinal', () => {
    const comInversao = amostra('medio').filter((e) => e.conceitos.includes('inequacoes.inversao'));

    expect(comInversao.length).toBeGreaterThan(0);
  });

  it('a resolução registra explicitamente a inversão quando ela ocorre', () => {
    const exercicio = amostra('dificil', 60).find((e) =>
      e.conceitos.includes('inequacoes.inversao'),
    )!;

    expect(exercicio.resolucao.passos.some((passo) => passo.descricao.includes('NEGATIVO'))).toBe(
      true,
    );
  });

  it('o sentido invertido é reprovado, mesmo com a fronteira certa', () => {
    // Era o furo central do tópico: pedindo só a fronteira, quem esquecia de
    // inverter a desigualdade ao dividir por um negativo acertava o exercício.
    const comInversao = amostra('medio', 120).filter((e) =>
      e.conceitos.includes('inequacoes.inversao'),
    );

    expect(comInversao.length).toBeGreaterThan(5);

    for (const exercicio of comInversao) {
      const { relacao, fronteira } = exercicio.gabarito;
      const invertido = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' }[relacao];
      const resultado = corrigir(
        geradorInequacoes,
        exercicio,
        `x ${invertido} ${String(fronteira).replace('.', ',')}`,
      );

      expect(resultado.veredito).toBe('incorreto');
      expect(resultado.diagnostico).toBeDefined();
    }
  });

  it('aceita o conjunto solução nas escritas usuais', () => {
    expect(geradorInequacoes.analisar('x > 3')).toEqual({ relacao: '>', fronteira: 3 });
    expect(geradorInequacoes.analisar('x>=-1,5')).toEqual({ relacao: '>=', fronteira: -1.5 });
    expect(geradorInequacoes.analisar('x ≤ 2')).toEqual({ relacao: '<=', fronteira: 2 });
    expect(geradorInequacoes.analisar('< 4')).toEqual({ relacao: '<', fronteira: 4 });
    // "3 < x" descreve o mesmo conjunto que "x > 3".
    expect(geradorInequacoes.analisar('3 < x')).toEqual({ relacao: '>', fronteira: 3 });
    // A fronteira fracionária do nível difícil é digitável.
    expect(geradorInequacoes.analisar('x > 3/4')).toEqual({ relacao: '>', fronteira: 0.75 });
  });

  it('recusa uma resposta sem sentido de desigualdade', () => {
    expect(geradorInequacoes.analisar('3')).toBeNull();
    expect(geradorInequacoes.analisar('x = 3')).toBeNull();
    expect(geradorInequacoes.analisar('maior que 3')).toBeNull();
  });

  it('diagnostica o erro de somar em vez de subtrair', () => {
    const exercicio = amostra('medio', 40).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('em vez de subtrair')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('em vez de subtrair'),
    )!;

    const digitado = geradorInequacoes.formatar(armadilha.resposta);
    expect(corrigir(geradorInequacoes, exercicio, digitado).veredito).toBe('incorreto');
  });
});
