import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { paraRadianos, quadrante } from '@core/math';

/** Raio do círculo no sistema de coordenadas interno do SVG. */
const RAIO = 120;
const CENTRO = 170;

/**
 * Círculo trigonométrico.
 *
 * Seno e cosseno aparecem como as COORDENADAS do ponto sobre o círculo de
 * raio 1 — que é a definição que generaliza a do triângulo retângulo para
 * ângulos de qualquer medida. A tangente é mostrada na reta vertical x = 1,
 * onde o prolongamento do raio a encontra.
 */
@Component({
  selector: 'app-circulo-trigonometrico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './circulo-trigonometrico.html',
  styleUrl: './circulo-trigonometrico.scss',
})
export class CirculoTrigonometrico {
  readonly anguloGraus = input.required<number>();
  readonly mostrarTangente = input(false);
  readonly mostrarProjecoes = input(true);

  protected readonly RAIO = RAIO;
  protected readonly CENTRO = CENTRO;

  protected readonly radianos = computed(() => paraRadianos(this.anguloGraus()));

  protected readonly seno = computed(() => Math.sin(this.radianos()));
  protected readonly cosseno = computed(() => Math.cos(this.radianos()));

  protected readonly tangente = computed(() => {
    const cos = this.cosseno();
    return Math.abs(cos) < 1e-9 ? null : this.seno() / cos;
  });

  protected readonly quadranteAtual = computed(() => quadrante(this.anguloGraus()));

  /** Ponto sobre o círculo, já em coordenadas de tela (y cresce para baixo). */
  protected readonly ponto = computed(() => ({
    x: CENTRO + this.cosseno() * RAIO,
    y: CENTRO - this.seno() * RAIO,
  }));

  /** Onde o prolongamento do raio encontra a reta tangente x = 1. */
  protected readonly pontoTangente = computed(() => {
    const t = this.tangente();
    if (t === null || Math.abs(t) > 6) {
      return null;
    }
    return { x: CENTRO + RAIO, y: CENTRO - t * RAIO };
  });

  /** Arco que marca o ângulo, desenhado a partir do eixo x positivo. */
  protected readonly arco = computed(() => {
    const raioArco = 34;
    const angulo = this.radianos();
    const fim = {
      x: CENTRO + Math.cos(angulo) * raioArco,
      y: CENTRO - Math.sin(angulo) * raioArco,
    };

    const normalizado = ((this.anguloGraus() % 360) + 360) % 360;
    const arcoGrande = normalizado > 180 ? 1 : 0;

    return `M${CENTRO + raioArco},${CENTRO} A${raioArco},${raioArco} 0 ${arcoGrande} 0 ${fim.x.toFixed(2)},${fim.y.toFixed(2)}`;
  });

  protected readonly descricao = computed(
    () =>
      `Círculo trigonométrico com ângulo de ${this.anguloGraus()} graus no ` +
      `${this.quadranteAtual()}º quadrante. Cosseno ${this.formatar(this.cosseno())}, ` +
      `seno ${this.formatar(this.seno())}.`,
  );

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
