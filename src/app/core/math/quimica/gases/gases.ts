import { paraKelvin } from '@core/math/fisica/termica/termica';
import { Resolucao } from '@core/math/tipos/tipos';

/**
 * Gases ideais: uma equação só, e a temperatura em kelvin.
 *
 * `PV = nRT` diz que, para um gás rarefeito, pressão, volume e temperatura não
 * são independentes: fixados dois, o terceiro está decidido. O modelo supõe
 * partículas sem volume próprio e sem atração entre si, o que é falso — e
 * ainda assim acerta bem, porque num gás comum a distância entre as partículas
 * é grande demais para que o resto importe.
 *
 * O erro que o tópico existe para corrigir é a temperatura em graus Celsius.
 * Não é descuido de unidade: a equação diz que o volume é PROPORCIONAL à
 * temperatura, e proporção exige uma escala cujo zero seja o zero de verdade.
 * Em Celsius, 20 °C não é o dobro de 10 °C; em kelvin, 293 K e 283 K mostram
 * o que de fato acontece — quase nada.
 */

/**
 * Constante dos gases, em L·atm por mol·K.
 *
 * É a mesma constante dos 8,314 J/(mol·K) da termodinâmica (`R_LITRO_ATM`, em
 * `fisica/fluidos`): muda a unidade de energia, não a física. Em química ela
 * aparece assim porque pressão vem em atm e volume em litros, e usar a outra
 * forma obrigaria a converter os dois.
 */
export const R_LITRO_ATM = 0.08206;

/**
 * A conversão para kelvin é a de `fisica/termica`, e não uma cópia: a escala
 * absoluta é uma só, e o tópico de gases apenas depende dela.
 */
export { paraKelvin };

/** A pressão de n mols num volume, a uma temperatura em KELVIN. */
export function pressaoIdeal(mols: number, litros: number, temperaturaK: number): number {
  return (mols * R_LITRO_ATM * temperaturaK) / litros;
}

export function volumeIdeal(mols: number, pressao: number, temperaturaK: number): number {
  return (mols * R_LITRO_ATM * temperaturaK) / pressao;
}

export function molsIdeais(pressao: number, litros: number, temperaturaK: number): number {
  return (pressao * litros) / (R_LITRO_ATM * temperaturaK);
}

export function molsIdeaisComPassos(
  pressao: number,
  litros: number,
  celsius: number,
): Resolucao<number> {
  const temperaturaK = paraKelvin(celsius);
  const resultado = molsIdeais(pressao, litros, temperaturaK);

  return {
    resultado,
    passos: [
      {
        descricao: 'A temperatura entra em kelvin, sempre.',
        tex: `T = ${Number(celsius.toFixed(2))} + 273{,}15 = ${Number(temperaturaK.toFixed(2))}\\;\\text{K}`,
        nota:
          'A equação diz que o volume é proporcional à temperatura, e proporção precisa de ' +
          'uma escala cujo zero seja o zero de verdade.',
      },
      {
        descricao: 'Isolando a quantidade na equação dos gases.',
        tex: 'n = \\frac{PV}{RT}',
      },
      {
        descricao: 'Substituindo.',
        tex:
          `n = \\frac{${Number(pressao.toFixed(4))} \\times ${Number(litros.toFixed(4))}}` +
          `{${R_LITRO_ATM} \\times ${Number(temperaturaK.toFixed(2))}} = ` +
          `${Number(resultado.toFixed(4))}\\;\\text{mol}`,
      },
    ],
  };
}

export function volumeIdealComPassos(
  mols: number,
  pressao: number,
  celsius: number,
): Resolucao<number> {
  const temperaturaK = paraKelvin(celsius);
  const resultado = volumeIdeal(mols, pressao, temperaturaK);

  return {
    resultado,
    passos: [
      {
        descricao: 'Primeiro a temperatura, em kelvin.',
        tex: `T = ${Number(celsius.toFixed(2))} + 273{,}15 = ${Number(temperaturaK.toFixed(2))}\\;\\text{K}`,
        nota: 'Usar graus Celsius aqui não erra por pouco: muda a resposta inteira.',
      },
      {
        descricao: 'Isolando o volume.',
        tex: 'V = \\frac{nRT}{P}',
      },
      {
        descricao: 'Substituindo.',
        tex:
          `V = \\frac{${Number(mols.toFixed(4))} \\times ${R_LITRO_ATM} \\times ` +
          `${Number(temperaturaK.toFixed(2))}}{${Number(pressao.toFixed(4))}} = ` +
          `${Number(resultado.toFixed(4))}\\;\\text{L}`,
      },
    ],
  };
}

