import {
  anguloEntreComPassos,
  areaParalelogramoComPassos,
  modulo,
  produtoEscalar,
  produtoVetorialZ,
  projecaoComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;

type Pergunta = 'escalar' | 'angulo' | 'projecao' | 'area' | 'trabalho';

export const geradorProdutos: GeradorExercicio<number> = {
  topicoId: 'produto-escalar-vetorial',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'escalar':
        return exercicioEscalar(nivel, rng);
      case 'angulo':
        return exercicioAngulo(nivel, rng);
      case 'projecao':
        return exercicioProjecao(nivel, rng);
      case 'area':
        return exercicioArea(nivel, rng);
      case 'trabalho':
        return exercicioTrabalho(nivel, rng);
    }
  },

  // O grau é ruído de unidade: a resposta em si é um número.
  analisar: (entrada) => analisarNumero(entrada.replace(/°/g, '')),

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(2)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['escalar', 'area']);
    case 'medio':
      return rng.escolher<Pergunta>(['angulo', 'projecao', 'escalar']);
    case 'dificil':
      return rng.escolher<Pergunta>(['angulo', 'trabalho', 'projecao']);
  }
}

function sortearVetor(rng: Rng): { x: number; y: number } {
  const x = rng.inteiro(-8, 8);
  const y = rng.inteiro(-8, 8);
  return x === 0 && y === 0 ? { x: 3, y: 4 } : { x, y };
}

