import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KatexService } from './katex.service';

/**
 * Renderiza uma expressão LaTeX.
 *
 * Uso: `<app-formula tex="\frac{a}{b}" />` em linha, ou com `[bloco]="true"`
 * para exibi-la centralizada e em tamanho maior.
 */
@Component({
  selector: 'app-formula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './formula.html',
  styleUrl: './formula.scss',
})
export class Formula {
  readonly tex = input.required<string>();
  readonly bloco = input(false);

  private readonly katex = inject(KatexService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly html = signal<SafeHtml | null>(null);

  /** Descarta respostas de renderizações que já foram substituídas por outras. */
  private geracao = 0;

  constructor() {
    effect(() => {
      const tex = this.tex();
      const bloco = this.bloco();
      const geracaoAtual = ++this.geracao;

      void this.katex.renderizar(tex, bloco).then((bruto) => {
        if (geracaoAtual !== this.geracao) {
          return;
        }
        // O HTML do KaTeX depende de `style` inline, que o sanitizador padrão
        // removeria. É seguro confiar nele: o LaTeX vem do código do projeto,
        // nunca de texto digitado pelo usuário.
        this.html.set(this.sanitizer.bypassSecurityTrustHtml(bruto));
      });
    });
  }
}
