import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { comSubscritos, formulaIonica, noxDoElemento } from '@core/math';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { Formula } from '@shared/components/formula/formula';
import textos from '@features/quimica/formulas-e-nomenclatura/formulas-e-nomenclatura.i18n.json';
import { geradorNomenclatura } from '@features/quimica/formulas-e-nomenclatura/formulas-e-nomenclatura.gerador';
import {
  NOME_DO_ANION,
  NOME_DO_CATION,
  nomeDoComposto,
} from '@features/quimica/formulas-e-nomenclatura/formulas-e-nomenclatura.textos';
import { TEORIA_NOMENCLATURA } from '@features/quimica/formulas-e-nomenclatura/formulas-e-nomenclatura.teoria';

/** Os metais da aba Explorar, com as cargas que formam. */
const METAIS = [
  { simbolo: 'Na', cargas: [1] },
  { simbolo: 'Ca', cargas: [2] },
  { simbolo: 'Al', cargas: [3] },
  { simbolo: 'Fe', cargas: [2, 3] },
  { simbolo: 'Cu', cargas: [1, 2] },
  { simbolo: 'Pb', cargas: [2, 4] },
] as const;

const NAO_METAIS = [
  { simbolo: 'Cl', carga: -1 },
  { simbolo: 'O', carga: -2 },
  { simbolo: 'S', carga: -2 },
  { simbolo: 'N', carga: -3 },
] as const;

/**
 * Fórmulas e nomenclatura — a aba Explorar.
 *
 * Escolher o metal, o não metal e a carga mostra o nome nas três línguas ao
 * lado da fórmula. Ver «cloreto de ferro(III)», «chlorure de fer(III)» e
 * «iron(III) chloride» na mesma tela é o que ensina que a ordem das palavras é
 * da língua e a fórmula não: FeCl₃ é FeCl₃ em qualquer lugar.
 *
 * Trocar a carga do ferro com o cloro fixo mostra, de uma vez, por que o
 * numeral romano existe.
 */
@Component({
  selector: 'app-formulas-e-nomenclatura',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, Formula, TopicoLayout],
  templateUrl: './formulas-e-nomenclatura.html',
  styleUrl: './formulas-e-nomenclatura.scss',
})
export class FormulasENomenclatura {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorNomenclatura;
  protected readonly conceitos = TEORIA_NOMENCLATURA.map((teoria) => teoria.id);
  protected readonly metais = METAIS;
  protected readonly naoMetais = NAO_METAIS;

  protected readonly indiceDoMetal = signal(3);
  protected readonly indiceDoNaoMetal = signal(0);
  protected readonly indiceDaCarga = signal(1);

  protected readonly metal = computed(() => METAIS[this.indiceDoMetal()] ?? METAIS[0]!);
  protected readonly naoMetal = computed(
    () => NAO_METAIS[this.indiceDoNaoMetal()] ?? NAO_METAIS[0]!,
  );

  protected readonly cargas = computed(() => this.metal().cargas);

  protected readonly carga = computed(() => {
    const possiveis = this.cargas();
    return possiveis[Math.min(this.indiceDaCarga(), possiveis.length - 1)]!;
  });

  protected readonly variavel = computed(() => this.cargas().length > 1);

  protected readonly formula = computed(() => {
    const escrita = formulaIonica(
      { simbolo: this.metal().simbolo, carga: this.carga() },
      { simbolo: this.naoMetal().simbolo, carga: this.naoMetal().carga },
    );

    return escrita === undefined ? '—' : comSubscritos(escrita);
  });

  protected readonly nomes = computed(() => {
    const metal = this.metal().simbolo;
    const naoMetal = this.naoMetal().simbolo;

    if (NOME_DO_CATION[metal] === undefined || NOME_DO_ANION[naoMetal] === undefined) {
      return [];
    }

    return (['pt', 'fr', 'en'] as const).map((idioma) => ({
      idioma,
      nome: nomeDoComposto(metal, naoMetal, this.carga(), this.variavel(), idioma),
    }));
  });

  protected readonly nox = computed(() => {
    const crua = formulaIonica(
      { simbolo: this.metal().simbolo, carga: this.carga() },
      { simbolo: this.naoMetal().simbolo, carga: this.naoMetal().carga },
    );

    if (crua === undefined) {
      return undefined;
    }

    return noxDoElemento(crua, this.metal().simbolo);
  });

  protected escolherMetal(indice: number): void {
    this.indiceDoMetal.set(indice);
    this.indiceDaCarga.set(0);
  }

  protected escolherNaoMetal(indice: number): void {
    this.indiceDoNaoMetal.set(indice);
  }

  protected escolherCarga(indice: number): void {
    this.indiceDaCarga.set(indice);
  }

  protected comSinal(valor: number | undefined): string {
    if (valor === undefined) {
      return '—';
    }
    return valor > 0 ? `+${valor}` : String(valor);
  }
}
