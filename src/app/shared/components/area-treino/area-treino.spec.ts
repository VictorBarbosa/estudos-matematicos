import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Fracao, observarSimplificacao, resolverComPassos } from '@core/math';
import {
  ACERTOS_NA_JANELA,
  ACERTOS_PARA_SUBIR,
  ACERTOS_POR_TIPO,
  ACERTOS_SEGUIDOS_FINAIS,
  ERROS_PARA_DESCER,
  REQUISITOS_POR_TOPICO,
  RESPOSTAS_NA_JANELA,
  TRILHA,
} from '@core/progressao/models/progressao.model';
import { ExercicioEmFocoService } from '@core/exercicio/services/exercicio-em-foco.service';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { Exercicio, GeradorExercicio, Nivel } from '@core/treino/models/treino.model';
import { AreaTreino } from '@shared/components/area-treino/area-treino';

/**
 * Gerador determinístico: sempre 1/4 + 1/6, cujo resultado é 5/12.
 *
 * Usar um gerador fixo aqui testa a mecânica da área de treino — corrigir,
 * pontuar, diagnosticar, avançar — sem depender do sorteio real.
 */
const resolucao = resolverComPassos(Fracao.criar(1, 4), 'somar', Fracao.criar(1, 6));

const exercicioFixo: Exercicio<Fracao> = {
  id: 'teste-1',
  nivel: 'facil',
  enunciado: 'Calcule e escreva o resultado na forma mais simples.',
  enunciadoTex: '\\frac{1}{4} + \\frac{1}{6} = \\;?',
  gabarito: resolucao.resultado,
  resolucao,
  conceitos: ['fracoes.mmc'],
  armadilhas: [
    {
      resposta: Fracao.criar(2, 10),
      diagnostico: 'Você somou numeradores com numeradores e denominadores com denominadores.',
      passo: 3,
      conceito: 'fracoes.operacoes',
    },
  ],
};

const geradorFixo: GeradorExercicio<Fracao> = {
  topicoId: 'fracoes-teste',
  formatoResposta: 'ex.: 3/4',
  gerar: (_nivel: Nivel) => exercicioFixo,
  analisar: (entrada) => Fracao.analisar(entrada),
  saoEquivalentes: (a, b) => a.igualA(b),
  formatar: (valor) => valor.toString(),
  observarResposta: observarSimplificacao,
};

