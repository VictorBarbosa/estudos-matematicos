import {
  ESTADO_INICIAL,
  calcularFatores,
  calcularInteiros,
  EstadoCalculadora,
  alternarSinal,
  apagar,
  calcular,
  digitar,
  emGraus,
  fecharPendentes,
  formatarValor,
  inverso,
  limpar,
  porcentagem,
} from '@core/calculadora/models/calculadora.model';

/** Digita uma sequência de teclas, como quem aperta uma a uma. */
function teclar(sequencia: readonly string[]): EstadoCalculadora {
  return sequencia.reduce((estado, tecla) => digitar(estado, tecla), ESTADO_INICIAL);
}

/** O valor que a calculadora mostra depois do igual. */
function conta(expressao: string, angulo: 'rad' | 'deg' = 'rad'): string | null {
  return calcular({ ...ESTADO_INICIAL, expressao }, angulo).resultado;
}

describe('a conta', () => {
  it('respeita a ordem das operações', () => {
    // O visor mostra a expressão inteira justamente para que isto fique claro:
    // num site que ensina precedência, 2+3×4 não pode dar 20.
    expect(conta('2+3×4')).toBe('14');
  });

  it('soma decimais sem o lixo do ponto flutuante', () => {
    expect(conta('0,1+0,2')).toBe('0,3');
  });

  it('lê a vírgula como separador decimal', () => {
    expect(conta('1,5×4')).toBe('6');
  });

  it('calcula potência, raiz e logaritmo', () => {
    expect(conta('2^10')).toBe('1024');
    expect(conta('√(144)')).toBe('12');
    expect(conta('log(1000)')).toBe('3');
    expect(conta('ln(e)')).toBe('1');
  });

  it('conhece π e o número de Euler', () => {
    expect(conta('π')).toBe('3,14159265359');
    expect(conta('e^0')).toBe('1');
  });

  it('fecha sozinha os parênteses que ficaram abertos', () => {
    // Quem escreve sin(30 e aperta igual quer o seno de trinta, não um erro.
    expect(fecharPendentes('sin(30')).toBe('sin(30)');
    expect(fecharPendentes('((1+2)')).toBe('((1+2))');
    expect(conta('√(4', 'rad')).toBe('2');
  });

  it('avisa quando a conta não fecha', () => {
    const estado = calcular({ ...ESTADO_INICIAL, expressao: '2+' }, 'rad');

    expect(estado.resultado).toBeNull();
    expect(estado.erro?.chave).toBe('calculadora.naoCalcula');
  });

  it('divisão por zero não vira resultado', () => {
    expect(conta('1÷0')).toBeNull();
  });

  it('o igual numa tela vazia não faz nada', () => {
    expect(calcular(ESTADO_INICIAL, 'rad')).toEqual(ESTADO_INICIAL);
  });
});

describe('graus e radianos', () => {
  it('em radianos, o seno de π vale zero', () => {
    // π não cabe num `double`: o valor exato sai 1,22·10⁻¹⁶, que é zero com
    // poeira binária em cima. Mostrar isso faria a calculadora parecer quebrada.
    expect(conta('sin(π)', 'rad')).toBe('0');
  });

  it('em graus, o cosseno de 90 vale zero', () => {
    expect(conta('cos(90)', 'deg')).toBe('0');
  });

  it('número minúsculo sem trigonometria continua inteiro', () => {
    // 6,6·10⁻³⁴ é a constante de Planck, não ruído: arredondar para zero aqui
    // seria dar uma resposta errada.
    expect(conta('1÷10^20')).toContain('e-20');
    expect(formatarValor(6.626e-34)).toContain('e-34');
  });

  it('em graus, o seno de 30 vale meio', () => {
    expect(conta('sin(30)', 'deg')).toBe('0,5');
  });

  it('converte o argumento inteiro, e não só o primeiro número', () => {
    // `sin(30+60)` é o seno de noventa. Converter só o 30 daria outro número —
    // do tipo que passa despercebido porque continua parecendo plausível.
    expect(emGraus('sin(30+60)')).toContain('(30+60)');
    expect(conta('sin(30+60)', 'deg')).toBe('1');
  });

  it('converte também o seno de dentro de outro', () => {
    const convertido = emGraus('cos(sin(30))');

    expect(convertido.match(/0\.017453/g)?.length).toBe(2);
  });

  it('não mexe em nada quando não há trigonometria', () => {
    expect(emGraus('2+3×4')).toBe('2+3×4');
  });

  it('parêntese aberto não trava a conversão', () => {
    expect(emGraus('sin(30')).toBe('sin(30');
  });
});

