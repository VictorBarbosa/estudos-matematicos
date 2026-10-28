import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ErroMatematico, Resolucao, resolverExpressaoComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorOperacoes } from './operacoes-fundamentais.gerador';
import { TEORIA_OPERACOES } from './operacoes-fundamentais.teoria';

/** Expressões prontas que evidenciam cada regra de precedência. */
const EXEMPLOS: readonly { readonly rotulo: string; readonly expressao: string }[] = [
  { rotulo: 'Multiplicação antes da soma', expressao: '2 + 3 * 4' },
  { rotulo: 'Parênteses mudam tudo', expressao: '(2 + 3) * 4' },
  { rotulo: 'Potência antes do produto', expressao: '3 * 2^3' },
  { rotulo: 'Tudo junto', expressao: '2 + 3 * (4 - 1)^2' },
  { rotulo: 'Sinais negativos', expressao: '-2 * (3 - 7) + 10 / 5' },
];

@Component({
  selector: 'app-operacoes-fundamentais',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, Formula, PassoAPasso, TopicoLayout],
  templateUrl: './operacoes-fundamentais.html',
  styleUrl: './operacoes-fundamentais.scss',
})
export class OperacoesFundamentais {
  protected readonly gerador = geradorOperacoes;
  protected readonly conceitos = TEORIA_OPERACOES.map((teoria) => teoria.id);
  protected readonly exemplos = EXEMPLOS;

  protected readonly expressao = signal('2 + 3 * (4 - 1)^2');

  /**
   * A resolução, ou a mensagem de erro quando o texto não é uma expressão
   * válida — digitar é livre, então a tela precisa aguentar qualquer entrada.
   */
  private readonly analise = computed<
    | { readonly ok: true; readonly resolucao: Resolucao<number> }
    | { readonly ok: false; readonly mensagem: string }
  >(() => {
    try {
      return { ok: true, resolucao: resolverExpressaoComPassos(this.expressao()) };
    } catch (erro) {
      return {
        ok: false,
        mensagem:
          erro instanceof ErroMatematico
            ? erro.message
            : 'Não consegui interpretar essa expressão.',
      };
    }
  });

  protected readonly erro = computed(() => {
    const analise = this.analise();
    return analise.ok ? null : analise.mensagem;
  });

  protected readonly passos = computed(() => {
    const analise = this.analise();
    return analise.ok ? analise.resolucao.passos : [];
  });

  protected readonly resultado = computed(() => {
    const analise = this.analise();
    return analise.ok ? analise.resolucao.resultado : null;
  });

  /** Quantas operações foram necessárias — o primeiro passo é só o enunciado. */
  protected readonly quantidadeDeOperacoes = computed(() => Math.max(0, this.passos().length - 1));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_OPERACOES);
  }

  protected aoDigitar(evento: Event): void {
    this.expressao.set((evento.target as HTMLInputElement).value);
  }

  protected usarExemplo(expressao: string): void {
    this.expressao.set(expressao);
  }
}
