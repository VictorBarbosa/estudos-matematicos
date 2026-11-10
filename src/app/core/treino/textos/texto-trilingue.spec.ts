import { enunciadoTrilingue, diagnosticoTrilingue } from '@core/treino/textos/texto-trilingue';

describe('enunciado trilíngue', () => {
  const frases = {
    pt: (a: number, b: number) => `${a} kg custam R$ ${b}.`,
    fr: (a: number, b: number) => `${a} kg coûtent ${b} $.`,
    en: (a: number, b: number) => `${a} kg cost $${b}.`,
  };

  it('monta o português no enunciado e as duas línguas em traducoes', () => {
    const texto = enunciadoTrilingue(frases, [3, 24]);

    expect(texto.enunciado).toBe('3 kg custam R$ 24.');
    expect(texto.traducoes.fr?.enunciado).toBe('3 kg coûtent 24 $.');
    expect(texto.traducoes.en?.enunciado).toBe('3 kg cost $24.');
  });

  it('leva a dica junto, quando existe', () => {
    const texto = enunciadoTrilingue(frases, [3, 24], {
      pt: () => 'Dobre a quantidade?',
      fr: () => 'Doublez la quantité ?',
      en: () => 'Double the amount?',
    });

    expect(texto.traducoes.fr?.dica).toBe('Doublez la quantité ?');
    expect(texto.traducoes.en?.dica).toBe('Double the amount?');
  });

  it('sem dica, o campo fica indefinido em vez de vazio', () => {
    const texto = enunciadoTrilingue(frases, [2, 10]);

    expect(texto.traducoes.fr?.dica).toBeUndefined();
    expect(texto.traducoes.en?.dica).toBeUndefined();
  });

  it('o diagnóstico traduzido carrega o número do exercício', () => {
    const diagnostico = diagnosticoTrilingue(
      {
        pt: (a: number) => `Dividir por ${a} inverte o sentido.`,
        fr: (a: number) => `Diviser par ${a} renverse le sens.`,
        en: (a: number) => `Dividing by ${a} flips the sign.`,
      },
      [-3],
    );

    expect(diagnostico.diagnostico).toContain('-3');
    expect(diagnostico.diagnosticoTraducoes.fr).toContain('-3');
    expect(diagnostico.diagnosticoTraducoes.en).toContain('-3');
  });
});
