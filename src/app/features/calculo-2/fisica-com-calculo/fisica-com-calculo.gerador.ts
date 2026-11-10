import { Polinomio } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-4);
const dec = (v: number): string => formatar(v).replace(',', '{,}');

type Pergunta =
  'deslocamento' | 'mola' | 'forca-variavel' | 'velocidade' | 'centro-de-massa' | 'gravidade';

/**
 * Física com cálculo.
 *
 * O bloco que a avaliação de 09/11 deixou registrado para depois do Cálculo 2:
 * a Física do site vem antes do Cálculo, e por isso tudo nela é de força
 * constante. Aqui a força varia, e a integral é que soma: trabalho, deslocamento,
 * velocidade, centro de massa — até o trabalho para subir um satélite, em que a
 * gravidade cai com o quadrado da distância.
 */
export const geradorFisicaComCalculo: GeradorExercicio<number> = {
  topicoId: 'fisica-com-calculo',
  formatoResposta: 'um número, ex.: 12,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'deslocamento':
        return deslocamento(nivel, rng);
      case 'mola':
        return mola(nivel, rng);
      case 'forca-variavel':
        return forcaVariavel(nivel, rng);
      case 'velocidade':
        return velocidade(nivel, rng);
      case 'centro-de-massa':
        return centroDeMassa(nivel, rng);
      case 'gravidade':
        return gravidade(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['deslocamento', 'mola']);
    case 'medio':
      return rng.escolher<Pergunta>(['forca-variavel', 'velocidade', 'mola']);
    case 'dificil':
      return rng.escolher<Pergunta>(['centro-de-massa', 'forca-variavel', 'velocidade']);
    // A gravidade que cai com 1/r² é o caso em que «força × distância» erra
    // por muito — e é o cálculo de quanto custa pôr algo em órbita.
    case 'extremo':
      return rng.escolher<Pergunta>(['gravidade', 'centro-de-massa']);
  }
}

