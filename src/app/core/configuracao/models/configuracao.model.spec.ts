import {
  CONFIGURACAO_PADRAO,
  LIMITES,
  definir,
  ehPadrao,
  harmonizar,
  validar,
} from '@core/configuracao/models/configuracao.model';

describe('configuração', () => {
  it('os valores de fábrica são os que o site sempre usou', () => {
    expect(CONFIGURACAO_PADRAO).toEqual({
      etapa: {
        respostasNaJanela: 10,
        acertosNaJanela: 8,
        acertosExigentes: 3,
        acertosSeguidosFinais: 3,
        acertosPorTipo: 3,
      },
      escada: { acertosParaSubir: 3, errosParaDescer: 2 },
      prova: { errosTolerados: 2, minimoDeQuestoes: 8 },
    });
  });

  it('todo ajuste tem limite declarado', () => {
    const chaves = Object.entries(CONFIGURACAO_PADRAO).flatMap(([grupo, valores]) =>
      Object.keys(valores).map((chave) => `${grupo}.${chave}`),
    );
    const comLimite = LIMITES.map((limite) => limite.ajuste.join('.'));

    expect(comLimite.sort()).toEqual(chaves.sort());
  });

  it('muda um número e deixa o resto onde estava', () => {
    const novo = definir(CONFIGURACAO_PADRAO, ['prova', 'errosTolerados'], 5);

    expect(novo.prova.errosTolerados).toBe(5);
    expect(novo.prova.minimoDeQuestoes).toBe(8);
    expect(novo.etapa).toEqual(CONFIGURACAO_PADRAO.etapa);
  });

  it('prende o valor dentro do limite em vez de recusá-lo', () => {
    expect(
      definir(CONFIGURACAO_PADRAO, ['etapa', 'respostasNaJanela'], 0).etapa.respostasNaJanela,
    ).toBe(3);
    expect(
      definir(CONFIGURACAO_PADRAO, ['etapa', 'respostasNaJanela'], 999).etapa.respostasNaJanela,
    ).toBe(40);
  });

  it('arredonda o que vier quebrado', () => {
    expect(
      definir(CONFIGURACAO_PADRAO, ['prova', 'errosTolerados'], 2.7).prova.errosTolerados,
    ).toBe(3);
  });

  it('não dá para exigir mais acertos do que respostas', () => {
    // Pedir 12 acertos numa janela de 10 é um critério impossível.
    const novo = definir(CONFIGURACAO_PADRAO, ['etapa', 'acertosNaJanela'], 12);

    expect(novo.etapa.acertosNaJanela).toBe(10);
  });

  it('encolher a janela puxa os dependentes junto', () => {
    const novo = definir(CONFIGURACAO_PADRAO, ['etapa', 'respostasNaJanela'], 4);

    expect(novo.etapa.respostasNaJanela).toBe(4);
    expect(novo.etapa.acertosNaJanela).toBe(4);
    expect(novo.etapa.acertosExigentes).toBe(3);
  });

  it('os exigentes não passam dos acertos pedidos', () => {
    const apertado = harmonizar({
      ...CONFIGURACAO_PADRAO,
      etapa: { ...CONFIGURACAO_PADRAO.etapa, acertosNaJanela: 2, acertosExigentes: 9 },
    });

    expect(apertado.etapa.acertosExigentes).toBe(2);
    expect(apertado.etapa.acertosSeguidosFinais).toBe(2);
  });

  it('o que estava guardado volta inteiro', () => {
    const guardado = definir(CONFIGURACAO_PADRAO, ['escada', 'errosParaDescer'], 4);

    expect(validar(JSON.parse(JSON.stringify(guardado)))).toEqual(guardado);
  });

  it('armazenamento corrompido volta ao de fábrica, campo a campo', () => {
    expect(validar(null)).toEqual(CONFIGURACAO_PADRAO);
    expect(validar('lixo')).toEqual(CONFIGURACAO_PADRAO);
    expect(validar({ prova: { errosTolerados: 'muitos' } })).toEqual(CONFIGURACAO_PADRAO);
    // Um campo bom entre campos ruins é aproveitado.
    expect(validar({ prova: { errosTolerados: 5, minimoDeQuestoes: null } }).prova).toEqual({
      errosTolerados: 5,
      minimoDeQuestoes: 8,
    });
  });

  it('reconhece a configuração intocada', () => {
    expect(ehPadrao(CONFIGURACAO_PADRAO)).toBe(true);
    expect(ehPadrao(definir(CONFIGURACAO_PADRAO, ['prova', 'errosTolerados'], 1))).toBe(false);
  });
});
