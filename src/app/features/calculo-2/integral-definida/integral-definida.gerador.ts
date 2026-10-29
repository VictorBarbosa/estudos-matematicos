import { Rng } from '@core/treino/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-6);

type Pergunta = 'area-trapezio' | 'constante' | 'propriedades' | 'valor-medio';

/**
 * Exercícios de integral definida — sem usar o Teorema Fundamental.
 *
 * A integral definida é, por definição, um limite de somas, e seu significado
 * é a área com signo. Só o TFC, que vem duas etapas depois, autoriza calculá-la
 * por F(b) − F(a).
 *
 * Antes, todos os exercícios daqui exigiam exatamente isso: achar a primitiva
 * e avaliar nos extremos. O tópico cobrava, portanto, o que ainda não havia
 * sido ensinado — e a prática de F(b) − F(a) já existe no tópico do TFC. Aqui
 * ficam a área por geometria, as propriedades da integral e o valor médio,
 * todos acessíveis com o que a trilha já apresentou.
 */
export const geradorDefinida: GeradorExercicio<number> = {
  topicoId: 'integral-definida',
  formatoResposta: 'um número, ex.: 9 ou -2,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'area-trapezio':
        return exercicioAreaTrapezio(nivel, rng);
      case 'constante':
        return exercicioConstante(nivel, rng);
      case 'propriedades':
        return exercicioPropriedades(nivel, rng);
      case 'valor-medio':
        return exercicioValorMedio(nivel, rng);
    }
  },

  analisar: analisarNumero,

  ...numeroComCasas(2, 1e-6),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['constante', 'area-trapezio']);
    case 'medio':
      return rng.escolher<Pergunta>(['area-trapezio', 'propriedades', 'valor-medio']);
    case 'dificil':
      return rng.escolher<Pergunta>(['propriedades', 'valor-medio', 'area-trapezio']);
  }
}

/** Uma reta positiva no intervalo, para que a integral seja uma área de verdade. */
function retaPositiva(nivel: Nivel, rng: Rng) {
  const de = rng.inteiro(0, 4);
  const ate = de + rng.inteiro(1, 7);
  const m = nivel === 'facil' ? rng.inteiro(1, 5) : rng.inteiro(1, 6) * rng.sinal();
  // Com m negativo, o termo constante precisa segurar a reta acima do eixo.
  const k = m >= 0 ? rng.inteiro(0, 8) : Math.abs(m) * ate + rng.inteiro(0, 6);

  return { de, ate, m, k };
}

function retaTex(m: number, k: number): string {
  const termoM = m === 1 ? 'x' : m === -1 ? '-x' : `${m}x`;
  return k === 0 ? termoM : `${termoM} ${k > 0 ? '+' : '-'} ${Math.abs(k)}`;
}

