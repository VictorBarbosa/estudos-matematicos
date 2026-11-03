import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { TeclaDeSimbolo } from '@core/treino/models/treino.model';

let proximoId = 0;

/** Entrada da resposta do aluno, com estado visual de acerto e erro. */
@Component({
  selector: 'app-campo-resposta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './campo-resposta.html',
  styleUrl: './campo-resposta.scss',
})
export class CampoResposta {
  readonly valor = model.required<string>();
  readonly rotulo = input.required<string>();
  /** Formato esperado, por exemplo `ex.: 3/4`. */
  readonly ajuda = input<string>();
  readonly estado = input<'neutro' | 'correto' | 'incorreto'>('neutro');
  readonly bloqueado = input(false);
  /**
   * Teclas de símbolo, quando o tópico pede notação que não está no teclado.
   *
   * Vazio na maioria dos tópicos — ninguém precisa de paleta para digitar 3/4.
   */
  readonly simbolos = input<readonly TeclaDeSimbolo[]>([]);

  readonly enviar = output<void>();

  protected readonly id = `resposta-${proximoId++}`;
  private readonly entrada = viewChild<ElementRef<HTMLInputElement>>('entrada');

  /** Devolve o foco ao campo — usado ao avançar para o próximo exercício. */
  focar(): void {
    this.entrada()?.nativeElement.focus();
  }

  /**
   * Escreve o símbolo onde o cursor está.
   *
   * No fim do texto seria mais simples, mas também seria inútil: quem escreve
   * `∀x∈ℝ` precisa voltar e inserir no meio. O `recuo` serve aos esqueletos:
   * `f()` entra com o cursor entre os parênteses.
   */
  protected inserir(tecla: TeclaDeSimbolo): void {
    const campo = this.entrada()?.nativeElement;
    if (campo === undefined) {
      return;
    }

    const texto = this.valor();
    const inicio = campo.selectionStart ?? texto.length;
    const fim = campo.selectionEnd ?? texto.length;

    this.valor.set(texto.slice(0, inicio) + tecla.insere + texto.slice(fim));

    // O cursor só pode ser movido depois que o Angular reescreve o `value`.
    const posicao = inicio + tecla.insere.length - (tecla.recuo ?? 0);
    queueMicrotask(() => {
      campo.focus();
      campo.setSelectionRange(posicao, posicao);
    });
  }
}
