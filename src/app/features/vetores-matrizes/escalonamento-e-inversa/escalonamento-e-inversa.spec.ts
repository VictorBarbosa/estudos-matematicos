import { Fracao, gaussJordanComPassos, inversaComPassos, multiplicarComPassos } from '@core/math';
import { ErroMatematico } from '@core/math/tipos/tipos';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEscalonamento } from '@features/vetores-matrizes/escalonamento-e-inversa/escalonamento-e-inversa.gerador';

function amostra(nivel: Nivel, quantidade = 120) {
  const rng = criarRng(2718);
  return Array.from({ length: quantidade }, () => geradorEscalonamento.gerar(nivel, rng));
}

/** Os coeficientes de um sistema escrito em `\begin{cases}`. */
function sistema(tex: string): { a: number[][]; b: number[] } | null {
  const corpo = /\\begin\{cases\} (.*) \\end\{cases\}/.exec(tex)?.[1];
  if (!corpo || corpo.includes('k')) {
    return null;
  }

  const a: number[][] = [];
  const b: number[] = [];
  for (const equacao of corpo.split(' \\\\ ')) {
    const [esquerda, direita] = equacao.split(' = ');
    const linha = [0, 0, 0];
    for (const [, sinal, numero, nome] of esquerda!
      .replace(/\s/g, '')
      .matchAll(/([+-]?)(\d*)([xyz])/g)) {
      const valor = (sinal === '-' ? -1 : 1) * (numero === '' ? 1 : Number(numero));
      linha['xyz'.indexOf(nome!)] = valor;
    }
    a.push(linha);
    b.push(Number(direita));
  }
  return { a, b };
}

describe('escalonamento (núcleo)', () => {
  it('Gauss-Jordan resolve o sistema do exemplo da teoria', () => {
    const { resultado } = gaussJordanComPassos([
      [1, 1, 1, 6],
      [2, 3, 1, 11],
      [1, -1, 2, 5],
    ]);
    expect(resultado.tipo).toBe('determinado');
    expect(resultado.solucao!.map((v) => v.paraDecimal())).toEqual([1, 2, 3]);
  });

  it('troca linhas quando o primeiro pivô é zero', () => {
    const { resultado, passos } = gaussJordanComPassos([
      [0, 1, 1, 5],
      [1, 1, 0, 3],
      [1, 0, 1, 4],
    ]);
    expect(passos.some((p) => p.descricao.includes('trocamos'))).toBe(true);
    expect(resultado.solucao!.map((v) => v.paraDecimal())).toEqual([1, 2, 3]);
  });

  it('classifica impossível e indeterminado', () => {
    const impossivel = gaussJordanComPassos([
      [1, 1, 1, 3],
      [1, 2, 3, 6],
      [2, 3, 4, 10],
    ]);
    const indeterminado = gaussJordanComPassos([
      [1, 1, 1, 3],
      [1, 2, 3, 6],
      [2, 3, 4, 9],
    ]);
    expect(impossivel.resultado.tipo).toBe('impossivel');
    expect(indeterminado.resultado.tipo).toBe('indeterminado');
  });

  it('a inversa 3×3 por (A | I) multiplicada por A dá a identidade', () => {
    const a = [
      [2, 1, 0],
      [1, 3, 1],
      [0, 1, 2],
    ];
    const inversa = inversaComPassos(a).resultado.map((l) => l.map((v) => v.paraDecimal()));
    const produto = multiplicarComPassos(a, inversa).resultado;
    produto.forEach((linha, i) =>
      linha.forEach((valor, j) => expect(valor).toBeCloseTo(i === j ? 1 : 0, 9)),
    );
  });

  it('a inversa 2×2 sai da adjunta dividida pelo determinante', () => {
    const inversa = inversaComPassos([
      [2, 1],
      [5, 3],
    ]).resultado;
    expect(inversa[0]![1]!.igualA(Fracao.criar(-1, 1))).toBe(true);
    expect(inversa[1]![0]!.igualA(Fracao.criar(-5, 1))).toBe(true);
  });

  it('recusa a inversa quando o determinante é zero', () => {
    expect(() =>
      inversaComPassos([
        [1, 2],
        [2, 4],
      ]),
    ).toThrow(ErroMatematico);
  });
});

describe('geradorEscalonamento', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorEscalonamento.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
        }
      }
    });

    it(`no nível ${nivel}, o gabarito digitado como fração é aceito`, () => {
      for (const exercicio of amostra(nivel)) {
        const forma = geradorEscalonamento.formatar(exercicio.gabarito);
        expect(corrigir(geradorEscalonamento, exercicio, forma).veredito).toBe('correto');
      }
    });

    it(`no nível ${nivel}, há ao menos duas perguntas diferentes`, () => {
      const formas = new Set(amostra(nivel).map((e) => e.id.split('-').slice(0, 2).join('-')));
      expect(formas.size).toBeGreaterThanOrEqual(2);
    });
  }

  it('nos sistemas sem parâmetro, a variável pedida satisfaz as três equações', () => {
    for (const nivel of ['medio', 'dificil', 'extremo'] as const) {
      for (const exercicio of amostra(nivel).filter((e) => e.id.startsWith('escal-gauss'))) {
        const s = sistema(exercicio.enunciadoTex)!;
        const solucao = gaussJordanComPassos(s.a.map((l, i) => [...l, s.b[i]!])).resultado.solucao!;
        const nome = /valor de ([xyz])/.exec(exercicio.enunciado)![1]!;
        expect(solucao['xyz'.indexOf(nome)]!.paraDecimal()).toBeCloseTo(exercicio.gabarito, 9);
      }
    }
  });

  it('o Extremo traz o sistema que exige trocar linhas', () => {
    const trocas = amostra('extremo').filter((e) => e.id.startsWith('escal-gauss-troca'));
    expect(trocas.length).toBeGreaterThan(0);
    for (const exercicio of trocas) {
      expect(exercicio.resolucao.passos.some((p) => p.descricao.includes('trocamos'))).toBe(true);
    }
  });

  it('o Extremo não repete as perguntas do Difícil', () => {
    const prefixo = (id: string) => id.split('-').slice(0, 2).join('-');
    const dificil = new Set(amostra('dificil').map((e) => prefixo(e.id)));
    const extremo = new Set(amostra('extremo').map((e) => prefixo(e.id)));
    expect([...extremo].some((forma) => !dificil.has(forma))).toBe(true);
  });

  it('com o k do gabarito, o sistema com parâmetro perde o determinante', () => {
    for (const exercicio of amostra('dificil').filter((e) => e.id.startsWith('escal-param'))) {
      const corpo = /\\begin\{cases\} (.*) \\end\{cases\}/.exec(exercicio.enunciadoTex)![1]!;
      const comK = corpo.replace(/k/g, String(exercicio.gabarito));
      const s = sistema(`\\begin{cases} ${comK} \\end{cases}`)!;
      expect(gaussJordanComPassos(s.a.map((l, i) => [...l, s.b[i]!])).resultado.tipo).not.toBe(
        'determinado',
      );
    }
  });

  it('a classificação responde 0, 1 ou 2 conforme o escalonamento', () => {
    for (const exercicio of amostra('medio').filter((e) => e.id.startsWith('escal-classe-sis'))) {
      const s = sistema(exercicio.enunciadoTex)!;
      const tipo = gaussJordanComPassos(s.a.map((l, i) => [...l, s.b[i]!])).resultado.tipo;
      expect(exercicio.gabarito).toBe({ impossivel: 0, determinado: 1, indeterminado: 2 }[tipo]);
    }
  });
});