describe('AreaTreino', () => {
  let fixture: ComponentFixture<AreaTreino>;

  /** Digita no campo de resposta e dispara o evento de input. */
  async function responder(texto: string): Promise<void> {
    const campo = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    campo.value = texto;
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const botao = [...fixture.nativeElement.querySelectorAll('button')].find(
      (b: HTMLButtonElement) => b.textContent?.trim() === 'Verificar',
    ) as HTMLButtonElement;
    botao.click();
    await fixture.whenStable();
  }

  function texto(): string {
    return fixture.nativeElement.textContent as string;
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AreaTreino],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AreaTreino);
    fixture.componentRef.setInput('gerador', geradorFixo);
    await fixture.whenStable();
  });

  it('mostra o enunciado e o placar zerado', () => {
    expect(texto()).toContain('Calcule e escreva o resultado');
    expect(texto()).toContain('Acertos');
    expect(texto()).toContain('Sequência');
  });

  it('aceita a resposta correta', async () => {
    await responder('5/12');

    expect(texto()).toContain('Correto!');
    expect(texto()).toContain('Próximo exercício');
  });

  it('o acerto também mostra como o cálculo foi feito', async () => {
    // A resolução não é só consolo de quem errou: quem acertou confere o
    // caminho, e quem chegou ao número por volta vê o curto.
    await responder('5/12');

    expect(texto()).toContain('Como se resolve');
  });

  it('a resolução só aparece depois de verificar', async () => {
    expect(texto()).not.toContain('Como se resolve');
  });

  it('o próximo exercício volta a esconder a resolução', async () => {
    await responder('5/12');
    expect(texto()).toContain('Como se resolve');

    const proximo = [...fixture.nativeElement.querySelectorAll('button')].find(
      (b: HTMLButtonElement) => b.textContent?.trim().startsWith('Próximo'),
    ) as HTMLButtonElement;
    proximo.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(texto()).not.toContain('Como se resolve');
  });

  it('aceita a fração ampliada e aponta a forma menor', async () => {
    // 10/24 é o mesmo número que 5/12: conta como acerto, e o site diz que dá
    // para escrever menor em vez de deixar o aluno achar que errou a forma.
    await responder('10/24');

    expect(texto()).toContain('Correto!');
    expect(texto()).toContain('Aceita');
    expect(texto()).toContain('5/12');
  });

  it('a resposta já irredutível não ganha recado', async () => {
    await responder('5/12');

    expect(texto()).toContain('Correto!');
    expect(texto()).not.toContain('Aceita —');
  });

  it('aceita uma forma equivalente da resposta', async () => {
    await responder('10/24');
    expect(texto()).toContain('Correto!');
  });

  it('diagnostica o erro previsto em vez de só mostrar o gabarito', async () => {
    await responder('2/10');

    expect(texto()).toContain('numeradores com numeradores');
    expect(texto()).toContain('Resposta correta:');
    // Ao errar, a resolução comentada aparece sozinha.
    expect(texto()).toContain('Como se resolve');
  });

  it('informa o gabarito quando o erro não é um dos previstos', async () => {
    await responder('7/9');

    expect(texto()).toContain('Resposta correta:');
    expect(texto()).not.toContain('numeradores com numeradores');
  });

  it('não conta como erro uma resposta que não dá para ler', async () => {
    await responder('qualquer coisa');

    expect(texto()).toContain('Não consegui ler essa resposta');
    // Segue aberto para nova tentativa.
    expect(texto()).toContain('Verificar');
  });

  it('avança para o próximo exercício e limpa a resposta', async () => {
    await responder('5/12');

    const proximo = [...fixture.nativeElement.querySelectorAll('button')].find(
      (b: HTMLButtonElement) => b.textContent?.trim() === 'Próximo exercício',
    ) as HTMLButtonElement;
    proximo.click();
    await fixture.whenStable();

    const campo = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(campo.value).toBe('');
    expect(texto()).toContain('Verificar');
    expect(texto()).not.toContain('Correto!');
  });

  /** O nível mostrado agora, que não se escolhe. */
  function nivelMostrado(): string {
    return fixture.nativeElement.querySelector('.nivel-atual').textContent.trim() as string;
  }

  /** O `feitos/alvo` da exigência cujo rótulo contém o trecho dado. */
  function contadorDe(rotulo: string): string | undefined {
    const item = [...fixture.nativeElement.querySelectorAll('.requisitos li')].find(
      (linha: HTMLElement) => linha.textContent?.includes(rotulo),
    ) as HTMLElement | undefined;
    return item?.querySelector('strong')?.textContent?.trim();
  }

  /** O contador de acertos seguidos, que é o que um erro zera. */
  function seguidosMostrados(): string | undefined {
    return contadorDe('acertos seguidos agora');
  }

  /** Responde certo e passa ao próximo, quantas vezes for pedido. */
  async function acertar(vezes: number): Promise<void> {
    for (let i = 0; i < vezes; i++) {
      await responder('5/12');
      const proximo = [...fixture.nativeElement.querySelectorAll('button')].find(
        (botao: HTMLButtonElement) => botao.textContent?.trim() === 'Próximo exercício',
      ) as HTMLButtonElement;
      proximo.click();
      await fixture.whenStable();
    }
  }

  it('começa no fácil e não oferece escolha de nível', () => {
    expect(nivelMostrado()).toBe('Fácil');
    expect(fixture.nativeElement.querySelectorAll('.nivel').length).toBe(0);
  });

  it('sobe de nível depois de acertos seguidos', async () => {
    const naTrilha: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: TRILHA[0]!.topicoId };
    fixture.componentRef.setInput('gerador', naTrilha);
    await fixture.whenStable();

    await acertar(ACERTOS_PARA_SUBIR);
    expect(nivelMostrado()).toBe('Médio');

    await acertar(ACERTOS_PARA_SUBIR);
    expect(nivelMostrado()).toBe('Difícil');
  });

  it('desce de nível depois de erros seguidos', async () => {
    const naTrilha: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: TRILHA[0]!.topicoId };
    fixture.componentRef.setInput('gerador', naTrilha);
    await fixture.whenStable();

    await acertar(ACERTOS_PARA_SUBIR);
    expect(nivelMostrado()).toBe('Médio');

    for (let i = 0; i < ERROS_PARA_DESCER; i++) {
      await responder('1/2');
      const proximo = [...fixture.nativeElement.querySelectorAll('button')].find(
        (botao: HTMLButtonElement) => botao.textContent?.trim() === 'Próximo exercício',
      ) as HTMLButtonElement;
      proximo.click();
      await fixture.whenStable();
    }

    expect(nivelMostrado()).toBe('Fácil');
  });

  it('diz quanto falta para o próximo degrau', async () => {
    const naTrilha: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: TRILHA[0]!.topicoId };
    fixture.componentRef.setInput('gerador', naTrilha);
    await fixture.whenStable();

    expect(texto()).toContain(`${ACERTOS_PARA_SUBIR} acerto(s) seguido(s) para subir`);

    await acertar(1);
    expect(texto()).toContain(`${ACERTOS_PARA_SUBIR - 1} acerto(s) seguido(s) para subir`);
  });

  it('lista as quatro condições para a etapa abrir', async () => {
    await responder('5/12');

    expect(texto()).toContain('Para abrir a próxima etapa');
    expect(texto()).toContain('exercícios respondidos');
    expect(texto()).toContain('acertos entre eles');
    expect(texto()).toContain('acertos no Médio ou no Difícil');
    expect(texto()).toContain('acertos seguidos agora');
  });

  it('avisa qual das condições um erro zera', async () => {
    await responder('5/12');

    expect(texto()).toContain('zera a cada erro');
  });

  it('o erro zera a contagem de acertos seguidos na lista', async () => {
    // O critério sempre foi este; o que faltava era a tela dizer. Quem errava o
    // último exercício via a etapa continuar fechada sem explicação nenhuma.
    const naTrilha: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: TRILHA[0]!.topicoId };
    fixture.componentRef.setInput('gerador', naTrilha);
    await fixture.whenStable();

    await acertar(2);
    expect(seguidosMostrados()).toBe(`2/${ACERTOS_SEGUIDOS_FINAIS}`);

    await responder('1/2');
    expect(seguidosMostrados()).toBe(`0/${ACERTOS_SEGUIDOS_FINAIS}`);
  });

  it('os acertos da janela não são zerados pelo erro', async () => {
    const naTrilha: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: TRILHA[0]!.topicoId };
    fixture.componentRef.setInput('gerador', naTrilha);
    await fixture.whenStable();

    await acertar(2);
    await responder('1/2');

    expect(contadorDe('acertos entre eles')).toBe(`2/${ACERTOS_NA_JANELA}`);
  });

  it('revelar a resolução conta como desistência e tranca o campo', async () => {
    const naTrilha: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: TRILHA[0]!.topicoId };
    fixture.componentRef.setInput('gerador', naTrilha);
    await fixture.whenStable();

    const mostrar = [...fixture.nativeElement.querySelectorAll('button')].find(
      (b: HTMLButtonElement) => b.textContent?.trim() === 'Não sei, mostrar a resolução',
    ) as HTMLButtonElement;
    mostrar.click();
    await fixture.whenStable();

    // O último passo da resolução traz a resposta: sem travar o campo, dava
    // para copiá-la e ganhar o acerto.
    const campo = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(campo.disabled).toBe(true);
    expect(texto()).toContain('conta como não resolvido');
    expect(texto()).toContain('Como se resolve');

    const progresso = TestBed.inject(ProgressoService);
    expect(progresso.estatisticaDe(TRILHA[0]!.topicoId).erros).toBe(1);
    expect(progresso.historicoDe(TRILHA[0]!.topicoId).at(-1)?.desistiu).toBe(true);
  });

  it('celebra o desbloqueio e aponta a próxima etapa', async () => {
    // O gerador fixo precisa pertencer à trilha para que haja o que desbloquear.
    const naTrilha: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: TRILHA[0]!.topicoId };
    fixture.componentRef.setInput('gerador', naTrilha);
    await fixture.whenStable();

    // São 8 acertos nas últimas 10, com 3 no Médio ou no Difícil. Acertando
    // sempre, a escada leva até lá sozinha — o gerador fixo responde igual em
    // qualquer nível.
    await acertar(RESPOSTAS_NA_JANELA);

    expect(texto()).toContain('Etapa vencida!');
    expect(texto()).toContain(TRILHA[1]!.titulo);
  });
});

