// @flow

const clear = require('clear');
const sleep = require('sleep');

const POPULATION_SIZE = 20;
const HALF_POPULATION_SIZE = POPULATION_SIZE / 2;
const MAX_ITERATIONS = 1000;
const ACCEPTABLE_SCORE = 0;

type Dna = Array<number>;
type Organism = {
    dna: Dna,
    score: number
};
type MaybeOrganism = Organism | null;
type Population = Array<Organism>;

const generateInitialPopulation = (): Population => {
    const population: Population = [];

    for (let i = 0; i < POPULATION_SIZE; ++i) {
        population.push(generateRandomOrganism());
    }

    return population;
};

type StepValue = {
    nextPopulation: Population,
    currentBestSolution: MaybeOrganism
};
const executeStep = (population: Population): StepValue => {
    const scoredPopulation: Population = population.map((organism: Organism) => {
        return {
            ...organism,
            score: scoreOrganism(organism)
        };
    });
    const bestSolution: MaybeOrganism = scoredPopulation.reduce((bestOrganism: MaybeOrganism, organism: Organism) => {
        if (bestOrganism === null) {
            return organism;
        } else if (bestOrganism.score > organism.score) {
            return organism;
        } else {
            return bestOrganism;
        }
    }, null);

    return {
        nextPopulation: generateNextGeneration(scoredPopulation),
        currentBestSolution: bestSolution
    };
};
const evolveSolution =  (): MaybeOrganism => {
    const initialPopulation: Population =  generateInitialPopulation(POPULATION_SIZE);
    let stepValue: StepValue = {
        nextPopulation: initialPopulation,
        currentBestSolution: null
    };
    let currentIteration = 0;

    while (!isDoneEvolving(currentIteration, stepValue.currentBestSolution)) {
        sleep.msleep(5);
        currentIteration++;
        stepValue = executeStep(stepValue.nextPopulation);

        if (stepValue.currentBestSolution !== null) {
            const best: Organism = stepValue.currentBestSolution;
            clear();
            console.log('Current best');
            console.log(String.fromCharCode(...best.dna));
            console.log(best.score);
        }
    }

    console.log('Total iterations: ' + currentIteration);

    return stepValue.currentBestSolution;
};

const isDoneEvolving = (currentIteration: number, currentBestSolution: MaybeOrganism): boolean => {
    return currentIteration >= MAX_ITERATIONS ||
            (currentBestSolution !== null &&
            currentBestSolution.score <= ACCEPTABLE_SCORE);
};

const createOrganismFromDna = (dna: Dna): Organism => {
    return {
        dna,
        score: Number.MAX_SAFE_INTEGER
    };
};

const generateNextGeneration = (population: Population): Population => {
    const bestHalfOfPopulation: Population = population.slice(0)
        .sort((organism1: Organism, organism2: Organism) => {
            return organism2.score - organism1.score;
        })
        .filter((organism: Organism, index: number) => {
            return index >= HALF_POPULATION_SIZE;
        });

    const nextPopulation: Population = [];
    for (var i = 0; i < HALF_POPULATION_SIZE; i += 2) {
        const parent1: Organism = bestHalfOfPopulation[i];
        const parent2: Organism = bestHalfOfPopulation[i+1];

        nextPopulation.push(createOrganismFromDna(mutateDna(crossoverDnas(parent1.dna, parent2.dna))));
        nextPopulation.push(createOrganismFromDna(mutateDna(crossoverDnas(parent1.dna, parent2.dna))));
        nextPopulation.push(createOrganismFromDna(mutateDna(crossoverDnas(parent1.dna, parent2.dna))));

        // Keep the best parent from the pair so we never get worse
        if (parent1.score < parent2.score) {
            nextPopulation.push(parent1);
        } else {
            nextPopulation.push(parent2);
        }
    }

    return nextPopulation;
};


////////
// Hello World


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

evolveSolution();