describe('as teclas', () => {
  it('o igual guarda a conta e o resultado', () => {
    const estado = calcular(teclar(['1', '2', '+', '3']), 'rad');

    expect(estado.expressao).toBe('12+3');
    expect(estado.resultado).toBe('15');
  });

  it('depois do resultado, um operador continua a conta', () => {
    const depois = digitar(calcular(teclar(['8', '+', '2']), 'rad'), '×');

    expect(depois.expressao).toBe('10×');
    expect(depois.resultado).toBeNull();
  });

  it('depois do resultado, um algarismo começa outra', () => {
    const depois = digitar(calcular(teclar(['8', '+', '2']), 'rad'), '7');

    expect(depois.expressao).toBe('7');
  });

  it('apagar remove a função inteira, não uma letra', () => {
    // `sin(` é um token: tirar só o parêntese deixaria `sin`, que não é nada.
    expect(apagar(teclar(['3', 'sin('])).expressao).toBe('3');
    expect(apagar(teclar(['1', '2'])).expressao).toBe('1');
  });

  it('limpar devolve a tela ao começo', () => {
    expect(limpar()).toEqual(ESTADO_INICIAL);
  });

  it('o sinal vale para o último número, não para a conta inteira', () => {
    // Em 5×3, o ± é do 3: trocar o sinal da conta toda mudaria o 5 também.
    expect(alternarSinal(teclar(['5', '×', '3'])).expressao).toBe('5×-3');
  });

  it('o sinal volta atrás quando apertado de novo', () => {
    expect(alternarSinal(alternarSinal(teclar(['5', '×', '3']))).expressao).toBe('5×3');
  });

  it('o sinal não apaga a subtração', () => {
    // Em 8-3 aquele menos é a operação; removê-lo apagaria a conta.
    expect(alternarSinal(teclar(['8', '-', '3'])).expressao).toBe('8--3');
  });

  it('a porcentagem divide o último número por cem', () => {
    const estado = porcentagem(teclar(['2', '0', '0', '+', '1', '0']));

    expect(estado.expressao).toBe('200+(10÷100)');
    expect(calcular(estado, 'rad').resultado).toBe('200,1');
  });

  it('o inverso se aplica ao que está na tela', () => {
    expect(calcular(inverso(teclar(['2', '+', '3'])), 'rad').resultado).toBe('0,2');
  });

  it('o inverso de uma tela vazia não faz nada', () => {
    expect(inverso(ESTADO_INICIAL)).toEqual(ESTADO_INICIAL);
  });
});

describe('o número exibido', () => {
  it('não mostra casas que o ponto flutuante inventou', () => {
    expect(formatarValor(0.1 + 0.2)).toBe('0,3');
  });

  it('usa vírgula, como o resto do site', () => {
    expect(formatarValor(1.5)).toBe('1,5');
  });

  it('cai para notação científica quando o número foge da escala', () => {
    expect(formatarValor(1e15)).toContain('e+15');
    expect(formatarValor(1e-9)).toContain('e-9');
  });

  it('um valor impossível não vira número', () => {
    expect(formatarValor(Number.NaN)).toBe('—');
    expect(formatarValor(Number.POSITIVE_INFINITY)).toBe('—');
  });
});

/**
 * As teclas que não podem acontecer.
 *
 * A calculadora aceitava qualquer tecla a qualquer momento: dava para escrever
 * `5-----333---` e `5××××2`, e o aviso só vinha no igual, quando a conta
 * inteira já estava perdida.
 */
