import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';

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

  readonly enviar = output<void>();

  protected readonly id = `resposta-${proximoId++}`;
  private readonly entrada = viewChild<ElementRef<HTMLInputElement>>('entrada');

  /** Devolve o foco ao campo — usado ao avançar para o próximo exercício. */
  focar(): void {
    this.entrada()?.nativeElement.focus();
  }
}
