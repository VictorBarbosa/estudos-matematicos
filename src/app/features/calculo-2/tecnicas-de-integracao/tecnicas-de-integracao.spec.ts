import { integralNumerica } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorTecnicas } from '@features/calculo-2/tecnicas-de-integracao/tecnicas-de-integracao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(8686);
  return Array.from({ length: quantidade }, () => geradorTecnicas.gerar(nivel, rng));
}

describe('geradorTecnicas', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          // A régua é a tolerância da correção: uma armadilha que o gerador
          // considera equivalente ao gabarito diagnosticaria quem acertou.
          expect(geradorTecnicas.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
        }
      }
    });
  }

  it('o gabarito da substituição confere com a integração numérica', () => {
    // Pelo id, e não pelo texto: «Resolva por substituição trigonométrica»
    // também contém «substituição», e é outra técnica, com outro integrando.
    // Pelo id, e não pelo texto: «Resolva por substituição trigonométrica»
    // também contém «substituição», e é outra técnica, com outro integrando. A
    // substituição direta é a única cujo id traz o coeficiente logo depois do
    // prefixo; as outras três trazem um nome.
    const porSubstituicao = amostra('medio', 90).filter((e) => /^tecnicas-\d/.test(e.id));

    expect(porSubstituicao.length).toBeGreaterThan(5);

    for (const exercicio of porSubstituicao) {
      const [, aTexto, sinal, bTexto, nTexto] =
        /\\left\((\d*)x ([+-]) (\d+)\\right\)\^\{(\d+)\}/.exec(exercicio.enunciadoTex)!;
      const [, ate] = /\\int_\{0\}\^\{(\d+)\}/.exec(exercicio.enunciadoTex)!;

      const a = aTexto === '' ? 1 : Number(aTexto);
      const b = sinal === '+' ? Number(bTexto) : -Number(bTexto);
      const n = Number(nTexto);

      const numerica = integralNumerica((x) => (a * x + b) ** n, 0, Number(ate));
      expect(exercicio.gabarito).toBeCloseTo(numerica, 4);
    }
  });

  it('diagnostica quem esquece o fator da substituição', () => {
    const exercicio = amostra('facil', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('coeficiente interno')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('coeficiente interno'),
    )!;

    const resultado = corrigir(geradorTecnicas, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('tecnicas.substituicao');
  });

  it('diagnostica quem mantém o expoente ao integrar', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('AUMENTAR em um')),
    )!;

    expect(exercicio).toBeDefined();
  });

  it('a integração por partes confere com a integração numérica', () => {
    const porPartes = amostra('dificil', 120).filter((e) => e.enunciado.includes('por partes'));

    expect(porPartes.length).toBeGreaterThan(5);

    for (const exercicio of porPartes) {
      const [, limite, coeficiente] = /\\int_\{1\}\^\{(\d+)\} (\d*)x\\ln x/.exec(
        exercicio.enunciadoTex,
      )!;
      const c = coeficiente === '' ? 1 : Number(coeficiente);

      const numerica = integralNumerica((x) => c * x * Math.log(x), 1, Number(limite), 4000);
      expect(exercicio.gabarito).toBeCloseTo(numerica, 4);
    }
  });

  it('as frações parciais conferem com a integração numérica', () => {
    const parciais = amostra('dificil', 120).filter((e) =>
      e.enunciado.includes('frações parciais'),
    );

    expect(parciais.length).toBeGreaterThan(5);

    for (const exercicio of parciais) {
      const [, ate, p, sinal, q, m, n] =
        /\\int_\{0\}\^\{(\d+)\} \\frac\{(\d*)x ([+-]) (\d+)\}\{\(x \+ (\d+)\)\(x \+ (\d+)\)\}/.exec(
          exercicio.enunciadoTex,
        )!;

      const coefP = p === '' ? 1 : Number(p);
      const coefQ = (sinal === '-' ? -1 : 1) * Number(q);

      const numerica = integralNumerica(
        (x) => (coefP * x + coefQ) / ((x + Number(m)) * (x + Number(n))),
        0,
        Number(ate),
        4000,
      );
      expect(exercicio.gabarito).toBeCloseTo(numerica, 4);
    }
  });

  it('as três técnicas aparecem nos níveis mais altos', () => {
    const enunciados = amostra('dificil', 200).map((e) => e.enunciado);

    expect(enunciados.some((e) => e.includes('substituição'))).toBe(true);
    expect(enunciados.some((e) => e.includes('por partes'))).toBe(true);
    expect(enunciados.some((e) => e.includes('frações parciais'))).toBe(true);
  });
});

