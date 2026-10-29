import { Fracao, mdc, resolverComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { CONCEITO_DA_OPERACAO, geradorFracoes } from '@features/matematica-basica/fracoes/fracoes.gerador';

/** Gera uma amostra de exercícios de um nível, de forma determinística. */
function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2024);
  return Array.from({ length: quantidade }, () => geradorFracoes.gerar(nivel, rng));
}

/**
 * O tópico tem dois tipos de exercício: operar duas frações e converter um
 * decimal em fração. O segundo não tem dois operandos nem operação, então as
 * travas que falam de denominadores só valem para o primeiro.
 */
function ehConversao(exercicio: { readonly conceitos: readonly string[] }): boolean {
  return exercicio.conceitos.includes('fracoes.decimais');
}

/** Só os exercícios de operação entre duas frações. */
function operacoes(nivel: Nivel, quantidade = 60) {
  return amostra(nivel, quantidade).filter((exercicio) => !ehConversao(exercicio));
}

describe('determinismo', () => {
  it('a mesma semente produz o mesmo exercício', () => {
    const primeiro = geradorFracoes.gerar('medio', criarRng(7));
    const segundo = geradorFracoes.gerar('medio', criarRng(7));

    expect(primeiro.enunciadoTex).toBe(segundo.enunciadoTex);
    expect(primeiro.gabarito.toString()).toBe(segundo.gabarito.toString());
  });
});