function exercicioEscalar(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = sortearVetor(rng);
  const b = sortearVetor(rng);
  const resultado = produtoEscalar(a, b);

  return {
    id: `prod-esc-${a.x}_${a.y}-${b.x}_${b.y}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é o produto escalar de (${a.x}, ${a.y}) por (${b.x}, ${b.y})?`,
    enunciadoTex: `\\vec{a} = (${a.x},\\; ${a.y}) \\qquad \\vec{b} = (${b.x},\\; ${b.y})`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Multiplicamos as componentes correspondentes e somamos.',
          tex: '\\vec{a}\\cdot\\vec{b} = a_x b_x + a_y b_y',
        },
        {
          descricao: 'Substituindo.',
          tex: `= (${a.x})(${b.x}) + (${a.y})(${b.y}) = ${resultado}`,
        },
        {
          descricao: 'O resultado é um NÚMERO, não um vetor.',
          tex: `\\vec{a}\\cdot\\vec{b} = ${resultado}`,
          nota:
            Math.abs(resultado) < 1e-9
              ? 'Zero: os vetores são perpendiculares.'
              : resultado > 0
                ? 'Positivo: o ângulo entre eles é agudo.'
                : 'Negativo: o ângulo é obtuso.',
        },
      ],
    },
    conceitos: ['produtos.escalar'],
    armadilhas: semColisoes(
      [
        {
          resposta: produtoVetorialZ(a, b),
          diagnostico:
            'Essa é a componente do produto VETORIAL (aₓb_y − a_ybₓ). O escalar soma os ' +
            'produtos correspondentes; o vetorial os subtrai cruzados.',
          passo: 0,
          conceito: 'produtos.vetorial',
        },
        {
          resposta: a.x * b.x,
          diagnostico: 'Faltou a parcela do eixo y: o produto escalar soma as duas contribuições.',
          passo: 1,
          conceito: 'produtos.escalar',
        },
        {
          resposta: modulo(a) * modulo(b),
          diagnostico:
            'Esse seria o produto escalar apenas se os vetores fossem paralelos e de mesmo ' +
            'sentido, quando cos θ = 1.',
          passo: 1,
          conceito: 'produtos.escalar',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'a·b = aₓbₓ + a_yb_y' : undefined,
  };
}

function exercicioAngulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = sortearVetor(rng);
  const b = sortearVetor(rng);

  const { resultado, passos } = anguloEntreComPassos(a, b);

  return {
    id: `prod-ang-${a.x}_${a.y}-${b.x}_${b.y}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é o ângulo entre (${a.x}, ${a.y}) e (${b.x}, ${b.y})? (em graus, 2 casas)`,
    enunciadoTex: `\\vec{a} = (${a.x},\\; ${a.y}) \\qquad \\vec{b} = (${b.x},\\; ${b.y})`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['produtos.escalar'],
    armadilhas: semColisoes(
      [
        {
          resposta: produtoEscalar(a, b),
          diagnostico:
            'Esse é o produto escalar, não o ângulo. Ele é só o primeiro passo: falta dividir ' +
            'pelos módulos e tomar o arco-cosseno.',
          passo: 1,
          conceito: 'produtos.escalar',
        },
        {
          resposta: 180 - resultado,
          diagnostico:
            'Esse é o ângulo suplementar. Confira o sinal do produto escalar: positivo indica ' +
            'ângulo agudo, negativo indica obtuso.',
          passo: 3,
          conceito: 'produtos.escalar',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioProjecao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = sortearVetor(rng);
  const b = sortearVetor(rng);

  const { resultado, passos } = projecaoComPassos(a, b);

  return {
    id: `prod-proj-${a.x}_${a.y}-${b.x}_${b.y}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é a projeção de (${a.x}, ${a.y}) sobre a direção de (${b.x}, ${b.y})? ` +
      '(2 casas decimais)',
    enunciadoTex: `\\vec{a} = (${a.x},\\; ${a.y}) \\qquad \\vec{b} = (${b.x},\\; ${b.y})`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['produtos.projecao', 'produtos.escalar'],
    armadilhas: semColisoes(
      [
        {
          resposta: produtoEscalar(a, b),
          diagnostico:
            'Faltou dividir pelo módulo de b. Sem essa divisão, o resultado depende do ' +
            'comprimento de b — e a projeção deve depender só da sua direção.',
          passo: 1,
          conceito: 'produtos.projecao',
        },
        {
          resposta: produtoEscalar(a, b) / modulo(a),
          diagnostico:
            'A divisão é pelo módulo do vetor sobre o qual se projeta, b — não pelo módulo de a.',
          passo: 1,
          conceito: 'produtos.projecao',
        },
        {
          resposta: modulo(a),
          diagnostico:
            'Esse é o módulo de a. A projeção só o alcança quando os vetores são paralelos e ' +
            'de mesmo sentido.',
          passo: 0,
          conceito: 'produtos.projecao',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioArea(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = sortearVetor(rng);
  const b = sortearVetor(rng);

  const { resultado, passos } = areaParalelogramoComPassos(a, b);

  return {
    id: `prod-area-${a.x}_${a.y}-${b.x}_${b.y}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é a área do paralelogramo formado por (${a.x}, ${a.y}) e (${b.x}, ${b.y})?`,
    enunciadoTex: `\\vec{a} = (${a.x},\\; ${a.y}) \\qquad \\vec{b} = (${b.x},\\; ${b.y})`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['produtos.vetorial'],
    armadilhas: semColisoes(
      [
        {
          resposta: produtoEscalar(a, b),
          diagnostico:
            'O produto ESCALAR mede alinhamento e usa cosseno. A área usa o produto vetorial, ' +
            'com seno — e os dois são opostos: um zera onde o outro é máximo.',
          passo: 1,
          conceito: 'produtos.escalar',
        },
        {
          resposta: resultado / 2,
          diagnostico:
            'A metade é a área do TRIÂNGULO formado pelos dois vetores. O paralelogramo é o ' +
            'dobro dele.',
          passo: 2,
          conceito: 'produtos.vetorial',
        },
        {
          resposta: modulo(a) * modulo(b),
          diagnostico:
            'Esse produto só daria a área se os vetores fossem perpendiculares, quando ' +
            'sen θ = 1.',
          passo: 0,
          conceito: 'produtos.vetorial',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'A = |aₓb_y − a_ybₓ|' : undefined,
  };
}

function exercicioTrabalho(nivel: Nivel, rng: Rng): Exercicio<number> {
  const forca = rng.inteiro(5, 60);
  const deslocamento = rng.inteiro(2, 20);
  const angulo = rng.escolher([0, 30, 37, 45, 53, 60, 90, 120, 180]);

  const resultado = forca * deslocamento * Math.cos((angulo * Math.PI) / 180);

  return {
    id: `prod-trab-${forca}-${deslocamento}-${angulo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma força de ${forca} N é aplicada a ${angulo}° do deslocamento, que vale ` +
      `${deslocamento} m. Qual é o trabalho realizado, em joules? (2 casas)`,
    enunciadoTex: `F = ${forca}\\,\\text{N} \\qquad d = ${deslocamento}\\,\\text{m} \\qquad \\theta = ${angulo}^\\circ`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Trabalho é o produto escalar entre força e deslocamento.',
          tex: 'W = \\vec{F}\\cdot\\vec{d} = Fd\\cos\\theta',
        },
        {
          descricao: 'Só a componente da força na direção do deslocamento realiza trabalho.',
          tex: `F\\cos\\theta = ${forca}\\cos ${angulo}^\\circ = ${Number((forca * Math.cos((angulo * Math.PI) / 180)).toFixed(4))}\\,\\text{N}`,
        },
        {
          descricao: 'Multiplicamos pelo deslocamento.',
          tex: `W = ${Number(resultado.toFixed(4))}\\,\\text{J}`,
          nota:
            angulo === 90
              ? 'Força perpendicular ao deslocamento não realiza trabalho nenhum.'
              : angulo > 90
                ? 'Trabalho negativo: a força se opõe ao movimento.'
                : undefined,
        },
      ],
    },
    conceitos: ['produtos.projecao', 'produtos.escalar'],
    armadilhas: semColisoes(
      [
        {
          resposta: forca * deslocamento,
          diagnostico:
            'Faltou o cosseno: a força está inclinada em relação ao deslocamento, e só a ' +
            'componente alinhada realiza trabalho.',
          passo: 1,
          conceito: 'produtos.projecao',
        },
        {
          resposta: forca * deslocamento * Math.sin((angulo * Math.PI) / 180),
          diagnostico:
            'O trabalho usa COSSENO. O seno apareceria no torque, que mede giro, não ' +
            'deslocamento alinhado.',
          passo: 0,
          conceito: 'produtos.vetorial',
        },
      ],
      resultado,
      proximos,
    ),
  };
}
