import { Frases } from '@core/treino/textos/texto-trilingue';
import { numeroEscrito } from '@core/treino/textos/numero-escrito';

/**
 * Os enunciados e as dicas do tópico, nas três línguas.
 *
 * As temperaturas vêm em graus Celsius de propósito: é como elas aparecem num
 * problema real, e converter para kelvin é o que o tópico ensina. Dá-las já em
 * kelvin pouparia o aluno do erro que a equação dos gases mais cobra.
 */

export const VOLUME: Frases<[number, number, number]> = {
  pt: (mols, pressao, celsius) =>
    `Que volume ocupam ${numeroEscrito(mols, 'pt')} mol de um gás a ` +
    `${numeroEscrito(pressao, 'pt')} atm e ${numeroEscrito(celsius, 'pt')} °C? ` +
    '(em litros, 2 casas decimais)',
  fr: (mols, pressao, celsius) =>
    `Quel volume occupent ${numeroEscrito(mols, 'fr')} mol d’un gaz à ` +
    `${numeroEscrito(pressao, 'fr')} atm et ${numeroEscrito(celsius, 'fr')} °C ? ` +
    '(en litres, 2 décimales)',
  en: (mols, pressao, celsius) =>
    `What volume do ${numeroEscrito(mols, 'en')} mol of a gas occupy at ` +
    `${numeroEscrito(pressao, 'en')} atm and ${numeroEscrito(celsius, 'en')} °C? ` +
    '(in litres, 2 decimal places)',
};

/**
 * A dica diz a conversão e o porquê dela.
 *
 * «Passe para kelvin» sozinho vira regra decorada; dizer que a equação pede
 * proporção, e que proporção precisa de um zero verdadeiro, é o que faz a
 * conversão parar de ser arbitrária.
 */
export const DICA_KELVIN: Frases<[number, number, number]> = {
  pt: () =>
    'A temperatura entra em kelvin: some 273,15 aos graus Celsius. A equação diz que o volume ' +
    'é proporcional a T, e proporção precisa de uma escala cujo zero seja o zero de verdade.',
  fr: () =>
    'La température s’exprime en kelvins : ajoutez 273,15 aux degrés Celsius. L’équation dit ' +
    'que le volume est proportionnel à T, et une proportion exige une échelle dont le zéro est ' +
    'le vrai zéro.',
  en: () =>
    'Temperature goes in kelvin: add 273.15 to the Celsius reading. The equation says volume is ' +
    'proportional to T, and proportion needs a scale whose zero is the real zero.',
};

export const QUANTIDADE: Frases<[number, number, number]> = {
  pt: (pressao, litros, celsius) =>
    `Quantos mols de gás há num recipiente de ${numeroEscrito(litros, 'pt')} L a ` +
    `${numeroEscrito(pressao, 'pt')} atm e ${numeroEscrito(celsius, 'pt')} °C? ` +
    '(2 casas decimais)',
  fr: (pressao, litros, celsius) =>
    `Combien de moles de gaz y a-t-il dans un récipient de ${numeroEscrito(litros, 'fr')} L à ` +
    `${numeroEscrito(pressao, 'fr')} atm et ${numeroEscrito(celsius, 'fr')} °C ? ` +
    '(2 décimales)',
  en: (pressao, litros, celsius) =>
    `How many moles of gas are there in a ${numeroEscrito(litros, 'en')} L vessel at ` +
    `${numeroEscrito(pressao, 'en')} atm and ${numeroEscrito(celsius, 'en')} °C? ` +
    '(2 decimal places)',
};

