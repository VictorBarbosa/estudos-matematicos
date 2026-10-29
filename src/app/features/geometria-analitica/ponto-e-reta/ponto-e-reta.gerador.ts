import { Ponto } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta = 'distancia' | 'inclinacao' | 'ponto-medio-x';

/** Exercícios de ponto e reta no plano cartesiano. */
export const geradorPontoReta: GeradorExercicio<number> = {
  topicoId: 'ponto-e-reta',
  formatoResposta: 'um número com até 2 casas, ex.: 7,21',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);
    const { a, b } = sortearPontos(nivel, rng, pergunta);

    const par = `A${pontoTex(a)} \\qquad B${pontoTex(b)}`;

    if (pergunta === 'distancia') {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const gabarito = Math.hypot(dx, dy);

      return {
        id: `ponto-reta-dist-${a.x}${a.y}-${b.x}${b.y}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Qual é a distância entre os dois pontos? (2 casas decimais)',
        enunciadoTex: par,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'As diferenças de coordenadas são os catetos.',
              tex: `\\Delta x = ${dx} \\qquad \\Delta y = ${dy}`,
            },
            {
              descricao: 'A distância é a hipotenusa.',
              tex: `d = \\sqrt{${dx * dx} + ${dy * dy}} = \\sqrt{${dx * dx + dy * dy}}`,
            },
            { descricao: 'Calculando.', tex: `d = ${gabarito.toFixed(4)}` },
          ],
        },
        conceitos: ['ponto-reta.distancia'],
        armadilhas: semColisoes(
          [
            {
              resposta: Math.abs(dx) + Math.abs(dy),
              diagnostico:
                'Você somou as diferenças. A distância é a HIPOTENUSA do triângulo formado ' +
                'por elas, e não a soma dos catetos — andar na diagonal é mais curto que ' +
                'andar pelos dois lados.',
              passo: 1,
              conceito: 'ponto-reta.distancia',
            },
            {
              resposta: dx * dx + dy * dy,
              diagnostico: 'Esse é o valor de d². Falta extrair a raiz quadrada.',
              passo: 2,
              conceito: 'ponto-reta.distancia',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'Desenhe o triângulo retângulo entre os dois pontos.' : undefined,
      };
    }

    if (pergunta === 'ponto-medio-x') {
      const gabarito = (a.x + b.x) / 2;

      return {
        id: `ponto-reta-medio-${a.x}${b.x}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Qual é a abscissa (coordenada x) do ponto médio do segmento AB?',
        enunciadoTex: par,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'O ponto médio tem cada coordenada igual à média das coordenadas.',
              tex: `x_M = \\frac{x_A + x_B}{2}`,
            },
            {
              descricao: 'Substituindo.',
              tex: `x_M = \\frac{${a.x} + ${b.x}}{2} = ${gabarito}`,
            },
          ],
        },
        conceitos: ['ponto-reta.distancia'],
        armadilhas: semColisoes(
          [
            {
              resposta: b.x - a.x,
              diagnostico:
                'Essa é a diferença entre as abscissas, não a média delas. O ponto médio fica ' +
                'a meio caminho, então soma-se e divide-se por 2.',
              passo: 1,
              conceito: 'ponto-reta.distancia',
            },
            {
              resposta: (a.y + b.y) / 2,
              diagnostico: 'Esse é o y do ponto médio. A pergunta é pela abscissa.',
              passo: 0,
              conceito: 'ponto-reta.distancia',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    const gabarito = (b.y - a.y) / (b.x - a.x);

    return {
      id: `ponto-reta-incl-${a.x}${a.y}-${b.x}${b.y}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Qual é o coeficiente angular da reta que passa pelos dois pontos?',
      enunciadoTex: par,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'O coeficiente angular é a razão entre as variações.',
            tex: `m = \\frac{\\Delta y}{\\Delta x}`,
          },
          {
            descricao: 'Substituindo.',
            tex: `m = \\frac{${b.y} - ${a.y}}{${b.x} - ${a.x}} = \\frac{${b.y - a.y}}{${b.x - a.x}} = ${gabarito}`,
          },
        ],
      },
      conceitos: ['ponto-reta.equacao'],
      armadilhas: semColisoes(
        [
          {
            resposta: (b.x - a.x) / (b.y - a.y),
            diagnostico:
              'A razão está invertida. O coeficiente angular é Δy sobre Δx — a variação ' +
              'VERTICAL dividida pela horizontal.',
            passo: 1,
            conceito: 'ponto-reta.equacao',
          },
          {
            resposta: -gabarito,
            diagnostico:
              'O sinal está trocado. Confira a ordem das subtrações: as duas diferenças ' +
              'precisam usar os pontos na MESMA ordem.',
            passo: 1,
            conceito: 'ponto-reta.equacao',
          },
        ],
        gabarito,
        proximos,
      ),
    };
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 }),
};

function pontoTex({ x, y }: Ponto): string {
  return `(${x},\\; ${y})`;
}

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['distancia', 'ponto-medio-x']);
    case 'medio':
      return rng.escolher<Pergunta>(['distancia', 'inclinacao', 'ponto-medio-x']);
    case 'dificil':
      return rng.escolher<Pergunta>(['distancia', 'inclinacao']);
  }
}

function sortearPontos(
  nivel: Nivel,
  rng: Rng,
  pergunta: Pergunta,
): { a: Ponto; b: Ponto } {
  if (pergunta === 'distancia' && nivel !== 'dificil') {
    // Ternos pitagóricos dão distância inteira.
    const [dx, dy] = rng.escolher([
      [3, 4],
      [6, 8],
      [5, 12],
      [8, 15],
      [9, 12],
    ]);
    const a: Ponto = { x: rng.inteiro(-5, 5), y: rng.inteiro(-5, 5) };
    return { a, b: { x: a.x + dx * rng.sinal(), y: a.y + dy * rng.sinal() } };
  }

  const limite = nivel === 'facil' ? 6 : 10;
  const a: Ponto = { x: rng.inteiro(-limite, limite), y: rng.inteiro(-limite, limite) };
  let b: Ponto = { x: rng.inteiro(-limite, limite), y: rng.inteiro(-limite, limite) };

  // Evita pontos coincidentes e, na inclinação, reta vertical.
  if (b.x === a.x) {
    b = { ...b, x: a.x + 1 };
  }
  if (b.y === a.y && pergunta === 'inclinacao') {
    b = { ...b, y: a.y + rng.inteiro(1, 4) };
  }

  return { a, b };
}
