// @flow

import { evolveSolution } from '../genetic.algo';
import type { GAOptions } from '../genetic.algo';

type Dna = Array<number>;
type Organism = {
    dna: Dna,
    score: number
};
type MaybeOrganism = Organism | null;
type Population = Array<Organism>;

const TARGET_STRING: string = 'Hello World';
const HELLO_WORLD_ASCII: Array<number> = TARGET_STRING.split('').map((char: string) => {
    return char.charCodeAt(0);
});
const CROSSOVER_SPLIT_INDEX = Math.floor(TARGET_STRING.length/2);

const generateRandomOrganism = (): Organism => {
    const randDna: Dna = [];

    for (let i = 0; i < TARGET_STRING.length; ++i) {
        randDna.push(getAsciiCodeForRandomCharacter());
    }

    return {
        dna: randDna,
        score: Number.MAX_SAFE_INTEGER
    };
};
const getAsciiCodeForRandomCharacter = (): number => {
    const randNum: number = Math.floor(Math.random() * 53);

    // a-z, A-Z, " " .. 53 total characters
    if (randNum === 0) {
        return 32;              // space
    } else if (randNum <= 26) {
        return randNum + 64;    // A-Z
    } else {
        return randNum + 70;    // a-z
    }
};

const scoreOrganism = (organism: Organism): number => {
    return HELLO_WORLD_ASCII.reduce((score: number, asciiCode: number, index: number) => {
        const organismAscii = organism.dna[index];
        return score + Math.abs(organismAscii - asciiCode);
    }, 0);
};

const crossoverDnas = (dna1: Dna, dna2: Dna): Dna => {
    let parent1DnaPart: Dna;
    let parent2DnaPart: Dna;

    if (Math.random() < 0.5) {
        parent1DnaPart = dna1.slice(0, CROSSOVER_SPLIT_INDEX);
        parent2DnaPart = dna2.slice(CROSSOVER_SPLIT_INDEX);
    } else {
        parent1DnaPart = dna2.slice(0, CROSSOVER_SPLIT_INDEX);
        parent2DnaPart = dna1.slice(CROSSOVER_SPLIT_INDEX);
    }

    return parent1DnaPart.concat(parent2DnaPart);
};

const mutateDna = (dna: Dna): Dna => {
    const randomIndex: number = Math.floor(Math.random() * TARGET_STRING.length);
    const randomAsciiCode: number = getAsciiCodeForRandomCharacter();

    if (randomIndex === TARGET_STRING.length - 1) {
        return dna
                .slice(0, randomIndex)
                .concat(randomAsciiCode);
    } else {
        return dna
                .slice(0, randomIndex)
                .concat(randomAsciiCode)
                .concat(dna.slice(randomIndex + 1));
    }
};

const args: GAOptions<Dna> = {
    generateRandomOrganism,
    scoreOrganism,
    crossoverDnas,
    mutateDna
};
evolveSolution(args);