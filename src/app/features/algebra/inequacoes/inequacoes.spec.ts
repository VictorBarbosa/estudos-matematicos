import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, SEM_FORMULA, corrigir } from '@core/treino/models/treino.model';
import { geradorInequacoes } from '@features/algebra/inequacoes/inequacoes.gerador';

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

/**
 * A inequação que vem de uma história.
 *
 * O modelo é `a·x + b REL c`, escrito em `inequacoes.contextos.ts`. O teste
 * confere a COERÊNCIA entre a história e a conta: se o texto diz uma coisa e a
 * inequação resolvida outra, o aluno acerta a conta e erra a pergunta — e não
 * há corretor que perceba isso olhando só o gabarito.
 */
describe('as histórias de inequação', () => {
  /** O `id` carrega os parâmetros: `inequacoes-historia-<cenario>-<a>-<b>-<c>-<rel>-N`. */
  function parametros(id: string): { a: number; b: number; c: number } | null {
    const partes = /^inequacoes-historia-[a-z]+-(-?\d+)-(-?\d+)-(-?\d+)-/.exec(id);
    return partes === null
      ? null
      : { a: Number(partes[1]), b: Number(partes[2]), c: Number(partes[3]) };
  }

  it('metade dos exercícios vem de uma situação, e ela não mostra a conta', () => {
    for (const nivel of NIVEIS) {
      const exercicios = amostra(nivel, 160);
      const comHistoria = exercicios.filter((e) => e.id.includes('-historia-'));

      expect(comHistoria.length, nivel).toBeGreaterThan(40);
      expect(comHistoria.length, nivel).toBeLessThan(120);

      for (const exercicio of comHistoria) {
        expect(exercicio.enunciadoTex, exercicio.enunciado).toBe(SEM_FORMULA);
        expect(exercicio.enunciado.length).toBeGreaterThan(80);
        expect(exercicio.dica?.length ?? 0).toBeGreaterThan(20);
      }
    }
  });

  it('a fronteira do gabarito é exatamente onde a conta empata', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 200).filter((e) => e.id.includes('-historia-'))) {
        const p = parametros(exercicio.id);
        expect(p, exercicio.id).not.toBeNull();

        // a·x + b = c na fronteira — é o que define o valor crítico.
        expect(p!.a * exercicio.gabarito.fronteira + p!.b, `${exercicio.enunciado}`).toBeCloseTo(
          p!.c,
          6,
        );
      }
    }
  });

  it('a história existe em francês e inglês, com a dica junto', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 80).filter((e) => e.id.includes('-historia-'))) {
        expect(exercicio.traducoes?.fr?.enunciado.length ?? 0).toBeGreaterThan(60);
        expect(exercicio.traducoes?.en?.enunciado.length ?? 0).toBeGreaterThan(60);
        expect(exercicio.traducoes?.fr?.dica?.length ?? 0).toBeGreaterThan(15);
        expect(exercicio.traducoes?.en?.dica?.length ?? 0).toBeGreaterThan(15);
      }
    }
  });

  it('toda história cita o conceito de modelagem', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 60).filter((e) => e.id.includes('-historia-'))) {
        expect(exercicio.conceitos).toContain('inequacoes.modelagem');
      }
    }
  });

  it('um ponto dentro da solução satisfaz a conta, e um fora não', () => {
    /*
     * Este teste fecha o caminho inteiro: história → inequação montada →
     * resolver → gabarito. Ele NÃO tenta adivinhar o sentido pela palavra do
     * enunciado («pelo menos» pode se referir aos litros que restam, e não às
     * horas), porque esse atalho produzia falso positivo: no tanque, «restam
     * pelo menos 22 litros» dá x ≤ …, e a palavra sozinha diria o contrário.
     *
     * O que se confere é o que importa: a fronteira é onde a conta empata, e o
     * conjunto devolvido é exatamente o lado que satisfaz a desigualdade.
     */
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 200).filter((e) => e.id.includes('-historia-'))) {
        const partes = /^inequacoes-historia-[a-z]+-(-?\d+)-(-?\d+)-(-?\d+)-([<>=]+)-/.exec(
          exercicio.id,
        );
        expect(partes, exercicio.id).not.toBeNull();

        const [a, b, c] = [Number(partes![1]), Number(partes![2]), Number(partes![3])];
        const relacao = partes![4] as '<' | '<=' | '>' | '>=';
        const { fronteira, relacao: final } = exercicio.gabarito;
        const vale = (x: number): boolean => {
          const esquerda = a * x + b;
          return relacao === '<'
            ? esquerda < c
            : relacao === '<='
              ? esquerda <= c
              : relacao === '>'
                ? esquerda > c
                : esquerda >= c;
        };

        // O sentido final é o inicial, ou o seu oposto quando se dividiu por negativo.
        const esperada = a < 0 ? { '<': '>', '<=': '>=', '>': '<', '>=': '<=' }[relacao] : relacao;
        expect(final, `${exercicio.enunciado}`).toBe(esperada);

        // Um passo para dentro da solução e um para fora. O lado é dado pelo
        // sentido FINAL, já invertido — não pelo sinal de `a`.
        const dentro = final.startsWith('>') ? fronteira + 1 : fronteira - 1;
        const fora = final.startsWith('>') ? fronteira - 1 : fronteira + 1;

        expect(vale(dentro), `dentro: ${dentro} em ${exercicio.enunciado}`).toBe(true);
        expect(vale(fora), `fora: ${fora} em ${exercicio.enunciado}`).toBe(false);
      }
    }
  });

  it('a armadilha do sentido invertido é sempre recusada', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 100).filter((e) => e.id.includes('-historia-'))) {
        const invertida = {
          ...exercicio.gabarito,
          relacao: { '<': '>', '<=': '>=', '>': '<', '>=': '<=' }[exercicio.gabarito.relacao],
        } as typeof exercicio.gabarito;

        const texto = geradorInequacoes.formatar(invertida);
        expect(corrigir(geradorInequacoes, exercicio, texto).veredito, texto).toBe('incorreto');
      }
    }
  });
});