/**
 * Substituição trigonométrica, a técnica que faltava no tópico.
 *
 * `√(a² − x²)` e `a² + x²` não cedem às outras três, e a avaliação do site a
 * listava como ausente desde que a trigonometria inversa entrou — que é a
 * dependência dela, porque a resposta volta por arcsen ou arctg.
 *
 * O gabarito é conferido por integração numérica do próprio integrando lido do
 * enunciado: se a primitiva estiver errada, a conta direta não bate.
 */
describe('geradorTecnicas: substituição trigonométrica', () => {
  const trigonometricas = NIVEIS.flatMap((nivel) =>
    amostra(nivel, 120).filter((e) => e.id.includes('tecnicas-trig')),
  );

  it('aparece do Médio em diante', () => {
    expect(trigonometricas.length).toBeGreaterThan(20);
    expect(amostra('facil', 120).some((e) => e.id.includes('tecnicas-trig'))).toBe(false);
  });

  it('o gabarito confere com a integral numérica do integrando', () => {
    for (const exercicio of trigonometricas) {
      const comRaiz = exercicio.id.includes('-sen-');
      const [, quadrado, ate] = /\{(\d+) - x|\{(\d+) \+ x/.exec(exercicio.enunciadoTex)
        ? [null, null, null]
        : [null, null, null];
      void quadrado;
      void ate;

      // Os números saem do próprio TeX: o limite superior e o a².
      const limite = Number(/\\int_\{0\}\^\{(\d+)\}/.exec(exercicio.enunciadoTex)![1]);
      const aQuadrado = Number(/\{(\d+) [-+] x\^\{2\}\}/.exec(exercicio.enunciadoTex)![1]);

      const integrando = comRaiz
        ? (x: number): number => Math.sqrt(aQuadrado - x * x)
        : (x: number): number => 1 / (aQuadrado + x * x);

      const direto = integralNumerica(integrando, 0, limite);

      expect(Math.abs(direto - exercicio.gabarito), exercicio.enunciadoTex).toBeLessThan(1e-3);
    }
  });

  it('a raiz nunca fica negativa: o limite respeita a', () => {
    for (const exercicio of trigonometricas.filter((e) => e.id.includes('-sen-'))) {
      const limite = Number(/\\int_\{0\}\^\{(\d+)\}/.exec(exercicio.enunciadoTex)![1]);
      const aQuadrado = Number(/\{(\d+) - x\^\{2\}\}/.exec(exercicio.enunciadoTex)![1]);

      expect(limite * limite).toBeLessThanOrEqual(aQuadrado);
    }
  });

  /**
   * O erro clássico de cada caso é diagnosticado.
   *
   * Na raiz, responder só a parcela do arco; na soma de quadrados, esquecer o
   * fator 1/a que vem da troca. São os dois desvios que um aluno comete depois
   * de entender a técnica — e por isso merecem nome, não «não é isso».
   */
  it('diagnostica o fator 1/a esquecido', () => {
    const comTangente = trigonometricas.find((e) => e.id.includes('-tg-'))!;
    const armadilha = comTangente.armadilhas.find((a) => a.diagnostico.includes('fator 1/a'));

    expect(armadilha, comTangente.enunciadoTex).toBeDefined();

    const resultado = corrigir(
      geradorTecnicas,
      comTangente,
      armadilha!.resposta.toFixed(2).replace('.', ','),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('1/a');
  });

  it('as duas trocas aparecem', () => {
    expect(trigonometricas.some((e) => e.id.includes('-sen-'))).toBe(true);
    expect(trigonometricas.some((e) => e.id.includes('-tg-'))).toBe(true);
  });
});
