import { LLM_PADRAO, LOTE_MAXIMO, definirLlm, llmEhPadrao, validarLlm } from './llm.model';

describe('configuração da LLM', () => {
  it('o padrão é o que o site usava antes de ser ajustável', () => {
    expect(LLM_PADRAO).toEqual({
      endpoint: '',
      modelo: 'gpt-oss:20b',
      raciocinio: 'false',
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
    expect(definirLlm(LLM_PADRAO, 'raciocinio', 'true').raciocinio).toBe('false');
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
      raciocinio: 'false',
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
