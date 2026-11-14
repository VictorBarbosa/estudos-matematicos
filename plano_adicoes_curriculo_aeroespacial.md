# Plano de adições ao currículo — Preparação para Engenharia Aeroespacial

**Tipo de documento:** especificação de conteúdo e implementação para outro LLM ou agente de programação  
**Idioma do conteúdo:** português  
**Fonte de referência:** `aulas.md`, fornecido pelo usuário  
**Escopo:** ampliar o currículo preparatório sem modificar ou prejudicar a trilha existente

---

## 1. Objetivo

Este documento transforma a análise do arquivo `aulas.md` em uma proposta concreta de adições ao site de estudos matemáticos.

O objetivo é fortalecer a preparação matemática e física para uma futura graduação em Engenharia Aeroespacial. As adições devem complementar a formação existente, sem tentar reproduzir uma graduação completa e sem alterar a sequência que já funciona.

O currículo de referência contém **118 aulas, distribuídas em 16 áreas e 10 faixas**, desde matemática básica até cálculo multivariável e equações diferenciais.

## 2. Instruções obrigatórias de preservação

As regras abaixo têm prioridade sobre qualquer decisão de implementação:

1. **Não excluir nenhuma das 118 aulas existentes.**
2. **Não alterar a ordem das aulas existentes.**
3. **Não renumerar as aulas existentes.**
4. **Não substituir aulas existentes por aulas novas.**
5. **Não tornar os módulos complementares pré-requisitos obrigatórios para concluir a trilha principal.**
6. Criar uma camada separada de conteúdo, com um nome como **“Complementos para Engenharia Aeroespacial”**.
7. Identificar claramente os pré-requisitos, o nível e a posição recomendada de cada aula nova.
8. Preservar identificadores, rotas, progresso do usuário, configurações e estado das aulas existentes.
9. Antes de publicar, validar a contagem da trilha, a barra lateral, a navegação e a persistência do progresso.

### Orientação técnica importante

O arquivo original informa que `src/app/curriculo/curriculo.ts` é a fonte única da ordem da trilha principal. Portanto, a implementação mais segura é cadastrar os novos módulos em uma estrutura de dados separada, sem inserir aulas novas no array principal e sem alterar a ordenação atual.

Se a arquitetura do projeto exigir integração com estruturas existentes, preservar a separação lógica: a trilha principal continua independente dos complementos. Não fazer refatorações amplas como parte desta tarefa.

## 3. Aulas existentes que devem ser reativadas

No plano pessoal do usuário, recomenda-se reativar estas quatro aulas que aparecem como desabilitadas no documento de referência:

| Aula existente | Ação recomendada | Justificativa |
|---|---|---|
| Fatoração | **Reativar** | É usada em manipulação algébrica, funções racionais e técnicas de integração. |
| Inequações | **Reativar** | Ajuda a trabalhar intervalos, domínios e condições matemáticas. |
| Estudo de sinal | **Reativar** | É útil para analisar funções, raízes, intervalos e otimização. |
| Sistemas lineares | **Reativar** | Prepara para matrizes, álgebra linear e modelagem de sistemas. |

### Aulas que podem continuar fora da trilha prioritária

| Aula existente | Recomendação |
|---|---|
| MMC e MDC | Pode continuar desabilitada na trilha pessoal, se essa for a preferência do usuário. Não excluir do currículo completo. |
| Círculo e polígonos | Pode continuar desabilitada na trilha pessoal, se essa for a preferência do usuário. Não excluir do currículo completo. |

**Importante:** desabilitar uma aula no plano pessoal não significa apagá-la do currículo ou do código.

---

## 4. Módulo complementar A — Álgebra Linear

**Prioridade:** alta  
**Posição sugerida:** depois da Faixa 4 — Vetores, matrizes e coordenadas  
**Tipo:** complemento matemático

### Justificativa

O site já apresenta vetores, matrizes, determinantes, escalonamento e matriz inversa. O novo módulo deve aprofundar esses fundamentos, sem repetir as aulas existentes.

### Aulas propostas

