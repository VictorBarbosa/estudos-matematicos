import { ModeloDeProblema } from '@core/problemas/validacao/validar-modelo';
import { vestirEnunciado } from '@core/problemas/vestir/vestir-enunciado';

const MODELO: ModeloDeProblema = {
  pt: 'Uma oficina cobra {0} por hora e {1} de taxa. Quantas horas cabem em {2}?',
  fr: 'Un atelier facture {0} l’heure et {1} de frais. Combien d’heures tient-on dans {2} ?',
  en: 'A workshop charges {0} per hour plus {1} in fees. How many hours fit in {2}?',
  lacunas: 3,
};

describe('vestir enunciado', () => {
  it('troca as lacunas pelos valores', () => {
    const vestido = vestirEnunciado(MODELO, [3, 7, 22], 'pt')!;

    expect(vestido).toBe('Uma oficina cobra 3 por hora e 7 de taxa. Quantas horas cabem em 22?');
  });

  /**
   * A razão de a troca passar por `numeroEscrito`: o separador decimal é do
   * idioma. Um enunciado em português com ponto decimal foi defeito real do
   * site, e a LLM escreveria isso em três línguas de uma vez.
   */
  it('o separador decimal é do idioma', () => {
    expect(vestirEnunciado(MODELO, [2.5, 7, 22], 'pt')!).toContain('2,5');
    expect(vestirEnunciado(MODELO, [2.5, 7, 22], 'fr')!).toContain('2,5');
    expect(vestirEnunciado(MODELO, [2.5, 7, 22], 'en')!).toContain('2.5');
  });

  it('usa a história do idioma pedido', () => {
    expect(vestirEnunciado(MODELO, [3, 7, 22], 'fr')!).toContain('atelier');
    expect(vestirEnunciado(MODELO, [3, 7, 22], 'en')!).toContain('workshop');
  });

  it('cai no português quando falta o idioma', () => {
    const semIngles = { ...MODELO, en: '' };

    expect(vestirEnunciado(semIngles, [3, 7, 22], 'en')!).toContain('oficina');
  });

  /**
   * O contrato da resposta é do código, nunca da LLM: o número de casas que o
   * corretor cobra tem de ser o que o enunciado promete.
   */
  it('acrescenta o contrato da resposta no idioma', () => {
    const contrato = {
      pt: 'em horas, 2 casas decimais',
      fr: 'en heures, 2 décimales',
      en: 'in hours, 2 decimal places',
    };

    expect(vestirEnunciado(MODELO, [3, 7, 22], 'pt', contrato)!).toMatch(
      /\(em horas, 2 casas decimais\)$/,
    );
    expect(vestirEnunciado(MODELO, [3, 7, 22], 'fr', contrato)!).toMatch(
      /\(en heures, 2 décimales\)$/,
    );
  });

  it('sem contrato, não acrescenta nada', () => {
    expect(vestirEnunciado(MODELO, [3, 7, 22], 'pt')!.endsWith('?')).toBe(true);
  });

  /** Lacuna sobrando na tela seria pior que o enunciado seco de sempre. */
  it('recusa quando a quantidade de valores não bate', () => {
    expect(vestirEnunciado(MODELO, [3, 7], 'pt')).toBeUndefined();
    expect(vestirEnunciado(MODELO, [3, 7, 22, 1], 'pt')).toBeUndefined();
  });

  it('recusa valor que não é número', () => {
    expect(vestirEnunciado(MODELO, [3, Number.NaN, 22], 'pt')).toBeUndefined();
    expect(vestirEnunciado(MODELO, [3, Number.POSITIVE_INFINITY, 22], 'pt')).toBeUndefined();
  });

  /**
   * O enunciado vestido tem de obedecer à mesma regra que os escritos à mão:
   * os mesmos números, na mesma ordem, nos três idiomas. É o que
   * `textos-traduzidos.spec.ts` cobra do resto do site.
   */
  it('os três idiomas carregam os mesmos números na mesma ordem', () => {
    const numeros = (texto: string) =>
      [...texto.matchAll(/\d+(?:[.,]\d+)?/g)].map((achado) => achado[0].replace(',', '.'));

    const pt = numeros(vestirEnunciado(MODELO, [3.5, 7, 22], 'pt')!);
    const fr = numeros(vestirEnunciado(MODELO, [3.5, 7, 22], 'fr')!);
    const en = numeros(vestirEnunciado(MODELO, [3.5, 7, 22], 'en')!);

    expect(fr).toEqual(pt);
    expect(en).toEqual(pt);
  });
});
