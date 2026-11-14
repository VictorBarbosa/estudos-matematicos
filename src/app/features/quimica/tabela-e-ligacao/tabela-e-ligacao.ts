import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ELEMENTOS,
  camadas,
  cargaMaisProvavel,
  comSubscritos,
  diferencaDeEletronegatividade,
  eletronegatividade,
  eletronsDaUltimaCamada,
  formulaIonica,
  grupo,
  tipoDeLigacao,
} from '@core/math';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { Formula } from '@shared/components/formula/formula';
import textos from '@features/quimica/tabela-e-ligacao/tabela-e-ligacao.i18n.json';
import { geradorLigacao } from '@features/quimica/tabela-e-ligacao/tabela-e-ligacao.gerador';
import { TEORIA_LIGACAO } from '@features/quimica/tabela-e-ligacao/tabela-e-ligacao.teoria';

/** Os elementos que a aba Explorar oferece, em ordem de número atômico. */
const ESCOLHAS = ELEMENTOS.filter((elemento) => elemento.numeroAtomico <= 20).concat(
  ELEMENTOS.filter((elemento) => [35, 53, 56].includes(elemento.numeroAtomico)),
);

/**
 * Tabela periódica e ligação — a aba Explorar.
 *
 * Dois elementos escolhidos lado a lado, com o grupo, o período e o íon
 * provável de cada um; embaixo, o que eles formam juntos. Trocar um dos dois
 * mostra a regularidade de que o tópico fala: o sódio e o potássio dão
 * exatamente a mesma coisa com o cloro, porque têm a mesma última camada.
 *
 * O rótulo da ligação aparece com a ressalva, e não sozinho: a régua de 1,7 é
 * convenção de ensino, e apresentá-la como lei ensinaria errado.
 */
@Component({
  selector: 'app-tabela-e-ligacao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, Formula, TopicoLayout],
  templateUrl: './tabela-e-ligacao.html',
  styleUrl: './tabela-e-ligacao.scss',
})
export class TabelaELigacao {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorLigacao;
  protected readonly conceitos = TEORIA_LIGACAO.map((teoria) => teoria.id);
  protected readonly escolhas = ESCOLHAS;

  protected readonly indicePrimeiro = signal(
    Math.max(
      0,
      ESCOLHAS.findIndex((elemento) => elemento.simbolo === 'Na'),
    ),
  );
  protected readonly indiceSegundo = signal(
    Math.max(
      0,
      ESCOLHAS.findIndex((elemento) => elemento.simbolo === 'Cl'),
    ),
  );

  protected readonly primeiro = computed(() => ESCOLHAS[this.indicePrimeiro()] ?? ESCOLHAS[0]!);
  protected readonly segundo = computed(() => ESCOLHAS[this.indiceSegundo()] ?? ESCOLHAS[0]!);

  protected readonly fichaPrimeira = computed(() => this.ficha(this.indicePrimeiro()));
  protected readonly fichaSegunda = computed(() => this.ficha(this.indiceSegundo()));

  protected readonly diferenca = computed(() =>
    diferencaDeEletronegatividade(this.primeiro().simbolo, this.segundo().simbolo),
  );

  protected readonly tipo = computed(() => {
    switch (tipoDeLigacao(this.primeiro().simbolo, this.segundo().simbolo)) {
      case 'ionica':
        return this.texto('ionica');
      case 'covalente-polar':
        return this.texto('polar');
      case 'covalente-apolar':
        return this.texto('apolar');
      default:
        return this.texto('semValor');
    }
  });

  /** O composto iônico dos dois, quando um é cátion e o outro é ânion. */
  protected readonly composto = computed(() => {
    const cargaPrimeira = cargaMaisProvavel(this.primeiro().numeroAtomico);
    const cargaSegunda = cargaMaisProvavel(this.segundo().numeroAtomico);

    if (cargaPrimeira === undefined || cargaSegunda === undefined) {
      return undefined;
    }
    if (Math.sign(cargaPrimeira) === Math.sign(cargaSegunda)) {
      return undefined;
    }

    const cation =
      cargaPrimeira > 0
        ? { simbolo: this.primeiro().simbolo, carga: cargaPrimeira }
        : { simbolo: this.segundo().simbolo, carga: cargaSegunda };
    const anion =
      cargaPrimeira > 0
        ? { simbolo: this.segundo().simbolo, carga: cargaSegunda }
        : { simbolo: this.primeiro().simbolo, carga: cargaPrimeira };

    const formula = formulaIonica(cation, anion);

    return formula === undefined ? undefined : comSubscritos(formula);
  });

  protected escolherPrimeiro(indice: number): void {
    this.indicePrimeiro.set(indice);
  }

  protected escolherSegundo(indice: number): void {
    this.indiceSegundo.set(indice);
  }

  protected arredondar(valor: number | undefined): string {
    return valor === undefined
      ? this.texto('semValor')
      : valor.toLocaleString(this.i18n.idioma() === 'en' ? 'en-US' : 'pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  }

  private ficha(indice: number) {
    const elemento = ESCOLHAS[indice] ?? ESCOLHAS[0]!;
    const z = elemento.numeroAtomico;
    const carga = cargaMaisProvavel(z);

    return {
      simbolo: elemento.simbolo,
      grupo: grupo(z) ?? undefined,
      periodo: camadas(z).length,
      ultima: eletronsDaUltimaCamada(z),
      eletro: eletronegatividade(elemento.simbolo),
      carga:
        carga === undefined
          ? undefined
          : `${elemento.simbolo}${Math.abs(carga)}${carga > 0 ? '+' : '-'}`,
    };
  }
}
