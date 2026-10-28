import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ANGULOS_NOTAVEIS, paraRadianos, resolverTrianguloComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorTriangulo } from './triangulo-retangulo.gerador';
import { TEORIA_TRIANGULO } from './triangulo-retangulo.teoria';

/** Dimensões do desenho do triângulo, no sistema interno do SVG. */
const LARGURA = 340;
const ALTURA = 240;
const MARGEM = 30;

@Component({
  selector: 'app-triangulo-retangulo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    PassoAPasso,
    TopicoLayout,
  ],
  templateUrl: './triangulo-retangulo.html',
  styleUrl: './triangulo-retangulo.scss',
})
export class TrianguloRetangulo {
  protected readonly gerador = geradorTriangulo;
  protected readonly conceitos = TEORIA_TRIANGULO.map((teoria) => teoria.id);
  protected readonly notaveis = ANGULOS_NOTAVEIS;

  protected readonly angulo = signal(30);
  protected readonly hipotenusa = signal(10);

  protected readonly anguloValido = computed(() =>
    Math.min(85, Math.max(5, this.angulo())),
  );

  protected readonly analise = computed(() =>
    resolverTrianguloComPassos(this.anguloValido(), this.hipotenusa()),
  );

  protected readonly catetos = computed(() => this.analise().resultado);

  protected readonly razoes = computed(() => {
    const radianos = paraRadianos(this.anguloValido());
    return {
      seno: Math.sin(radianos),
      cosseno: Math.cos(radianos),
      tangente: Math.tan(radianos),
    };
  });

  /** Confirmação numérica de que sen² + cos² dá 1. */
  protected readonly identidade = computed(() => {
    const { seno, cosseno } = this.razoes();
    return seno * seno + cosseno * cosseno;
  });

  /**
   * Vértices do triângulo em coordenadas de tela, escalados para preencher o
   * desenho independentemente do ângulo escolhido.
   */
  protected readonly vertices = computed(() => {
    const { oposto, adjacente } = this.catetos();
    const escala = Math.min(
      (LARGURA - 2 * MARGEM) / Math.max(adjacente, 0.001),
      (ALTURA - 2 * MARGEM) / Math.max(oposto, 0.001),
    );

    const base = adjacente * escala;
    const altura = oposto * escala;

    return {
      a: { x: MARGEM, y: ALTURA - MARGEM },
      b: { x: MARGEM + base, y: ALTURA - MARGEM },
      c: { x: MARGEM + base, y: ALTURA - MARGEM - altura },
      base,
      altura,
    };
  });

  protected readonly LARGURA = LARGURA;
  protected readonly ALTURA = ALTURA;

  protected readonly descricaoTriangulo = computed(
    () =>
      `Triângulo retângulo com ângulo de ${this.anguloValido()} graus, hipotenusa ` +
      `${this.hipotenusa()}, cateto oposto ${this.formatar(this.catetos().oposto)} e ` +
      `cateto adjacente ${this.formatar(this.catetos().adjacente)}.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_TRIANGULO);
  }

  protected usarNotavel(graus: number): void {
    this.angulo.set(graus);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
