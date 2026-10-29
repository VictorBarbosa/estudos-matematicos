import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  NOME_SOLIDO,
  Solido,
  razaoDeVolumesComPassos,
  superficieComPassos,
  volumeComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorSolidos } from '@features/geometria/solidos-e-volumes/solidos-e-volumes.gerador';
import { TEORIA_SOLIDOS } from '@features/geometria/solidos-e-volumes/solidos-e-volumes.teoria';

const SOLIDOS: readonly Solido[] = ['cilindro', 'cone', 'esfera'];

@Component({
  selector: 'app-solidos-e-volumes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    PassoAPasso,
    TopicoLayout,
  ],
  templateUrl: './solidos-e-volumes.html',
  styleUrl: './solidos-e-volumes.scss',
})
export class SolidosEVolumes {
  protected readonly gerador = geradorSolidos;
  protected readonly conceitos = TEORIA_SOLIDOS.map((teoria) => teoria.id);
  protected readonly solidos = SOLIDOS;
  protected readonly nomeSolido = NOME_SOLIDO;

  protected readonly solido = signal<Solido>('cone');
  protected readonly raio = signal(3);
  protected readonly altura = signal(6);
  protected readonly k = signal(2);

  protected readonly dimensoes = computed(() => ({
    raio: this.raio(),
    altura: this.solido() === 'esfera' ? 2 * this.raio() : this.altura(),
    geratriz: Math.hypot(this.raio(), this.altura()),
  }));

  protected readonly analiseVolume = computed(() =>
    volumeComPassos(this.solido(), this.dimensoes()),
  );

  protected readonly analiseSuperficie = computed(() =>
    superficieComPassos(this.solido(), this.dimensoes()),
  );

  protected readonly volume = computed(() => this.analiseVolume().resultado);

  /** O cilindro de referência: mesmo raio, mesma altura. */
  protected readonly volumeCilindro = computed(
    () =>
      volumeComPassos('cilindro', {
        raio: this.raio(),
        altura: this.solido() === 'esfera' ? 2 * this.raio() : this.altura(),
      }).resultado,
  );

  protected readonly fracaoDoCilindro = computed(() => this.volume() / this.volumeCilindro());

  protected readonly volumeTex = computed(() => {
    const r = this.raio();
    const h = this.altura();

    switch (this.solido()) {
      case 'esfera':
        return `V = \\frac{4}{3}\\pi \\cdot ${r}^{3} = ${this.formatar(this.volume())}`;
      case 'cone':
        return `V = \\frac{\\pi \\cdot ${r}^{2} \\cdot ${h}}{3} = ${this.formatar(this.volume())}`;
      default:
        return `V = \\pi \\cdot ${r}^{2} \\cdot ${h} = ${this.formatar(this.volume())}`;
    }
  });

  /** Razão superfície/volume: a grandeza que decide projeto de estruturas. */
  protected readonly razaoSuperficieVolume = computed(
    () => this.analiseSuperficie().resultado / this.volume(),
  );

  protected readonly escala = computed(() => razaoDeVolumesComPassos(this.k()));

  protected readonly volumeAmpliado = computed(() => this.volume() * this.escala().resultado);

  protected readonly superficieAmpliada = computed(
    () => this.analiseSuperficie().resultado * this.k() ** 2,
  );

  protected readonly razaoAmpliada = computed(
    () => this.superficieAmpliada() / this.volumeAmpliado(),
  );

  protected readonly usaAltura = computed(() => this.solido() !== 'esfera');

  constructor() {
    inject(TeoriaService).registrar(TEORIA_SOLIDOS);
  }

  protected selecionar(solido: Solido): void {
    this.solido.set(solido);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }

  protected percentual(valor: number): string {
    return `${(valor * 100).toFixed(1).replace('.', ',')}%`;
  }
}
