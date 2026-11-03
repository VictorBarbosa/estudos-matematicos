import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FAMILIAS,
  FamiliaDeSimbolos,
  SIMBOLOS,
  SimboloMatematico,
  TresLinguas,
  somatorioComPassos,
} from '@core/math';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/matematica-basica/notacao-matematica/notacao-matematica.i18n.json';
import { geradorNotacao } from '@features/matematica-basica/notacao-matematica/notacao-matematica.gerador';
import { TEORIA_NOTACAO } from '@features/matematica-basica/notacao-matematica/notacao-matematica.teoria';

/** Os termos que o somatório da aba Explorar sabe somar. */
const TERMOS = [
  { corpo: 'k', rotulo: 'k', valor: (k: number) => k, tex: (k: number) => `${k}` },
  { corpo: 'k^2', rotulo: 'k²', valor: (k: number) => k * k, tex: (k: number) => `${k}^2` },
  { corpo: '2k', rotulo: '2k', valor: (k: number) => 2 * k, tex: (k: number) => `2 \\cdot ${k}` },
  {
    corpo: '(2k - 1)',
    rotulo: '2k − 1',
    valor: (k: number) => 2 * k - 1,
    tex: (k: number) => `(2 \\cdot ${k} - 1)`,
  },
] as const;

/**
 * Notação matemática.
 *
 * A aba Explorar é um dicionário vivo: cada símbolo com o nome que tem, como
 * se lê em voz alta nas três línguas do curso e um exemplo. O somatório ganha
 * um painel à parte porque ele é o símbolo em que a leitura mais falha — ver a
 * expansão mudar quando se arrasta o limite é o que o faz virar conta.
 */
@Component({
  selector: 'app-notacao-matematica',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, PassoAPasso, TopicoLayout],
  templateUrl: './notacao-matematica.html',
  styleUrl: './notacao-matematica.scss',
})
export class NotacaoMatematica {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorNotacao;
  protected readonly conceitos = TEORIA_NOTACAO.map((teoria) => teoria.id);

  protected readonly familias = Object.entries(FAMILIAS) as readonly [
    FamiliaDeSimbolos,
    TresLinguas,
  ][];

  /** Os símbolos agrupados por família, na ordem em que a tabela os mostra. */
  protected readonly porFamilia = computed(() =>
    this.familias.map(([id, titulo]) => ({
      id,
      titulo,
      simbolos: SIMBOLOS.filter((simbolo) => simbolo.familia === id),
    })),
  );

  /** Escolhe, numa frase já escrita nas três línguas, a da tela. */
  protected naLingua(frase: TresLinguas): string {
    return frase[this.i18n.idioma()];
  }

  protected readonly termos = TERMOS;
  protected readonly termo = signal<(typeof TERMOS)[number]>(TERMOS[1]);
  protected readonly ate = signal(4);

  protected readonly somatorio = computed(() => {
    const termo = this.termo();
    return somatorioComPassos(1, this.ate(), termo.valor, termo.tex, termo.corpo);
  });

  protected readonly somatorioTex = computed(
    () => `\\sum_{k=1}^{${this.ate()}} ${this.termo().corpo} = ${this.somatorio().resultado}`,
  );

  protected escolherTermo(termo: (typeof TERMOS)[number]): void {
    this.termo.set(termo);
  }

  /** Identidade estável para o `@for` da tabela. */
  protected identificar(simbolo: SimboloMatematico): string {
    return simbolo.simbolo;
  }
}