describe('consistência dos exercícios', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere com o motor matemático`, () => {
      for (const exercicio of amostra(nivel)) {
        const esperado = exercicio.resolucao.resultado;
        expect(exercicio.gabarito.igualA(esperado)).toBe(true);
      }
    });

    it(`no nível ${nivel}, todo exercício tem enunciado, conceitos e resolução`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.enunciadoTex).toContain('=');
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
        // A conversão se resolve em dois passos: ler as casas e simplificar.
        expect(exercicio.resolucao.passos.length).toBeGreaterThanOrEqual(
          ehConversao(exercicio) ? 2 : 3,
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta.igualA(exercicio.gabarito)).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }
});

describe('calibração dos níveis', () => {
  it('no fácil, um denominador é múltiplo do outro e o resultado não é negativo', () => {
    for (const exercicio of operacoes('facil')) {
      const [, esquerda, direita] = /\\frac\{-?\d+\}\{(\d+)\}.*\\frac\{-?\d+\}\{(\d+)\}/.exec(
        exercicio.enunciadoTex,
      ) ?? [undefined, undefined, undefined];

      const d1 = Number(esquerda);
      const d2 = Number(direita);
      expect(Math.max(d1, d2) % Math.min(d1, d2)).toBe(0);
      expect(exercicio.gabarito.ehNegativa).toBe(false);
    }
  });

  it('no médio, os denominadores são coprimos, exigindo o cálculo real do MMC', () => {
    for (const exercicio of operacoes('medio')) {
      const encontrados = [...exercicio.enunciadoTex.matchAll(/\\frac\{-?\d+\}\{(\d+)\}/g)].map(
        (encontro) => Number(encontro[1]),
      );

      expect(encontrados.length).toBe(2);
      expect(mdc(encontrados[0]!, encontrados[1]!)).toBe(1);
    }
  });

  it('no difícil, a divisão nunca aparece com divisor zero', () => {
    // Se algum divisor fosse zero, `gerar` teria lançado ao resolver.
    expect(() => amostra('dificil', 200)).not.toThrow();
  });
});

describe('correção das respostas', () => {
  const exercicio = geradorFracoes.gerar('facil', criarRng(11));

  it('aceita a resposta correta', () => {
    const resultado = corrigir(geradorFracoes, exercicio, exercicio.gabarito.toString());
    expect(resultado.veredito).toBe('correto');
  });

  it('aceita uma forma equivalente não simplificada', () => {
    const gabarito = exercicio.gabarito;
    const equivalente = Fracao.criar(gabarito.numerador * 3, gabarito.denominador * 3);

    const resultado = corrigir(geradorFracoes, exercicio, equivalente.toString());
    expect(resultado.veredito).toBe('correto');
  });

  it('aceita a forma decimal quando ela é exata', () => {
    const resultado = corrigir(
      geradorFracoes,
      { ...exercicio, gabarito: Fracao.criar(1, 2) },
      '0,5',
    );
    expect(resultado.veredito).toBe('correto');
  });

  it('marca como inválido o que não é uma fração', () => {
    const resultado = corrigir(geradorFracoes, exercicio, 'não sei');
    expect(resultado.veredito).toBe('invalido');
  });

  it('diagnostica o erro de somar numeradores e denominadores', () => {
    // 1/4 + 1/6: quem soma os dois termos chega a 2/10.
    const a = Fracao.criar(1, 4);
    const b = Fracao.criar(1, 6);
    const resolucao = resolverComPassos(a, 'somar', b);

    const comArmadilha = {
      ...geradorFracoes.gerar('facil', criarRng(3)),
      gabarito: resolucao.resultado,
      resolucao,
      armadilhas: [
        {
          resposta: Fracao.criar(2, 10),
          diagnostico: 'Somou numeradores com numeradores e denominadores com denominadores.',
          conceito: 'fracoes.operacoes',
          passo: 3,
        },
      ],
    };

    const resultado = corrigir(geradorFracoes, comArmadilha, '2/10');
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('denominadores');
    expect(resultado.conceitoAssociado).toBe('fracoes.operacoes');
    expect(resultado.passoDivergente).toBe(3);
  });

  it('informa o gabarito quando o erro não é um dos previstos', () => {
    const resultado = corrigir(geradorFracoes, exercicio, '999/1000');
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.mensagem).toContain(exercicio.gabarito.toString());
  });
});

describe('cobertura das quatro operações', () => {
  /** A operação de um exercício, lida pelo conceito que ele declara. */
  function operacaoDe(conceitos: readonly string[]): string | undefined {
    return Object.entries(CONCEITO_DA_OPERACAO).find(([, conceito]) =>
      conceitos.includes(conceito),
    )?.[0];
  }

  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, as quatro operações aparecem`, () => {
      // A etapa exige cinco acertos em cada operação; se a divisão só
      // existisse no Difícil, cumprir a exigência obrigaria a trocar de nível.
      const vistas = new Set(operacoes(nivel, 200).map((e) => operacaoDe(e.conceitos)));

      expect([...vistas].sort()).toEqual(['dividir', 'multiplicar', 'somar', 'subtrair']);
    });

    it(`no nível ${nivel}, todo exercício declara exatamente uma operação`, () => {
      for (const exercicio of operacoes(nivel)) {
        const declaradas = Object.values(CONCEITO_DA_OPERACAO).filter((conceito) =>
          exercicio.conceitos.includes(conceito),
        );

        expect(declaradas.length).toBe(1);
        // O conceito da operação vem primeiro: é ele que a progressão conta.
        expect(exercicio.conceitos[0]).toBe(declaradas[0]);
      }
    });
  }
});

