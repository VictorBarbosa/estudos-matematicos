import {
  analisarSimbolica,
  simbolica,
  simbolicasEquivalentes,
} from '@core/treino/resposta-simbolica/resposta-simbolica';

/** Atalho: lê a expressão e falha o teste se ela não for reconhecida. */
function ler(entrada: string) {
  const lida = analisarSimbolica(entrada);
  expect(lida, `não reconheceu "${entrada}"`).not.toBeNull();
  return lida!;
}

describe('analisarSimbolica', () => {
  it('lê polinômios', () => {
    const f = ler('3x^2 - 2x + 1');

    expect(f.avaliar(0)).toBeCloseTo(1, 9);
    expect(f.avaliar(2)).toBeCloseTo(9, 9);
    expect(f.avaliar(-1)).toBeCloseTo(6, 9);
  });

  it('entende multiplicação implícita', () => {
    expect(ler('3x').avaliar(2)).toBeCloseTo(6, 9);
    expect(ler('x(x+1)').avaliar(3)).toBeCloseTo(12, 9);
    expect(ler('2(x-1)^2').avaliar(4)).toBeCloseTo(18, 9);
  });

  it('lê as funções usuais, com e sem parênteses', () => {
    expect(ler('sin(x)').avaliar(Math.PI / 2)).toBeCloseTo(1, 9);
    expect(ler('cos x').avaliar(0)).toBeCloseTo(1, 9);
    expect(ler('ln(x)').avaliar(Math.E)).toBeCloseTo(1, 9);
    expect(ler('exp(x)').avaliar(1)).toBeCloseTo(Math.E, 9);
    expect(ler('sqrt(x)').avaliar(9)).toBeCloseTo(3, 9);
  });

  it('aceita a grafia em português', () => {
    expect(ler('sen(x)').avaliar(Math.PI / 2)).toBeCloseTo(1, 9);
    expect(ler('tg(x)').avaliar(Math.PI / 4)).toBeCloseTo(1, 9);
    expect(ler('√x').avaliar(16)).toBeCloseTo(4, 9);
    expect(ler('2x^2 - 1,5x').avaliar(2)).toBeCloseTo(5, 9);
  });

  it('lê uma constante como função constante', () => {
    const f = ler('7');

    expect(f.avaliar(0)).toBe(7);
    expect(f.avaliar(100)).toBe(7);
  });

  it('recusa o que não é expressão', () => {
    for (const entrada of ['', 'derivada', '3x +', '(x', 'x^', 'y + 1', '3 x y']) {
      expect(analisarSimbolica(entrada), entrada).toBeNull();
    }
  });

  it('recusa expressão que não vale em nenhum ponto testado', () => {
    expect(analisarSimbolica('sqrt(-x^2-1)')).toBeNull();
  });

  it('guarda a forma digitada para exibir', () => {
    expect(ler('3x^2 - 2x + 1').tex).toBe('3x^2 - 2x + 1');
  });
});

describe('simbolicasEquivalentes', () => {
  const esperada = simbolica('6x + 4', (x) => 6 * x + 4);

  it('aceita formas diferentes da mesma função', () => {
    for (const forma of ['6x + 4', '4 + 6x', '2(3x + 2)', '6x+4', '2*3*x + 4']) {
      expect(simbolicasEquivalentes(ler(forma), esperada), forma).toBe(true);
    }
  });

  it('recusa funções diferentes, mesmo que coincidam num ponto', () => {
    // x² e 6x + 4 não coincidem; 6x + 4 e 10 coincidem só em x = 1.
    expect(simbolicasEquivalentes(ler('x^2'), esperada)).toBe(false);
    expect(simbolicasEquivalentes(ler('10'), esperada)).toBe(false);
    expect(simbolicasEquivalentes(ler('6x + 5'), esperada)).toBe(false);
  });

  it('reconhece identidades trigonométricas', () => {
    expect(
      simbolicasEquivalentes(
        ler('2sin(x)cos(x)'),
        simbolica('sin(2x)', (x) => Math.sin(2 * x)),
      ),
    ).toBe(true);

    expect(
      simbolicasEquivalentes(
        ler('1 - 2sin(x)^2'),
        simbolica('cos(2x)', (x) => Math.cos(2 * x)),
      ),
    ).toBe(true);
  });

  it('ignora pontos em que alguma das funções não é definida', () => {
    // 1/x explode em zero, mas nenhum ponto de teste é zero: a comparação
    // continua valendo nos demais.
    expect(
      simbolicasEquivalentes(ler('1/x'), simbolica('x^-1', (x) => x ** -1)),
    ).toBe(true);
  });

  it('não dá veredito quando sobram poucos pontos comparáveis', () => {
    // ln(x) só é finita nos pontos positivos da lista, mas eles bastam.
    expect(
      simbolicasEquivalentes(ler('ln(x)'), simbolica('ln x', (x) => Math.log(x))),
    ).toBe(true);
  });
});