/**
 * Lei combinada: o mesmo gás, em dois estados.
 *
 * `P₁V₁/T₁ = P₂V₂/T₂` não é uma lei nova — é `PV = nRT` escrita duas vezes
 * para a mesma quantidade de gás, com o `nR` cancelando. Por isso ela vale
 * quando nada escapa do recipiente, e só então.
 */
export function volumeNoSegundoEstado(
  p1: number,
  v1: number,
  t1: number,
  p2: number,
  t2: number,
): number {
  return (p1 * v1 * t2) / (t1 * p2);
}

export function volumeNoSegundoEstadoComPassos(
  p1: number,
  v1: number,
  celsius1: number,
  p2: number,
  celsius2: number,
): Resolucao<number> {
  const t1 = paraKelvin(celsius1);
  const t2 = paraKelvin(celsius2);
  const resultado = volumeNoSegundoEstado(p1, v1, t1, p2, t2);

  return {
    resultado,
    passos: [
      {
        descricao: 'As duas temperaturas, em kelvin.',
        tex:
          `T_1 = ${Number(t1.toFixed(2))}\\;\\text{K} \\qquad T_2 = ` +
          `${Number(t2.toFixed(2))}\\;\\text{K}`,
        nota: 'Em Celsius, a razão entre as duas seria outra — e a resposta, outra também.',
      },
      {
        descricao: 'A quantidade de gás não mudou, e por isso o nR some dos dois lados.',
        tex: '\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2}',
        nota: 'É a equação dos gases escrita duas vezes, e não uma lei à parte.',
      },
      {
        descricao: 'Isolando o volume final.',
        tex:
          `V_2 = \\frac{${Number(p1.toFixed(4))} \\times ${Number(v1.toFixed(4))} \\times ` +
          `${Number(t2.toFixed(2))}}{${Number(t1.toFixed(2))} \\times ${Number(p2.toFixed(4))}} = ` +
          `${Number(resultado.toFixed(4))}\\;\\text{L}`,
      },
    ],
  };
}

/**
 * Pressões parciais: cada gás empurra como se estivesse sozinho.
 *
 * Num gás ideal as partículas não se enxergam, e por isso a pressão total é a
 * soma das pressões de cada componente. A consequência prática é a fração
 * MOLAR: o que decide a parcela de cada gás é quantas partículas ele traz, não
 * quanto ele pesa. Trocar fração molar por fração em massa é o erro do tópico,
 * e ele é grande sempre que as massas molares diferem muito — hélio e argônio,
 * por exemplo.
 */
export function fracaoMolar(molsDoGas: number, molsTotais: number): number {
  return molsDoGas / molsTotais;
}

export function pressaoParcial(molsDoGas: number, molsTotais: number, total: number): number {
  return fracaoMolar(molsDoGas, molsTotais) * total;
}

export function pressaoParcialComPassos(
  molsDoGas: number,
  molsTotais: number,
  total: number,
  gas: string,
): Resolucao<number> {
  const fracao = fracaoMolar(molsDoGas, molsTotais);
  const resultado = fracao * total;

  return {
    resultado,
    passos: [
      {
        descricao: `A fração molar de ${gas} é a parte dele na contagem total de partículas.`,
        tex:
          `x = \\frac{${Number(molsDoGas.toFixed(4))}}{${Number(molsTotais.toFixed(4))}} = ` +
          `${Number(fracao.toFixed(4))}`,
        nota: 'Em mols, não em gramas: o que empurra a parede é partícula, não massa.',
      },
      {
        descricao: 'Cada gás contribui com essa fração da pressão total.',
        tex:
          `P_{${gas}} = ${Number(fracao.toFixed(4))} \\times ${Number(total.toFixed(4))} = ` +
          `${Number(resultado.toFixed(4))}\\;\\text{atm}`,
        nota: 'Num gás ideal as partículas não se enxergam, e as pressões simplesmente se somam.',
      },
    ],
  };
}

/** A fração em MASSA: existe para ser armadilha da pressão parcial. */
export function fracaoEmMassa(massaDoGas: number, massaTotal: number): number {
  return massaDoGas / massaTotal;
}
