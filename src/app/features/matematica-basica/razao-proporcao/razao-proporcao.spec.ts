import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, SEM_FORMULA, corrigir } from '@core/treino/models/treino.model';
import { geradorProporcao } from '@features/matematica-basica/razao-proporcao/razao-proporcao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(4242);
  return Array.from({ length: quantidade }, () => geradorProporcao.gerar(nivel, rng));
}

describe('geradorProporcao', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é positivo e finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
        expect(exercicio.gabarito).toBeGreaterThan(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(1e-6);
        }
      }
    });

    it(`no nível ${nivel}, todo exercício tem enunciado em contexto`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.enunciado.length).toBeGreaterThan(20);
      }
    });
  }

  it('no nível fácil só aparece a proporcionalidade direta', () => {
    for (const exercicio of amostra('facil')) {
      expect(exercicio.enunciadoTex).toContain('\\frac');
    }
  });

  it('nos níveis seguintes aparecem os dois tipos', () => {
    const inversas = amostra('medio', 60).filter((e) => e.enunciadoTex.includes('\\cdot'));

    expect(inversas.length).toBeGreaterThan(0);
    expect(inversas.length).toBeLessThan(60);
  });

  it('avisa quem confunde direta com inversa', () => {
    const exercicio = amostra('medio', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('INVERSAMENTE')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('INVERSAMENTE'))!;
    const resultado = corrigir(geradorProporcao, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('proporcao.regra-de-tres');
  });
});

/**
 * No Difícil, só o enunciado.
 *
 * A fórmula ao lado do texto responde a pergunta antes dela ser feita:
 * `\frac{a}{b} = \frac{c}{x}` já diz que a proporção é direta, e
 * `a \cdot b = c \cdot x` que é inversa — que é exatamente a decisão que o
 * exercício existe para treinar.
 */
describe('a fórmula que o Difícil não entrega', () => {
  it('no Fácil e no Médio, a montagem vem pronta', () => {
    for (const nivel of ['facil', 'medio'] as const) {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.enunciadoTex, nivel).not.toBe(SEM_FORMULA);
      }
    }
  });

  it('no Difícil, nenhum exercício mostra a fórmula', () => {
    for (const exercicio of amostra('dificil', 200)) {
      expect(exercicio.enunciadoTex, exercicio.enunciado).toBe(SEM_FORMULA);
    }
  });

  it('vale para os dois tipos de exercício do nível', () => {
    // Regra de três e divisão proporcional — os dois saem no Difícil.
    const divisoes = amostra('dificil', 200).filter((e) =>
      e.conceitos.includes('proporcao.divisao'),
    );
    const regras = amostra('dificil', 200).filter((e) =>
      e.conceitos.includes('proporcao.regra-de-tres'),
    );

    expect(divisoes.length).toBeGreaterThan(5);
    expect(regras.length).toBeGreaterThan(5);
    for (const exercicio of [...divisoes, ...regras]) {
      expect(exercicio.enunciadoTex).toBe(SEM_FORMULA);
    }
  });

  it('o enunciado sozinho traz todos os números da conta', () => {
    // Sem fórmula, o texto é a pergunta inteira: se ele não disser os valores,
    // o exercício fica impossível em vez de difícil.
    for (const exercicio of amostra('dificil', 120)) {
      const numeros = exercicio.enunciado.match(/\d+/g) ?? [];

      expect(numeros.length, exercicio.enunciado).toBeGreaterThanOrEqual(3);
      expect(exercicio.enunciado.length).toBeGreaterThan(40);
      expect(exercicio.enunciado.trim().endsWith('?')).toBe(true);
    }
  });

  it('a resolução continua mostrando a montagem', () => {
    // A fórmula não sumiu do tópico: ela aparece depois da resposta, que é
    // quando ela ensina em vez de entregar.
    for (const exercicio of amostra('dificil', 60)) {
      const passos = exercicio.resolucao.passos;

      expect(passos.length).toBeGreaterThan(1);
      expect(passos.some((passo) => passo.tex.includes('='))).toBe(true);
    }
  });
});
