import { canonizarNotacao } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, SEM_FORMULA, corrigir } from '@core/treino/models/treino.model';
import { geradorNotacao } from '@features/matematica-basica/notacao-matematica/notacao-matematica.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(31_415);
  return Array.from({ length: quantidade }, () => geradorNotacao.gerar(nivel, rng));
}

/** Responde ao exercício com o texto dado. */
function responder(exercicio: ReturnType<typeof geradorNotacao.gerar>, texto: string) {
  return corrigir(geradorNotacao, exercicio, texto);
}

/** Só os exercícios de escrever notação. */
function escritas(nivel: Nivel, quantidade = 200) {
  return amostra(nivel, quantidade).filter((e) => e.conceitos.includes('notacao.escrita'));
}

/** Só os exercícios de ler notação. */
function leituras(nivel: Nivel, quantidade = 200) {
  return amostra(nivel, quantidade).filter((e) => e.conceitos.includes('notacao.leitura'));
}

describe('geradorNotacao', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o tópico cobra as duas mãos`, () => {
      // Ler e escrever são o mesmo assunto visto dos dois lados, e o tópico
      // existe porque uma das mãos costuma ficar para trás.
      expect(leituras(nivel).length).toBeGreaterThan(20);
      expect(escritas(nivel).length).toBeGreaterThan(20);
    });

    it(`no nível ${nivel}, o gabarito é aceito como está escrito`, () => {
      for (const exercicio of amostra(nivel)) {
        const exibido = geradorNotacao.formatar(exercicio.gabarito);

        expect(responder(exercicio, exibido).veredito, exibido).toBe('correto');
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorNotacao.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('a paleta de símbolos é oferecida', () => {
    // ∀, ∈ e ∑ não estão no teclado de ninguém: sem paleta, o tópico pede o
    // impossível.
    const rotulos = (geradorNotacao.simbolos ?? []).map((tecla) => tecla.rotulo);

    expect(rotulos).toContain('∀');
    expect(rotulos).toContain('∈');
    expect(rotulos).toContain('∑');
    expect(rotulos).toContain('f(x)');
    for (const tecla of geradorNotacao.simbolos ?? []) {
      expect(tecla.nome.length, tecla.rotulo).toBeGreaterThan(2);
    }
  });
});

/**
 * Ler vira conta.
 *
 * Quem entende o somatório chega a 30; quem não entende, não chega. É por isso
 * que a leitura é cobrada pelo valor e não pela tradução em palavras — não há
 * como acertar por eliminação.
 */
describe('ler notação', () => {
  it('o somatório é a soma de todas as parcelas', () => {
    const rng = criarRng(1);
    const exercicio = Array.from({ length: 80 }, () => geradorNotacao.gerar('medio', rng)).find(
      (e) => e.enunciadoTex.includes('\\sum'),
    )!;

    // Cada parcela aparece na expansão, e a soma delas é o gabarito.
    expect(exercicio.resolucao.passos.length).toBeGreaterThanOrEqual(3);
    expect(exercicio.gabarito.valor).not.toBeNull();
    expect(responder(exercicio, String(exercicio.gabarito.valor)).veredito).toBe('correto');
  });

  it('responder só o último termo do somatório é diagnosticado', () => {
    const rng = criarRng(2);
    const exercicio = Array.from({ length: 80 }, () => geradorNotacao.gerar('medio', rng)).find(
      (e) =>
        e.enunciadoTex.includes('\\sum') &&
        e.armadilhas.some((a) => a.diagnostico.includes('ÚLTIMO')),
    )!;
    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('ÚLTIMO'))!;

    const validacao = responder(exercicio, armadilha.resposta.exibida);

    expect(validacao.veredito).toBe('incorreto');
    expect(validacao.diagnostico).toContain('onde a soma para');
  });

  it('a leitura sempre pede um número', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of leituras(nivel)) {
        expect(exercicio.gabarito.valor, exercicio.enunciado).not.toBeNull();
      }
    }
  });

  it('a leitura mostra a notação, que é o que se está lendo', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of leituras(nivel)) {
        expect(exercicio.enunciadoTex, exercicio.enunciado).not.toBe(SEM_FORMULA);
      }
    }
  });
});

/**
 * Escrever é a mão que revela se a leitura é real.
 *
 * Reconhecer ∀ numa página é fácil; decidir que a frase pede ∀, ∈ e ≥, nessa
 * ordem, exige saber o que cada símbolo faz.
 */
describe('escrever notação', () => {
  it('a escrita não mostra a notação — ela é a resposta', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of escritas(nivel)) {
        expect(exercicio.enunciadoTex, exercicio.enunciado).toBe(SEM_FORMULA);
        expect(exercicio.enunciado).toContain('Escreva em símbolos');
      }
    }
  });

  it('aceita LaTeX, símbolo e atalho ASCII como a mesma resposta', () => {
    const exercicio = escritas('medio').find((e) => e.gabarito.exibida.includes('∀'))!;

    // As três escritas abaixo dizem a mesma coisa; cobrar a digitação em vez
    // do conteúdo reprovaria quem entendeu.
    const comSimbolos = exercicio.gabarito.exibida;
    const comLatex = comSimbolos
      .replace(/∀/g, '\\forall ')
      .replace(/∈/g, ' \\in ')
      .replace(/ℝ/g, '\\mathbb{R}')
      .replace(/ℕ/g, '\\mathbb{N}')
      .replace(/ℤ/g, '\\mathbb{Z}')
      .replace(/≥/g, '\\geq ')
      .replace(/≠/g, '\\neq ');

    expect(responder(exercicio, comSimbolos).veredito).toBe('correto');
    expect(responder(exercicio, comLatex).veredito, comLatex).toBe('correto');
  });

  it('o espaçamento não muda a resposta', () => {
    const exercicio = escritas('facil').find((e) => e.gabarito.exibida.includes('∈'))!;
    const apertado = exercicio.gabarito.exibida.replace(/\s+/g, '');

    expect(responder(exercicio, apertado).veredito).toBe('correto');
  });

  it('dois-pontos vale por vírgula no quantificador', () => {
    const exercicio = escritas('medio').find((e) => e.gabarito.exibida.includes('∀'))!;

    expect(responder(exercicio, exercicio.gabarito.exibida.replace(',', ':')).veredito).toBe(
      'correto',
    );
  });

  it('trocar ∀ por ∃ é erro, e o diagnóstico diz por quê', () => {
    const exercicio = escritas('medio').find((e) => e.gabarito.exibida.startsWith('∀'))!;

    const validacao = responder(exercicio, exercicio.gabarito.exibida.replace('∀', '∃'));

    expect(validacao.veredito).toBe('incorreto');
    expect(validacao.diagnostico).toContain('existe');
  });

  it('o enunciado diz em palavras tudo o que a resposta precisa', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of escritas(nivel)) {
        expect(exercicio.enunciado.length, exercicio.enunciado).toBeGreaterThan(30);
        expect(exercicio.enunciado.split(/\s+/).length).toBeGreaterThan(5);
      }
    }
  });
});

describe('geradorNotacao: a caixa da letra', () => {
  /** Um exercício de escrever em símbolos, com intervalo fechado. */
  function doIntervalo() {
    for (let s = 0; s < 300; s++) {
      for (const nivel of NIVEIS) {
        const exercicio = geradorNotacao.gerar(nivel, criarRng(s));
        if (geradorNotacao.formatar(exercicio.gabarito).includes('∈ [')) {
          return exercicio;
        }
      }
    }
    throw new Error('nenhum exercício de intervalo fechado foi sorteado');
  }

  it('o xis maiúsculo é aceito, como o minúsculo', () => {
    // Relato do aluno: escreveu `X∈[-3,2]` e foi reprovado com o recado
    // «a resposta correta é x ∈ [-3, 2]» — a mesma notação.
    const exercicio = doIntervalo();
    const certo = geradorNotacao.formatar(exercicio.gabarito);

    for (const escrita of [
      certo,
      certo.replace(/\s+/g, ''),
      certo.toUpperCase(),
      certo.replace(/\s+/g, '').replace('x', 'X'),
    ]) {
      expect(corrigir(geradorNotacao, exercicio, escrita).veredito, escrita).toBe('correto');
    }
  });

  it('e a resposta continua aparecendo como o aluno a escreveu', () => {
    const exercicio = doIntervalo();
    const validacao = corrigir(geradorNotacao, exercicio, 'X ∈ [-3, 2]');

    expect(validacao.veredito === 'correto' || validacao.veredito === 'incorreto').toBe(true);
  });
});

describe('geradorNotacao: o que o teclado do campo produz', () => {
  /** Um exercício de assinatura de função. */
  function daFuncao() {
    for (let s = 0; s < 400; s++) {
      for (const nivel of NIVEIS) {
        const exercicio = geradorNotacao.gerar(nivel, criarRng(s));
        if (geradorNotacao.formatar(exercicio.gabarito).startsWith('f:')) {
          return exercicio;
        }
      }
    }
    throw new Error('nenhuma assinatura de função foi sorteada');
  }

  it('a tecla f(x) escreve uma assinatura que vale', () => {
    // Relato do aluno: respondeu a assinatura e levou «não é isso». A tecla
    // que o campo oferece para função é `f(x)`, e era ela que não passava.
    const exercicio = daFuncao();
    const certo = geradorNotacao.formatar(exercicio.gabarito);

    for (const escrita of [
      certo,
      certo.replace('f:', 'f(x):'),
      certo.replace('f:', 'f(x) :').replace(/\s+/g, ''),
      certo.replace(/→/, '->'),
      certo.replace('ℕ', 'N').replace('ℤ', 'Z').replace('ℝ', 'R'),
    ]) {
      expect(corrigir(geradorNotacao, exercicio, escrita).veredito, escrita).toBe('correto');
    }
  });

  it('e a assinatura ao contrário continua errada', () => {
    const exercicio = daFuncao();
    const certo = geradorNotacao.formatar(exercicio.gabarito);
    const [, entrada, saida] = /f:\s*(\S+)\s*→\s*(\S+)/.exec(certo)!;

    if (entrada === saida) {
      return; // ℕ → ℕ é simétrico: não há «ao contrário».
    }

    expect(corrigir(geradorNotacao, exercicio, `f: ${saida} → ${entrada}`).veredito).toBe(
      'incorreto',
    );
  });
});

/** O normalizador é quem decide se a correção cobra conteúdo ou digitação. */
describe('canonizarNotacao', () => {
  it('reduz LaTeX e símbolo à mesma forma', () => {
    expect(canonizarNotacao('\\forall x \\in \\mathbb{R}, x^{2} \\geq 0')).toBe(
      canonizarNotacao('∀x ∈ ℝ, x² ≥ 0'),
    );
  });

  it('entende os atalhos de teclado', () => {
    expect(canonizarNotacao('x >= 2')).toBe(canonizarNotacao('x ≥ 2'));
    expect(canonizarNotacao('x <= 2')).toBe(canonizarNotacao('x ≤ 2'));
    expect(canonizarNotacao('x != 2')).toBe(canonizarNotacao('x ≠ 2'));
    expect(canonizarNotacao('f: R -> R')).toBe(canonizarNotacao('f: ℝ → ℝ'));
  });

  it('R solto depois de ∈ é o conjunto dos reais', () => {
    expect(canonizarNotacao('x ∈ R')).toBe(canonizarNotacao('x ∈ ℝ'));
    expect(canonizarNotacao('n ∈ N')).toBe(canonizarNotacao('n ∈ ℕ'));
  });

  it('mas R em outro lugar continua sendo uma letra', () => {
    // Não dá para trocar todo R: numa fórmula de física, R é resistência.
    expect(canonizarNotacao('R = 10')).toBe('r=10');
    expect(canonizarNotacao('R = 10')).not.toContain('ℝ');
  });

  it('não confunde símbolos que começam igual', () => {
    // `\\Leftrightarrow` tem de ser trocado antes de `\\leq`.
    expect(canonizarNotacao('a \\Leftrightarrow b')).toBe('a⇔b');
    expect(canonizarNotacao('a \\leq b')).toBe('a≤b');
  });

  it('o espaçamento de LaTeX não muda nada', () => {
    expect(canonizarNotacao('\\sum_{k=1}^{n}\\, k^2')).toBe(canonizarNotacao('∑_{k=1}^{n} k²'));
  });

  it('ponto final não conta', () => {
    expect(canonizarNotacao('A ⊂ B.')).toBe('a⊂b');
  });

  it('a caixa da letra não reprova quem acertou a notação', () => {
    // Quem escreve `X ∈ [-3, 2]` acertou o símbolo, que é o que se cobra aqui.
    expect(canonizarNotacao('X ∈ [-3, 2]')).toBe(canonizarNotacao('x ∈ [-3, 2]'));
    expect(canonizarNotacao('A ⊂ B')).toBe(canonizarNotacao('a ⊂ b'));
    expect(canonizarNotacao('∀X ∈ ℝ, X² ≥ 0')).toBe(canonizarNotacao('∀x ∈ ℝ, x² ≥ 0'));
  });

  it('o LaTeX é lido antes de a caixa cair', () => {
    // `\\Rightarrow` e `\\rightarrow` são comandos diferentes: baixar a caixa
    // antes de traduzi-los juntaria os dois no mesmo símbolo.
    expect(canonizarNotacao('p \\Rightarrow q')).not.toBe(canonizarNotacao('p \\rightarrow q'));
    expect(canonizarNotacao('x \\in \\mathbb{R}')).toBe(canonizarNotacao('x ∈ ℝ'));
  });

  it('o conjunto escrito em minúscula depois de ∈ também vale', () => {
    expect(canonizarNotacao('x ∈ r')).toBe(canonizarNotacao('x ∈ ℝ'));
    expect(canonizarNotacao('n ∈ n')).toBe(canonizarNotacao('n ∈ ℕ'));
  });
});