function exercicioAreaTrapezio(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { de, ate, m, k } = retaPositiva(nivel, rng);

  const alturaEsquerda = m * de + k;
  const alturaDireita = m * ate + k;
  const largura = ate - de;
  // A região sob uma reta é um trapézio: (base menor + base maior)/2 × altura.
  const gabarito = ((alturaEsquerda + alturaDireita) / 2) * largura;

  return {
    id: `def-trap-${m}_${k}-${de}${ate}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Calcule a integral pela GEOMETRIA da região: ela é um trapézio. ' +
      '(sem usar primitivas)',
    enunciadoTex: `\\int_{${de}}^{${ate}} \\left(${retaTex(m, k)}\\right) dx`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A integral de uma função positiva é a área sob o gráfico.',
          tex: `f(${de}) = ${alturaEsquerda} \\qquad f(${ate}) = ${alturaDireita}`,
        },
        {
          descricao: 'Sob uma reta, essa região é um trapézio.',
          tex: `A = \\frac{f(${de}) + f(${ate})}{2} \\cdot (${ate} - ${de})`,
          nota:
            'Nenhuma primitiva é necessária: a definição da integral é a área, e aqui a ' +
            'geometria já a entrega.',
        },
        {
          descricao: 'Substituindo.',
          tex:
            `A = \\frac{${alturaEsquerda} + ${alturaDireita}}{2} \\cdot ${largura} = ` +
            `${gabarito}`,
        },
      ],
    },
    conceitos: ['integral-def.area-geometrica', 'integral-def.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: (alturaEsquerda + alturaDireita) / 2,
          diagnostico:
            'Essa é a média das duas alturas, não a área. Falta multiplicar pela largura do ' +
            `intervalo, que vale ${largura}.`,
          passo: 1,
          conceito: 'integral-def.area-geometrica',
        },
        {
          resposta: alturaDireita * largura,
          diagnostico:
            'Você usou um retângulo de altura f(b). Como a reta é inclinada, a região é um ' +
            'trapézio: a altura muda ao longo do intervalo.',
          passo: 1,
          conceito: 'integral-def.area-geometrica',
        },
        {
          resposta: alturaDireita - alturaEsquerda,
          diagnostico:
            'Essa é a variação da função, não a área sob ela. Integrar acumula valores; ' +
            'subtrair extremos é o que a DERIVADA desfaz.',
          passo: 0,
          conceito: 'integral-def.definicao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Desenhe a região: ela é um trapézio de bases f(a) e f(b).' : undefined,
  };
}

function exercicioConstante(nivel: Nivel, rng: Rng): Exercicio<number> {
  const valor = rng.inteiro(2, 12) * (nivel === 'facil' ? 1 : rng.sinal());
  const de = nivel === 'facil' ? rng.inteiro(0, 4) : rng.inteiro(-6, 3);
  const ate = de + rng.inteiro(1, 8);
  const gabarito = valor * (ate - de);

  return {
    id: `def-const-${valor}-${de}${ate}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Calcule a integral de uma função constante.',
    enunciadoTex: `\\int_{${de}}^{${ate}} ${valor}\\,dx`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A região é um retângulo de altura constante.',
          tex: `\\text{altura} = ${valor} \\qquad \\text{largura} = ${ate} - (${de}) = ${ate - de}`,
        },
        {
          descricao: 'A integral é a área com signo desse retângulo.',
          tex: `\\int_{${de}}^{${ate}} ${valor}\\,dx = ${valor} \\cdot ${ate - de} = ${gabarito}`,
          nota:
            valor < 0
              ? 'Altura negativa dá área NEGATIVA: a integral tem signo, a área geométrica não.'
              : 'É o caso mais simples da definição: soma de retângulos iguais.',
        },
      ],
    },
    conceitos: ['integral-def.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: valor,
          diagnostico:
            'Faltou multiplicar pela largura do intervalo. A integral acumula o valor ao ' +
            'longo de todo o intervalo.',
          passo: 1,
          conceito: 'integral-def.definicao',
        },
        {
          resposta: Math.abs(gabarito),
          diagnostico:
            'A integral de uma função negativa é NEGATIVA. Área geométrica é sempre positiva; ' +
            'a integral é área com signo.',
          passo: 1,
          conceito: 'integral-def.definicao',
        },
        {
          resposta: valor * (ate + de),
          diagnostico:
            'A largura é b − a, não b + a. Com limites negativos é fácil somar sem perceber.',
          passo: 0,
          conceito: 'integral-def.definicao',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}

type Propriedade = 'aditividade' | 'inversao' | 'multiplo' | 'soma-de-funcoes';

