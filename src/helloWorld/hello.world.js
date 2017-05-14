// @flow

import { evolveSolution } from '../genetic.algo';
import type { GAOptions, Organism, MaybeOrganism } from '../genetic.algo';
import sleep from 'sleep';

type Dna = Array<number>;

let generations = 0;

const MAX_ITERATIONS = 50000;
const TARGET_STRING: string = 'Hello world';
const HELLO_WORLD_ASCII: Array<number> = TARGET_STRING.split('').map((char: string) => {
    return char.charCodeAt(0);
});
const CROSSOVER_SPLIT_INDEX = Math.floor(TARGET_STRING.length/2);

const generateRandomOrganism = (): Organism<Dna> => {
    const randDna: Dna = [];

    for (let i = 0; i < TARGET_STRING.length; ++i) {
        randDna.push(getAsciiCodeForRandomCharacter());
    }

    return {
        dna: randDna,
        score: null
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

const scoreOrganism = (organism: Organism<Dna>): number => {
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

    let randIndices: Array<number> = []
    for (let i = 0; i < determineNumCharactersToMutate(TARGET_STRING); ++i) {
        randIndices.push(Math.floor(Math.random() * TARGET_STRING.length));
    }

    return randIndices.reduce((nextDna, index) => {
        const randomAsciiCode: number = getAsciiCodeForRandomCharacter();
        return nextDna
                .slice(0, index)
                .concat(randomAsciiCode)
                .concat(nextDna.slice(index + 1));
    }, dna);
};

const determineNumCharactersToMutate = (targetStr: string) : number => {
    const numToMutate = Math.floor(targetStr.length * 0.1);

    return numToMutate > 0 ? numToMutate : 1;
};

const isDoneEvolving = (currentBestOrganism: MaybeOrganism<Dna>, currentIteration: number): boolean => {
    sleep.msleep(5);

    generations++;

    if (currentBestOrganism) {
        console.log(String.fromCharCode(...currentBestOrganism.dna));
    }

    return (currentBestOrganism !== null &&
            currentBestOrganism.score !== null &&
            currentBestOrganism.score === 0) || 
            currentIteration >= MAX_ITERATIONS;
};

const args: GAOptions<Dna> = {
    generateRandomOrganism,
    scoreOrganism,
    crossoverDnas,
    mutateDna,
    isDoneEvolving
};

const maybeSolution = evolveSolution(args);
if (maybeSolution) {
    console.log('Best solution found after ' + generations + ' generations: ' + String.fromCharCode(...maybeSolution.dna));
}