| Nova aula | Conteúdo a abordar | Aplicação possível |
|---|---|---|
| Espaços vetoriais | Subespaços, combinações lineares, conjunto gerador, base e dimensão. | Organização matemática de estados, forças e grandezas. |
| Transformações lineares | Núcleo, imagem, posto e mudança de coordenadas. | Transformações entre referenciais e representação de sistemas. |
| Autovalores e autovetores | Cálculo e interpretação geométrica de autovalores e autovetores. | Estabilidade, vibrações e dinâmica de sistemas. |
| Diagonalização | Matrizes diagonalizáveis e interpretação de sistemas em uma base adequada. | Simplificação de modelos dinâmicos e análise de modos. |
| Ortogonalidade e mínimos quadrados | Vetores ortogonais, projeções, bases ortogonais e ajuste por mínimos quadrados. | Análise de dados, aproximações e métodos computacionais. |

### Pré-requisitos

- Aulas atuais de vetores e matrizes.
- Vetores no plano e no espaço.
- Operações com matrizes e determinantes.
- Escalonamento de sistemas lineares.

### Diretriz de implementação

Criar uma área própria de Álgebra Linear. Não duplicar as aulas existentes sobre matrizes, determinantes, escalonamento ou vetores. O módulo novo deve começar a partir desses conhecimentos.

---

## 5. Módulo complementar B — Matemática Aplicada Avançada

**Prioridade:** alta a média  
**Posição sugerida:** depois do Cálculo 4  
**Tipo:** complemento matemático avançado

### Justificativa

O currículo já inclui cálculo diferencial e integral, cálculo multivariável e equações diferenciais ordinárias (EDOs). As adições ampliam esse conjunto para problemas com grandezas acopladas, sinais e campos físicos.

### Aulas propostas

| Nova aula | Conteúdo a abordar | Pré-requisito principal |
|---|---|---|
| Sistemas de equações diferenciais | Sistemas acoplados de EDOs e introdução à solução por métodos matriciais. | EDOs de primeira e segunda ordem; álgebra linear. |
| Transformada de Laplace | Transformada, transformada inversa e aplicação à solução de EDOs. | Integrais e EDOs. |
| Séries de Fourier | Representação periódica por senos e cossenos e interpretação dos coeficientes. | Trigonometria e integração. |
| Introdução às equações diferenciais parciais (EDPs) | Noções de EDPs e exemplos relacionados a calor, ondas e fluidos. | Cálculo multivariável e integral; familiaridade com EDOs. |

### Ordem didática recomendada

1. Séries de Fourier podem ser estudadas depois de trigonometria e integração.
2. Sistemas de EDOs e Transformada de Laplace devem ser estudados depois de Cálculo 4 e Álgebra Linear.
3. Introdução às EDPs deve ficar por último, como tópico avançado.

### Restrições

- Não exigir esses tópicos para concluir a trilha principal.
- Não exigir esses tópicos como condição para considerar o usuário preparado para iniciar a graduação.
- Identificar claramente as EDPs como conteúdo avançado e introdutório nesta etapa.

---

## 6. Módulo complementar C — Mecânica dos Materiais e Estruturas

**Prioridade:** média  
**Posição sugerida:** após Física clássica, com cálculo como apoio  
**Tipo:** fundamentos de engenharia

### Justificativa

O currículo já contém leis de Newton, trabalho e energia, estática, torque e dinâmica rotacional. Falta uma introdução organizada à resposta dos materiais quando submetidos a cargas.

### Aulas propostas

| Nova aula | Conteúdo a abordar |
|---|---|
| Tensão e deformação | Tensão normal e de cisalhamento; deformação; interpretação física das grandezas. |
| Lei de Hooke e módulo de elasticidade | Regime elástico, relação tensão-deformação e módulo de Young. |
| Coeficiente de Poisson | Deformação transversal e longitudinal e comportamento elástico básico. |
| Flexão | Momento fletor, tensão de flexão e deformação de vigas em nível introdutório. |
| Torção | Torque aplicado, tensão de cisalhamento e deformação angular em eixos. |
| Flambagem | Instabilidade de elementos comprimidos e introdução à carga crítica. |
| Fadiga e falha de materiais | Cargas cíclicas, vida em fadiga e modos gerais de falha. |
| Introdução aos materiais compósitos | Matriz, reforço, propriedades direcionais e aplicações aeroespaciais. |

### Conexão aeroespacial

Este módulo prepara a compreensão de asas, fuselagens, estruturas, suportes, componentes de veículos espaciais e seleção preliminar de materiais.

### Limite de profundidade

