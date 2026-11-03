import {
  IDENTIDADE,
  aplicar,
  descreverTransformacao,
  transformacaoParaTex,
  transformarPonto,
  verticeTransformadoComPassos,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorTransformacoes } from '@features/funcoes/transformacoes-de-graficos/transformacoes-de-graficos.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(97_531);
  return Array.from({ length: quantidade }, () => geradorTransformacoes.gerar(nivel, rng));
}

describe('geradorTransformacoes', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorTransformacoes.formatar(exercicio.gabarito);
        expect(corrigir(geradorTransformacoes, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorTransformacoes.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Fácil não mexe no fator horizontal', () => {
    // É ele que inverte a intuição; no Fácil o aluno ainda está vendo o resto.
    for (const exercicio of amostra('facil', 150)) {
      expect(exercicio.conceitos).not.toContain('transformacoes.escala-horizontal');
    }
  });

  it('o Difícil cobra escala e sinal invertido', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('transformacoes.escala')).toBe(true);
    expect(conceitos.has('transformacoes.dentro-e-fora')).toBe(true);
  });

  it('a armadilha do sinal invertido aparece nos exercícios de vértice', () => {
    const vertices = amostra('facil', 200).filter((exercicio) =>
      exercicio.enunciado.includes('vértice'),
    );

    expect(vertices.length).toBeGreaterThan(0);
    for (const exercicio of vertices) {
      if (exercicio.gabarito === 0) {
        continue;
      }
      expect(
        exercicio.armadilhas.some((a) => a.diagnostico.includes('sinal está invertido')),
        exercicio.enunciadoTex,
      ).toBe(true);
    }
  });

  it('diagnostica quem multiplica em vez de dividir na horizontal', () => {
    const exercicio = amostra('dificil', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('AVESSO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('AVESSO'))!;
    const resultado = corrigir(
      geradorTransformacoes,
      exercicio,
      geradorTransformacoes.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('transformacoes.escala');
  });
});

/**
 * O motor das transformações.
 *
 * O que ele precisa acertar é a assimetria: fora do argumento a conta é
 * direta, dentro dele é o avesso.
 */
describe('transformações de gráficos', () => {
  it('a identidade não muda nada', () => {
    const ponto = { x: 3, y: 4 };

    expect(transformarPonto(ponto, IDENTIDADE)).toEqual(ponto);
    expect(descreverTransformacao(IDENTIDADE)).toEqual(['não muda nada']);
  });

  it('somar dentro do argumento desloca para a esquerda', () => {
    // f(x + 3) é a transformação com h = −3.
    const destino = transformarPonto({ x: 4, y: 0 }, { a: 1, b: 1, h: -3, k: 0 });

    expect(destino.x).toBe(1);
  });

  it('subtrair dentro do argumento desloca para a direita', () => {
    const destino = transformarPonto({ x: 4, y: 0 }, { a: 1, b: 1, h: 3, k: 0 });

    expect(destino.x).toBe(7);
  });

  it('multiplicar dentro do argumento comprime', () => {
    const destino = transformarPonto({ x: 4, y: 0 }, { a: 1, b: 2, h: 0, k: 0 });

    expect(destino.x).toBe(2);
  });

  it('e fora do argumento, estica', () => {
    const destino = transformarPonto({ x: 0, y: 4 }, { a: 2, b: 1, h: 0, k: 0 });

    expect(destino.y).toBe(8);
  });

  it('a ordem na vertical é multiplicar e só depois somar', () => {
    const destino = transformarPonto({ x: 0, y: 3 }, { a: 2, b: 1, h: 0, k: 1 });

    expect(destino.y).toBe(7);
  });

  it('a função transformada confere com o ponto transformado', () => {
    const t = { a: 2, b: 3, h: 1, k: -4 };
    const quadrado = (x: number) => x * x;
    const g = aplicar(quadrado, t);
    const destino = transformarPonto({ x: 2, y: quadrado(2) }, t);

    expect(g(destino.x)).toBeCloseTo(destino.y, 10);
  });

  it('o vértice se lê direto dos parâmetros', () => {
    const { resultado, passos } = verticeTransformadoComPassos({ a: 1, b: 1, h: 3, k: 2 });

    expect(resultado).toBe(3);
    expect(passos[2]!.nota).toContain('para a DIREITA');
  });

  it('a descrição em palavras segue a ordem das operações', () => {
    const descricao = descreverTransformacao({ a: -2, b: 2, h: 1, k: 3 });

    expect(descricao[0]).toContain('comprime na horizontal');
    expect(descricao[1]).toContain('direita');
    expect(descricao).toContain('reflete no eixo horizontal');
    expect(descricao.at(-1)).toContain('cima');
  });

  it('a escrita omite o que vale 1 ou 0', () => {
    expect(transformacaoParaTex(IDENTIDADE)).toBe('f\\left(x\\right)');
    expect(transformacaoParaTex({ a: 1, b: 1, h: 2, k: 0 })).toBe('f\\left(x - 2\\right)');
  });
});
