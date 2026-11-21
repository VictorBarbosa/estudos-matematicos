import {
  enunciadoComSufixosPorIdioma,
  moldesDe,
  type ValoresPorIdioma,
} from '@core/enunciados/moldes/moldes.model';
import { paraRadianos } from '@core/math';
import {
  Cena,
  CENAS,
  Forma,
  REFERENCIA_ESCRITA,
  Sintagma,
} from '@core/treino/cenas/cenas.contextos';
import { anguloDaCena, intervaloDoLado, Lado, valorNoIntervalo } from '@core/treino/cenas/faixas';
import { PROFISSOES, profissaoDe } from '@core/treino/cenas/profissoes.contextos';
import { Exercicio, Nivel, SEM_FORMULA, semColisoes } from '@core/treino/models/treino.model';
import { Rng } from '@core/treino/rng/rng';

/**
 * Exercícios de trigonometria a partir de uma CENA.
 *
 * ## O que este motor resolve
 *
 * O tópico tinha cinco formas de pergunta: quem errava reencontrava a mesma
 * pergunta com outros números. Aqui o enunciado é montado de três partes, cada
 * uma vinda do arquivo e nas três línguas:
 *
 * - a **cena** — a história, e com o que o ângulo é formado;
 * - a **pergunta** — o que se dá e o que se pede, com o nome de cada lado na
 *   língua da tela;
 * - o **sufixo** — como responder.
 *
 * Vinte cenas e duas perguntas dão vinte e dois arquivos, e não os cento e
 * quarenta que um molde por combinação exigiria. A variedade vem do produto;
 * o custo, da soma.
 *
 * ## O que o motor garante
 *
 * - **Sempre diz com o que o ângulo é formado.** É exigência da cena, e o
 *   molde dela é obrigado a escrevê-la.
 * - **Números coerentes sem laço de rejeição.** O intervalo admissível do lado
 *   sorteado sai em forma fechada (`faixas.ts`), e o sorteio é um só — sortear
 *   e repetir consumiria um número variável de valores do rng e quebraria o
 *   determinismo que `verificar-geradores.mjs` exige.
 * - **Dica sempre.** `formaDaPergunta` troca só números por `N`, então cada
 *   cena × pergunta é uma forma distinta, e `dicas-de-estreia.spec.ts` exige
 *   dica na estreia de cada uma. A dica mora no molde da cena, de graça nas
 *   três línguas, e é ela que faz a ponte história → triângulo.
 * - **Passos por FORMA, não por cena.** Passo é texto em TypeScript traduzido
 *   pelo dicionário, cuja chave normaliza números mas não palavras: por cena
 *   seriam dezenas de entradas novas; por forma são poucas.
 */

/**
 * O que cada forma dá e o que ela pede.
 *
 * A forma `angulo` fica de fora: ela dá os DOIS catetos e pede o ângulo, e é
 * construída à parte.
 */
const PAPEIS: Readonly<
  Record<Exclude<Forma, 'angulo'>, { readonly procurado: Lado; readonly conhecido: Lado }>
> = {
  'vertical-por-inclinado': { procurado: 'vertical', conhecido: 'inclinado' },
  'horizontal-por-inclinado': { procurado: 'horizontal', conhecido: 'inclinado' },
  'vertical-por-horizontal': { procurado: 'vertical', conhecido: 'horizontal' },
  'horizontal-por-vertical': { procurado: 'horizontal', conhecido: 'vertical' },
  'inclinado-por-vertical': { procurado: 'inclinado', conhecido: 'vertical' },
  'inclinado-por-horizontal': { procurado: 'inclinado', conhecido: 'horizontal' },
};

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

/** O número como o LaTeX o mostra: vírgula, que é como o site escreve. */
const tex = (valor: number, casas = 2): string => valor.toFixed(casas).replace('.', '{,}');

/** O lado medido a partir do lado conhecido e do ângulo. */
function medida(lado: Lado, inclinado: number, radianos: number): number {
  if (lado === 'inclinado') return inclinado;
  return lado === 'vertical' ? inclinado * Math.sin(radianos) : inclinado * Math.cos(radianos);
}

