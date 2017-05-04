// @flow

const POPULATION_SIZE = 20;
const HALF_POPULATION_SIZE = POPULATION_SIZE / 2;
const ACCEPTABLE_SCORE = 0; // TODO: use this? pass it in?

type MaybeScore = number | null;
export type Organism<DnaType> = {
    dna: DnaType,
    score: MaybeScore
};
export type MaybeOrganism<DnaType> = Organism<DnaType> | null;
type Population<DnaType> = Array<Organism<DnaType>>;
type StepValue<DnaType> = {
    nextPopulation: Population<DnaType>,
    currentBestSolution: MaybeOrganism<DnaType>
};
export type GAOptions<DnaType> = {
    generateRandomOrganism: () => Organism<DnaType>,
    scoreOrganism: (organism: Organism<DnaType>) => number,
    crossoverDnas: (dna1: DnaType, dna2: DnaType) => DnaType,
    mutateDna: (dna: DnaType) => DnaType,
    isDoneEvolving: (maybeOrganism: MaybeOrganism<DnaType>, currentIteration: number) => boolean
};

export const evolveSolution = <DnaType>(gaOptions: GAOptions<DnaType>): MaybeOrganism<DnaType> => {
    const {generateRandomOrganism, scoreOrganism, crossoverDnas, mutateDna, isDoneEvolving} = gaOptions;
    const initialPopulation: Population<DnaType> =  generateInitialPopulation(generateRandomOrganism);
    let stepValue: StepValue<DnaType> = {
        nextPopulation: initialPopulation,
        currentBestSolution: null
    };
    let currentIteration = 0;

    while (!isDoneEvolving(stepValue.currentBestSolution, currentIteration)) {
        currentIteration++;

        stepValue = executeStep(scoreOrganism, crossoverDnas, mutateDna, stepValue.nextPopulation);
    }

    return stepValue.currentBestSolution;
};

const executeStep = <DnaType>(scoreOrganism: (organism: Organism<DnaType>) => number, crossoverDnas: (dna1: DnaType, dna2: DnaType) => DnaType, mutateDna: (dna: DnaType) => DnaType, population: Population<DnaType>): StepValue<DnaType> => {
    const scoredPopulation: Population<DnaType> = population.map((organism: Organism<DnaType>) => {
        if (organism.score !== null) {
            return organism;
        } else {
            return {
                ...organism,
                score: scoreOrganism(organism)
            };
        }
    });
    const bestSolution: MaybeOrganism<DnaType> = scoredPopulation.reduce((bestOrganism: MaybeOrganism<DnaType>, organism: Organism<DnaType>) => {
        if (bestOrganism === null) {
            return organism;
        } else if (bestOrganism.score !== null && organism.score !== null && bestOrganism.score > organism.score) {
            return organism;
        } else {
            return bestOrganism;
        }
    }, null);

    return {
        nextPopulation: generateNextGeneration(crossoverDnas, mutateDna, scoredPopulation),
        currentBestSolution: bestSolution
    };
};

const generateInitialPopulation = <DnaType>(generateRandomOrganism: () => Organism<DnaType>): Population<DnaType> => {
    const population: Population<DnaType> = [];

    for (let i = 0; i < POPULATION_SIZE; ++i) {
        population.push(generateRandomOrganism());
    }

    return population;
};

const generateNextGeneration = <DnaType>(crossoverDnas: (dna1: DnaType, dna2: DnaType) => DnaType, mutateDna: (dna: DnaType) => DnaType, population: Population<DnaType>): Population<DnaType> => {
    const bestHalfOfPopulation: Population<DnaType> = population.slice(0)
        .sort((organism1: Organism<DnaType>, organism2: Organism<DnaType>) => {
            if (organism1.score !== null && organism2.score !== null) {
                return organism2.score - organism1.score;
            } else {
                return 0;
            }
        }).slice(HALF_POPULATION_SIZE);

    const nextPopulation: Population<DnaType> = [];
    for (var i = 0; i < HALF_POPULATION_SIZE; i += 2) {
        const parent1: Organism<DnaType> = bestHalfOfPopulation[i];
        const parent2: Organism<DnaType> = bestHalfOfPopulation[i+1];

        nextPopulation.push(createOrganismFromDna(mutateDna(crossoverDnas(parent1.dna, parent2.dna))));
        nextPopulation.push(createOrganismFromDna(mutateDna(crossoverDnas(parent1.dna, parent2.dna))));
        nextPopulation.push(createOrganismFromDna(mutateDna(crossoverDnas(parent1.dna, parent2.dna))));

        // Keep the best parent from the pair so we never get worse
        if (parent1.score !== null && parent2.score !== null && parent1.score < parent2.score) {
            nextPopulation.push(parent1);
        } else {
            nextPopulation.push(parent2);
        }
    }

    return nextPopulation;
};

const createOrganismFromDna = <DnaType>(dna: DnaType): Organism<DnaType> => {
    return {
        dna,
        score: null
    };
};