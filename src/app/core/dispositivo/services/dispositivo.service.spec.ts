import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DispositivoService } from '@core/dispositivo/services/dispositivo.service';

/**
 * Finge uma tela.
 *
 * O jsdom não tem `matchMedia` nem toque, então os dois são postos à mão —
 * é o mínimo para que a classificação possa ser testada sem um iPad real.
 */
function fingir({
  largura,
  altura,
  grosso = false,
  agente = 'Mozilla/5.0 (Macintosh)',
  toques = 0,
}: {
  largura: number;
  altura: number;
  grosso?: boolean;
  agente?: string;
  toques?: number;
}): DispositivoService {
  Object.defineProperty(window, 'innerWidth', { value: largura, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: altura, configurable: true });
  Object.defineProperty(window.navigator, 'userAgent', { value: agente, configurable: true });
  Object.defineProperty(window.navigator, 'maxTouchPoints', { value: toques, configurable: true });

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (consulta: string) => ({
      matches: consulta.includes('coarse') ? grosso : false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  });

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  return TestBed.inject(DispositivoService);
}

describe('DispositivoService', () => {
  it('monitor largo com mouse é computador, e a calculadora cabe', () => {
    const d = fingir({ largura: 1600, altura: 900 });

    expect(d.tipo()).toBe('computador');
    expect(d.calculadoraPermitida()).toBe(true);
    expect(d.folhaPermitida()).toBe(false);
  });

  it('janela estreita no computador esconde a calculadora', () => {
    const d = fingir({ largura: 800, altura: 900 });

    expect(d.tipo()).toBe('computador');
    expect(d.calculadoraPermitida()).toBe(false);
    // No computador há papel na mesa.
    expect(d.rascunhoPermitido()).toBe(false);
  });

  it('celular não tem calculadora nem folha, e tem o monta monta', () => {
    const d = fingir({
      largura: 430,
      altura: 932,
      grosso: true,
      agente: 'Mozilla/5.0 (iPhone)',
      toques: 5,
    });

    expect(d.tipo()).toBe('celular');
    expect(d.ehCelular()).toBe(true);
    expect(d.calculadoraPermitida()).toBe(false);
    expect(d.folhaPermitida()).toBe(false);
    // Aqui não há como escrever nem desenhar: em vez da folha, peças.
    expect(d.rascunhoPermitido()).toBe(true);
  });

  it('celular deitado continua celular: o menor lado não muda ao girar', () => {
    const d = fingir({
      largura: 932,
      altura: 430,
      grosso: true,
      agente: 'Mozilla/5.0 (iPhone)',
      toques: 5,
    });

    expect(d.tipo()).toBe('celular');
    expect(d.rascunhoPermitido()).toBe(true);
  });

  it('iPad em retrato é tablet: tem calculadora e folha, apesar de estreito', () => {
    const d = fingir({
      largura: 820,
      altura: 1180,
      grosso: true,
      agente: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
      toques: 5,
    });

    expect(d.tipo()).toBe('tablet');
    expect(d.ehTablet()).toBe(true);
    expect(d.calculadoraPermitida()).toBe(true);
    expect(d.folhaPermitida()).toBe(true);
    // No tablet a folha à mão livre já resolve; o monta monta não aparece.
    expect(d.rascunhoPermitido()).toBe(false);
  });

  it('iPad que se diz Mac é desmascarado pelos pontos de toque', () => {
    const d = fingir({
      largura: 1024,
      altura: 1366,
      grosso: false,
      agente: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      toques: 5,
    });

    expect(d.tipo()).toBe('tablet');
    expect(d.folhaPermitida()).toBe(true);
  });

  it('Mac de verdade não vira tablet por ter a mesma assinatura', () => {
    const d = fingir({
      largura: 1024,
      altura: 1366,
      agente: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      toques: 0,
    });

    expect(d.tipo()).toBe('computador');
    expect(d.folhaPermitida()).toBe(false);
  });

  it('iPad mini, o menor dos tablets, ainda conta como tablet', () => {
    const d = fingir({
      largura: 744,
      altura: 1133,
      grosso: true,
      agente: 'Mozilla/5.0 (iPad)',
      toques: 5,
    });

    expect(d.tipo()).toBe('tablet');
  });

  it('reavalia ao girar o aparelho', () => {
    const d = fingir({
      largura: 820,
      altura: 1180,
      grosso: true,
      agente: 'Mozilla/5.0 (iPad)',
      toques: 5,
    });

    expect(d.tipo()).toBe('tablet');

    // Girado: o menor lado é o mesmo, então a classificação não muda.
    Object.defineProperty(window, 'innerWidth', { value: 1180, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 820, configurable: true });
    window.dispatchEvent(new Event('orientationchange'));

    expect(d.tipo()).toBe('tablet');
    expect(d.calculadoraPermitida()).toBe(true);
  });
});
