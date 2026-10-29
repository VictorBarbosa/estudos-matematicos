import { NOME_SOLIDO, Solido, superficieComPassos, volumeComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;

type Pergunta = 'volume' | 'superficie' | 'escala' | 'altura-faltante';

export const geradorSolidos: GeradorExercicio<number> = {
  topicoId: 'solidos-e-volumes',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'volume':
        return exercicioVolume(nivel, rng);
      case 'superficie':
        return exercicioSuperficie(nivel, rng);
      case 'escala':
        return exercicioEscala(nivel, rng);
      case 'altura-faltante':
        return exercicioAlturaFaltante(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(2)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return 'volume';
    case 'medio':
      return rng.escolher<Pergunta>(['volume', 'superficie', 'escala']);
    case 'dificil':
      return rng.escolher<Pergunta>(['superficie', 'escala', 'altura-faltante']);
  }
}

function exercicioVolume(nivel: Nivel, rng: Rng): Exercicio<number> {
  const solido: Solido = rng.escolher(
    nivel === 'facil' ? ['cilindro', 'cone', 'esfera'] : ['cilindro', 'cone', 'esfera', 'piramide'],
  );

  const raio = rng.inteiro(2, 8);
  const altura = rng.inteiro(3, 12);
  const areaBase = rng.inteiro(4, 36);

  const dimensoes = { raio, altura, areaBase };
  const { resultado, passos } = volumeComPassos(solido, dimensoes);

  const enunciado =
    solido === 'esfera'
      ? `Qual é o volume de uma esfera de raio ${raio}? (2 casas decimais)`
      : solido === 'piramide'
        ? `Uma pirâmide tem área da base ${areaBase} e altura ${altura}. Qual é seu volume?`
        : `Qual é o volume de um ${NOME_SOLIDO[solido]} de raio ${raio} e altura ${altura}? ` +
          '(2 casas decimais)';

  const enunciadoTex =
    solido === 'esfera'
      ? `r = ${raio}`
      : solido === 'piramide'
        ? `A_b = ${areaBase} \\qquad h = ${altura}`
        : `r = ${raio} \\qquad h = ${altura}`;

  // Os erros típicos variam com o sólido.
  const armadilhas =
    solido === 'esfera'
      ? [
          {
            resposta: 4 * Math.PI * raio * raio,
            diagnostico:
              'Essa é a SUPERFÍCIE da esfera, 4πr². O volume usa r³ e tem o fator 4/3.',
            passo: 2,
            conceito: 'solidos.esfera',
          },
          {
            resposta: (4 / 3) * Math.PI * raio * raio,
            diagnostico:
              'O expoente é 3, não 2: volume é uma grandeza de três dimensões.',
            passo: 2,
            conceito: 'solidos.esfera',
          },
        ]
      : solido === 'cone' || solido === 'piramide'
        ? [
            {
              resposta:
                solido === 'cone' ? Math.PI * raio * raio * altura : areaBase * altura,
              diagnostico:
                'Faltou o terço: um sólido que afina até um vértice tem 1/3 do volume do ' +
                'prisma ou cilindro de mesma base e altura.',
              passo: 1,
              conceito: 'solidos.terco',
            },
            {
              resposta:
                solido === 'cone' ? (Math.PI * raio * raio * altura) / 2 : (areaBase * altura) / 2,
              diagnostico:
                'A divisão é por 3, não por 2. O fator 1/2 é da área do triângulo, não do ' +
                'volume do cone.',
              passo: 1,
              conceito: 'solidos.terco',
            },
          ]
        : [
            {
              resposta: (Math.PI * raio * raio * altura) / 3,
              diagnostico:
                'O terço vale para cone e pirâmide. O cilindro tem seção constante: é área da ' +
                'base vezes altura, sem divisão.',
              passo: 0,
              conceito: 'solidos.terco',
            },
            {
              resposta: 2 * Math.PI * raio * altura,
              diagnostico:
                'Essa é a área LATERAL do cilindro. O volume usa a área da base, πr².',
              passo: 1,
              conceito: 'solidos.base-altura',
            },
          ];

  return {
    id: `sol-vol-${solido}-${raio}-${altura}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado,
    enunciadoTex,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos:
      solido === 'esfera'
        ? ['solidos.esfera']
        : solido === 'cone' || solido === 'piramide'
          ? ['solidos.terco']
          : ['solidos.base-altura'],
    armadilhas: semColisoes(armadilhas, resultado, proximos),
    dica:
      nivel === 'facil'
        ? solido === 'esfera'
          ? 'V = 4πr³/3'
          : solido === 'cone'
            ? 'V = πr²h/3'
            : 'V = πr²h'
        : undefined,
  };
}

function exercicioSuperficie(nivel: Nivel, rng: Rng): Exercicio<number> {
  const solido: Solido = rng.escolher(['esfera', 'cilindro', 'cone']);
  const raio = rng.inteiro(2, 8);
  const altura = rng.inteiro(3, 12);
  const geratriz = raio + rng.inteiro(2, 8);

  const dimensoes = { raio, altura, geratriz };
  const { resultado, passos } = superficieComPassos(solido, dimensoes);

  const enunciado =
    solido === 'esfera'
      ? `Qual é a área da superfície de uma esfera de raio ${raio}? (2 casas decimais)`
      : solido === 'cone'
        ? `Um cone tem raio ${raio} e geratriz ${geratriz}. Qual é sua área total? (2 casas)`
        : `Um cilindro tem raio ${raio} e altura ${altura}. Qual é sua área total? (2 casas)`;

  const enunciadoTex =
    solido === 'esfera'
      ? `r = ${raio}`
      : solido === 'cone'
        ? `r = ${raio} \\qquad g = ${geratriz}`
        : `r = ${raio} \\qquad h = ${altura}`;

  const armadilhas =
    solido === 'esfera'
      ? [
          {
            resposta: (4 / 3) * Math.PI * raio ** 3,
            diagnostico: 'Esse é o VOLUME. A superfície é 4πr², sem o fator 4/3 e com r².',
            passo: 1,
            conceito: 'solidos.esfera',
          },
          {
            resposta: Math.PI * raio * raio,
            diagnostico:
              'Esse é um único círculo máximo. A esfera tem superfície equivalente a QUATRO ' +
              'deles.',
            passo: 0,
            conceito: 'solidos.esfera',
          },
        ]
      : solido === 'cone'
        ? [
            {
              resposta: Math.PI * raio * geratriz,
              diagnostico: 'Essa é só a área LATERAL. A área total inclui a base circular.',
              passo: 1,
              conceito: 'solidos.base-altura',
            },
            {
              resposta: Math.PI * raio * raio + Math.PI * raio * raio,
              diagnostico:
                'A lateral usa a GERATRIZ, não o raio: ela é o setor circular de raio g.',
              passo: 0,
              conceito: 'solidos.base-altura',
            },
          ]
        : [
            {
              resposta: 2 * Math.PI * raio * altura,
              diagnostico: 'Essa é a lateral. Faltam as duas tampas circulares.',
              passo: 1,
              conceito: 'solidos.base-altura',
            },
            {
              resposta: Math.PI * raio * raio + 2 * Math.PI * raio * altura,
              diagnostico:
                'Faltou uma tampa: o cilindro fechado tem duas bases, uma em cada extremidade.',
              passo: 1,
              conceito: 'solidos.base-altura',
            },
          ];

  return {
    id: `sol-sup-${solido}-${raio}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado,
    enunciadoTex,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: solido === 'esfera' ? ['solidos.esfera'] : ['solidos.base-altura'],
    armadilhas: semColisoes(armadilhas, resultado, proximos),
  };
}

function exercicioEscala(nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = rng.escolher([2, 3, 4, 5, 10]);
  const volume = rng.inteiro(2, 50);
  const gabarito = volume * k ** 3;

  return {
    id: `sol-escala-${k}-${volume}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um sólido de volume ${volume} cm³ é ampliado ${k} vezes em todas as dimensões. Qual é ` +
      'o novo volume, em cm³?',
    enunciadoTex: `V = ${volume} \\qquad k = ${k}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Cada uma das três dimensões é multiplicada por k.',
          tex: `V' = (k\\ell_1)(k\\ell_2)(k\\ell_3) = k^{3} V`,
        },
        {
          descricao: 'Calculamos o fator.',
          tex: `k^{3} = ${k}^{3} = ${k ** 3}`,
        },
        {
          descricao: 'Multiplicamos pelo volume original.',
          tex: `V' = ${k ** 3} \\cdot ${volume} = ${gabarito}`,
          nota: 'A superfície, por sua vez, cresceria apenas k² = ' + k ** 2 + ' vezes.',
        },
      ],
    },
    conceitos: ['solidos.escala'],
    armadilhas: semColisoes(
      [
        {
          resposta: volume * k,
          diagnostico:
            'A razão k multiplica COMPRIMENTOS. O volume tem três dimensões, então o fator é k³.',
          passo: 0,
          conceito: 'solidos.escala',
        },
        {
          resposta: volume * k ** 2,
          diagnostico: 'k² é o fator de ÁREA. Volume escala com k³.',
          passo: 1,
          conceito: 'solidos.escala',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? "V' = k³·V" : undefined,
  };
}

function exercicioAlturaFaltante(nivel: Nivel, rng: Rng): Exercicio<number> {
  const cone = rng.escolher([true, false]);
  const raio = rng.inteiro(2, 8);
  const altura = rng.inteiro(3, 12);

  const volume = volumeComPassos(cone ? 'cone' : 'cilindro', { raio, altura }).resultado;

  return {
    id: `sol-alt-${cone ? 'cone' : 'cil'}-${raio}-${altura}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um ${cone ? 'cone' : 'cilindro'} de raio ${raio} tem volume ` +
      `${Number(volume.toFixed(2))}. Qual é sua altura?`,
    enunciadoTex: `r = ${raio} \\qquad V = ${Number(volume.toFixed(2))}`,
    gabarito: altura,
    resolucao: {
      resultado: altura,
      passos: [
        {
          descricao: 'Partimos da fórmula do volume e isolamos a altura.',
          tex: cone
            ? 'V = \\frac{\\pi r^{2}h}{3} \\;\\Rightarrow\\; h = \\frac{3V}{\\pi r^{2}}'
            : 'V = \\pi r^{2} h \\;\\Rightarrow\\; h = \\frac{V}{\\pi r^{2}}',
        },
        {
          descricao: 'Calculamos a área da base.',
          tex: `\\pi r^{2} = \\pi \\cdot ${raio}^{2} = ${Number((Math.PI * raio * raio).toFixed(4))}`,
        },
        {
          descricao: 'Dividimos e chegamos à altura.',
          tex: `h = ${altura}`,
          nota: cone ? 'O 3 sobe multiplicando o volume ao isolarmos h.' : undefined,
        },
      ],
    },
    conceitos: cone ? ['solidos.terco'] : ['solidos.base-altura'],
    armadilhas: semColisoes(
      [
        {
          resposta: cone ? volume / (Math.PI * raio * raio) : (3 * volume) / (Math.PI * raio * raio),
          diagnostico: cone
            ? 'Faltou o 3: como o volume do cone já tinha sido dividido por 3, o fator volta ' +
              'multiplicando quando isolamos h.'
            : 'O cilindro não tem o fator 3 — esse é do cone.',
          passo: 0,
          conceito: 'solidos.terco',
        },
        {
          resposta: volume / raio,
          diagnostico:
            'O denominador é a ÁREA da base, πr², não o raio. Volume dividido por comprimento ' +
            'daria uma área, não uma altura.',
          passo: 1,
          conceito: 'solidos.base-altura',
        },
      ],
      altura,
      proximos,
    ),
  };
}
