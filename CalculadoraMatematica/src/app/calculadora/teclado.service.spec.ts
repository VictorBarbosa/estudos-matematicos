import { alturaDoTeclado } from './teclado.service';

/**
 * A conta que posiciona a faixa de teclas.
 *
 * Ela tem de acertar em três situações que o WebView produz, e é fácil acertar
 * numa e errar nas outras — daí o teste ser só da conta, sem navegador.
 */
describe('altura do teclado', () => {
  it('teclado que cobre a página: a diferença é a altura dele', () => {
    // Safari: a janela continua com 800, a área visível cai para 500.
    expect(alturaDoTeclado(800, { height: 500, offsetTop: 0 })).toBe(300);
  });

  it('WebView que encolhe: a faixa fica no rodapé, sem subir', () => {
    // Capacitor com `resize: native`: janela e área visível encolhem juntas.
    // A faixa colada no rodapé já está acima do teclado.
    expect(alturaDoTeclado(500, { height: 500, offsetTop: 0 })).toBe(0);
  });

  it('página rolada até o campo: o deslocamento entra na conta', () => {
    // Sem o `offsetTop`, a faixa apareceria DENTRO do teclado.
    expect(alturaDoTeclado(800, { height: 500, offsetTop: 100 })).toBe(200);
  });

  it('sem teclado, zero — e nunca negativo', () => {
    expect(alturaDoTeclado(800, { height: 800, offsetTop: 0 })).toBe(0);
    expect(alturaDoTeclado(800, { height: 810, offsetTop: 0 })).toBe(0);
  });

  it('arredonda a fração de pixel que o iOS informa', () => {
    expect(alturaDoTeclado(800.4, { height: 500.1, offsetTop: 0 })).toBe(300);
  });
});