Manter o módulo em nível introdutório. Dimensionamento estrutural avançado, análise estrutural especializada e projeto de componentes devem permanecer para etapas posteriores da formação universitária.

---

## 7. Módulo complementar D — Mecânica dos Fluidos e Aerodinâmica

**Prioridade:** média  
**Posição sugerida:** depois da aula atual “Fluidos e aerodinâmica”  
**Tipo:** fundamentos de engenharia

### Justificativa

A aula atual apresenta pressão, empuxo, Bernoulli e sustentação. O complemento deve ampliar gradualmente a descrição do escoamento, começando pelas propriedades dos fluidos e avançando até escoamentos compressíveis.

### Aulas propostas

| Nova aula | Conteúdo a abordar |
|---|---|
| Viscosidade | Viscosidade dinâmica e cinemática; diferença entre comportamento idealizado e real. |
| Equação da continuidade | Conservação de massa e relação entre área e velocidade em escoamentos simples. |
| Número de Reynolds | Significado físico e relação com regimes de escoamento. |
| Camada limite | Conceito, desenvolvimento próximo à superfície e separação em nível introdutório. |
| Introdução às equações de Navier–Stokes | Significado dos termos e interpretação física; sem exigir solução avançada. |
| Escoamento compressível | Densidade variável, velocidade do som e noções de escoamentos compressíveis. |
| Número de Mach e ondas de choque | Regimes subsônico, transônico e supersônico; noções de ondas de choque. |

### Sequência didática recomendada

Viscosidade → Equação da continuidade → Número de Reynolds → Camada limite → Introdução a Navier–Stokes → Escoamento compressível → Número de Mach e ondas de choque.

### Limite de profundidade

Os últimos tópicos devem ser identificados como avançados. A introdução a Navier–Stokes deve explicar o significado físico e os termos da equação, sem exigir que o aluno resolva problemas avançados de dinâmica dos fluidos.

---

## 8. Módulo complementar E — Sistemas de Controle

**Prioridade:** média  
**Posição sugerida:** depois de Álgebra Linear e Matemática Aplicada Avançada  
**Tipo:** fundamentos de engenharia

### Justificativa

O site já apresenta movimento, aceleração, oscilações e equações diferenciais. O novo módulo conecta a modelagem matemática ao comportamento de sistemas que precisam medir, corrigir e manter uma resposta desejada.

### Aulas propostas

| Nova aula | Conteúdo a abordar |
|---|---|
| Malha aberta e malha fechada | Diferença entre sistemas sem realimentação e sistemas com realimentação. |
| Realimentação (feedback) | Referência, erro, sensor, controlador, atuador e processo em um diagrama funcional. |
| Funções de transferência | Relação entrada-saída no domínio de Laplace e interpretação introdutória de polos e zeros. |
| Estabilidade | Resposta transitória, regime permanente e noções de estabilidade de sistemas. |
| Controladores PID | Ações proporcional, integral e derivativa e efeito qualitativo de cada parcela. |
| Espaço de estados | Variáveis de estado, representação matricial e relação com sistemas de EDOs. |

### Pré-requisitos

- Equações diferenciais.
- Álgebra linear.
- Transformada de Laplace.

### Limite de profundidade

O módulo deve ser uma introdução conceitual e matemática. Não deve se transformar em um curso de implementação de controle de voo, nem incluir instruções de construção ou operação de sistemas propulsivos ou veículos.

---

## 9. Ordem de implementação recomendada

| Etapa | O que fazer | Condição para avançar |
|---|---|---|
| 1 — Correções seguras | Reativar Fatoração, Inequações, Estudo de sinal e Sistemas lineares no plano pessoal. | Confirmar que a trilha continua correta e que o progresso foi preservado. |
| 2 — Base matemática | Criar o módulo de Álgebra Linear. | Usar as aulas atuais de vetores e matrizes como pré-requisitos. |
| 3 — Matemática aplicada | Criar Sistemas de EDOs, Transformada de Laplace, Séries de Fourier e Introdução às EDPs. | Manter o conteúdo avançado separado da trilha principal. |
| 4 — Engenharia aplicada | Criar os módulos de Mecânica dos Materiais e Estruturas e de Mecânica dos Fluidos e Aerodinâmica. | Declarar pré-requisitos e nível introdutório ou avançado. |
| 5 — Sistemas | Criar o módulo de Sistemas de Controle. | Disponibilizar depois de Álgebra Linear e Matemática Aplicada Avançada. |

