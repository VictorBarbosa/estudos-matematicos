import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { arranjosComPassos, combinacoes, combinacoesComPassos, fatorial } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorCombinatoria } from './analise-combinatoria.gerador';
import { TEORIA_COMBINATORIA } from './analise-combinatoria.teoria';

@Component({
  selector: 'app-analise-combinatoria',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    PassoAPasso,
    TopicoLayout,
  ],
  templateUrl: './analise-combinatoria.html',
  styleUrl: './analise-combinatoria.scss',
})
export class AnaliseCombinatoria {
  protected readonly gerador = geradorCombinatoria;
  protected readonly conceitos = TEORIA_COMBINATORIA.map((teoria) => teoria.id);

  protected readonly n = signal(10);
  protected readonly p = signal(3);

  /** Quantas linhas do triângulo de Pascal mostrar. */
  protected readonly linhasPascal = signal(7);

  protected readonly arranjo = computed(() => arranjosComPassos(this.n(), this.pValido()));
  protected readonly combinacao = computed(() => combinacoesComPassos(this.n(), this.pValido()));

  /** p nunca pode passar de n, mesmo com os controles em qualquer ordem. */
  protected readonly pValido = computed(() => Math.min(this.p(), this.n()));

  protected readonly ordensRepetidas = computed(() => fatorial(this.pValido()));

  protected readonly arranjoTex = computed(
    () => `A_{${this.n()},${this.pValido()}} = ${this.formatar(this.arranjo().resultado)}`,
  );

  protected readonly combinacaoTex = computed(
    () => `C_{${this.n()},${this.pValido()}} = ${this.formatar(this.combinacao().resultado)}`,
  );

  /** O triângulo de Pascal, onde cada entrada é uma combinação. */
  protected readonly pascal = computed(() =>
    Array.from({ length: this.linhasPascal() }, (_, linha) =>
      Array.from({ length: linha + 1 }, (_, coluna) => ({
        valor: combinacoes(linha, coluna),
        destacado: linha === this.n() && coluna === this.pValido(),
      })),
    ),
  );

  /** A soma de cada linha é 2ⁿ: todos os subconjuntos possíveis. */
  protected readonly somasDasLinhas = computed(() =>
    this.pascal().map((linha) => linha.reduce((total, celula) => total + celula.valor, 0)),
  );

  protected readonly simetrica = computed(() => combinacoes(this.n(), this.n() - this.pValido()));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_COMBINATORIA);
  }

  protected formatar(valor: number): string {
    return valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  }
}