/**
 * O treino oferece o que falta.
 *
 * Com sorteio uniforme dá para chegar a `soma 9/5` com `subtração com mistos`
 * parada em 3/5: o gerador seguia oferecendo o que já estava cumprido.
 */
describe('AreaTreino e os tipos que faltam', () => {
  let fixture: ComponentFixture<AreaTreino>;
  let progresso: ProgressoService;

  /** Os tipos que o gerador recebeu como pendentes, sorteio a sorteio. */
  const pedidos: (readonly string[])[] = [];

  const geradorEspiao: GeradorExercicio<Fracao> = {
    ...geradorFixo,
    topicoId: 'fracoes',
    gerar: (_nivel: Nivel, _rng, pendentes: readonly string[] = []) => {
      pedidos.push(pendentes);
      return exercicioFixo;
    },
  };

  beforeEach(async () => {
    localStorage.clear();
    pedidos.length = 0;

    await TestBed.configureTestingModule({
      imports: [AreaTreino],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    progresso = TestBed.inject(ProgressoService);
    fixture = TestBed.createComponent(AreaTreino);
  });

  async function montar(): Promise<void> {
    fixture.componentRef.setInput('gerador', geradorEspiao);
    await fixture.whenStable();
  }

  it('o gerador recebe a lista do que ainda falta', async () => {
    await montar();

    expect(pedidos[0]).toContain('fracoes.soma');
    expect(pedidos[0]!.length).toBe(REQUISITOS_POR_TOPICO['fracoes']!.length);
  });

  it('o tipo cumprido deixa de ser pedido', async () => {
    for (let i = 0; i < ACERTOS_POR_TIPO; i++) {
      progresso.registrar({
        topicoId: 'fracoes',
        conceitos: ['fracoes.soma'],
        acertou: true,
        sequencia: i + 1,
        nivel: 'medio',
      });
    }

    await montar();

    expect(pedidos[0]).not.toContain('fracoes.soma');
    expect(pedidos[0]).toContain('fracoes.mista-subtracao');
  });
});

/**
 * O gabarito com mais de uma escrita certa.
 *
 * Em Frações, 28/27 e 1 1/27 são o mesmo número e sempre contaram como acerto.
 * Mas o gabarito exibia só a forma que `formatar` escolhe — quem respondeu
 * 28/27 lia depois "Resposta correta: 1 1/27" e tinha razão em achar que a sua
 * escrita é que estava errada.
 */
describe('AreaTreino com gabarito de duas escritas', () => {
  const resultado = Fracao.criar(28, 27);

  const exercicio: Exercicio<Fracao> = {
    ...exercicioFixo,
    id: 'teste-misto',
    gabarito: resultado,
    resolucao: { resultado, passos: resolucao.passos },
    armadilhas: [],
  };

  const gerador: GeradorExercicio<Fracao> = {
    ...geradorFixo,
    gerar: (_nivel: Nivel) => exercicio,
    formatar: (valor) => valor.toStringMisto(),
    formasEquivalentes: (valor) => [valor.toStringMisto(), valor.simplificar().toString()],
  };

  let fixture: ComponentFixture<AreaTreino>;

  async function responder(texto: string): Promise<void> {
    const campo = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    campo.value = texto;
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const botao = [...fixture.nativeElement.querySelectorAll('button')].find(
      (b) => (b as HTMLButtonElement).textContent?.trim() === 'Verificar',
    ) as HTMLButtonElement;
    botao.click();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

    fixture = TestBed.createComponent(AreaTreino);
    fixture.componentRef.setInput('gerador', gerador);
    await fixture.whenStable();
  });

  function texto(): string {
    return fixture.nativeElement.textContent as string;
  }

  it('aceita a imprópria e a mista como acerto', async () => {
    for (const forma of ['28/27', '1 1/27']) {
      await responder(forma);
      expect(texto(), forma).toContain('Correto!');

      fixture.componentInstance['sessao']().proximo();
      await fixture.whenStable();
    }
  });

  it('mostra as duas escritas ao informar a resposta correta', async () => {
    await responder('5/27');

    expect(texto()).toContain('1 1/27');
    expect(texto()).toContain('28/27');
  });

  it('mostra as duas escritas também quando a resolução é revelada', async () => {
    const botao = [...fixture.nativeElement.querySelectorAll('button')].find((b) =>
      (b as HTMLButtonElement).textContent?.includes('mostrar a resolução'),
    ) as HTMLButtonElement;
    botao.click();
    await fixture.whenStable();

    expect(texto()).toContain('1 1/27');
    expect(texto()).toContain('28/27');
  });
});

/**
 * Quanto falta para a próxima fase, no placar.
 *
 * As treze condições já apareciam, mas no fim da página. O placar fica no
 * topo, onde o olho vai a cada resposta, e contava só a rodada — acertos,
 * erros, sequência. Nada ali dizia quanto falta para liberar a seguinte.
 */
describe('AreaTreino: quanto falta no placar', () => {
  let fixture: ComponentFixture<AreaTreino>;
  let progresso: ProgressoService;

  const emFracoes: GeradorExercicio<Fracao> = { ...geradorFixo, topicoId: 'fracoes' };

  /** O bloco do placar cujo rótulo é "Falta". */
  function bloco(): HTMLElement {
    return [...fixture.nativeElement.querySelectorAll('.placar div')].find(
      (item) => (item as HTMLElement).querySelector('dt')?.textContent?.trim() === 'Falta',
    ) as HTMLElement;
  }

  function quanto(): string {
    return bloco().querySelector('dd')!.textContent!.trim();
  }

  /** Registra acertos num conceito, como se o aluno os tivesse feito. */
  function acertar(conceito: string, vezes: number): void {
    for (let i = 0; i < vezes; i++) {
      progresso.registrar({
        topicoId: 'fracoes',
        conceitos: [conceito],
        acertou: true,
        sequencia: i + 1,
        nivel: 'dificil',
      });
    }
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AreaTreino],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    progresso = TestBed.inject(ProgressoService);
    fixture = TestBed.createComponent(AreaTreino);
  });

  async function montar(): Promise<void> {
    fixture.componentRef.setInput('gerador', emFracoes);
    await fixture.whenStable();
  }

  it('conta as quatro condições e os nove tipos', async () => {
    await montar();

    const total = 4 + REQUISITOS_POR_TOPICO['fracoes']!.length;
    expect(quanto()).toBe(String(total));
  });

  it('acertar faz a conta baixar', async () => {
    acertar('fracoes.soma', ACERTOS_POR_TIPO);
    await montar();

    /*
     * De 13 para 10, e não para 12: os mesmos cinco acertos que cumpriram a
     * soma também cumpriram duas das quatro condições da janela — os três
     * acertos no Difícil e os três seguidos. A conta é do que falta, não do
     * que foi feito.
     */
    expect(quanto()).toBe('10');
    expect(bloco().getAttribute('title')).not.toContain(
      `soma ${ACERTOS_POR_TIPO}/${ACERTOS_POR_TIPO}`,
    );
  });

  it('diz em palavras o que falta', async () => {
    acertar('fracoes.soma', ACERTOS_POR_TIPO);
    await montar();

    const resumo = bloco().getAttribute('title')!;
    expect(resumo).toContain(`subtração com mistos 0/${ACERTOS_POR_TIPO}`);
    expect(resumo).not.toContain(`soma ${ACERTOS_POR_TIPO}/${ACERTOS_POR_TIPO}`);
  });

  it('zera — e fica verde — quando a etapa é vencida', async () => {
    for (const requisito of REQUISITOS_POR_TOPICO['fracoes']!) {
      acertar(requisito.conceito, requisito.acertos);
    }
    for (let i = 0; i < RESPOSTAS_NA_JANELA; i++) {
      progresso.registrar({
        topicoId: 'fracoes',
        conceitos: [],
        acertou: true,
        sequencia: i + 1,
        nivel: 'dificil',
      });
    }
    await montar();

    expect(quanto()).toBe('0');
    expect(bloco().querySelector('dd')!.classList).toContain('certo');
  });
});

