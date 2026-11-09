import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { TeclaDeSimbolo } from '@core/treino/models/treino.model';
import {
  cursorNaMascara,
  digitosAte,
  mascararNumero,
} from '@core/treino/mascara-numero/mascara-numero';

let proximoId = 0;

/** Entrada da resposta do aluno, com estado visual de acerto e erro. */
import { I18nService } from '@core/i18n/services/i18n.service';

@Component({
  selector: 'app-campo-resposta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './campo-resposta.html',
  styleUrl: './campo-resposta.scss',
})
export class CampoResposta {
  protected readonly i18n = inject(I18nService);

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

  /**
   * Arruma o número enquanto ele é digitado.
   *
   * `6.082.12` e `6.082,12` eram a mesma intenção escrita de dois jeitos, e só
   * um deles era lido certo. Agora o campo reescreve o que foi digitado com a
   * regra do próprio corretor, então o que está na tela é o que vai ser
   * corrigido — não há mais erro que venha só do separador.
   *
   * Fração, raiz, intervalo e qualquer resposta com letra passam intactas: a
   * máscara só age quando o texto é número puro.
   */
  protected aoDigitar(alvo: HTMLInputElement): void {
    const digitado = alvo.value;
    const mascarado = mascararNumero(digitado);

    if (mascarado === digitado) {
      this.valor.set(digitado);
      return;
    }

    // O cursor é reposicionado por contagem de dígitos: os pontos de milhar
    // nascem e morrem à esquerda dele, e contar caracteres o faria saltar.
    const posicao = cursorNaMascara(
      mascarado,
      digitosAte(digitado, alvo.selectionStart ?? digitado.length),
    );

    this.valor.set(mascarado);
    queueMicrotask(() => {
      alvo.setSelectionRange(posicao, posicao);
    });
  }

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