describe('teclas impossíveis', () => {
  it('operador em cima de operador troca, não acumula', () => {
    expect(teclar(['5', '-', '-', '-', '-']).expressao).toBe('5-');
    expect(teclar(['5', '×', '×', '×', '×', '2']).expressao).toBe('5×2');
  });

  it('a última tecla é a que vale', () => {
    expect(teclar(['9', '+', '×', '÷', '2']).expressao).toBe('9÷2');
  });

  it('o menos depois de × nega o próximo número', () => {
    // `5×-3` é uma conta legítima: é cinco vezes menos três.
    expect(teclar(['5', '×', '-', '3']).expressao).toBe('5×-3');
    expect(calcular(teclar(['5', '×', '-', '3']), 'rad').resultado).toBe('-15');
  });

  it('mas um segundo menos ali também troca', () => {
    expect(teclar(['5', '×', '-', '-', '-']).expressao).toBe('5-');
  });

  it('a conta não começa com uma operação', () => {
    expect(teclar(['+']).expressao).toBe('');
    expect(teclar(['×']).expressao).toBe('');
  });

  it('mas começa com um menos, que é sinal', () => {
    expect(teclar(['-', '7']).expressao).toBe('-7');
  });

  it('só uma vírgula por número', () => {
    expect(teclar(['1', ',', '5', ',', ',']).expressao).toBe('1,5');
  });

  it('cada número ganha a sua vírgula', () => {
    expect(teclar(['1', ',', '5', '+', '2', ',', '5']).expressao).toBe('1,5+2,5');
  });

  it('vírgula solta vira zero vírgula', () => {
    expect(teclar([',', '5']).expressao).toBe('0,5');
    expect(teclar(['2', '+', ',', '5']).expressao).toBe('2+0,5');
  });

  it('não fecha parênteses que não foram abertos', () => {
    expect(teclar([')']).expressao).toBe('');
    expect(teclar(['2', '+', '3', ')']).expressao).toBe('2+3');
  });

  it('nem fecha um parênteses vazio', () => {
    expect(teclar(['(', ')']).expressao).toBe('(');
  });

  it('fecha o que foi aberto', () => {
    expect(teclar(['(', '2', '+', '3', ')', '×', '4']).expressao).toBe('(2+3)×4');
  });

  it('x² precisa de alguma coisa para elevar', () => {
    expect(teclar(['^2']).expressao).toBe('');
    expect(teclar(['2', '+', '^2']).expressao).toBe('2+');
    expect(teclar(['3', '^2']).expressao).toBe('3^2');
  });

  it('a tecla recusada não apaga o resultado da tela', () => {
    const comResultado = calcular(teclar(['2', '+', '2']), 'rad');
    const depois = digitar(comResultado, ')');

    expect(depois).toEqual(comResultado);
  });
});

/**
 * A aba de MMC e MDC.
 *
 * Aqui a vírgula separa números, e não casas decimais: as duas contas só
 * existem entre inteiros, então não há ambiguidade a resolver.
 */
describe('MMC e MDC', () => {
  it('calcula o MMC de dois números', () => {
    expect(calcularInteiros('12, 18', 'mmc').valor).toBe(36);
  });

  it('calcula o MDC de dois números', () => {
    expect(calcularInteiros('12, 18', 'mdc').valor).toBe(6);
  });

  it('aceita mais de dois números', () => {
    expect(calcularInteiros('12, 18, 24', 'mmc').valor).toBe(72);
    expect(calcularInteiros('12, 18, 24', 'mdc').valor).toBe(6);
  });

  it('separa por vírgula, ponto e vírgula ou espaço', () => {
    for (const entrada of ['12,18', '12; 18', '12 18', '  12 ,  18  ']) {
      expect(calcularInteiros(entrada, 'mdc').valor, entrada).toBe(6);
    }
  });

  it('mostra a montagem do resultado', () => {
    expect(calcularInteiros('12, 18, 24', 'mmc').montagem).toBe('2³ · 3² = 72');
    expect(calcularInteiros('12, 18, 24', 'mdc').montagem).toBe('2 · 3 = 6');
  });

  it('sem divisor comum, não há montagem a mostrar', () => {
    // MDC 1 não se escreve como produto de primos; a tela diz isso em palavras.
    expect(calcularInteiros('8, 9', 'mdc').montagem).toBeNull();
  });

  it('coprimos têm MDC 1 e MMC igual ao produto', () => {
    expect(calcularInteiros('8, 9', 'mdc').valor).toBe(1);
    expect(calcularInteiros('8, 9', 'mmc').valor).toBe(72);
  });

  it('a tela vazia não é erro', () => {
    const vazia = calcularInteiros('   ', 'mmc');

    expect(vazia.valor).toBeNull();
    expect(vazia.erro).toBeNull();
  });

  it('um número só pede o segundo', () => {
    expect(calcularInteiros('7', 'mmc').erro?.chave).toBe('calculadora.aoMenosDois');
  });

  it('o que não é inteiro é recusado pelo nome', () => {
    // A parte recusada viaja no erro para aparecer na frase, em qualquer idioma.
    expect(calcularInteiros('12, abc', 'mmc').erro?.valores).toEqual({ parte: 'abc' });
    expect(calcularInteiros('12, 1.5', 'mmc').erro?.valores).toEqual({ parte: '1.5' });
    expect(calcularInteiros('12, -4', 'mdc').erro?.valores).toEqual({ parte: '-4' });
  });

  it('o zero fica de fora', () => {
    // mdc(0, n) = n e mmc(n, 0) = 0: respostas verdadeiras e inúteis para
    // quem está aprendendo o que as duas contas significam.
    expect(calcularInteiros('0, 12', 'mmc').erro?.chave).toBe('calculadora.semZero');
  });

  it('não devolve resultado que o ponto flutuante não aguenta', () => {
    const gigante = calcularInteiros('999999937, 999999893, 999999929', 'mmc');

    expect(gigante.valor).toBeNull();
    expect(gigante.erro?.chave).toBe('calculadora.passaDoExato');
  });
});

