import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Matriz, determinante, gaussJordanComPassos, inversaComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/vetores-matrizes/escalonamento-e-inversa/escalonamento-e-inversa.i18n.json';
import { geradorEscalonamento } from '@features/vetores-matrizes/escalonamento-e-inversa/escalonamento-e-inversa.gerador';
import { TEORIA_ESCALONAMENTO } from '@features/vetores-matrizes/escalonamento-e-inversa/escalonamento-e-inversa.teoria';

const NOMES = ['x', 'y', 'z'];

@Component({
  selector: 'app-escalonamento-e-inversa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, PassoAPasso, TopicoLayout],
  templateUrl: './escalonamento-e-inversa.html',
  styleUrl: './escalonamento-e-inversa.scss',
})
export class EscalonamentoEInversa {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorEscalonamento;
  protected readonly conceitos = TEORIA_ESCALONAMENTO.map((teoria) => teoria.id);

  /**
   * As doze entradas da matriz aumentada, linha por linha.
   *
   * O sistema de partida tem solução (1, 2, 3) e precisa de eliminações nas
   * três colunas — dá para ver o método inteiro antes de mexer em nada.
   */
  protected readonly entradas = [
    [signal(1), signal(1), signal(1), signal(6)],
    [signal(2), signal(3), signal(1), signal(11)],
    [signal(1), signal(-1), signal(2), signal(5)],
  ] as const;

  protected readonly rotulos = [
    ['a₁₁', 'a₁₂', 'a₁₃', 'b₁'],
    ['a₂₁', 'a₂₂', 'a₂₃', 'b₂'],
    ['a₃₁', 'a₃₂', 'a₃₃', 'b₃'],
  ];

  protected readonly aumentada = computed<Matriz>(() =>
    this.entradas.map((linha) => linha.map((entrada) => entrada())),
  );

  protected readonly a = computed<Matriz>(() => this.aumentada().map((linha) => linha.slice(0, 3)));

  protected readonly sistemaTex = computed(
    () =>
      `\\begin{cases} ${this.aumentada()
        .map((linha) => this.equacaoTex(linha))
        .join(' \\\\ ')} \\end{cases}`,
  );

  protected readonly gauss = computed(() => gaussJordanComPassos(this.aumentada()));

  protected readonly tipo = computed(() => this.gauss().resultado.tipo);

  protected readonly solucaoTexto = computed(() => {
    const solucao = this.gauss().resultado.solucao;
    return solucao === null ? '' : solucao.map((valor) => valor.toString()).join('; ');
  });

  protected readonly det = computed(() => Math.round(determinante(this.a()) * 1e6) / 1e6);

  /** A inversa por (A | I), ou `null` quando det A = 0 e ela não existe. */
  protected readonly inversa = computed(() =>
    Math.abs(this.det()) < 1e-9 ? null : inversaComPassos(this.a()),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_ESCALONAMENTO);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }

  private equacaoTex(linha: readonly number[]): string {
    const termos: string[] = [];
    linha.slice(0, 3).forEach((c, i) => {
      if (c === 0) return;
      const modulo = Math.abs(c) === 1 ? '' : String(Math.abs(c));
      termos.push(
        termos.length === 0
          ? `${c < 0 ? '-' : ''}${modulo}${NOMES[i]}`
          : `${c < 0 ? '-' : '+'} ${modulo}${NOMES[i]}`,
      );
    });
    return `${termos.length === 0 ? '0' : termos.join(' ')} = ${linha[3]}`;
  }
}