/** O fator que leva do lado conhecido ao procurado, e a razão que o nomeia. */
function razaoEntre(
  procurado: Lado,
  conhecido: Lado,
): { readonly razao: 'sen' | 'cos' | 'tg'; readonly multiplica: boolean } {
  if (conhecido === 'inclinado') {
    return { razao: procurado === 'vertical' ? 'sen' : 'cos', multiplica: true };
  }
  if (procurado === 'inclinado') {
    return { razao: conhecido === 'vertical' ? 'sen' : 'cos', multiplica: false };
  }
  return { razao: 'tg', multiplica: procurado === 'vertical' };
}

const TEX_DA_RAZAO: Readonly<Record<'sen' | 'cos' | 'tg', string>> = {
  sen: '\\sin',
  cos: '\\cos',
  tg: '\\tan',
};

/**
 * O nome do lado em cada língua.
 *
 * O lado inclinado tem dois nomes: o do OBJETO, que entra na frase do dado («A
 * escada mede 6 metros»), e o da MEDIDA, que entra na pergunta («Quanto mede o
 * comprimento da escada?»). Em inglês a diferença é a de uma pergunta que faz
 * sentido e uma que não faz: «What is the ladder?».
 */
function sintagma(cena: Cena, lado: Lado, perguntado: boolean): Sintagma {
  if (lado === 'vertical') return cena.vertical;
  if (lado === 'horizontal') return cena.horizontal;
  return perguntado ? cena.comprimento : cena.inclinado;
}

/** A primeira letra maiúscula: o nome do lado abre a frase da pergunta. */
function comMaiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Um exercício de uma das cenas.
 *
 * A ordem do sorteio é fixa — cena, forma, ângulo, lado — e cada etapa é uma
 * chamada só, para que a mesma semente dê sempre o mesmo exercício.
 */
