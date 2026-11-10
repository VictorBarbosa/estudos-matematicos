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

  it('o treino do tópico é só regra de três', () => {
    /*
     * A divisão proporcional saiu do treino.
     *
     * "Dividindo $ 230,00 em partes proporcionais a 1 e 4, qual é a MAIOR das
     * partes?" exercitava uma receita — somar os pesos, achar k, multiplicar —
     * e não a decisão entre direta e inversa, que é o que este tópico ensina.
     * Ela continua na teoria e na aba Explorar, onde é consulta e não prova.
     */
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 200)) {
        expect(exercicio.conceitos, exercicio.enunciado).not.toContain('proporcao.divisao');
        expect(exercicio.enunciado).not.toContain('partes proporcionais');
        expect(exercicio.conceitos).toContain('proporcao.regra-de-tres');
      }
    }
  });

  it('o enunciado sozinho traz todos os números da conta', () => {
    // Sem fórmula, o texto é a pergunta inteira: se ele não disser os valores,
    // o exercício fica impossível em vez de difícil.
    //
    // Duas grandezas pedem dois números no enunciado; as perguntas de valor
    // unitário («quanto custa 1 kg?») têm exatamente os dois, porque o terceiro
    // valor da conta é o 1 que a própria pergunta enuncia. Exigir três ali
    // reprovaria uma pergunta completa por ser curta.
    for (const exercicio of amostra('dificil', 120)) {
      const numeros = exercicio.enunciado.match(/\d+/g) ?? [];

      expect(numeros.length, exercicio.enunciado).toBeGreaterThanOrEqual(2);
      expect(exercicio.enunciado.length).toBeGreaterThan(30);
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

/**
 * As três línguas.
 *
 * A interface fala português, francês e inglês, e a pergunta do exercício é o
 * texto que o aluno mais lê. Sem estas versões no próprio exercício, trocar de
 * idioma no cabeçalho deixaria a pergunta na língua anterior até o próximo
 * sorteio.
 */
describe('as três línguas', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o enunciado existe em francês e inglês`, () => {
      for (const exercicio of amostra(nivel)) {
        const fr = exercicio.traducoes?.fr?.enunciado ?? '';
        const en = exercicio.traducoes?.en?.enunciado ?? '';

        expect(fr.length, exercicio.enunciado).toBeGreaterThan(20);
        expect(en.length, exercicio.enunciado).toBeGreaterThan(20);
        expect(fr, exercicio.enunciado).not.toBe(exercicio.enunciado);
        expect(en, exercicio.enunciado).not.toBe(exercicio.enunciado);
      }
    });

    it(`no nível ${nivel}, a dica e o diagnóstico acompanham a língua`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.traducoes?.fr?.dica?.length ?? 0).toBeGreaterThan(10);
        expect(exercicio.traducoes?.en?.dica?.length ?? 0).toBeGreaterThan(10);

        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.diagnosticoTraducoes?.fr?.length ?? 0).toBeGreaterThan(20);
          expect(armadilha.diagnosticoTraducoes?.en?.length ?? 0).toBeGreaterThan(20);
        }
      }
    });
  }
});

/**
 * A regra de três composta.
 *
 * Duas grandezas mudam ao mesmo tempo — é o degrau que separa «aplicar a
 * fórmula» de «decidir o que multiplica o quê». O enunciado dá cinco números e
 * a resolução mostra as duas proporções encadeadas.
 */
describe('o Extremo composto', () => {
  it('só o Extremo sorteia a composta, e ela tem cinco números', () => {
    for (const nivel of ['facil', 'medio', 'dificil'] as const) {
      for (const exercicio of amostra(nivel, 120)) {
        expect(exercicio.id, nivel).not.toContain('composta');
      }
    }

    for (const exercicio of amostra('extremo', 120)) {
      expect(exercicio.id).toContain('composta');
      expect(exercicio.enunciado.match(/\d+/g)?.length ?? 0).toBeGreaterThanOrEqual(5);
      expect(exercicio.resolucao.passos.length).toBeGreaterThan(4);
      expect(exercicio.enunciadoTex).toBe(SEM_FORMULA);
    }
  });

  it('as duas proporções encadeadas chegam ao gabarito', () => {
    for (const exercicio of amostra('extremo', 60)) {
      const ultimo = exercicio.resolucao.passos.at(-1)!;
      expect(ultimo.tex).toContain('x');
      expect(Number.isInteger(exercicio.gabarito)).toBe(true);
    }
  });
});
