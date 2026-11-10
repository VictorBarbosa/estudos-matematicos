import { Rng } from '@core/treino/rng/rng';
import { numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * EDO exata: M dx + N dy = 0 com ∂M/∂y = ∂N/∂x.
 *
 * A avaliação de 09/11 listou a EDO exata entre as ausências de Cálculo 4. A
 * ideia é que a equação seja a diferencial de uma função F(x, y): então as
 * soluções são as curvas de nível F(x, y) = C. O erro clássico ao montar F é
 * esquecer a parte que só depende de y — ou contar duas vezes os termos mistos.
 */

const { saoEquivalentes, formatar } = numeroComCasas(4);

/** Um termo de F: monômio c·xᵖ·yᵠ, ou c·eˣ no Extremo. */
type Termo =
  | { readonly tipo: 'mono'; readonly c: number; readonly px: number; readonly py: number }
  | { readonly tipo: 'exp'; readonly c: number };

const mono = (c: number, px: number, py: number): Termo => ({ tipo: 'mono', c, px, py });

function derivarX(t: Termo): Termo | null {
  if (t.tipo === 'exp') return t;
  return t.px === 0 ? null : mono(t.c * t.px, t.px - 1, t.py);
}

function derivarY(t: Termo): Termo | null {
  if (t.tipo === 'exp') return null;
  return t.py === 0 ? null : mono(t.c * t.py, t.px, t.py - 1);
}

function valor(t: Termo, x: number, y: number): number {
  return t.tipo === 'exp' ? t.c * Math.exp(x) : t.c * x ** t.px * y ** t.py;
}

const potencia = (v: string, e: number): string => (e === 0 ? '' : e === 1 ? v : `${v}^{${e}}`);

/** O termo sem sinal, para juntar com + e −. */
function corpo(t: Termo): string {
  const abs = Math.abs(t.c);
  const partes = t.tipo === 'exp' ? 'e^{x}' : `${potencia('x', t.px)}${potencia('y', t.py)}`;
  if (partes === '') return String(abs);
  return `${abs === 1 ? '' : abs}${partes}`;
}

/** Soma de termos em LaTeX, já com sinais; os nulos somem. */
function somaTex(termos: readonly (Termo | null)[]): string {
  const validos = termos.filter((t): t is Termo => t !== null && t.c !== 0);
  if (validos.length === 0) return '0';
  return validos
    .map((t, i) =>
      i === 0 ? `${t.c < 0 ? '-' : ''}${corpo(t)}` : `${t.c < 0 ? '-' : '+'} ${corpo(t)}`,
    )
    .join(' ');
}

const soma = (termos: readonly Termo[], x: number, y: number): number =>
  termos.reduce((acc, t) => acc + valor(t, x, y), 0);

const misto = (t: Termo): boolean => t.tipo === 'mono' && t.px > 0 && t.py > 0;
const soDeY = (t: Termo): boolean => t.tipo === 'mono' && t.px === 0;

const par = (v: number): string => (v < 0 ? `(${v})` : String(v));

/**
 * Fácil: o k que torna a equação exata.
 *
 * F = c·xᵖ·yᵠ gera M = c·p·xᵖ⁻¹·yᵠ; o enunciado troca esse coeficiente por k.
 */
export function exercicioExataK(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = rng.inteiro(2, 3);
  const q = rng.inteiro(1, 3);
  const c = rng.inteiro(1, 4);
  const b = rng.inteiro(1, 9) * rng.sinal();
  const d = rng.inteiro(1, 9) * rng.sinal();
  const gabarito = c * p;

  const mTex = `k${potencia('x', p - 1)}${potencia('y', q)} ${b < 0 ? '-' : '+'} ${Math.abs(b)}`;
  const nTex = somaTex([mono(c * q, p, q - 1), mono(d, 0, 0)]);
  const derivadaComum = `${potencia('x', p - 1)}${potencia('y', q - 1)}`;

  const armadilhas: Armadilha<number>[] = [
    {
      resposta: c * q,
      diagnostico:
        'Esse é o coeficiente de N, comparado direto com o de M. A condição compara as DERIVADAS: ∂M/∂y com ∂N/∂x.',
      passo: 0,
      conceito: 'edo1.exata',
    },
    {
      resposta: c * p * q,
      diagnostico: `Ao derivar M em y, o expoente ${q} de y também desce e multiplica o k: ∂M/∂y = ${q}k·(…).`,
      passo: 1,
      conceito: 'edo1.exata',
    },
    {
      resposta: c,
      diagnostico: `Ao derivar N em x, o expoente ${p} de x desce: ∂N/∂x tem o fator ${p}.`,
      passo: 2,
      conceito: 'edo1.exata',
    },
  ];

  return {
    id: `exata-k-${p}${q}${c}${b}${d}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Para que valor de k esta equação diferencial é exata?',
    enunciadoTex: `\\left(${mTex}\\right)dx + \\left(${nTex}\\right)dy = 0`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'M dx + N dy = 0 é exata quando as derivadas cruzadas coincidem.',
          tex: '\\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}',
        },
        {
          descricao: 'Derivamos M em relação a y (x fica constante).',
          tex: `\\frac{\\partial M}{\\partial y} = ${q === 1 ? '' : q}k${derivadaComum}`,
        },
        {
          descricao: 'Derivamos N em relação a x (y fica constante); a constante some.',
          tex: `\\frac{\\partial N}{\\partial x} = ${c * q * p}${derivadaComum}`,
        },
        {
          descricao: 'Igualando os coeficientes.',
          tex: `${q === 1 ? '' : q}k = ${c * q * p} \\;\\Rightarrow\\; k = ${gabarito}`,
        },
      ],
    },
    conceitos: ['edo1.exata'],
    armadilhas: semColisoes(armadilhas, gabarito, saoEquivalentes),
    dica:
      nivel === 'facil'
        ? 'Exata quer dizer ∂M/∂y = ∂N/∂x. Derive M em y, N em x, e iguale os coeficientes.'
        : undefined,
  };
}

/**
 * Médio a Extremo: a constante C da curva-solução que passa por um ponto.
 *
 * - Médio: F = a·x²·y + b·x + e·y².
 * - Difícil: F com termo misto x²y², termo xy, x³ e y.
 * - Extremo: o mesmo com eˣ no lugar de x³ — a resposta deixa de ser inteira.
 */
export function exercicioExataConstante(nivel: Nivel, rng: Rng): Exercicio<number> {
  const nz = (min: number, max: number): number => rng.inteiro(min, max) * rng.sinal();
  let termos: Termo[];
  if (nivel === 'medio') {
    termos = [mono(nz(1, 4), 2, 1), mono(nz(1, 6), 1, 0), mono(nz(1, 3), 0, 2)];
  } else if (nivel === 'dificil') {
    termos = [
      mono(nz(1, 3), 2, 2),
      mono(nz(1, 5), 1, 1),
      mono(nz(1, 3), 3, 0),
      mono(nz(1, 6), 0, 1),
    ];
  } else {
    termos = [
      mono(nz(1, 3), 2, 2),
      mono(nz(1, 5), 1, 1),
      { tipo: 'exp', c: nz(1, 4) },
      mono(nz(1, 6), 0, 1),
    ];
  }

  const x0 = rng.inteiro(nivel === 'extremo' ? 0 : -2, 2);
  const y0 = rng.inteiro(-2, 3);
  const M = termos.map(derivarX);
  const N = termos.map(derivarY);
  const cruzada = termos.map((t) => {
    const dx = derivarX(t);
    return dx ? derivarY(dx) : null;
  });

  const deX = termos.filter((t) => !soDeY(t));
  const deY = termos.filter(soDeY);
  const gabarito = soma(termos, x0, y0);
  const inteiro = Number.isInteger(Number(gabarito.toFixed(9)));
  const num = (v: number): string =>
    inteiro ? String(Math.round(v)) : formatar(v).replace(',', '{,}');

  const fator = (base: number, e: number): string =>
    e === 0 ? '' : e === 1 ? par(base) : `${par(base)}^{${e}}`;
  const parcelas = termos
    .map((t) =>
      t.tipo === 'exp'
        ? `${t.c}e^{${x0}}`
        : [String(t.c), fator(x0, t.px), fator(y0, t.py)].filter((f) => f !== '').join(' \\cdot '),
    )
    .join(' + ')
    .replace(/\+ -/g, '- ');

  const armadilhas: Armadilha<number>[] = [
    {
      resposta: soma(deX, x0, y0),
      diagnostico:
        'Faltou a parte que só depende de y. Integrar M em x deixa uma «constante» g(y), que se acha comparando ∂F/∂y com N.',
      passo: 3,
      conceito: 'edo1.exata',
    },
    {
      resposta: gabarito + soma(termos.filter(misto), x0, y0),
      diagnostico:
        'Os termos mistos (com x e y) foram contados duas vezes. Eles já saem de ∫M dx; de N só se aproveita o que é novo, a g′(y).',
      passo: 3,
      conceito: 'edo1.exata',
    },
    {
      resposta: soma(termos, y0, x0),
      diagnostico: `O ponto foi lido ao contrário: x = ${x0} e y = ${y0}.`,
      passo: 4,
      conceito: 'edo1.condicao-inicial',
    },
  ];

  return {
    id: `exata-c-${nivel}-${termos.map((t) => t.c).join('_')}-${x0}${y0}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `A equação é exata e sua solução tem a forma F(x, y) = C. Qual é o valor de C para a ` +
      `curva que passa pelo ponto (${x0}, ${y0})?` +
      (inteiro ? '' : ' Responda com 4 casas decimais.'),
    enunciadoTex: `\\left(${somaTex(M)}\\right)dx + \\left(${somaTex(N)}\\right)dy = 0`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Conferimos que é exata: as derivadas cruzadas são iguais.',
          tex: `\\frac{\\partial M}{\\partial y} = ${somaTex(cruzada)} = \\frac{\\partial N}{\\partial x}`,
        },
        {
          descricao: 'Integramos M em relação a x; a «constante» de integração pode depender de y.',
          tex: `F = \\int M\\,dx = ${somaTex(deX)} + g(y)`,
        },
        {
          descricao: 'Derivamos em y e comparamos com N: o que sobra em N é g′(y).',
          tex: `\\frac{\\partial F}{\\partial y} = ${somaTex(deX.map(derivarY))} + g'(y) = ${somaTex(N)} \\;\\Rightarrow\\; g'(y) = ${somaTex(deY.map(derivarY))}`,
        },
        {
          descricao: 'Integrando g′, a função F completa.',
          tex: `F(x, y) = ${somaTex(termos)}`,
          nota: 'Cada valor de C é uma curva da família; o ponto escolhe uma.',
        },
        {
          descricao: `Substituímos o ponto (${x0}, ${y0}).`,
          tex: `C = ${parcelas} = ${num(gabarito)}`,
        },
      ],
    },
    conceitos: ['edo1.exata', 'edo1.condicao-inicial'],
    armadilhas: semColisoes(armadilhas, gabarito, saoEquivalentes),
    dica:
      nivel === 'medio'
        ? 'Integre M em x, some uma g(y) e ache g comparando a derivada em y com N. Depois substitua o ponto.'
        : nivel === 'extremo'
          ? 'O termo com eˣ vem de M e não tem y: ele entra em F uma vez só, pela integral de M.'
          : undefined,
  };
}