export function exercicioDeCena(nivel: Nivel, rng: Rng, cenas: readonly Cena[] = CENAS): Exercicio<number> | null {
  const cena = rng.escolher(cenas);
  const forma = rng.escolher(cena.formas);

  if (forma === 'angulo') {
    return exercicioDoAngulo(nivel, rng, cena);
  }

  const { procurado, conhecido } = PAPEIS[forma];

  const anguloGraus = anguloDaCena(rng, nivel === 'facil', cena.limites.angulo);
  const radianos = paraRadianos(anguloGraus);

  const intervalo = intervaloDoLado(conhecido, anguloGraus, cena.limites);
  if (intervalo === null) {
    return null;
  }

  const valorConhecido = valorNoIntervalo(rng, intervalo);
  const inclinado =
    conhecido === 'inclinado'
      ? valorConhecido
      : conhecido === 'vertical'
        ? valorConhecido / Math.sin(radianos)
        : valorConhecido / Math.cos(radianos);

  const gabarito = medida(procurado, inclinado, radianos);
  const { razao, multiplica } = razaoEntre(procurado, conhecido);
  const fator =
    razao === 'sen' ? Math.sin(radianos) : razao === 'cos' ? Math.cos(radianos) : Math.tan(radianos);

  const nomeConhecido = sintagma(cena, conhecido, false);
  const nomeProcurado = sintagma(cena, procurado, true);

  const pessoa = pessoaDaCena(rng, cena);

  const objeto = cena.inclinado;
  const referencia = REFERENCIA_ESCRITA[cena.referencia];

  const valores: ValoresPorIdioma = {
    pt: {
      angulo: anguloGraus,
      pessoa: pessoa.pt,
      objeto: comMaiuscula(objeto.pt),
      referencia: referencia.pt,
      conhecido: comMaiuscula(nomeConhecido.pt),
      valor: valorConhecido,
      unidade: cena.unidade.pt,
      procurado: nomeProcurado.pt,
    },
    fr: {
      angulo: anguloGraus,
      pessoa: pessoa.fr,
      objeto: comMaiuscula(objeto.fr),
      referencia: referencia.fr,
      conhecido: comMaiuscula(nomeConhecido.fr),
      valor: valorConhecido,
      unidade: cena.unidade.fr,
      procurado: nomeProcurado.fr,
    },
    en: {
      angulo: anguloGraus,
      pessoa: pessoa.en,
      objeto: comMaiuscula(objeto.en),
      referencia: referencia.en,
      conhecido: comMaiuscula(nomeConhecido.en),
      valor: valorConhecido,
      unidade: cena.unidade.en,
      procurado: nomeProcurado.en,
    },
  };

  /*
   * Duas redações para a mesma pergunta.
   *
   * Quando o dado é o próprio lado inclinado, dizer «A escada faz 68° com o
   * chão. A escada mede 6 m.» repetiria o sujeito; uma frase só resolve. Nas
   * outras, o ângulo é do lado inclinado e o dado é um cateto, e as duas
   * informações não cabem na mesma oração sem confundir a quem pertence o
   * ângulo.
   */
  const texto = enunciadoComSufixosPorIdioma(
    moldesDe('triangulo-retangulo', `cena-${cena.id}`)[0]!,
    [
      ...moldesDe(
        'triangulo-retangulo',
        conhecido === 'inclinado' ? 'pergunta-lado-inclinado' : 'pergunta-lado',
      ),
      ...moldesDe('triangulo-retangulo', 'sufixo-casas-2'),
    ],
    valores,
  );

  return {
    id: `cena-${cena.id}-${forma}-${anguloGraus}-${valorConhecido}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    dica: texto.dica,
    /*
     * Sem fórmula: montar o triângulo a partir da história É a pergunta.
     * Escrever `\theta = 70°` ao lado do texto entregaria metade do trabalho,
     * e a outra metade — qual lado é qual — não cabe em símbolo nenhum.
     */
    enunciadoTex: SEM_FORMULA,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: passosDaForma(procurado, conhecido, razao, multiplica, {
        anguloGraus,
        valorConhecido,
        fator,
        gabarito,
      }),
    },
    conceitos: ['triangulo.razoes'],
    armadilhas: semColisoes(
      [
        {
          // A troca clássica: seno onde cabia cosseno, e vice-versa.
          resposta: multiplica
            ? valorConhecido * (razao === 'sen' ? Math.cos(radianos) : Math.sin(radianos))
            : valorConhecido / (razao === 'sen' ? Math.cos(radianos) : Math.sin(radianos)),
          diagnostico:
            'A razão está trocada. O lado de frente para o ângulo é o OPOSTO, e o que fica encostado nele é o ADJACENTE — confira qual dos dois o enunciado dá e qual ele pede.',
          passo: 0,
          conceito: 'triangulo.razoes',
        },
        {
          // Multiplicar onde era dividir: o erro de quem não vê a incógnita no
          // denominador.
          resposta: multiplica ? valorConhecido / fator : valorConhecido * fator,
          diagnostico:
            'A operação ficou invertida. Escreva a razão com a incógnita no lugar certo e isole-a: quando ela está embaixo, a conta é uma DIVISÃO.',
          passo: 1,
          conceito: 'triangulo.razoes',
        },
        {
          // O complemento: contar o ângulo a partir da outra linha.
          resposta: multiplica
            ? valorConhecido * fatorDoComplemento(razao, radianos)
            : valorConhecido / fatorDoComplemento(razao, radianos),
          diagnostico:
            'Esse é o resultado com o ÂNGULO COMPLEMENTAR, 90° menos o do enunciado. Conte o ângulo a partir da linha que o enunciado nomeia.',
          passo: 0,
          conceito: 'triangulo.razoes',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}

/** A razão do ângulo complementar, que é a troca de quem conta do outro lado. */
function fatorDoComplemento(razao: 'sen' | 'cos' | 'tg', radianos: number): number {
  const complemento = Math.PI / 2 - radianos;
  return razao === 'sen'
    ? Math.sin(complemento)
    : razao === 'cos'
      ? Math.cos(complemento)
      : Math.tan(complemento);
}

/**
 * Os passos, escritos por FORMA.
 *
 * A ponte entre a história e o triângulo — «a escada é a hipotenusa» — está na
 * dica, que vem do arquivo da cena nas três línguas. Aqui ficam só as frases
 * que valem para qualquer cena, porque cada uma delas custa uma entrada no
 * dicionário de traduções.
 */
function passosDaForma(
  procurado: Lado,
  conhecido: Lado,
  razao: 'sen' | 'cos' | 'tg',
  multiplica: boolean,
  numeros: {
    readonly anguloGraus: number;
    readonly valorConhecido: number;
    readonly fator: number;
    readonly gabarito: number;
  },
): Exercicio<number>['resolucao']['passos'] {
  const { anguloGraus, valorConhecido, fator, gabarito } = numeros;
  const simbolo = TEX_DA_RAZAO[razao];

  const descricaoDaRazao =
    razao === 'sen'
      ? 'Oposto sobre hipotenusa é o seno.'
      : razao === 'cos'
        ? 'Adjacente sobre hipotenusa é o cosseno.'
        : 'Oposto sobre adjacente é a tangente.';

  return [
    {
      descricao: ondeCadaLadoEsta(procurado, conhecido),
      tex: `${simbolo} ${anguloGraus}° = ${
        multiplica ? `\\frac{x}{${tex(valorConhecido, 1)}}` : `\\frac{${tex(valorConhecido, 1)}}{x}`
      }`,
      nota: descricaoDaRazao,
    },
    {
      descricao: multiplica
        ? 'Isolamos o lado procurado multiplicando pelo lado conhecido.'
        : 'A incógnita está embaixo: para isolá-la, DIVIDIMOS o lado conhecido pela razão.',
      tex: multiplica
        ? `x = ${tex(valorConhecido, 1)} \\cdot ${simbolo} ${anguloGraus}°`
        : `x = \\frac{${tex(valorConhecido, 1)}}{${simbolo} ${anguloGraus}°}`,
    },
    {
      descricao: 'Calculando.',
      tex: `x = ${tex(valorConhecido, 1)} ${multiplica ? '\\cdot' : '\\div'} ${tex(fator, 4)} = ${tex(gabarito)}`,
    },
  ];
}

/**
 * A frase que situa os dois lados em relação ao ângulo.
 *
 * São quatro, não seis: o que importa é o PAPEL de cada lado, e «dou a
 * hipotenusa, peço o oposto» é a mesma frase em qualquer cena.
 */
function ondeCadaLadoEsta(procurado: Lado, conhecido: Lado): string {
  if (conhecido === 'inclinado') {
    return procurado === 'vertical'
      ? 'O lado conhecido é o maior, de frente para o ângulo reto: é a hipotenusa. O procurado está de frente para o ângulo dado: é o cateto OPOSTO.'
      : 'O lado conhecido é o maior, de frente para o ângulo reto: é a hipotenusa. O procurado está encostado no ângulo dado: é o cateto ADJACENTE.';
  }
  if (procurado === 'inclinado') {
    return conhecido === 'vertical'
      ? 'O lado conhecido está de frente para o ângulo dado: é o cateto OPOSTO. O procurado é a hipotenusa, o maior de todos.'
      : 'O lado conhecido está encostado no ângulo dado: é o cateto ADJACENTE. O procurado é a hipotenusa, o maior de todos.';
  }
  return procurado === 'vertical'
    ? 'O lado conhecido está encostado no ângulo dado (ADJACENTE) e o procurado está de frente para ele (OPOSTO): os dois são catetos.'
    : 'O lado conhecido está de frente para o ângulo dado (OPOSTO) e o procurado está encostado nele (ADJACENTE): os dois são catetos.';
}

/**
 * O ângulo, a partir dos dois catetos.
 *
 * ## Por que o ângulo é sorteado primeiro
 *
 * Sortear os dois catetos à solta produz triângulos de 4° e de 86° com a mesma
 * frequência dos de 40° — e nenhuma escada fica a 4° do chão. Aqui o ângulo
 * nasce dentro da faixa da cena, o cateto adjacente vem do intervalo
 * admissível, e o oposto é DERIVADO dele.
 *
 * ## Por que o gabarito vem dos números escritos
 *
 * O oposto é arredondado para caber no enunciado, e isso desloca o ângulo em
 * alguns centésimos. Quem refaz a conta a partir do texto tem de chegar ao
 * mesmo número, então a resposta é recalculada dos dois valores EXIBIDOS, e
 * não do ângulo que serviu para construí-los.
 */
function exercicioDoAngulo(nivel: Nivel, rng: Rng, cena: Cena): Exercicio<number> | null {
  const anguloBase = anguloDaCena(rng, nivel === 'facil', cena.limites.angulo);
  const intervalo = intervaloDoLado('horizontal', anguloBase, cena.limites);
  if (intervalo === null) {
    return null;
  }

  const adjacente = valorNoIntervalo(rng, intervalo);
  const oposto = Math.round(adjacente * Math.tan(paraRadianos(anguloBase)) * 2) / 2;
  if (oposto <= 0) {
    return null;
  }

  const gabarito = (Math.atan(oposto / adjacente) * 180) / Math.PI;

  const pessoa = pessoaDaCena(rng, cena);
  const referencia = REFERENCIA_ESCRITA[cena.referencia];

  const valores: ValoresPorIdioma = {
    pt: {
      pessoa: pessoa.pt,
      objeto: cena.inclinado.pt,
      referencia: referencia.pt,
      conhecido: comMaiuscula(cena.vertical.pt),
      valor: oposto,
      conhecido2: cena.horizontal.pt,
      valor2: adjacente,
      unidade: cena.unidade.pt,
    },
    fr: {
      pessoa: pessoa.fr,
      objeto: cena.inclinado.fr,
      referencia: referencia.fr,
      conhecido: comMaiuscula(cena.vertical.fr),
      valor: oposto,
      conhecido2: cena.horizontal.fr,
      valor2: adjacente,
      unidade: cena.unidade.fr,
    },
    en: {
      pessoa: pessoa.en,
      objeto: cena.inclinado.en,
      referencia: referencia.en,
      conhecido: comMaiuscula(cena.vertical.en),
      valor: oposto,
      conhecido2: cena.horizontal.en,
      valor2: adjacente,
      unidade: cena.unidade.en,
    },
  };

  const texto = enunciadoComSufixosPorIdioma(
    moldesDe('triangulo-retangulo', `cena-${cena.id}`)[0]!,
    [
      ...moldesDe('triangulo-retangulo', 'pergunta-angulo'),
      ...moldesDe('triangulo-retangulo', 'sufixo-casas-2'),
    ],
    valores,
  );

  const razao = oposto / adjacente;

  return {
    id: `cena-${cena.id}-angulo-${oposto}-${adjacente}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    dica: texto.dica,
    enunciadoTex: SEM_FORMULA,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Oposto e adjacente juntos dão a tangente do ângulo.',
          tex: `\\tan \\theta = \\frac{${tex(oposto, 1)}}{${tex(adjacente, 1)}} = ${tex(razao, 4)}`,
        },
        {
          descricao: 'Para voltar da razão ao ângulo, usamos a função inversa, o arco-tangente.',
          tex: `\\theta = \\arctan(${tex(razao, 4)})`,
          nota: 'Na calculadora: tan⁻¹, com o modo em GRAUS.',
        },
        {
          descricao: 'Calculando.',
          tex: `\\theta = ${tex(gabarito)}°`,
        },
      ],
    },
    conceitos: ['triangulo.razoes'],
    armadilhas: semColisoes(
      [
        {
          resposta: 90 - gabarito,
          diagnostico:
            'Esse é o OUTRO ângulo agudo: a razão ficou invertida. A tangente é oposto sobre ' +
            'adjacente, vistos a partir do ângulo pedido.',
          passo: 0,
          conceito: 'triangulo.razoes',
        },
        {
          resposta: Math.atan(razao),
          diagnostico:
            'Esse é o ângulo em RADIANOS. A calculadora estava no modo errado: passe para graus.',
          passo: 1,
          conceito: 'triangulo.razoes',
        },
        {
          resposta: razao,
          diagnostico: 'Essa é a tangente, não o ângulo. Falta aplicar o arco-tangente.',
          passo: 1,
          conceito: 'triangulo.razoes',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}

/**
 * Quem aparece na cena.
 *
 * O sorteio acontece mesmo quando a cena não tem gente: é o que mantém o
 * consumo do rng igual para todas elas.
 */
function pessoaDaCena(rng: Rng, cena: Cena): Sintagma {
  const escolhida = rng.escolher(cena.profissoes.length > 0 ? cena.profissoes : ['pedreiro']);
  return (profissaoDe(escolhida) ?? PROFISSOES[0]!).nome;
}
