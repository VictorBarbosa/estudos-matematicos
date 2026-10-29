import { GRANDEZAS, grandezaPorNome } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorDimensional } from '@features/fisica/analise-dimensional/analise-dimensional.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1402);
  return Array.from({ length: quantidade }, () => geradorDimensional.gerar(nivel, rng));
}

describe('geradorDimensional', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta).not.toBe(exercicio.gabarito);
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

  it('o expoente pedido confere com a tabela de grandezas', () => {
    // "Na dimensão de X" é a pergunta sobre a tabela; a de combinação começa
    // com "Considere o produto" e pode envolver grandezas de base.
    const exercicios = amostra('medio', 150).filter((e) =>
      e.enunciado.startsWith('Na dimensão de'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const nome = /dimensão de (.*?) \(unidade/.exec(exercicio.enunciado)![1]!;
      const base = /expoente de ([MLT])/.exec(exercicio.enunciado)![1]! as 'M' | 'L' | 'T';

      expect(exercicio.gabarito).toBe(grandezaPorNome(nome)!.dimensao[base]);
    }
  });

  it('nunca pergunta o expoente de uma grandeza de base', () => {
    for (const exercicio of amostra('medio', 150).filter((e) =>
      e.enunciado.startsWith('Na dimensão de'),
    )) {
      const nome = /dimensão de (.*?) \(unidade/.exec(exercicio.enunciado)![1]!;
      expect(['comprimento', 'massa', 'tempo']).not.toContain(nome);
    }
  });

  it('a opção correta do pêndulo tem dimensão de tempo', () => {
    const exercicios = amostra('dificil', 180).filter((e) => e.enunciado.includes('PERÍODO'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      // O gabarito é um índice válido entre as quatro opções.
      expect(exercicio.gabarito).toBeGreaterThanOrEqual(1);
      expect(exercicio.gabarito).toBeLessThanOrEqual(4);

      // E a opção apontada é a da raiz de L/g.
      const linhas = exercicio.enunciado.split('\n').slice(1);
      expect(linhas[exercicio.gabarito - 1]).toContain('comprimento sobre gravidade');
    }
  });

  it('as conversões de área e volume usam o fator elevado', () => {
    const exercicios = amostra('medio', 180).filter((e) => e.enunciado.startsWith('Converta'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      expect(exercicio.gabarito).toBeGreaterThan(1);
      // Todos os fatores usados são potências de dez.
      expect(Math.log10(exercicio.gabarito) % 1).toBeCloseTo(0, 9);
    }
  });

  it('diagnostica quem usa o fator linear numa unidade de volume', () => {
    const exercicio = amostra('medio', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('fator LINEAR')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('fator LINEAR'))!;
    const resultado = corrigir(geradorDimensional, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('dimensional.grandezas');
  });

  it('diagnostica quem inverte o sinal do expoente', () => {
    const exercicio = amostra('facil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('sinal está invertido')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('sinal está invertido'),
    )!;

    const resultado = corrigir(geradorDimensional, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('dimensional.grandezas');
  });

  it('a tabela de grandezas cobre as dimensões usadas no currículo', () => {
    for (const nome of ['força', 'energia', 'potência', 'pressão', 'momento linear']) {
      expect(GRANDEZAS.some((grandeza) => grandeza.nome === nome)).toBe(true);
    }
  });

  it('aceita negativos', () => {
    expect(geradorDimensional.analisar('-2')).toBe(-2);
    expect(geradorDimensional.analisar('0')).toBe(0);
    expect(geradorDimensional.analisar('dois')).toBeNull();
  });
});
