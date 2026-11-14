import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  nivelAoMenos,
  semColisoes,
} from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  DICA_FRACOES_PARCIAIS,
  DICA_POR_PARTES,
  DICA_SENO,
  DICA_SUBSTITUICAO,
  DICA_TANGENTE,
  FRACOES_PARCIAIS,
  POR_PARTES,
  SUBSTITUICAO,
  SUBSTITUICAO_TRIGONOMETRICA,
} from '@features/calculo-2/tecnicas-de-integracao/tecnicas-de-integracao.textos';

const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-6);

/**
 * Teto do gabarito, para que ele continue digitável.
 *
 * A primitiva de (ax+b)^n cresce como uma potência: com a = 12, n = 6 e x até
 * 6 o resultado passava de 2×10¹¹, e o enunciado ainda pedia 2 casas
 * decimais. O limite superior da integral é escolhido para respeitar este
 * teto.
 */
const MAIOR_GABARITO = 1e5;

type Pergunta = 'substituicao' | 'por-partes' | 'fracoes-parciais' | 'trigonometrica';

/**
 * Exercícios das três técnicas de integração do 0M03.
 *
 * Antes só havia substituição — por partes e frações parciais apareciam apenas
 * na teoria, embora a descrição do tópico prometesse as três. A armadilha
 * central da substituição é esquecer de dividir pelo coeficiente interno, o
 * espelho exato do erro clássico da regra da cadeia.
 */
export const geradorTecnicas: GeradorExercicio<number> = {
  topicoId: 'tecnicas-de-integracao',
  formatoResposta: 'um número, ex.: 10,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    if (pergunta === 'por-partes') {
      return exercicioPorPartes(nivel, rng);
    }

    if (pergunta === 'fracoes-parciais') {
      return exercicioFracoesParciais(nivel, rng);
    }

    if (pergunta === 'trigonometrica') {
      return exercicioTrigonometrica(nivel, rng);
    }

    const a = rng.inteiro(2, nivel === 'facil' ? 6 : 9);
    const b = rng.inteiro(-9, 9);
    const n = rng.inteiro(2, nivelAoMenos(nivel, 'dificil') ? 5 : 4);

    const textoSubstituicao = enunciadoTrilingue(SUBSTITUICAO, [], DICA_SUBSTITUICAO);
    const de = 0;
    // |ax+b| no topo do intervalo não pode estourar o teto do gabarito.
    const maiorInterno = (MAIOR_GABARITO * a * (n + 1)) ** (1 / (n + 1));
    const maiorAte = Math.floor((maiorInterno - Math.abs(b)) / a);
    const ate = rng.inteiro(1, Math.min(6, Math.max(1, maiorAte)));

    // ∫(ax+b)^n dx = (ax+b)^(n+1) / (a(n+1))
    const primitiva = (x: number): number => (a * x + b) ** (n + 1) / (a * (n + 1));
    const gabarito = primitiva(ate) - primitiva(de);

    // Erro clássico: esquecer de dividir pelo coeficiente interno.
    const semDividir = ((a * ate + b) ** (n + 1) - (a * de + b) ** (n + 1)) / (n + 1);

    const internoTex = `${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;

    return {
      id: `tecnicas-${a}${b}${n}-${de}${ate}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: textoSubstituicao.enunciado,
      traducoes: textoSubstituicao.traducoes,
      enunciadoTex: `\\int_{${de}}^{${ate}} \\left(${internoTex}\\right)^{${n}} dx`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Chamamos o miolo de u e calculamos du.',
            tex: `u = ${internoTex} \\qquad du = ${a}\\,dx \\;\\Rightarrow\\; dx = \\frac{du}{${a}}`,
          },
          {
            descricao: 'A integral vira uma potência simples.',
            tex: `\\frac{1}{${a}}\\int u^{${n}}\\,du = \\frac{1}{${a}} \\cdot \\frac{u^{${n + 1}}}{${n + 1}}`,
          },
          {
            descricao: 'Voltando à variável original.',
            tex: `\\frac{\\left(${internoTex}\\right)^{${n + 1}}}{${a * (n + 1)}}`,
            nota: 'O denominador traz o coeficiente interno — é ele que a substituição revela.',
          },
          {
            descricao: 'Avaliando nos limites.',
            tex: `${primitiva(ate).toFixed(4)} - ${primitiva(de).toFixed(4)} = ${gabarito.toFixed(4)}`,
          },
        ],
      },
      conceitos: ['tecnicas.substituicao', 'tecnicas.escolha'],
      armadilhas: semColisoes(
        [
          {
            resposta: semDividir,
            diagnostico:
              `Faltou dividir pelo coeficiente interno ${a}. Ao trocar dx por du, aparece um ` +
              `fator 1/${a} que precisa acompanhar toda a integral.`,
            passo: 1,
            conceito: 'tecnicas.substituicao',
          },
          {
            resposta: (a * ate + b) ** (n + 1) / (a * (n + 1)),
            diagnostico:
              'Faltou subtrair o valor no limite inferior. A integral definida continua ' +
              'sendo F(b) − F(a), mesmo depois da substituição.',
            passo: 3,
            conceito: 'tecnicas.substituicao',
          },
          {
            resposta: ((a * ate + b) ** n - (a * de + b) ** n) / (a * n),
            diagnostico:
              'O expoente deve AUMENTAR em um ao integrar. Aqui ele foi mantido, o que ' +
              'corresponderia a derivar.',
            passo: 1,
            conceito: 'tecnicas.substituicao',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: nivel === 'facil' ? textoSubstituicao.dica : undefined,
    };
  },

  analisar: analisarNumero,

  ...numeroComCasas(2, 1e-6),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return 'substituicao';
    case 'medio':
      return rng.escolher<Pergunta>([
        'substituicao',
        'por-partes',
        'fracoes-parciais',
        'trigonometrica',
      ]);
    case 'dificil':
      return rng.escolher<Pergunta>([
        'por-partes',
        'fracoes-parciais',
        'substituicao',
        'trigonometrica',
      ]);
    /*
     * As três técnicas que exigem montar antes de integrar: escolher u e dv,
     * decompor a fração, ou reconhecer qual troca trigonométrica a expressão
     * pede. Substituição direta sai de cena.
     */
    case 'extremo':
      return rng.escolher<Pergunta>(['por-partes', 'fracoes-parciais', 'trigonometrica']);
  }
}