/**
 * A decomposição, linha a linha.
 *
 * O que estava na tela antes — a fatoração de cada número, pronta — mostrava o
 * fim sem mostrar o caminho. A divisão simultânea é o método da escola, e tem
 * a propriedade de dar as duas respostas de uma vez.
 */
describe('divisão simultânea', () => {
  /** A tabela como ela se lê: `12 18 24 | 2`. */
  function tabela(entrada: string): readonly string[] {
    return calcularInteiros(entrada, 'mmc').decomposicao.map(
      (linha) => `${linha.valores.join(' ')} | ${linha.divisor}`,
    );
  }

  it('desce dividindo até todos chegarem a 1', () => {
    expect(tabela('12, 18, 24')).toEqual([
      '12 18 24 | 2',
      '6 9 12 | 2',
      '3 9 6 | 2',
      '3 9 3 | 3',
      '1 3 1 | 3',
    ]);
  });

  it('divide quem dá e deixa quem não dá como está', () => {
    // Na terceira linha o 9 não é divisível por 2 e desce inteiro.
    expect(calcularInteiros('12, 18, 24', 'mmc').decomposicao[2]!.valores).toEqual([3, 9, 6]);
  });

  it('marca as linhas em que o divisor coube em todos', () => {
    const marcadas = calcularInteiros('12, 18, 24', 'mmc')
      .decomposicao.filter((linha) => linha.comum)
      .map((linha) => linha.divisor);

    // São exatamente os fatores do MDC: 2 · 3 = 6.
    expect(marcadas).toEqual([2, 3]);
  });

  it('coprimos não têm nenhuma linha comum', () => {
    expect(calcularInteiros('8, 9', 'mmc').decomposicao.every((l) => !l.comum)).toBe(true);
  });

  it('o produto dos divisores é o MMC', () => {
    const conta = calcularInteiros('6, 8, 15', 'mmc');
    const produto = conta.decomposicao.reduce((total, linha) => total * linha.divisor, 1);

    expect(produto).toBe(conta.valor);
  });

  it('o produto das linhas comuns é o MDC', () => {
    const conta = calcularInteiros('24, 36, 60', 'mdc');
    const produto = conta.decomposicao
      .filter((linha) => linha.comum)
      .reduce((total, linha) => total * linha.divisor, 1);

    expect(produto).toBe(conta.valor);
  });

  it('números iguais descem juntos', () => {
    expect(tabela('6, 6')).toEqual(['6 6 | 2', '3 3 | 3']);
  });

  it('um primo grande não faz o divisor subir de um em um', () => {
    // Sem o atalho pela raiz, 999983 levaria um milhão de voltas.
    const comecou = Date.now();
    const conta = calcularInteiros('999983, 2', 'mmc');

    expect(conta.valor).toBe(1999966);
    expect(conta.decomposicao.map((l) => l.divisor)).toEqual([2, 999983]);
    expect(Date.now() - comecou).toBeLessThan(500);
  });
});