A ordem acima é uma ordem de implementação sugerida, não uma obrigação de tornar todos os módulos pré-requisitos uns dos outros. Os pré-requisitos de cada aula devem ser respeitados individualmente.

---

## 10. Conteúdos que não devem ser adicionados nesta fase

Nesta fase, não criar módulos extensos de:

- Mecânica quântica avançada.
- Relatividade geral.
- Combustão avançada.
- Projeto completo de motores ou foguetes.
- Projeto estrutural aeroespacial avançado.

Esses temas não são irrelevantes; apenas não são necessários para a próxima expansão do currículo preparatório.

**Manter a aula atual “Propulsão de foguetes”.** Um aprofundamento especializado pode ser avaliado em outra etapa, depois de consolidada a base matemática, física e de engenharia.

---

## 11. Química: preparação separada por enquanto

Química pode ser importante para determinados caminhos de admissão e para estudos posteriores de materiais e propulsão.

Como os requisitos de admissão variam conforme a formação anterior e a rota de candidatura, manter a preparação de Química separada por enquanto. Antes de criar uma área obrigatória no site, conferir os requisitos oficiais aplicáveis ao histórico acadêmico do usuário.

Não presumir que uma única lista de disciplinas de Química seja obrigatória para todos os candidatos.

---

## 12. Checklist de validação antes de publicar

### Integridade da trilha principal

- [ ] As 118 aulas originais continuam presentes.
- [ ] As 10 faixas originais continuam presentes.
- [ ] A ordem das aulas originais não foi alterada.
- [ ] A numeração das aulas originais não foi alterada.
- [ ] Nenhuma aula original foi substituída ou removida.
- [ ] A contagem da trilha principal continua correta.

### Separação dos complementos

- [ ] Os novos conteúdos aparecem em uma área separada de complementos.
- [ ] Os módulos complementares não são pré-requisitos obrigatórios da trilha principal.
- [ ] Cada aula nova declara pré-requisitos.
- [ ] Cada aula nova declara seu nível (introdutório, intermediário ou avançado).
- [ ] Não há duplicação desnecessária de aulas existentes.

### Integridade técnica e experiência do usuário

- [ ] Identificadores e rotas existentes foram preservados.
- [ ] O progresso das aulas existentes foi preservado.
- [ ] As configurações pessoais de aulas habilitadas/desabilitadas foram preservadas.
- [ ] A barra lateral continua mostrando a trilha principal corretamente.
- [ ] A navegação dos módulos complementares funciona sem interferir na trilha principal.
- [ ] A aplicação foi testada antes da publicação.

---

## 13. Resultado esperado

O resultado desejado é:

1. Um currículo principal estável, com as 118 aulas originais preservadas.
2. Uma segunda camada de aprofundamento em matemática e fundamentos de engenharia.
3. Complementos claramente identificados, com pré-requisitos e nível de dificuldade.
4. Uma preparação mais direcionada à Engenharia Aeroespacial, sem transformar o site em uma graduação antecipada.

## 14. Instrução final para o LLM que implementar este plano

Antes de modificar o código, inspecione a estrutura atual do projeto e localize a definição da trilha principal, especialmente `src/app/curriculo/curriculo.ts`.

Implemente somente as adições descritas neste documento e as quatro reativações indicadas para o plano pessoal. Preserve a trilha principal e seus dados. Não invente novas aulas, não remova conteúdo existente, não renumere etapas e não faça refatorações não solicitadas.

Se a implementação exigir uma decisão que possa alterar a ordem, a contagem, os identificadores, as rotas ou o progresso da trilha principal, **não faça essa alteração automaticamente**. Mantenha a estrutura atual e registre a limitação para decisão do usuário.

Ao terminar, apresente um resumo verificável das alterações, indicando os arquivos modificados, os novos módulos adicionados e os testes realizados. Confirme explicitamente que as 118 aulas originais e sua ordem foram preservadas.

---

**Nota de escopo:** este documento é uma proposta de organização curricular baseada no arquivo `aulas.md` e nas recomendações de preparação discutidas. Não substitui os requisitos oficiais de admissão nem o plano de estudos atualizado da universidade.
