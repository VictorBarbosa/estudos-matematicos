import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ConfiguracaoService } from './configuracao.service';
import { LLM_PADRAO } from '@core/configuracao/models/llm.model';
import { HistoriasService } from '@core/problemas/servicos/historias.service';
import { PROBLEMA_EQUACAO1 } from '@features/algebra/equacao-primeiro-grau/equacao-primeiro-grau.problema';

describe('a configuração da LLM chega a quem pede o lote', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it('trocar o modelo na configuração muda o modelo do pedido', async () => {
    const chamadas: { url: string; corpo: any }[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (url: any, init?: any) => {
      chamadas.push({ url: String(url), corpo: init?.body ? JSON.parse(init.body) : null });
      return new Response(JSON.stringify({ message: { content: '{"problemas":[]}' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as any;

    try {
      const config = TestBed.inject(ConfiguracaoService);
      const historias = TestBed.inject(HistoriasService);

      config.definirLlm('modelo', 'ministral-3:3b');
      config.definirLlm('lote', 3);

      historias.atribuir('ex-1', 'equacao-primeiro-grau', 'medio', PROBLEMA_EQUACAO1, [3, 7, 22]);
      await new Promise((r) => setTimeout(r, 80));

      const lote = chamadas.find((c) => c.url.includes('/api/chat'));

      expect(lote, 'nenhum pedido de lote saiu').toBeDefined();
      expect(lote!.corpo.model).toBe('ministral-3:3b');
      // `low` é o padrão medido; o campo segue ajustável na tela.
      expect(lote!.corpo.think).toBe('low');
    } finally {
      globalThis.fetch = original;
    }
  });

  it('o padrão de fábrica volta com um clique', () => {
    const config = TestBed.inject(ConfiguracaoService);

    config.definirLlm('modelo', 'outro');
    expect(config.llmIntocada()).toBe(false);

    config.redefinirLlm();
    expect(config.configuracaoDaLlm()).toEqual(LLM_PADRAO);
    expect(config.llmIntocada()).toBe(true);
  });

  it('a escolha sobrevive a um recarregamento da página', () => {
    const config = TestBed.inject(ConfiguracaoService);
    config.definirLlm('modelo', 'qwen3.5:0.8b-mlx');
    config.definirLlm('raciocinio', 'low');

    // O serviço grava por `effect`; uma leitura direta do armazenamento prova
    // que o que sai daqui é o que ele vai encontrar quando voltar.
    TestBed.flushEffects();

    const gravado = JSON.parse(localStorage.getItem('estudos-matematicos.llm.v1')!);

    expect(gravado.modelo).toBe('qwen3.5:0.8b-mlx');
    expect(gravado.raciocinio).toBe('low');
  });
});
