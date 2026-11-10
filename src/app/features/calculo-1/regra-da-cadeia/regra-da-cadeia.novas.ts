import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;
const dec = (v: number): string =>
  Number(v.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 }).replace(',', '{,}');
const binomio = (a: number, b: number): string =>
  `${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;

/**
 * Derivada segunda de (ax + b)ⁿ: a cadeia aplicada duas vezes.
 *
 * Cada derivada traz um fator a; duas trazem a². É onde se esquece o segundo
 * a, ou o (n − 1) que desce na segunda vez.
 */
export function exercicioSegundaCadeia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(2, nivel === 'facil' ? 3 : 4);
  const b = rng.inteiro(-4, 4);
  const n = rng.inteiro(3, nivel === 'facil' ? 4 : 5);
  const ponto = rng.inteiro(-2, 2);
  const u = a * ponto + b;
  const gabarito = n * (n - 1) * a * a * u ** (n - 2);

  return {
    id: `cadeia-segunda-${a}${b}${n}-${ponto}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule a derivada SEGUNDA f''(${ponto}).`,
    enunciadoTex: `f(x) = \\left(${binomio(a, b)}\\right)^{${n}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `A primeira derivada: o expoente desce e a cadeia traz o fator ${a}.`,
          tex: `f'(x) = ${n} \\cdot ${a}\\left(${binomio(a, b)}\\right)^{${n - 1}} = ${n * a}\\left(${binomio(a, b)}\\right)^{${n - 1}}`,
        },
        {
          descricao: `Derivando de novo: desce o ${n - 1} e vem outro fator ${a}.`,
          tex: `f''(x) = ${n * a} \\cdot ${n - 1} \\cdot ${a}\\left(${binomio(a, b)}\\right)^{${n - 2}} = ${n * (n - 1) * a * a}\\left(${binomio(a, b)}\\right)^{${n - 2}}`,
        },
        {
          descricao: `Em x = ${ponto}, o miolo vale ${u}.`,
          tex: `f''(${ponto}) = ${n * (n - 1) * a * a} \\cdot (${u})^{${n - 2}} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['cadeia.regra', 'cadeia.erro-comum'],
    armadilhas: semColisoes(
      [
        {
          resposta: n * (n - 1) * a * u ** (n - 2),
          diagnostico: `Faltou o segundo fator ${a}: cada derivada passa pela cadeia, então são ${a}·${a} = ${a * a}.`,
          passo: 1,
          conceito: 'cadeia.erro-comum',
        },
        {
          resposta: n * a * u ** (n - 1),
          diagnostico: 'Essa é a derivada PRIMEIRA no ponto. Falta derivar mais uma vez.',
          passo: 0,
          conceito: 'cadeia.regra',
        },
        {
          resposta: n * n * a * a * u ** (n - 2),
          diagnostico: `Na segunda derivada desce o novo expoente, ${n - 1}, não ${n} de novo.`,
          passo: 1,
          conceito: 'cadeia.regra',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Derive duas vezes. Cada derivada traz um fator ${a} da cadeia, e na segunda desce o expoente ${n - 1}.`,
  };
}

/**
 * Três camadas: ln(1 + (ax + b)²).
 *
 * Logaritmo por fora, quadrado no meio, binômio dentro: três fatores
 * multiplicados, um por camada.
 */
export function exercicioTresCamadas(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, nivel === 'extremo' ? 5 : 3);
  const b = rng.inteiro(-3, 3);
  const ponto = rng.inteiro(-2, 2);
  const u = a * ponto + b;
  const gabarito = (2 * u * a) / (1 + u * u);

  return {
    id: `cadeia-tres-${a}${b}-${ponto}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule f'(${ponto}). (3 casas decimais)`,
    enunciadoTex: `f(x) = \\ln\\left(1 + \\left(${binomio(a, b)}\\right)^{2}\\right)`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'As três camadas, de fora para dentro.',
          tex: `\\ln(w) \\;\\leftarrow\\; w = 1 + v^{2} \\;\\leftarrow\\; v = ${binomio(a, b)}`,
        },
        {
          descricao: 'Uma derivada por camada, multiplicadas.',
          tex: `f'(x) = \\frac{1}{1 + v^{2}} \\cdot 2v \\cdot ${a}`,
        },
        {
          descricao: `Em x = ${ponto}, v = ${u}.`,
          tex: `f'(${ponto}) = \\frac{2 \\cdot (${u}) \\cdot ${a}}{1 + ${u * u}} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['cadeia.camadas'],
    armadilhas: semColisoes(
      [
        {
          resposta: (2 * u) / (1 + u * u),
          diagnostico: `Faltou a derivada da camada mais de dentro: o binômio contribui com ${a}.`,
          passo: 1,
          conceito: 'cadeia.camadas',
        },
        {
          resposta: 1 / (1 + u * u),
          diagnostico:
            'Parou na primeira camada. O quadrado e o binômio também derivam: 2v e o coeficiente de x.',
          passo: 1,
          conceito: 'cadeia.camadas',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Três camadas, três fatores: 1/(1 + v²), depois 2v, depois ${a} (com v = ${binomio(a, b)}).`,
  };
}
