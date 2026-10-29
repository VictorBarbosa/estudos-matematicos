import { Rng } from '@core/treino/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

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

type Pergunta = 'substituicao' | 'por-partes' | 'fracoes-parciais';

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

    const a = rng.inteiro(2, nivel === 'facil' ? 6 : 9);
    const b = rng.inteiro(-9, 9);
    const n = rng.inteiro(2, nivel === 'dificil' ? 5 : 4);

    const de = 0;
    // |ax+b| no topo do intervalo não pode estourar o teto do gabarito.
    const maiorInterno = (MAIOR_GABARITO * a * (n + 1)) ** (1 / (n + 1));
    const maiorAte = Math.floor((maiorInterno - Math.abs(b)) / a);
    const ate = rng.inteiro(1, Math.min(6, Math.max(1, maiorAte)));

    // ∫(ax+b)^n dx = (ax+b)^(n+1) / (a(n+1))
    const primitiva = (x: number): number => (a * x + b) ** (n + 1) / (a * (n + 1));
    const gabarito = primitiva(ate) - primitiva(de);

    // Erro clássico: esquecer de dividir pelo coeficiente interno.
    const semDividir =
      ((a * ate + b) ** (n + 1) - (a * de + b) ** (n + 1)) / (n + 1);

    const internoTex = `${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;

    return {
      id: `tecnicas-${a}${b}${n}-${de}${ate}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Resolva por substituição. (2 casas decimais)',
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
      dica:
        nivel === 'facil'
          ? 'Depois de trocar por u, não esqueça o fator que vem de dx = du/a.'
          : undefined,
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
      return rng.escolher<Pergunta>(['substituicao', 'por-partes', 'fracoes-parciais']);
    case 'dificil':
      return rng.escolher<Pergunta>(['por-partes', 'fracoes-parciais', 'substituicao']);
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

  // ∫₁^k c·x·ln x dx = c·[x²/2·ln x − x²/4]₁^k
  const primitiva = (x: number): number =>
    coeficiente * (((x * x) / 2) * Math.log(x) - (x * x) / 4);
  const gabarito = primitiva(ate) - primitiva(1);

  const fator = coeficiente === 1 ? '' : String(coeficiente);

  return {
    id: `tecnicas-partes-${coeficiente}-${ate}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Resolva por partes. (2 casas decimais)',
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
            'Você parou no uv e não subtraiu ∫v du. A fórmula tem os dois termos: ' +
            'uv − ∫v du.',
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
    dica:
      nivel !== 'dificil'
        ? 'Tome u = ln x. A escolha certa é a que simplifica ao derivar.'
        : undefined,
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

  // (px + q)/((x+m)(x+n)) = A/(x+m) + B/(x+n), avaliando em x = −m e x = −n.
  const A = (q - p * m) / (n - m);
  const B = (q - p * n) / (m - n);

  const gabarito = A * Math.log((ate + m) / m) + B * Math.log((ate + n) / n);

  const numeradorTex = `${p === 1 ? '' : p}x ${q >= 0 ? '+' : '-'} ${Math.abs(q)}`;
  const denominadorTex = `(x + ${m})(x + ${n})`;

  return {
    id: `tecnicas-parciais-${m}${n}${p}${q}-${ate}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Resolva por frações parciais. (2 casas decimais)',
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
    dica:
      nivel !== 'dificil'
        ? `Fatore em A/(x+${m}) + B/(x+${n}) e avalie em x = -${m} e x = -${n}.`
        : undefined,
  };
}
