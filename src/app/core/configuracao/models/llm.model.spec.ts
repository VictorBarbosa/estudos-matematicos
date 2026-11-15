import { LLM_PADRAO, LOTE_MAXIMO, definirLlm, llmEhPadrao, validarLlm } from './llm.model';

describe('configuração da LLM', () => {
  /**
   * O raciocínio padrão é `low`, e isso foi medido, não escolhido.
   *
   * Esteve em `false` por uma medição que envelheceu com o prompt. Refeita com
   * o prompt atual, a máquina livre e o portão aplicado: `low` aprova 6 de 6
   * em 17 s, e `false` aprova 2 de 2 em 69 s — mesma taxa, doze vezes mais
   * eficiente. E o tempo passou a importar, porque a tela agora ESPERA a
   * história em vez de mostrar o enunciado seco e trocá-lo depois.
   */
  it('o padrão de fábrica é o que foi medido como melhor', () => {
    expect(LLM_PADRAO).toEqual({
      endpoint: '',
      modelo: 'gpt-oss:20b',
      raciocinio: 'low',
      lote: 2,
    });
  });

  it('endereço em branco é a herança, e não um servidor vazio', () => {
    // A herança do assistente é o que dá zero configuração; se o padrão fosse
    // `localhost:11434` escrito, apontar o assistente para outra máquina
    // deixaria as histórias para trás sem ninguém notar.
    expect(LLM_PADRAO.endpoint).toBe('');
  });

  it('prende o lote no limite em vez de recusar', () => {
    expect(definirLlm(LLM_PADRAO, 'lote', 0).lote).toBe(1);
    expect(definirLlm(LLM_PADRAO, 'lote', 99).lote).toBe(LOTE_MAXIMO);
    expect(definirLlm(LLM_PADRAO, 'lote', 2.7).lote).toBe(3);
  });

  it('o raciocínio só aceita os dois graus que a API conhece', () => {
    expect(definirLlm(LLM_PADRAO, 'raciocinio', 'low').raciocinio).toBe('low');
    // Qualquer coisa que não seja um grau conhecido volta ao padrão.
    expect(definirLlm(LLM_PADRAO, 'raciocinio', 'true').raciocinio).toBe(LLM_PADRAO.raciocinio);
  });

  it('modelo vazio volta ao padrão em vez de quebrar o lote', () => {
    expect(validarLlm({ modelo: '   ' }).modelo).toBe(LLM_PADRAO.modelo);
  });

  it('o que está no navegador não é confiável, e cada campo se defende sozinho', () => {
    const lido = validarLlm({
      endpoint: 42,
      modelo: 'ministral-3:3b',
      raciocinio: 'qualquer',
      lote: 'muito',
    });

    expect(lido).toEqual({
      endpoint: '',
      modelo: 'ministral-3:3b',
      raciocinio: LLM_PADRAO.raciocinio,
      lote: LLM_PADRAO.lote,
    });
  });

  it('lixo não derruba a configuração inteira', () => {
    expect(validarLlm(null)).toEqual(LLM_PADRAO);
    expect(validarLlm('texto')).toEqual(LLM_PADRAO);
  });

  it('reconhece o estado de fábrica', () => {
    expect(llmEhPadrao(LLM_PADRAO)).toBe(true);
    expect(llmEhPadrao(definirLlm(LLM_PADRAO, 'modelo', 'outro'))).toBe(false);
  });
});
