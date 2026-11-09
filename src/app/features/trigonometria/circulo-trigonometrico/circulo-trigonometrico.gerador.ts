import { paraRadianos, quadrante } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { anguloNaVolta } from '@core/treino/sorteio/sorteio';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta = 'quadrante' | 'sinal' | 'valor' | 'radianos';

/**
 * Exercícios do círculo trigonométrico.
 *
 * O foco é o que o triângulo retângulo não cobre: ângulos além de 90°, os
 * sinais que deles decorrem e a medida em radianos.
 */
export const geradorCirculo: GeradorExercicio<number> = {
  topicoId: 'circulo-trigonometrico',
  formatoResposta: 'um número, ex.: 3 ou -0,87',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);
    const graus = sortearAngulo(nivel, rng);

    if (pergunta === 'quadrante') {
      const gabarito = quadrante(graus);

      return {
        id: `circulo-quadrante-${graus}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Em qual quadrante está este ângulo? Responda com 1, 2, 3 ou 4.',
        enunciadoTex: `\\theta = ${graus}°`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Reduzimos o ângulo à primeira volta.',
              tex: `${graus}° \\equiv ${((graus % 360) + 360) % 360}°`,
            },
            {
              descricao: 'Cada quadrante ocupa 90°.',
              tex: '1º: 0°–90° \\quad 2º: 90°–180° \\quad 3º: 180°–270° \\quad 4º: 270°–360°',
            },
            { descricao: 'Logo o ângulo cai no quadrante.', tex: `${gabarito}º` },
          ],
        },
        conceitos: ['circulo.quadrantes'],
        armadilhas: semColisoes(
          [
            {
              resposta: gabarito === 4 ? 1 : gabarito + 1,
              diagnostico:
                'Os quadrantes são contados no sentido anti-horário a partir do eixo x ' +
                'positivo, em faixas de 90°. Confira a redução à primeira volta.',
              passo: 1,
              conceito: 'circulo.quadrantes',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'Entre quais múltiplos de 90° o ângulo está?' : undefined,
      };
    }

    if (pergunta === 'radianos') {
      const gabarito = paraRadianos(graus);

      return {
        id: `circulo-radianos-${graus}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Converta ${graus}° para radianos. (2 casas decimais)`,
        enunciadoTex: `${graus}° = \\;?\\text{ rad}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Usamos a proporção com a volta completa.',
              tex: '180° = \\pi \\text{ rad}',
            },
            {
              descricao: 'Multiplicamos os graus por π/180.',
              tex: `${graus} \\cdot \\frac{\\pi}{180} = ${gabarito.toFixed(4)}`,
            },
          ],
        },
        conceitos: ['circulo.radianos'],
        armadilhas: semColisoes(
          [
            {
              resposta: graus * (180 / Math.PI),
              diagnostico:
                'A conversão ficou invertida. Para ir de graus a radianos multiplica-se por ' +
                'π/180; o fator 180/π faz o caminho contrário.',
              passo: 1,
              conceito: 'circulo.radianos',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    if (pergunta === 'sinal') {
      return exercicioSinal(nivel, rng, graus);
    }

    // Valor de seno ou cosseno, incluindo quadrantes com sinal negativo.
    const ehSeno = rng.booleano();
    const radianos = paraRadianos(graus);
    const gabarito = ehSeno ? Math.sin(radianos) : Math.cos(radianos);
    const nome = ehSeno ? '\\sin' : '\\cos';

    return {
      id: `circulo-valor-${graus}-${ehSeno}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Qual é o valor de ${ehSeno ? 'sen' : 'cos'} ${graus}°? (2 casas decimais)`,
      enunciadoTex: `${nome} ${graus}° = \\;?`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: `O ângulo está no ${quadrante(graus)}º quadrante.`,
            tex: `\\theta = ${graus}°`,
          },
          {
            descricao: ehSeno
              ? 'O seno é a ORDENADA do ponto sobre o círculo.'
              : 'O cosseno é a ABSCISSA do ponto sobre o círculo.',
            tex: `${nome}\\theta = ${ehSeno ? 'y' : 'x'}`,
          },
          {
            descricao: `Nesse quadrante o valor é ${gabarito >= 0 ? 'positivo' : 'negativo'}.`,
            tex: `${nome} ${graus}° = ${gabarito.toFixed(4)}`,
          },
        ],
      },
      conceitos: ['circulo.coordenadas', 'circulo.quadrantes'],
      armadilhas: semColisoes(
        [
          {
            resposta: -gabarito,
            diagnostico:
              `O valor absoluto está correto, mas o sinal não. No ${quadrante(graus)}º ` +
              `quadrante, ${ehSeno ? 'a ordenada' : 'a abscissa'} do ponto é ` +
              `${gabarito >= 0 ? 'positiva' : 'negativa'}.`,
            passo: 2,
            conceito: 'circulo.quadrantes',
          },
          {
            resposta: ehSeno ? Math.cos(radianos) : Math.sin(radianos),
            diagnostico: ehSeno
              ? 'Você deu o cosseno. O seno é a coordenada VERTICAL do ponto.'
              : 'Você deu o seno. O cosseno é a coordenada HORIZONTAL do ponto.',
            passo: 1,
            conceito: 'circulo.coordenadas',
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

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['quadrante', 'radianos']);
    case 'medio':
      return rng.escolher<Pergunta>(['quadrante', 'radianos', 'valor', 'sinal']);
    case 'dificil':
      return rng.escolher<Pergunta>(['valor', 'quadrante', 'sinal']);
    // Com o ângulo passando de uma volta (ver `anguloNaVolta`), o valor e o
    // sinal exigem reduzir ao intervalo principal antes de ler o círculo.
    case 'extremo':
      return rng.escolher<Pergunta>(['valor', 'sinal']);
  }
}

function sortearAngulo(nivel: Nivel, rng: Rng): number {
  if (nivel === 'facil') {
    // Qualquer ângulo da volta, não só os oito de sempre.
    return anguloNaVolta(rng, nivel);
  }
  if (nivel === 'medio') {
    return rng.inteiro(95, 355);
  }
  // Difícil: ângulos além da volta e negativos, que é onde a redução ao
  // primeiro giro importa. Sorteados num intervalo, e não de uma lista de
  // nove: o aluno percebia a repetição em poucos cliques.
  return rng.booleano() ? -rng.inteiro(5, 355) : rng.inteiro(365, 1080);
}

/**
 * O sinal de sen, cos ou tg no quadrante do ângulo.
 *
 * Estava declarado no tipo desde o começo e nunca era sorteado. É a pergunta
 * que separa quem decorou a tabela de quem sabe ler o círculo: o sinal sai da
 * posição do ponto, sem calcular valor nenhum.
 */
function exercicioSinal(nivel: Nivel, rng: Rng, sorteado: number): Exercicio<number> {
  // Sobre os eixos o seno, o cosseno ou a tangente zeram ou somem: sem sinal.
  const graus = sorteado % 90 === 0 ? sorteado + rng.inteiro(10, 80) : sorteado;
  const funcao = rng.escolher(['sen', 'cos', 'tg'] as const);
  const reduzido = ((graus % 360) + 360) % 360;
  const q = quadrante(graus);

  const x = Math.cos(paraRadianos(graus));
  const y = Math.sin(paraRadianos(graus));
  const valor = funcao === 'sen' ? y : funcao === 'cos' ? x : y / x;
  const gabarito = valor > 0 ? 1 : -1;

  const leitura =
    funcao === 'sen'
      ? `O seno é a ordenada (y) do ponto: no ${q}º quadrante ela é ${y > 0 ? 'positiva' : 'negativa'}.`
      : funcao === 'cos'
        ? `O cosseno é a abscissa (x) do ponto: no ${q}º quadrante ela é ${x > 0 ? 'positiva' : 'negativa'}.`
        : `A tangente é y/x: no ${q}º quadrante, y é ${y > 0 ? 'positivo' : 'negativo'} e x é ` +
          `${x > 0 ? 'positivo' : 'negativo'}, então o quociente é ${gabarito > 0 ? 'positivo' : 'negativo'}.`;

  return {
    id: `circulo-sinal-${funcao}-${graus}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é o sinal de ${funcao} ${graus}°? Responda 1 se for positivo e -1 se for negativo.`,
    enunciadoTex: `\\operatorname{${funcao}} ${graus}° \\gtrless 0 \;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Reduzimos o ângulo à primeira volta.',
          tex: `${graus}° \\equiv ${reduzido}°`,
        },
        {
          descricao: `${reduzido}° fica no ${q}º quadrante.`,
          tex: `\\text{${q}º quadrante}`,
        },
        {
          descricao: leitura,
          tex:
            `\\operatorname{${funcao}} ${graus}° ${gabarito > 0 ? '> 0' : '< 0'} ` +
            `\\;\\Rightarrow\\; ${gabarito}`,
          nota: 'O mnemônico: no 1º tudo é positivo; no 2º só o seno; no 3º só a tangente; no 4º só o cosseno.',
        },
      ],
    },
    conceitos: ['circulo.quadrantes'],
    armadilhas: semColisoes(
      [
        {
          resposta: -gabarito,
          diagnostico:
            funcao === 'tg'
              ? 'A tangente é y/x: o sinal sai dos DOIS sinais juntos. No 3º quadrante, por ' +
                'exemplo, os dois são negativos e a tangente é positiva.'
              : `Confira qual coordenada é ${funcao === 'sen' ? 'o seno (a vertical, y)' : 'o cosseno (a horizontal, x)'} ` +
                'e de que lado do eixo o ponto está nesse quadrante.',
          passo: 2,
          conceito: 'circulo.quadrantes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? 'Seno é o y do ponto, cosseno é o x, tangente é y/x. Veja o quadrante.'
        : undefined,
  };
}
