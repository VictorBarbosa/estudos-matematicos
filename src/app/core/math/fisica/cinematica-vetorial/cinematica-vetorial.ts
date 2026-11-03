import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';
import {
  Vetor,
  direcaoGraus,
  modulo,
  produtoEscalar,
  somar,
  subtrair,
  vetorParaTex,
} from '@core/math/algebra/vetores/vetores';

/**
 * Cinemática vetorial.
 *
 * Na cinemática escalar o movimento acontece numa reta e o sinal basta para
 * dizer o sentido. Aqui ele acontece no plano, e três coisas mudam de figura:
 * deslocamento deixa de ser distância percorrida, velocidade passa a ter
 * direção, e acelerar passa a incluir mudar de direção sem mudar de rapidez.
 *
 * O caso que a engenharia aeroespacial usa todo dia é a velocidade relativa:
 * um avião não voa em relação ao solo, voa em relação ao ar — e o vento entra
 * na conta como uma soma de vetores, não de números.
 */

/** Deslocamento, velocidade média e distância percorrida, lado a lado. */
export function deslocamentoVetorialComPassos(
  inicio: Vetor,
  fim: Vetor,
  tempo: number,
): Resolucao<number> {
  const deslocamento = subtrair(fim, inicio);
  const resultado = modulo(deslocamento) / tempo;

  const passos: Passo[] = [
    {
      descricao: 'O deslocamento é a diferença entre as posições, componente a componente.',
      tex: `\\Delta\\vec{r} = ${vetorParaTex(fim)} - ${vetorParaTex(inicio)} = ${vetorParaTex(deslocamento)}`,
      nota: 'Ele não depende do caminho: só de onde se começou e onde se terminou.',
    },
    {
      descricao: 'O módulo do deslocamento é a distância em linha reta.',
      tex: `\\left|\\Delta\\vec{r}\\right| = ${formatar(Number(modulo(deslocamento).toFixed(4)))}\\ \\text{m}`,
    },
    {
      descricao: `Dividindo pelo tempo de ${formatarEmTexto(tempo)} segundos.`,
      tex:
        `\\left|\\vec{v}_{m}\\right| = \\frac{${formatar(Number(modulo(deslocamento).toFixed(4)))}}{${formatar(tempo)}} = ` +
        `${formatar(Number(resultado.toFixed(4)))}\\ \\text{m/s}`,
      nota: 'Velocidade média vetorial usa o deslocamento, nunca a distância percorrida.',
    },
  ];

  return { resultado, passos };
}

/**
 * Velocidade relativa: o que o solo vê é o que o veículo faz mais o que o meio
 * faz.
 *
 * É a soma vetorial mais útil da aeronáutica — e a que explica por que uma
 * aeronave apontada para o norte pode estar indo para nordeste.
 */
export function velocidadeRelativaComPassos(
  proprio: Vetor,
  meio: Vetor,
  nomeDoProprio = 'aeronave',
  nomeDoMeio = 'vento',
): Resolucao<number> {
  const resultante = somar(proprio, meio);
  const resultado = modulo(resultante);

  const passos: Passo[] = [
    {
      descricao: `A velocidade em relação ao solo é a ${nomeDoProprio} mais o ${nomeDoMeio}.`,
      tex: `\\vec{v}_{solo} = \\vec{v}_{${nomeDoProprio === 'aeronave' ? 'ar' : 'pr'}} + \\vec{v}_{${nomeDoMeio}}`,
      nota: 'Somar vetores é somar componente a componente, nunca módulo com módulo.',
    },
    {
      descricao: 'Somando as componentes.',
      tex: `${vetorParaTex(proprio)} + ${vetorParaTex(meio)} = ${vetorParaTex(resultante)}`,
    },
    {
      descricao: 'O módulo da resultante é a rapidez em relação ao solo.',
      tex:
        `\\left|\\vec{v}_{solo}\\right| = \\sqrt{${formatar(resultante.x)}^{2} + ${formatar(resultante.y)}^{2}} = ` +
        `${formatar(Number(resultado.toFixed(4)))}\\ \\text{m/s}`,
      nota: `A direção efetiva é de ${formatarEmTexto(Number(direcaoGraus(resultante).toFixed(1)))} graus, e não a que o nariz aponta.`,
    },
  ];

  return { resultado, passos };
}

/**
 * Travessia de rio apontando direto para a outra margem.
 *
 * O tempo depende só da componente perpendicular — o que o rio faz é arrastar
 * rio abaixo, sem atrasar nem adiantar a travessia.
 */
export function travessiaDeRioComPassos(
  velocidadeDoBarco: number,
  velocidadeDoRio: number,
  largura: number,
): Resolucao<number> {
  const tempo = largura / velocidadeDoBarco;
  const resultado = velocidadeDoRio * tempo;

  const passos: Passo[] = [
    {
      descricao: 'As duas velocidades são perpendiculares, então uma não interfere na outra.',
      tex: `\\vec{v}_{barco} = (0,\\; ${formatar(velocidadeDoBarco)}) \\qquad \\vec{v}_{rio} = (${formatar(velocidadeDoRio)},\\; 0)`,
    },
    {
      descricao: 'O tempo de travessia sai só da componente que atravessa.',
      tex:
        `t = \\frac{d}{v_{barco}} = \\frac{${formatar(largura)}}{${formatar(velocidadeDoBarco)}} = ` +
        `${formatar(Number(tempo.toFixed(4)))}\\ \\text{s}`,
      nota: 'O rio não atrasa nem adianta a travessia: ele age numa direção que não é a dela.',
    },
    {
      descricao: 'Nesse tempo, a correnteza arrasta o barco rio abaixo.',
      tex:
        `\\Delta x = v_{rio}t = ${formatar(velocidadeDoRio)} \\cdot ${formatar(Number(tempo.toFixed(4)))} = ` +
        `${formatar(Number(resultado.toFixed(4)))}\\ \\text{m}`,
    },
  ];

  return { resultado, passos };
}