/**
 * A área de treino publica a pergunta para fora.
 *
 * No celular o monta monta ocupa a tela toda e cobre o enunciado: foi a
 * primeira coisa que faltou no aparelho de verdade. Esta tela não conhece a
 * gaveta — só diz o que está perguntando. Sem este teste, a publicação poderia
 * sumir num refactor e os testes do rascunho continuariam verdes, porque lá a
 * pergunta é posta à mão.
 */
describe('AreaTreino e a pergunta publicada', () => {
  let fixture: ComponentFixture<AreaTreino>;
  let emFoco: ExercicioEmFocoService;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

    emFoco = TestBed.inject(ExercicioEmFocoService);
    fixture = TestBed.createComponent(AreaTreino);
    // O tópico sai do próprio gerador; o componente recebe só o gerador.
    fixture.componentRef.setInput('gerador', geradorFixo);
    await fixture.whenStable();
  });

  it('publica o enunciado e a fórmula do exercício na tela', () => {
    expect(emFoco.exercicio()).toEqual({
      enunciado: exercicioFixo.enunciado,
      tex: exercicioFixo.enunciadoTex,
    });
  });

  it('para de publicar quando a tela sai', () => {
    fixture.destroy();

    expect(emFoco.exercicio()).toBeNull();
  });
});