function exercicioPropriedades(nivel: Nivel, rng: Rng): Exercicio<number> {
  const propriedade = rng.escolher<Propriedade>(
    nivel === 'medio'
      ? ['aditividade', 'inversao', 'multiplo']
      : ['aditividade', 'inversao', 'multiplo', 'soma-de-funcoes'],
  );

  const a = rng.inteiro(-4, 2);
  const b = a + rng.inteiro(1, 5);
  const c = b + rng.inteiro(1, 5);
  const primeira = rng.inteiro(-18, 18);
  const segunda = rng.inteiro(-18, 18);
  const fator = rng.inteiro(2, 7) * rng.sinal();

  if (propriedade === 'aditividade') {
    const gabarito = primeira + segunda;

    return {
      id: `def-prop-adit-${a}${b}${c}-${primeira}_${segunda}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        `Sabendo que a integral de f de ${a} a ${b} vale ${primeira} e de ${b} a ${c} vale ` +
        `${segunda}, quanto vale a integral de ${a} a ${c}?`,
      enunciadoTex:
        `\\int_{${a}}^{${b}} f = ${primeira} \\qquad \\int_{${b}}^{${c}} f = ${segunda} ` +
        `\\qquad \\int_{${a}}^{${c}} f = \\;?`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Intervalos encaixados somam: é a aditividade da integral.',
            tex: `\\int_{${a}}^{${c}} f = \\int_{${a}}^{${b}} f + \\int_{${b}}^{${c}} f`,
            nota: 'Faz sentido pela definição: as somas de Riemann dos dois trechos se juntam.',
          },
          {
            descricao: 'Substituindo os valores dados.',
            tex: `= ${primeira} + (${segunda}) = ${gabarito}`,
          },
        ],
      },
      conceitos: ['integral-def.propriedades'],
      armadilhas: semColisoes(
        [
          {
            resposta: primeira - segunda,
            diagnostico:
              'Os trechos se SOMAM. A subtração aparece quando se inverte um limite, não ao ' +
              'juntar intervalos consecutivos.',
            passo: 0,
            conceito: 'integral-def.propriedades',
          },
          {
            resposta: primeira * segunda,
            diagnostico: 'A integral é aditiva, não multiplicativa, em relação ao intervalo.',
            passo: 0,
            conceito: 'integral-def.propriedades',
          },
        ],
        gabarito,
        proximos,
      ),
    };
  }

  if (propriedade === 'inversao') {
    const gabarito = -primeira;

    return {
      id: `def-prop-inv-${a}${b}-${primeira}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        `Sabendo que a integral de f de ${a} a ${b} vale ${primeira}, quanto vale a integral ` +
        `de ${b} a ${a}?`,
      enunciadoTex:
        `\\int_{${a}}^{${b}} f = ${primeira} \\qquad \\int_{${b}}^{${a}} f = \\;?`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Trocar os limites troca o sinal da integral.',
            tex: `\\int_{${b}}^{${a}} f = -\\int_{${a}}^{${b}} f`,
            nota:
              'Na soma de Riemann, Δx = (b − a)/n muda de sinal quando se percorre o ' +
              'intervalo ao contrário.',
          },
          { descricao: 'Logo:', tex: `= -(${primeira}) = ${gabarito}` },
        ],
      },
      conceitos: ['integral-def.propriedades'],
      armadilhas: semColisoes(
        [
          {
            resposta: primeira,
            diagnostico:
              'A integral não é simétrica: inverter os limites INVERTE o sinal. Só a área ' +
              'geométrica ficaria igual.',
            passo: 0,
            conceito: 'integral-def.propriedades',
          },
          {
            resposta: Math.abs(primeira),
            diagnostico:
              'Não se trata de tomar o módulo: a integral invertida é o oposto do valor dado.',
            passo: 0,
            conceito: 'integral-def.propriedades',
          },
        ],
        gabarito,
        proximos,
      ),
    };
  }

  if (propriedade === 'multiplo') {
    const gabarito = fator * primeira;

    return {
      id: `def-prop-mult-${a}${b}-${fator}_${primeira}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        `Sabendo que a integral de f de ${a} a ${b} vale ${primeira}, quanto vale a integral ` +
        `de ${fator}·f no mesmo intervalo?`,
      enunciadoTex:
        `\\int_{${a}}^{${b}} f = ${primeira} \\qquad \\int_{${a}}^{${b}} ${fator}f = \\;?`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Uma constante multiplicativa sai da integral.',
            tex: `\\int_{${a}}^{${b}} ${fator}f = ${fator}\\int_{${a}}^{${b}} f`,
            nota: 'Esticar o gráfico na vertical estica a área na mesma proporção.',
          },
          { descricao: 'Substituindo.', tex: `= ${fator} \\cdot (${primeira}) = ${gabarito}` },
        ],
      },
      conceitos: ['integral-def.propriedades'],
      armadilhas: semColisoes(
        [
          {
            resposta: primeira + fator,
            diagnostico:
              'A constante MULTIPLICA a integral; ela não é somada ao resultado.',
            passo: 0,
            conceito: 'integral-def.propriedades',
          },
          {
            resposta: primeira,
            diagnostico: 'A constante não desaparece: ela multiplica todo o resultado.',
            passo: 0,
            conceito: 'integral-def.propriedades',
          },
        ],
        gabarito,
        proximos,
      ),
    };
  }

  const gabarito = primeira + fator * segunda;

  return {
    id: `def-prop-soma-${a}${b}-${primeira}_${fator}_${segunda}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Sabendo que a integral de f vale ${primeira} e a de g vale ${segunda} no intervalo de ` +
      `${a} a ${b}, quanto vale a integral de f + ${fator}·g?`,
    enunciadoTex:
      `\\int_{${a}}^{${b}} f = ${primeira} \\qquad \\int_{${a}}^{${b}} g = ${segunda} ` +
      `\\qquad \\int_{${a}}^{${b}} (f + ${fator}g) = \\;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A integral é linear: ela separa somas e deixa constantes passarem.',
          tex:
            `\\int_{${a}}^{${b}} (f + ${fator}g) = \\int_{${a}}^{${b}} f + ` +
            `${fator}\\int_{${a}}^{${b}} g`,
        },
        {
          descricao: 'Substituindo.',
          tex: `= ${primeira} + ${fator} \\cdot (${segunda}) = ${gabarito}`,
        },
      ],
    },
    conceitos: ['integral-def.propriedades'],
    armadilhas: semColisoes(
      [
        {
          resposta: primeira + segunda,
          diagnostico: `Faltou o fator ${fator} multiplicando a integral de g.`,
          passo: 0,
          conceito: 'integral-def.propriedades',
        },
        {
          resposta: fator * (primeira + segunda),
          diagnostico:
            `O fator ${fator} multiplica apenas g, não a soma inteira. Confira onde ele está ` +
            'no integrando.',
          passo: 0,
          conceito: 'integral-def.propriedades',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}

function exercicioValorMedio(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { de, ate, m, k } = retaPositiva(nivel, rng);

  const alturaEsquerda = m * de + k;
  const alturaDireita = m * ate + k;
  const largura = ate - de;
  const integral = ((alturaEsquerda + alturaDireita) / 2) * largura;
  const gabarito = integral / largura;

  return {
    id: `def-media-${m}_${k}-${de}${ate}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Qual é o valor MÉDIO da função no intervalo? (use a área, 2 casas decimais)',
    enunciadoTex:
      `f(x) = ${retaTex(m, k)} \\qquad [${de},\\, ${ate}] \\qquad ` +
      `\\bar{f} = \\frac{1}{b-a}\\int_{a}^{b} f`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A integral é a área do trapézio sob a reta.',
          tex:
            `\\int_{${de}}^{${ate}} f = \\frac{${alturaEsquerda} + ${alturaDireita}}{2} ` +
            `\\cdot ${largura} = ${integral}`,
        },
        {
          descricao: 'O valor médio é essa área dividida pela largura.',
          tex: `\\bar{f} = \\frac{${integral}}{${largura}} = ${gabarito}`,
          nota:
            'É a altura do retângulo que teria a MESMA área: numa reta, coincide com o valor ' +
            'no ponto médio do intervalo.',
        },
      ],
    },
    conceitos: ['integral-def.propriedades', 'integral-def.area-geometrica'],
    armadilhas: semColisoes(
      [
        {
          resposta: integral,
          diagnostico:
            'Esse é o valor da integral, não o valor médio. Falta dividir pela largura do ' +
            `intervalo, que vale ${largura}.`,
          passo: 1,
          conceito: 'integral-def.propriedades',
        },
        {
          resposta: (alturaEsquerda + alturaDireita) / 2 + 1,
          diagnostico:
            'Quase: o valor médio de uma função LINEAR é exatamente a média das alturas nos ' +
            'extremos. Confira a conta.',
          passo: 1,
          conceito: 'integral-def.propriedades',
        },
        {
          resposta: alturaDireita,
          diagnostico:
            'Esse é o valor no extremo direito. O valor médio pondera todo o intervalo.',
          passo: 0,
          conceito: 'integral-def.propriedades',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}