describe('números mistos e negativos', () => {
  /** Lê os dois operandos do enunciado, aceitando a forma mista. */
  function operandos(tex: string): readonly string[] {
    return tex
      .replace(' = \\;?', '')
      .split(/ [+\-] | \\times | \\div /)
      .map((parte) => parte.trim().replace(/^\\left\(|\\right\)$/g, ''));
  }

  /** O enunciado traz algum operando negativo? */
  function temOperandoNegativo(tex: string): boolean {
    return operandos(tex).some((operando) => operando.startsWith('-'));
  }

  it('o nível fácil não traz negativos nem mistos', () => {
    for (const exercicio of amostra('facil', 150)) {
      // O "−" da subtração não conta: o que não pode é operando negativo.
      expect(temOperandoNegativo(exercicio.enunciadoTex), exercicio.enunciadoTex).toBe(false);
      expect(exercicio.enunciado).not.toContain('mistos');
      expect(exercicio.gabarito.ehNegativa).toBe(false);
    }
  });

  for (const nivel of ['medio', 'dificil'] as const) {
    it(`no nível ${nivel}, aparecem números mistos no enunciado`, () => {
      const comMista = amostra(nivel, 200).filter((e) => e.enunciado.includes('mistos'));

      expect(comMista.length).toBeGreaterThan(10);

      for (const exercicio of comMista) {
        // Misto é parte inteira grudada na fração: `2\frac{1}{3}`.
        expect(exercicio.enunciadoTex).toMatch(/\d\\frac\{/);
      }
    });

    it(`no nível ${nivel}, aparecem frações negativas`, () => {
      const negativos = amostra(nivel, 200).filter((e) => temOperandoNegativo(e.enunciadoTex));

      expect(negativos.length).toBeGreaterThan(5);
    });

    it(`no nível ${nivel}, operando negativo vem entre parênteses`, () => {
      // "3/4 − −2/3" tem dois sinais colados; com parênteses, lê-se.
      for (const exercicio of amostra(nivel, 200)) {
        expect(exercicio.enunciadoTex, exercicio.enunciadoTex).not.toMatch(/[+\-] -/);
        expect(exercicio.enunciadoTex).not.toMatch(/times -|div -/);
      }
    });
  }

  it('o misto negativo tem o sinal no número inteiro', () => {
    const comNegativo = amostra('dificil', 300)
      .filter((e) => e.enunciado.includes('mistos'))
      .filter((e) => temOperandoNegativo(e.enunciadoTex));

    expect(comNegativo.length).toBeGreaterThan(0);

    for (const exercicio of comNegativo) {
      // `-2\frac{1}{3}` é −7/3, nunca −2 + 1/3: o sinal antecede o inteiro.
      const negativo = operandos(exercicio.enunciadoTex).find((o) => o.startsWith('-'))!;
      expect(negativo, exercicio.enunciadoTex).toMatch(
        /^-(\d+)?\\frac\{\d+\}\{\d+\}$|^-\d+$/,
      );
    }
  });

  it('o resultado impróprio é exibido como misto, e o campo o aceita de volta', () => {
    const impróprios = amostra('dificil', 200).filter((e) => e.gabarito.simplificar().ehImpropria);

    expect(impróprios.length).toBeGreaterThan(5);

    for (const exercicio of impróprios) {
      const exibido = geradorFracoes.formatar(exercicio.gabarito);
      expect(corrigir(geradorFracoes, exercicio, exibido).veredito).toBe('correto');
    }
  });

  it('aceita a resposta escrita como misto, como fração ou simplificada', () => {
    const exercicio = amostra('dificil', 200).find((e) =>
      e.gabarito.simplificar().ehImpropria,
    )!;
    const gabarito = exercicio.gabarito.simplificar();

    for (const forma of [gabarito.toString(), gabarito.toStringMisto()]) {
      expect(corrigir(geradorFracoes, exercicio, forma).veredito, forma).toBe('correto');
    }
  });
});

describe('conversão de decimal em fração', () => {
  /** Só os exercícios de conversão. */
  function conversoes(nivel: Nivel, quantidade = 300) {
    return amostra(nivel, quantidade).filter(ehConversao);
  }

  /** O decimal que o enunciado mostra. */
  function decimalDe(tex: string): number {
    return Number(tex.replace(' = \\;?', '').replace('{,}', '.'));
  }

  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, a conversão aparece no sorteio`, () => {
      expect(conversoes(nivel).length).toBeGreaterThan(10);
    });

    it(`no nível ${nivel}, o gabarito é o decimal em forma irredutível`, () => {
      for (const exercicio of conversoes(nivel)) {
        const decimal = decimalDe(exercicio.enunciadoTex);

        expect(Number.isNaN(decimal), exercicio.enunciadoTex).toBe(false);
        expect(exercicio.gabarito.paraDecimal()).toBeCloseTo(decimal, 9);
        expect(exercicio.gabarito.estaSimplificada, exercicio.gabarito.toString()).toBe(true);
      }
    });
  }

  it('aceita a fração, nas formas equivalentes', () => {
    const exercicio = conversoes('facil').find((e) => !e.gabarito.ehInteira)!;
    const gabarito = exercicio.gabarito;

    expect(corrigir(geradorFracoes, exercicio, gabarito.toString()).veredito).toBe('correto');

    // Equivalente não simplificada também vale: a correção é por valor.
    const dobrada = Fracao.criar(gabarito.numerador * 2, gabarito.denominador * 2);
    expect(corrigir(geradorFracoes, exercicio, dobrada.toString()).veredito).toBe('correto');
  });

  it('devolver o próprio decimal não conta como resposta', () => {
    // O valor está certo, mas a pergunta é pela FORMA: aceitar 0,75 deixaria o
    // aluno repetir o enunciado.
    for (const exercicio of conversoes('medio', 200).slice(0, 20)) {
      const decimal = decimalDe(exercicio.enunciadoTex);
      const comVirgula = String(decimal).replace('.', ',');

      for (const forma of [String(decimal), comVirgula]) {
        const resultado = corrigir(geradorFracoes, exercicio, forma);

        expect(resultado.veredito, forma).toBe('invalido');
        expect(resultado.mensagem).toContain('fração');
      }
    }
  });

  it('o decimal só é recusado onde a forma é a pergunta', () => {
    // Num exercício de operação, 0,75 continua sendo uma resposta legítima.
    const exercicio = operacoes('facil').find((e) => e.gabarito.igualA(Fracao.criar(3, 4)));

    if (exercicio !== undefined) {
      expect(corrigir(geradorFracoes, exercicio, '0,75').veredito).toBe('correto');
    }

    expect(operacoes('facil').every((e) => e.exigeFracao !== true)).toBe(true);
  });

  it('a forma não simplificada é aceita, porque a correção é por valor', () => {
    // 0,75 = 75/100 é uma resposta certa; o enunciado por isso não promete
    // cobrar a forma irredutível.
    const exercicio = conversoes('medio').find((e) => !e.gabarito.ehInteira)!;
    const decimal = decimalDe(exercicio.enunciadoTex);
    const casas = String(Math.abs(decimal)).split('.')[1]?.length ?? 0;
    const potencia = 10 ** casas;

    const semSimplificar = `${Math.round(decimal * potencia)}/${potencia}`;
    expect(corrigir(geradorFracoes, exercicio, semSimplificar).veredito).toBe('correto');
  });

  it('diagnostica quem usa 10 como denominador seja qual for a casa', () => {
    const exercicio = conversoes('medio', 400).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('número de CASAS')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('número de CASAS'),
    )!;

    const resultado = corrigir(geradorFracoes, exercicio, armadilha.resposta.toString());

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('fracoes.decimais');
  });

  it('o nível difícil traz decimais negativos e com parte inteira', () => {
    const difíceis = conversoes('dificil', 400);

    expect(difíceis.some((e) => e.gabarito.ehNegativa)).toBe(true);
    expect(difíceis.some((e) => Math.abs(e.gabarito.paraDecimal()) > 1)).toBe(true);
  });

  it('a conversão não entra na exigência das quatro operações', () => {
    // A etapa pede cinco acertos por operação; a conversão é outro assunto e
    // não pode diluir essa contagem.
    for (const exercicio of conversoes('dificil', 200)) {
      for (const conceito of Object.values(CONCEITO_DA_OPERACAO)) {
        expect(exercicio.conceitos).not.toContain(conceito);
      }
    }
  });
});