/** Deslocamento = ∫ v dt, com v(t) = at + b. */
function deslocamento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, 4);
  const b = rng.inteiro(0, 6);
  const t1 = rng.inteiro(0, 2);
  const t2 = t1 + rng.inteiro(2, 4);
  const v = Polinomio.de(b, a);
  const s = v.integrar();
  const gabarito = s.avaliar(t2) - s.avaliar(t1);

  return {
    id: `fcc-desloc-${a}${b}-${t1}${t2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um carro tem velocidade v(t) = ${a}t + ${b} (m/s). Quanto ele se desloca entre t = ${t1} s e t = ${t2} s, em metros?`,
    enunciadoTex: `v(t) = ${v.paraTex('t')} \\qquad \\Delta s = \\int_{${t1}}^{${t2}} v(t)\\,dt`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O deslocamento é a área sob a velocidade: a integral de v no intervalo.',
          tex: `\\Delta s = \\int_{${t1}}^{${t2}} (${v.paraTex('t')})\\,dt = \\left[${s.paraTex('t')}\\right]_{${t1}}^{${t2}}`,
        },
        {
          descricao: 'Avaliando nos extremos e subtraindo.',
          tex: `${dec(s.avaliar(t2))} - ${dec(s.avaliar(t1))} = ${dec(gabarito)}\\ \\text{m}`,
        },
      ],
    },
    conceitos: ['fcc.integral-acumula'],
    armadilhas: semColisoes(
      [
        {
          resposta: v.avaliar(t2) * (t2 - t1),
          diagnostico:
            'Velocidade × tempo só vale com velocidade constante. Aqui ela varia: integre.',
          passo: 0,
          conceito: 'fcc.integral-acumula',
        },
        {
          resposta: s.avaliar(t2),
          diagnostico: `Faltou subtrair o valor em t = ${t1}: a integral definida é F(${t2}) − F(${t1}).`,
          passo: 1,
          conceito: 'fcc.integral-acumula',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Integre v(t): a primitiva de ${a}t + ${b} é ${a}t²/2 + ${b}t. Avalie em ${t2} e em ${t1} e subtraia.`,
  };
}

/** Trabalho para esticar uma mola de x₁ a x₂: W = ½k(x₂² − x₁²). */
function mola(nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = rng.escolher([50, 80, 100, 200, 250, 400]);
  const x1 = nivel === 'facil' ? 0 : rng.escolher([0.05, 0.1, 0.2]);
  const x2 = x1 + rng.escolher([0.1, 0.2, 0.3]);
  const gabarito = (k / 2) * (x2 * x2 - x1 * x1);
  const n = (v: number) => String(Number(v.toFixed(2))).replace('.', ',');
  const t = (v: number) => n(v).replace(',', '{,}');

  return {
    id: `fcc-mola-${k}-${x1}-${x2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma mola de constante k = ${k} N/m é esticada de x = ${n(x1)} m até x = ${n(x2)} m. ` +
      'Qual é o trabalho feito, em joules? (2 casas decimais)',
    enunciadoTex: `F(x) = ${k}x \\qquad W = \\int_{${t(x1)}}^{${t(x2)}} ${k}x\\,dx`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'A força da mola cresce com x (lei de Hooke): o trabalho é a integral, não força × distância.',
          tex: `W = \\int_{${t(x1)}}^{${t(x2)}} ${k}x\\,dx = \\left[\\frac{${k}x^{2}}{2}\\right]_{${t(x1)}}^{${t(x2)}}`,
        },
        {
          descricao: 'Substituindo.',
          tex: `W = \\frac{${k}}{2}\\left(${t(x2)}^{2} - ${t(x1)}^{2}\\right) = ${dec(gabarito)}\\ \\text{J}`,
        },
      ],
    },
    conceitos: ['fcc.trabalho'],
    armadilhas: semColisoes(
      [
        {
          resposta: k * x2 * (x2 - x1),
          diagnostico: `Força final × distância supõe força constante igual a ${k}·${n(x2)}. Ela cresce desde ${k}·${n(x1)}: integre.`,
          passo: 0,
          conceito: 'fcc.trabalho',
        },
        {
          resposta: (k / 2) * (x2 - x1) ** 2,
          diagnostico: 'É x₂² − x₁², não (x₂ − x₁)²: a mola já estava esticada no começo.',
          passo: 1,
          conceito: 'fcc.trabalho',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `A força é ${k}x. Integre de ${n(x1)} a ${n(x2)}: W = (${k}/2)·(x₂² − x₁²).`,
  };
}

/** W = ∫ F(x) dx com F polinomial. */
function forcaVariavel(nivel: Nivel, rng: Rng): Exercicio<number> {
  const c2 = rng.inteiro(1, 4);
  const c1 = nivel === 'dificil' ? rng.inteiro(-3, 5) : 0;
  const a = rng.inteiro(0, 2);
  const b = a + rng.inteiro(1, 3);
  const F = Polinomio.de(0, c1, c2);
  const P = F.integrar();
  const gabarito = P.avaliar(b) - P.avaliar(a);

  return {
    id: `fcc-forca-${c2}${c1}-${a}${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Uma força F(x) (em N, x em metros) empurra um corpo de x = ${a} m até x = ${b} m. Qual é o trabalho, em joules? (2 casas decimais)`,
    enunciadoTex: `F(x) = ${F.paraTex()}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Com a força variando, o trabalho é a integral da força ao longo do caminho.',
          tex: `W = \\int_{${a}}^{${b}} (${F.paraTex()})\\,dx = \\left[${P.paraTex()}\\right]_{${a}}^{${b}}`,
        },
        {
          descricao: 'Avaliando nos extremos.',
          tex: `${dec(P.avaliar(b))} - ${dec(P.avaliar(a))} = ${dec(gabarito)}\\ \\text{J}`,
        },
      ],
    },
    conceitos: ['fcc.trabalho'],
    armadilhas: semColisoes(
      [
        {
          resposta: F.avaliar(b) * (b - a),
          diagnostico: 'Força × distância usa uma força constante. Aqui F depende de x: integre.',
          passo: 0,
          conceito: 'fcc.trabalho',
        },
        {
          resposta: F.derivar().avaliar(b) - F.derivar().avaliar(a),
          diagnostico:
            'Você derivou a força. O trabalho é a integral (a primitiva), não a derivada.',
          passo: 0,
          conceito: 'fcc.trabalho',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `W = integral de F(x) de ${a} a ${b}. A primitiva de x² é x³/3.`,
  };
}

/** v(t₂) a partir de a(t) e v(0): v = v₀ + ∫ a dt. */
function velocidade(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = rng.inteiro(1, 3);
  const q = rng.inteiro(0, 4);
  const v0 = rng.inteiro(0, 10);
  const t = rng.inteiro(2, 5);
  const aT = Polinomio.de(q, 0, p); // a(t) = p t² + q
  const A = aT.integrar();
  const gabarito = v0 + A.avaliar(t) - A.avaliar(0);

  return {
    id: `fcc-vel-${p}${q}-${v0}-${t}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um foguete parte com ${v0} m/s e tem aceleração a(t) (m/s², t em s). Qual é a velocidade em t = ${t} s, em m/s? (2 casas decimais)`,
    enunciadoTex: `a(t) = ${aT.paraTex('t')} \\qquad v(0) = ${v0}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A velocidade acumula a aceleração: v(t) = v(0) + integral de a.',
          tex: `v(${t}) = ${v0} + \\int_{0}^{${t}} (${aT.paraTex('t')})\\,dt`,
        },
        {
          descricao: 'Integrando e avaliando.',
          tex: `v(${t}) = ${v0} + \\left[${A.paraTex('t')}\\right]_{0}^{${t}} = ${v0} + ${dec(A.avaliar(t))} = ${dec(gabarito)}\\ \\text{m/s}`,
        },
      ],
    },
    conceitos: ['fcc.integral-acumula'],
    armadilhas: semColisoes(
      [
        {
          resposta: A.avaliar(t),
          diagnostico: `Faltou somar a velocidade inicial de ${v0} m/s.`,
          passo: 1,
          conceito: 'fcc.integral-acumula',
        },
        {
          resposta: v0 + aT.avaliar(t) * t,
          diagnostico: 'a·t só vale com aceleração constante. Aqui ela muda: integre.',
          passo: 0,
          conceito: 'fcc.integral-acumula',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `v(${t}) = ${v0} + integral de a(t) de 0 a ${t}. A primitiva de t² é t³/3.`,
  };
}

/** Centro de massa de uma barra com densidade λ(x) = a + bx (ou + cx² no Extremo). */
function centroDeMassa(nivel: Nivel, rng: Rng): Exercicio<number> {
  const L = rng.inteiro(2, 6);
  const a = rng.inteiro(1, 5);
  const b = rng.inteiro(1, 4);
  const c = nivel === 'extremo' ? rng.inteiro(1, 3) : 0;
  const lambda = Polinomio.de(a, b, c);
  const momento = Polinomio.de(0, a, b, c).integrar(); // ∫ x·λ
  const massa = lambda.integrar();
  const M = massa.avaliar(L);
  const Mx = momento.avaliar(L);
  const gabarito = Mx / M;

  return {
    id: `fcc-cm-${a}${b}${c}-${L}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Uma barra de ${L} m tem densidade linear λ(x) (kg/m), com x medido de uma ponta. Onde fica o centro de massa, em metros a partir dessa ponta? (2 casas decimais)`,
    enunciadoTex: `\\lambda(x) = ${lambda.paraTex()} \\qquad 0 \\leq x \\leq ${L}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'O centro de massa é a média das posições pesada pela massa de cada pedacinho.',
          tex: `x_{cm} = \\frac{\\int_0^{${L}} x\\,\\lambda(x)\\,dx}{\\int_0^{${L}} \\lambda(x)\\,dx}`,
        },
        {
          descricao: 'A massa total (denominador).',
          tex: `M = \\left[${massa.paraTex()}\\right]_0^{${L}} = ${dec(M)}\\ \\text{kg}`,
        },
        {
          descricao: 'O momento (numerador): integramos x vezes λ.',
          tex: `\\int_0^{${L}} x\\lambda\\,dx = \\left[${momento.paraTex()}\\right]_0^{${L}} = ${dec(Mx)}`,
        },
        {
          descricao: 'Dividindo.',
          tex: `x_{cm} = \\frac{${dec(Mx)}}{${dec(M)}} = ${dec(gabarito)}\\ \\text{m}`,
        },
      ],
    },
    conceitos: ['fcc.centro-de-massa'],
    armadilhas: semColisoes(
      [
        {
          resposta: L / 2,
          diagnostico:
            'O meio da barra só é o centro de massa se ela for homogênea. Aqui a densidade cresce com x: o centro se desloca para o lado mais pesado.',
          passo: 0,
          conceito: 'fcc.centro-de-massa',
        },
        {
          resposta: Mx,
          diagnostico: 'Esse é só o numerador. Falta dividir pela massa total.',
          passo: 3,
          conceito: 'fcc.centro-de-massa',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `x_cm = (integral de x·λ) ÷ (integral de λ), ambas de 0 a ${L}. Calcule a massa primeiro.`,
  };
}

/** Trabalho para levar massa m da superfície (R) até a altura h: W = GMm(1/R − 1/(R + h)). */
function gravidade(nivel: Nivel, rng: Rng): Exercicio<number> {
  const G = 6.674e-11;
  const M = 5.972e24;
  const R = 6.371e6;
  const m = rng.escolher([100, 500, 1000, 2000]);
  const hKm = rng.escolher([400, 1000, 2000, 6371, 20000]);
  const h = hKm * 1000;
  const W = G * M * m * (1 / R - 1 / (R + h));
  const gabarito = W / 1e9; // em GJ
  const ingenuo = (m * 9.81 * h) / 1e9;

  return {
    id: `fcc-grav-${m}-${hKm}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Quanto trabalho é preciso para levar um satélite de ${m} kg da superfície da Terra até ${hKm} km de altitude ` +
      '(sem contar a velocidade orbital)? Responda em gigajoules, GJ. (2 casas decimais)',
    enunciadoTex: `F(r) = \\frac{GMm}{r^{2}} \\qquad W = \\int_{R}^{R + h} \\frac{GMm}{r^{2}}\\,dr`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'A gravidade cai com o quadrado da distância ao centro: integramos de R até R + h.',
          tex: 'W = GMm\\left[-\\frac{1}{r}\\right]_{R}^{R+h} = GMm\\left(\\frac{1}{R} - \\frac{1}{R + h}\\right)',
        },
        {
          descricao: `Com R = 6371 km e R + h = ${6371 + hKm} km.`,
          tex: `W = 6{,}674 \\times 10^{-11} \\cdot 5{,}972 \\times 10^{24} \\cdot ${m} \\cdot \\left(\\frac{1}{6{,}371 \\times 10^{6}} - \\frac{1}{${dec((R + h) / 1e6)} \\times 10^{6}}\\right)`,
        },
        {
          descricao: 'Em gigajoules (10⁹ J).',
          tex: `W = ${dec(gabarito)}\\ \\text{GJ}`,
          nota: `Com g constante daria m·g·h = ${formatar(ingenuo)} GJ — ${ingenuo > gabarito ? 'mais' : 'menos'} que o certo, porque g diminui com a altura.`,
        },
      ],
    },
    conceitos: ['fcc.gravidade'],
    armadilhas: semColisoes(
      [
        {
          resposta: ingenuo,
          diagnostico:
            'm·g·h supõe g = 9,81 em todo o caminho. Longe da superfície g é menor: integre GMm/r².',
          passo: 0,
          conceito: 'fcc.gravidade',
        },
        {
          resposta: (G * M * m) / (R + h) / 1e9,
          diagnostico: 'É a DIFERENÇA 1/R − 1/(R + h), não só o termo do ponto final.',
          passo: 0,
          conceito: 'fcc.gravidade',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'A força é GMm/r². A primitiva de 1/r² é −1/r: W = GMm·(1/R − 1/(R + h)), com as distâncias em metros.',
  };
}