/**
 * Integração por partes, no caso em que ela é a única saída: ∫x·ln x dx.
 *
 * Aqui não há substituição que resolva, e a escolha de u = ln x é a decisão
 * que o aluno precisa aprender a tomar.
 */
function exercicioPorPartes(nivel: Nivel, rng: Rng): Exercicio<number> {
  const ate = rng.inteiro(2, 8);
  const coeficiente = rng.inteiro(1, 4);
  const texto = enunciadoTrilingue(POR_PARTES, [], DICA_POR_PARTES);

  // ∫₁^k c·x·ln x dx = c·[x²/2·ln x − x²/4]₁^k
  const primitiva = (x: number): number =>
    coeficiente * (((x * x) / 2) * Math.log(x) - (x * x) / 4);
  const gabarito = primitiva(ate) - primitiva(1);

  const fator = coeficiente === 1 ? '' : String(coeficiente);

  return {
    id: `tecnicas-partes-${coeficiente}-${ate}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `\\int_{1}^{${ate}} ${fator}x\\ln x\\,dx`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Escolhemos u como a parte que SIMPLIFICA ao derivar.',
          tex: `u = \\ln x \\qquad dv = ${fator}x\\,dx`,
          nota: 'Derivar ln x dá 1/x, uma função mais simples; integrar ln x seria pior.',
        },
        {
          descricao: 'Daí vêm du e v.',
          tex: `du = \\frac{dx}{x} \\qquad v = \\frac{${fator}x^{2}}{2}`,
        },
        {
          descricao: 'Aplicamos a fórmula ∫u dv = uv − ∫v du.',
          tex:
            `\\frac{${fator}x^{2}}{2}\\ln x - \\int \\frac{${fator}x^{2}}{2} ` +
            '\\cdot \\frac{dx}{x}',
        },
        {
          descricao: 'A integral que sobrou é elementar.',
          tex:
            `\\int \\frac{${fator}x}{2}dx = \\frac{${fator}x^{2}}{4} \\quad ` +
            `\\Rightarrow \\quad F(x) = \\frac{${fator}x^{2}}{2}\\ln x - ` +
            `\\frac{${fator}x^{2}}{4}`,
        },
        {
          descricao: 'Avaliando nos limites (e ln 1 = 0).',
          tex: `F(${ate}) - F(1) = ${gabarito.toFixed(4)}`,
        },
      ],
    },
    conceitos: ['tecnicas.por-partes', 'tecnicas.escolha'],
    armadilhas: semColisoes(
      [
        {
          resposta: coeficiente * ((ate * ate) / 2) * Math.log(ate),
          diagnostico:
            'Você parou no uv e não subtraiu ∫v du. A fórmula tem os dois termos: ' + 'uv − ∫v du.',
          passo: 2,
          conceito: 'tecnicas.por-partes',
        },
        {
          resposta: primitiva(ate),
          diagnostico:
            'Faltou subtrair F(1). Mesmo com ln 1 = 0, o termo −x²/4 em x = 1 não é zero.',
          passo: 4,
          conceito: 'tecnicas.por-partes',
        },
        {
          resposta: coeficiente * (((ate * ate) / 2) * Math.log(ate) + (ate * ate) / 4),
          diagnostico: 'O sinal de ∫v du é NEGATIVO na fórmula de integração por partes.',
          passo: 2,
          conceito: 'tecnicas.por-partes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: !nivelAoMenos(nivel, 'dificil') ? texto.dica : undefined,
  };
}

/**
 * Frações parciais com dois fatores lineares distintos.
 *
 * Os fatores são (x + m) e (x + n) com m, n positivos, e a integral vai de 0
 * a um limite positivo: assim não há polo dentro do intervalo.
 */
function exercicioFracoesParciais(nivel: Nivel, rng: Rng): Exercicio<number> {
  const m = rng.inteiro(1, 4);
  const n = m + rng.inteiro(1, 4);
  const p = rng.inteiro(1, 5);
  const q = rng.inteiro(-6, 6);
  const ate = rng.inteiro(1, 5);
  const texto = enunciadoTrilingue(FRACOES_PARCIAIS, [m, n], DICA_FRACOES_PARCIAIS);

  // (px + q)/((x+m)(x+n)) = A/(x+m) + B/(x+n), avaliando em x = −m e x = −n.
  const A = (q - p * m) / (n - m);
  const B = (q - p * n) / (m - n);

  const gabarito = A * Math.log((ate + m) / m) + B * Math.log((ate + n) / n);

  const numeradorTex = `${p === 1 ? '' : p}x ${q >= 0 ? '+' : '-'} ${Math.abs(q)}`;
  const denominadorTex = `(x + ${m})(x + ${n})`;

  return {
    id: `tecnicas-parciais-${m}${n}${p}${q}-${ate}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: `\\int_{0}^{${ate}} \\frac{${numeradorTex}}{${denominadorTex}}\\,dx`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Não há regra para integrar um quociente: separamos em parcelas.',
          tex:
            `\\frac{${numeradorTex}}{${denominadorTex}} = \\frac{A}{x + ${m}} + ` +
            `\\frac{B}{x + ${n}}`,
        },
        {
          descricao: 'Multiplicamos tudo pelo denominador comum.',
          tex: `${numeradorTex} = A(x + ${n}) + B(x + ${m})`,
        },
        {
          descricao: `Em x = -${m} o termo de B morre, e sai A.`,
          tex: `${p * -m + q} = A(${n - m}) \\quad \\Rightarrow \\quad A = ${A.toFixed(4)}`,
          nota: 'Avaliar nas raízes do denominador é mais rápido que montar o sistema.',
        },
        {
          descricao: `Em x = -${n} sai B.`,
          tex: `${p * -n + q} = B(${m - n}) \\quad \\Rightarrow \\quad B = ${B.toFixed(4)}`,
        },
        {
          descricao: 'Cada parcela integra pela regra do logaritmo.',
          tex:
            `\\left[A\\ln|x + ${m}| + B\\ln|x + ${n}|\\right]_{0}^{${ate}} = ` +
            `${gabarito.toFixed(4)}`,
        },
      ],
    },
    conceitos: ['tecnicas.fracoes-parciais', 'tecnicas.escolha'],
    armadilhas: semColisoes(
      [
        {
          resposta: B * Math.log((ate + m) / m) + A * Math.log((ate + n) / n),
          diagnostico:
            'A e B ficaram trocados. Cada coeficiente acompanha o fator que foi anulado para ' +
            'encontrá-lo.',
          passo: 2,
          conceito: 'tecnicas.fracoes-parciais',
        },
        {
          resposta: A * Math.log(ate + m) + B * Math.log(ate + n),
          diagnostico:
            'Faltou avaliar no limite inferior: ln(0 + m) não é zero, a menos que m seja 1.',
          passo: 4,
          conceito: 'tecnicas.fracoes-parciais',
        },
        {
          resposta: (p * ate + q) / ((ate + m) * (ate + n)),
          diagnostico:
            'Esse é o valor do integrando em x = ' +
            `${ate}, não a integral. Integrar exige a primitiva.`,
          passo: 0,
          conceito: 'tecnicas.fracoes-parciais',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: !nivelAoMenos(nivel, 'dificil') ? texto.dica : undefined,
  };
}

/**
 * Substituição trigonométrica — a técnica que faltava no tópico.
 *
 * `√(a² − x²)` e `a² + x²` não cedem às outras três: não há `u` cuja derivada
 * apareça no integrando, e não há o que decompor. O que dissolve a raiz é
 * trocar `x` por `a·sen θ`, porque aí `√(a² − a²sen²θ) = a·cos θ` pela
 * identidade fundamental; a soma de quadrados pede `a·tg θ`, pelo mesmo motivo
 * com `1 + tg² = sec²`.
 *
 * Os dois casos devolvem a resposta através de uma função inversa — arcsen ou
 * arctg —, e é por isso que esta técnica só pôde entrar depois que
 * `equacoes-trigonometricas` passou a ensinar as inversas.
 *
 * As duas integrais são exatas:
 *
 *     ∫₀^k √(a² − x²) dx = (k/2)·√(a² − k²) + (a²/2)·arcsen(k/a)
 *     ∫₀^k dx/(a² + x²)  = (1/a)·arctg(k/a)
 */
function exercicioTrigonometrica(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(2, nivelAoMenos(nivel, 'dificil') ? 9 : 6);
  // A raiz exige k ≤ a; a tangente aceita qualquer k, e aqui os dois usam a
  // mesma faixa para que o enunciado não revele a técnica pelo intervalo.
  const ate = rng.inteiro(1, a);
  const comRaiz = rng.escolher([true, false]);

  const gabarito = comRaiz
    ? (ate / 2) * Math.sqrt(a * a - ate * ate) + ((a * a) / 2) * Math.asin(ate / a)
    : (1 / a) * Math.atan(ate / a);

  const texto = comRaiz
    ? enunciadoTrilingue(SUBSTITUICAO_TRIGONOMETRICA, [], undefined)
    : enunciadoTrilingue(SUBSTITUICAO_TRIGONOMETRICA, [], undefined);
  const dica = comRaiz
    ? enunciadoTrilingue(DICA_SENO, [a], DICA_SENO)
    : enunciadoTrilingue(DICA_TANGENTE, [a], DICA_TANGENTE);

  const integrando = comRaiz ? `\\sqrt{${a * a} - x^{2}}` : `\\frac{1}{${a * a} + x^{2}}`;

  return {
    id: `tecnicas-trig-${comRaiz ? 'sen' : 'tg'}-${a}-${ate}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: {
      fr: { enunciado: texto.traducoes.fr!.enunciado, dica: dica.traducoes.fr!.enunciado },
      en: { enunciado: texto.traducoes.en!.enunciado, dica: dica.traducoes.en!.enunciado },
    },
    enunciadoTex: `\\int_{0}^{${ate}} ${integrando}\\,dx`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: comRaiz ? passosDoSeno(a, ate, gabarito) : passosDaTangente(a, ate, gabarito),
    },
    conceitos: ['tecnicas.escolha', 'tecnicas.substituicao'],
    armadilhas: semColisoes(
      comRaiz
        ? [
            {
              resposta: ((a * a) / 2) * Math.asin(ate / a),
              diagnostico:
                'Essa é só a parcela do arco. A integral de cos²θ tem DUAS parcelas: ' +
                'θ/2 e sen(2θ)/4 — a segunda é a que vira (k/2)·√(a² − k²).',
              passo: 3,
              conceito: 'tecnicas.escolha',
            },
            {
              resposta: (ate / 2) * Math.sqrt(a * a - ate * ate),
              diagnostico: 'Essa é só a outra parcela. Faltou o termo com o arco-seno.',
              passo: 3,
              conceito: 'tecnicas.escolha',
            },
            {
              resposta: a * ate - (ate * ate) / 2,
              diagnostico:
                'Você tratou √(a² − x²) como (a − x). A raiz de uma diferença não é a ' +
                'diferença das raízes — é justamente por isso que a troca trigonométrica existe.',
              passo: 0,
              conceito: 'tecnicas.escolha',
            },
          ]
        : [
            {
              resposta: Math.atan(ate / a),
              diagnostico:
                'Faltou o fator 1/a. Ele vem de dx = a·sec²θ dθ dividido por a²·sec²θ, ' +
                'que deixa dθ/a — e não dθ.',
              passo: 2,
              conceito: 'tecnicas.escolha',
            },
            {
              resposta: (1 / a) * Math.asin(ate / a),
              diagnostico:
                'Arco-seno resolve a RAIZ de uma diferença de quadrados. Uma SOMA de ' +
                'quadrados no denominador pede a tangente, e devolve arco-tangente.',
              passo: 1,
              conceito: 'tecnicas.escolha',
            },
          ],
      gabarito,
      proximos,
    ),
    dica: nivelAoMenos(nivel, 'extremo') ? undefined : dica.enunciado,
  };
}

function passosDoSeno(a: number, ate: number, gabarito: number) {
  const raiz = Math.sqrt(a * a - ate * ate);

  return [
    {
      descricao: 'A raiz de uma diferença de quadrados pede o seno.',
      tex: `x = ${a}\\sin\\theta \\qquad dx = ${a}\\cos\\theta\\,d\\theta`,
      nota: 'Com essa troca, a identidade fundamental dissolve a raiz.',
    },
    {
      descricao: 'A raiz vira um cosseno.',
      tex:
        `\\sqrt{${a * a} - ${a * a}\\sin^{2}\\theta} = ` +
        `${a}\\sqrt{1 - \\sin^{2}\\theta} = ${a}\\cos\\theta`,
    },
    {
      descricao: 'O integrando fica em cos², que se abaixa de grau.',
      tex:
        `\\int ${a * a}\\cos^{2}\\theta\\,d\\theta = ` +
        `${a * a}\\left(\\frac{\\theta}{2} + \\frac{\\sin 2\\theta}{4}\\right)`,
      nota: 'cos²θ = (1 + cos 2θ)/2 — sem isso a integral não fecha.',
    },
    {
      descricao: 'Voltando para x, com θ = arcsen(x/a).',
      tex:
        `F(x) = \\frac{x}{2}\\sqrt{${a * a} - x^{2}} + ` +
        `\\frac{${a * a}}{2}\\arcsin\\frac{x}{${a}}`,
    },
    {
      descricao: 'Avaliando nos limites, e F(0) = 0.',
      tex:
        `\\frac{${ate}}{2}\\cdot ${Number(raiz.toFixed(4))} + ` +
        `\\frac{${a * a}}{2}\\arcsin\\frac{${ate}}{${a}} = ${gabarito.toFixed(4)}`,
    },
  ];
}

function passosDaTangente(a: number, ate: number, gabarito: number) {
  return [
    {
      descricao: 'Uma soma de quadrados pede a tangente.',
      tex: `x = ${a}\\tan\\theta \\qquad dx = ${a}\\sec^{2}\\theta\\,d\\theta`,
      nota: 'Aqui não há raiz para dissolver: a troca serve para somar quadrados em um só.',
    },
    {
      descricao: 'O denominador vira uma secante ao quadrado.',
      tex: `${a * a} + ${a * a}\\tan^{2}\\theta = ${a * a}\\sec^{2}\\theta`,
      nota: '1 + tg²θ = sec²θ.',
    },
    {
      descricao: 'Tudo se cancela, menos o fator 1/a.',
      tex:
        `\\int \\frac{${a}\\sec^{2}\\theta\\,d\\theta}{${a * a}\\sec^{2}\\theta} = ` +
        `\\frac{1}{${a}}\\int d\\theta = \\frac{\\theta}{${a}}`,
    },
    {
      descricao: 'Voltando para x, com θ = arctg(x/a), e avaliando.',
      tex: `\\frac{1}{${a}}\\arctan\\frac{${ate}}{${a}} = ${gabarito.toFixed(4)}`,
    },
  ];
}
