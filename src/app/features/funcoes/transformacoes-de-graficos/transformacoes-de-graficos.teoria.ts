import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_TRANSFORMACOES: readonly Teoria[] = [
  {
    id: 'transformacoes.dentro-e-fora',
    titulo: 'Dentro inverte, fora não',
    resumo: 'A assimetria que explica quase todo erro do tópico.',
    definicao:
      'O que está fora do argumento se comporta como a intuição espera: multiplicar por 2 ' +
      'estica na vertical, somar 3 sobe três. O que está dentro se comporta ao contrário: ' +
      'somar 3 desloca para a ESQUERDA, e multiplicar por 2 COMPRIME pela metade. O motivo é ' +
      'que o x precisa compensar a operação para que o argumento chegue ao mesmo valor.',
    formulas: [
      { tex: 'g(x) = a\\,f\\!\\left(b(x - h)\\right) + k' },
      { tex: 'f(x + 3) \\;\\text{desloca 3 para a ESQUERDA}' },
      { tex: 'f(2x) \\;\\text{comprime pela metade}' },
    ],
    demonstracao: [
      {
        descricao: 'O gráfico de f passa pelo ponto de abscissa 4.',
        tex: 'f(4) = y_{0}',
      },
      {
        descricao: 'Em f(x + 3), onde o novo gráfico vale a mesma coisa?',
        tex: 'x + 3 = 4 \\;\\Longrightarrow\\; x = 1',
        nota: 'O ponto que estava em 4 aparece agora em 1: andou para a esquerda.',
      },
      {
        descricao: 'E em f(2x)?',
        tex: '2x = 4 \\;\\Longrightarrow\\; x = 2',
      },
      {
        descricao: 'O que estava em 4 passa para 2: o gráfico encolheu pela metade.',
        tex: 'x_{novo} = \\frac{x_{antigo}}{b} + h',
      },
    ],
    exemplo: {
      enunciado: 'g(x) = (x − 3)² + 1 vem de f(x) = x². Onde fica o vértice de g?',
      passos: [
        {
          descricao:
            'Dentro do parêntese, x − 3: o gráfico vai 3 para a DIREITA — o sinal se inverte.',
          tex: 'f(x - 3) \\;\\Rightarrow\\; 3 \\text{ para a direita}',
        },
        {
          descricao: 'Fora, + 1: o gráfico sobe 1 — sem inversão.',
          tex: 'f(x - 3) + 1 \\;\\Rightarrow\\; 1 \\text{ para cima}',
        },
        {
          descricao: 'O vértice de x², em (0, 0), acompanha os dois movimentos.',
          tex: '(0, 0) \\to (0 + 3,\\; 0 + 1) = (3, 1)',
        },
      ],
    },
    vejaTambem: ['transformacoes.deslocamento', 'transformacoes.escala'],
  },
  {
    id: 'transformacoes.deslocamento',
    titulo: 'Deslocar sem deformar',
    resumo: 'A forma não muda; só o lugar.',
    definicao:
      'Somar uma constante fora do argumento sobe o gráfico inteiro; subtrair uma constante ' +
      'dentro dele empurra para a direita. Nos dois casos a forma fica idêntica — nenhuma ' +
      'curvatura muda, nenhum ponto se aproxima de outro. É por isso que o vértice de uma ' +
      'parábola na forma canônica se lê direto, sem completar quadrado.',
    formulas: [
      { tex: 'y = a(x - h)^{2} + k \\;\\Longrightarrow\\; V = (h,\\; k)' },
      {
        tex: 'f(x) + k \\;\\text{sobe } k \\qquad f(x - h) \\;\\text{anda } h \\text{ para a direita}',
      },
    ],
    demonstracao: [
      {
        descricao: 'A parábola básica tem vértice na origem.',
        tex: 'y = x^{2} \\;\\Longrightarrow\\; V = (0,\\; 0)',
      },
      {
        descricao: 'Subtraindo 3 dentro dos parênteses.',
        tex: 'y = (x - 3)^{2} \\;\\Longrightarrow\\; V = (3,\\; 0)',
        nota: 'O sinal de menos empurra para a direita — é o que mais confunde.',
      },
      {
        descricao: 'Somando 2 fora.',
        tex: 'y = (x - 3)^{2} + 2 \\;\\Longrightarrow\\; V = (3,\\; 2)',
      },
      {
        descricao: 'A abertura da parábola continua exatamente a mesma.',
        tex: "y'' = 2 \\;\\text{em todos os casos}",
      },
    ],
    vejaTambem: ['transformacoes.dentro-e-fora', 'transformacoes.escala'],
  },
  {
    id: 'transformacoes.escala',
    titulo: 'Esticar, comprimir, refletir',
    resumo: 'Fatores mudam o tamanho; sinais negativos espelham.',
    definicao:
      'Um fator fora do argumento multiplica as alturas: acima de 1 estica na vertical, entre ' +
      '0 e 1 achata. Um fator dentro faz o oposto na horizontal: acima de 1 comprime. Sinais ' +
      'negativos refletem — fora, no eixo horizontal; dentro, no eixo vertical. A ordem ' +
      'importa: primeiro o que age no x, depois o que age no y.',
    formulas: [
      { tex: 'a\\,f(x) \\;\\text{estica na vertical por } a' },
      { tex: 'f(bx) \\;\\text{comprime na horizontal por } b' },
      { tex: '-f(x) \\;\\text{reflete no eixo x} \\qquad f(-x) \\;\\text{reflete no eixo y}' },
    ],
    demonstracao: [
      {
        descricao: 'Um gráfico que ocupa 8 unidades de largura.',
        tex: '\\text{largura} = 8',
      },
      {
        descricao: 'Com o argumento multiplicado por 4, ele encolhe.',
        tex: 'f(4x) \\;\\Longrightarrow\\; \\text{largura} = \\frac{8}{4} = 2',
      },
      {
        descricao: 'Já multiplicar a função inteira não mexe na largura.',
        tex: '4f(x) \\;\\Longrightarrow\\; \\text{largura} = 8, \\;\\text{altura} \\times 4',
      },
      {
        descricao: 'E o sinal negativo espelha, sem mudar tamanho.',
        tex: '-f(x) \\;\\Longrightarrow\\; \\text{mesma forma, de cabeça para baixo}',
        nota: 'Refletir é um caso particular de esticar, com fator menos um.',
      },
    ],
    vejaTambem: ['transformacoes.dentro-e-fora', 'transformacoes.deslocamento'],
  },
];