describe('soma e produto', () => {
  /** O par, em ordem crescente, para a asserção não depender da ordem. */
  const par = (produto: string, soma: string): readonly number[] | null => {
    const encontrado = calcularFatores(produto, soma).par;
    return encontrado === null ? null : [encontrado.a, encontrado.b].sort((x, y) => x - y);
  };

  it('acha o par que multiplica e soma', () => {
    expect(par('24', '11')).toEqual([3, 8]);
    expect(par('42', '13')).toEqual([6, 7]);
    expect(par('12', '7')).toEqual([3, 4]);
  });

  it('soma negativa dá os dois fatores negativos', () => {
    expect(par('24', '-11')).toEqual([-8, -3]);
  });

  it('produto negativo dá um de cada sinal', () => {
    expect(par('-24', '5')).toEqual([-3, 8]);
    expect(par('-24', '-5')).toEqual([-8, 3]);
  });

  it('produto zero: o outro fator é a própria soma', () => {
    expect(par('0', '7')).toEqual([0, 7]);
  });

  it('o quadrado perfeito dá os dois fatores iguais', () => {
    expect(par('36', '12')).toEqual([6, 6]);
  });

  it('escreve o trinômio e a fatoração', () => {
    expect(calcularFatores('24', '11').fatoracao).toBe('x² + 11x + 24 = (x + 3)(x + 8)');
    expect(calcularFatores('24', '-11').fatoracao).toBe('x² − 11x + 24 = (x − 8)(x − 3)');
    expect(calcularFatores('-9', '0').fatoracao).toBe('x² − 9 = (x − 3)(x + 3)');
  });

  it('a tabela para no par que serviu', () => {
    const conta = calcularFatores('24', '11');
    const ultima = conta.tentativas.at(-1)!;

    expect(ultima.escolhido).toBe(true);
    expect([ultima.a, ultima.b].sort((x, y) => x - y)).toEqual([3, 8]);
    // 1·24 e 2·12 foram tentados antes, e as somas deles aparecem.
    expect(conta.tentativas.map((t) => t.soma)).toEqual([25, 14, 11]);
  });

  it('sem par inteiro, mostra as raízes em vez de inventar um', () => {
    // 11² - 4·24 = 25 é quadrado; 11² - 4·28 = 9 também. 11 e 11 não é.
    const conta = calcularFatores('11', '11');

    expect(conta.par).toBeNull();
    expect(conta.fatoracao).toBeNull();
    expect(conta.raizes.length).toBe(2);
    // (11 ± √77)/2 ≈ 1,1125 e 9,8875.
    expect(conta.raizes[0]).toBe('1,1125178063');
    expect(conta.raizes[1]).toBe('9,8874821937');
  });

  it('as raízes somam e multiplicam o que foi pedido', () => {
    const conta = calcularFatores('11', '11');
    const numeros = conta.raizes.map((r) => Number(r.replace(',', '.')));

    expect(numeros[0]! + numeros[1]!).toBeCloseTo(11, 6);
    expect(numeros[0]! * numeros[1]!).toBeCloseTo(11, 5);
  });

  it('soma pequena demais para o produto não tem par real', () => {
    // Dois números que somam 4 têm produto no máximo 4: 10 é impossível.
    const conta = calcularFatores('10', '4');

    expect(conta.erro?.chave).toBe('calculadora.semParReal');
    expect(conta.par).toBeNull();
  });

  it('campo vazio não é erro, é pergunta pela metade', () => {
    expect(calcularFatores('', '').erro).toBeNull();
    expect(calcularFatores('24', '').erro).toBeNull();
    expect(calcularFatores('24', '').par).toBeNull();
  });

  it('o que não é inteiro é recusado com o que foi escrito', () => {
    expect(calcularFatores('2,5', '11').erro).toEqual({
      chave: 'calculadora.naoInteiro',
      valores: { parte: '2,5' },
    });
    expect(calcularFatores('24', 'x').erro?.chave).toBe('calculadora.naoInteiro');
  });

  it('acima do limite a conta deixa de ser de escola', () => {
    expect(calcularFatores('10000000', '11').erro?.chave).toBe('calculadora.limiteFatores');
  });

  it('o par sai depressa mesmo com muitos divisores', () => {
    // 720720 tem 240 divisores; a resposta vem do discriminante, não da varredura.
    const comecou = Date.now();
    const conta = calcularFatores('720720', '1698');

    expect([conta.par!.a, conta.par!.b].sort((x, y) => x - y)).toEqual([840, 858]);
    expect(Date.now() - comecou).toBeLessThan(200);
  });

  it('a tabela corta quando os pares não acabam', () => {
    // Sem par inteiro, a varredura percorre tudo e tem de parar sozinha.
    const conta = calcularFatores('-720720', '1');

    expect(conta.par).toBeNull();
    expect(conta.tentativas.length).toBeLessThanOrEqual(20);
    expect(conta.truncada).toBe(true);
  });
});