export const TRANSFORMACAO: Frases<[number, number, number, number, number]> = {
  pt: (p1, v1, celsius1, p2, celsius2) =>
    `Um gás ocupa ${numeroEscrito(v1, 'pt')} L a ${numeroEscrito(p1, 'pt')} atm e ` +
    `${numeroEscrito(celsius1, 'pt')} °C. Passando para ${numeroEscrito(p2, 'pt')} atm e ` +
    `${numeroEscrito(celsius2, 'pt')} °C, sem perder gás, que volume ele ocupa? ` +
    '(em litros, 2 casas decimais)',
  fr: (p1, v1, celsius1, p2, celsius2) =>
    `Un gaz occupe ${numeroEscrito(v1, 'fr')} L à ${numeroEscrito(p1, 'fr')} atm et ` +
    `${numeroEscrito(celsius1, 'fr')} °C. En passant à ${numeroEscrito(p2, 'fr')} atm et ` +
    `${numeroEscrito(celsius2, 'fr')} °C, sans perte de gaz, quel volume occupe-t-il ? ` +
    '(en litres, 2 décimales)',
  en: (p1, v1, celsius1, p2, celsius2) =>
    `A gas occupies ${numeroEscrito(v1, 'en')} L at ${numeroEscrito(p1, 'en')} atm and ` +
    `${numeroEscrito(celsius1, 'en')} °C. Moving to ${numeroEscrito(p2, 'en')} atm and ` +
    `${numeroEscrito(celsius2, 'en')} °C, with no gas lost, what volume does it occupy? ` +
    '(in litres, 2 decimal places)',
};

export const DICA_TRANSFORMACAO: Frases<[number, number, number, number, number]> = {
  pt: () =>
    'A quantidade de gás não mudou, então PV/T é a mesma antes e depois. Converta as DUAS ' +
    'temperaturas para kelvin antes de montar a razão.',
  fr: () =>
    'La quantité de gaz n’a pas changé, donc PV/T est la même avant et après. Convertissez les ' +
    'DEUX températures en kelvins avant d’écrire le rapport.',
  en: () =>
    'The amount of gas has not changed, so PV/T is the same before and after. Convert BOTH ' +
    'temperatures to kelvin before setting up the ratio.',
};

export const PARCIAL: Frases<[string, number, string, number, number]> = {
  pt: (gas, molsDoGas, outro, molsDoOutro, total) =>
    `Um recipiente contém ${numeroEscrito(molsDoGas, 'pt')} mol de ${gas} e ` +
    `${numeroEscrito(molsDoOutro, 'pt')} mol de ${outro}, com pressão total de ` +
    `${numeroEscrito(total, 'pt')} atm. Qual é a pressão parcial de ${gas}? ` +
    '(em atm, 2 casas decimais)',
  fr: (gas, molsDoGas, outro, molsDoOutro, total) =>
    `Un récipient contient ${numeroEscrito(molsDoGas, 'fr')} mol de ${gas} et ` +
    `${numeroEscrito(molsDoOutro, 'fr')} mol de ${outro}, avec une pression totale de ` +
    `${numeroEscrito(total, 'fr')} atm. Quelle est la pression partielle de ${gas} ? ` +
    '(en atm, 2 décimales)',
  en: (gas, molsDoGas, outro, molsDoOutro, total) =>
    `A vessel holds ${numeroEscrito(molsDoGas, 'en')} mol of ${gas} and ` +
    `${numeroEscrito(molsDoOutro, 'en')} mol of ${outro}, at a total pressure of ` +
    `${numeroEscrito(total, 'en')} atm. What is the partial pressure of ${gas}? ` +
    '(in atm, 2 decimal places)',
};

export const DICA_PARCIAL: Frases<[string, number, string, number, number]> = {
  pt: (gas) =>
    `Cada gás empurra como se estivesse sozinho. A parcela de ${gas} é a fração MOLAR dele — ` +
    'mols do gás sobre mols totais — vezes a pressão total.',
  fr: (gas) =>
    `Chaque gaz pousse comme s’il était seul. La part de ${gas} est sa fraction MOLAIRE — ` +
    'moles du gaz sur moles totales — multipliée par la pression totale.',
  en: (gas) =>
    `Each gas pushes as if it were alone. ${gas}’s share is its MOLE fraction — moles of the ` +
    'gas over total moles — times the total pressure.',
};