/**
 * O ângulo que compensa a correnteza, para chegar exatamente em frente.
 *
 * Só existe quando o barco é mais rápido que o rio — e essa condição é metade
 * do que o exercício ensina.
 */
export function anguloDeCompensacaoComPassos(
  velocidadeDoBarco: number,
  velocidadeDoRio: number,
): Resolucao<number> {
  const razao = velocidadeDoRio / velocidadeDoBarco;
  const resultado = (Math.asin(Math.min(1, razao)) * 180) / Math.PI;

  const passos: Passo[] = [
    {
      descricao: 'Para a resultante ficar perpendicular, a componente rio acima deve anular a correnteza.',
      tex: `v_{barco}\\operatorname{sen}\\theta = v_{rio}`,
    },
    {
      descricao: 'Isolando o seno do ângulo.',
      tex:
        `\\operatorname{sen}\\theta = \\frac{${formatar(velocidadeDoRio)}}{${formatar(velocidadeDoBarco)}} = ` +
        `${formatar(Number(razao.toFixed(4)))}`,
      nota:
        razao > 1
          ? 'Razão acima de 1 não tem solução: o barco é mais lento que o rio e não há como compensar.'
          : 'A razão precisa caber entre 0 e 1 para que exista ângulo.',
    },
    {
      descricao: 'E tomando o arco-seno.',
      tex: `\\theta = ${formatar(Number(resultado.toFixed(2)))}^\\circ`,
      nota: 'O barco aponta rio acima nesse ângulo, e a resultante sai perpendicular à margem.',
    },
  ];

  return { resultado, passos };
}

/**
 * As duas caras da aceleração: tangencial muda a rapidez, normal muda a direção.
 *
 * É a decomposição que explica a frase mais contraintuitiva do assunto: num
 * movimento circular uniforme há aceleração, e ela é toda normal.
 */
export function componentesDaAceleracaoComPassos(
  velocidade: Vetor,
  aceleracao: Vetor,
): Resolucao<number> {
  const rapidez = modulo(velocidade);
  const resultado = produtoEscalar(velocidade, aceleracao) / rapidez;
  const normal = Math.sqrt(Math.max(0, modulo(aceleracao) ** 2 - resultado ** 2));

  const passos: Passo[] = [
    {
      descricao: 'A componente tangencial é a projeção da aceleração sobre a velocidade.',
      tex: `a_{t} = \\frac{\\vec{a} \\cdot \\vec{v}}{\\left|\\vec{v}\\right|}`,
      nota: 'É ela, e só ela, que muda o módulo da velocidade.',
    },
    {
      descricao: 'Calculando o produto escalar e o módulo da velocidade.',
      tex:
        `\\vec{a} \\cdot \\vec{v} = ${formatar(produtoEscalar(velocidade, aceleracao))} \\qquad ` +
        `\\left|\\vec{v}\\right| = ${formatar(Number(rapidez.toFixed(4)))}`,
    },
    {
      descricao: 'A componente tangencial é o quociente.',
      tex: `a_{t} = ${formatar(Number(resultado.toFixed(4)))}\\ \\text{m/s}^{2}`,
      nota:
        Math.abs(resultado) < 1e-9
          ? 'Tangencial nula: a rapidez não muda, só a direção.'
          : resultado > 0
            ? 'Tangencial positiva: o movimento está acelerando.'
            : 'Tangencial negativa: o movimento está freando.',
    },
    {
      descricao: 'O que sobra do módulo total é a componente normal, que curva a trajetória.',
      tex:
        `a_{n} = \\sqrt{\\left|\\vec{a}\\right|^{2} - a_{t}^{2}} = ${formatar(Number(normal.toFixed(4)))}\\ \\text{m/s}^{2}`,
    },
  ];

  return { resultado, passos };
}

/** O raio de curvatura da trajetória, a partir da componente normal. */
export function raioDeCurvaturaComPassos(
  velocidade: Vetor,
  aceleracao: Vetor,
): Resolucao<number> {
  const rapidez = modulo(velocidade);
  const tangencial = produtoEscalar(velocidade, aceleracao) / rapidez;
  const normal = Math.sqrt(Math.max(0, modulo(aceleracao) ** 2 - tangencial ** 2));
  const resultado = normal === 0 ? Number.POSITIVE_INFINITY : (rapidez * rapidez) / normal;

  const passos: Passo[] = [
    {
      descricao: 'A componente normal da aceleração é a que curva a trajetória.',
      tex: `a_{n} = ${formatar(Number(normal.toFixed(4)))}\\ \\text{m/s}^{2}`,
    },
    {
      descricao: 'E ela se relaciona com o raio da curva como no movimento circular.',
      tex: 'a_{n} = \\frac{v^{2}}{R}',
      nota: 'Localmente, qualquer curva se parece com um arco de círculo.',
    },
    {
      descricao: 'Isolando o raio.',
      tex:
        `R = \\frac{${formatar(Number((rapidez * rapidez).toFixed(4)))}}{${formatar(Number(normal.toFixed(4)))}} = ` +
        `${Number.isFinite(resultado) ? formatar(Number(resultado.toFixed(4))) : '\\infty'}\\ \\text{m}`,
      nota: Number.isFinite(resultado)
        ? 'Raio pequeno é curva fechada; raio grande é curva suave.'
        : 'Sem componente normal a trajetória é reta, e o raio é infinito.',
    },
  ];

  return { resultado, passos };
}
