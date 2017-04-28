// @flow

import { evolveSolution } from '../genetic.algo';
import type { GAOptions, Organism } from '../genetic.algo';

type Circle = {
    x: number,
    y: number,
    radius: number,
    red: number,
    green: number,
    blue: number,
    alpha: number,
};
type Dna = Array<Circle>;

const WIDTH: number = 640;
const HEIGHT: number = 480;
const RADIUS: number = 200;
const CROSSOVER_RATE: number = 0.3;
const MUTATION_RATE: number = 0.03;
const NEW_CIRCLE_THRESHOLD = 0.02;

// frown at any type.. TODO fix if time
let gaCanvas: any;
let imageData: any = {};

const generateRandomOrganism = (): Organism<Dna> => {
    const randDna: Dna = [];

    for (let i = 0; i < 5; ++i) {
        randDna.push(getRandomCircle());
    }

    return {
        dna: randDna,
        score: Number.MAX_SAFE_INTEGER
    };
};
const getRandomCircle = (): Circle => {
    return {
        x: Math.floor(Math.random() * WIDTH),
        y: Math.floor(Math.random() * HEIGHT),
        radius: Math.floor(RADIUS),
        red: Math.floor(Math.random() * 255),
        green: Math.floor(Math.random() * 255),
        blue: Math.floor(Math.random() * 255),
        alpha: parseFloat(Math.random().toFixed(2))
    };
};

const scoreOrganism = (organism: Organism<Dna>): number => {
    drawOrganism(organism);

    const context = gaCanvas.getContext('2d');
    let pix = context.getImageData(0, 0, WIDTH, HEIGHT).data;
    let red: number;
    let green: number;
    let blue: number;
    let alpha: number;
    let original = imageData.data;
    let cost: number = 0;

    for (let i = 0, n = pix.length; i < n; i += 4) {
        red = pix[i];
        green = pix[i+1];
        blue = pix[i+2];
        alpha = pix[i+3];

        cost += Math.abs(red - original[i]);
        cost += Math.abs(green - original[i+1]);
        cost += Math.abs(blue - original[i+2]);
        cost += Math.abs(alpha - original[i+3]);
    }

    return cost;
};
const drawOrganism = (organism: Organism<Dna>): void => {
    const context = gaCanvas.getContext('2d');

    context.clearRect(0, 0, WIDTH, HEIGHT);

    for (let i = 0; i < organism.dna.length; ++i) {
        let circle: Circle = organism.dna[i];
        context.beginPath();
        context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'rgba(' + circle.red + ', ' + circle.green + ', ' + circle.blue + ', ' + circle.alpha + ')';
        context.fill();
    }
}

const crossoverDnas = (dna1: Dna, dna2: Dna): Dna => {
    let childCircles = dna1.slice(0, Math.floor(CROSSOVER_RATE * dna1.length));
    childCircles = childCircles.concat(dna2.slice(Math.floor(CROSSOVER_RATE * dna2.length)));

    return childCircles;
};

const mutateDna = (dna: Dna): Dna => {
    if (Math.random() <= NEW_CIRCLE_THRESHOLD) {
        console.log('generated new circle!');
        const nextDna = dna.slice();
        nextDna.push(getRandomCircle());

        return nextDna;
    } else {
        const randIndex: number = Math.floor(Math.random() * dna.length);
        const currentCircle: Circle = dna[randIndex];

        const nextCircle = mutateCircle(currentCircle);
        return [...dna.slice(0, randIndex), nextCircle, ...dna.slice(randIndex+1)];
    }
}

const mutateCircle = (currentCircle: Circle): Circle => {
    const randAttr: number = Math.floor(Math.random() * 7);
    const lowerX: number = Math.max(0, currentCircle.x - currentCircle.x * MUTATION_RATE);
    const upperX: number = Math.min(WIDTH, currentCircle.x + currentCircle.x * MUTATION_RATE);
    const lowerY: number = Math.max(0, currentCircle.y - currentCircle.y * MUTATION_RATE);
    const upperY: number = Math.min(HEIGHT, currentCircle.y + currentCircle.y * MUTATION_RATE);
    const lowerRadius: number = Math.max(0, currentCircle.radius - currentCircle.radius * MUTATION_RATE);
    const upperRadius: number = Math.min(300, currentCircle.radius + currentCircle.radius * MUTATION_RATE);
    const lowerRed: number = Math.max(0, currentCircle.red - currentCircle.red * MUTATION_RATE);
    const upperRed: number = Math.min(255, currentCircle.red + currentCircle.red * MUTATION_RATE);
    const lowerGreen: number = Math.max(0, currentCircle.green - currentCircle.green * MUTATION_RATE);
    const upperGreen: number = Math.min(255, currentCircle.green + currentCircle.green * MUTATION_RATE);
    const lowerBlue: number = Math.max(0, currentCircle.blue - currentCircle.blue * MUTATION_RATE);
    const upperBlue: number = Math.min(255, currentCircle.blue + currentCircle.blue * MUTATION_RATE);
    let nextCircle;

    switch (randAttr) {
        case 0:
            // currentCircle.x = mutateValue(currentCircle.x, lowerX, upperX);
            nextCircle = Object.assign({}, currentCircle, {
                x: mutateValue(currentCircle.x, lowerX, upperX)
            })
            break;
        case 1:
            // currentCircle.y = mutateValue(currentCircle.y, lowerY, upperY);
            nextCircle = Object.assign({}, currentCircle, {
                y: mutateValue(currentCircle.y, lowerY, upperY)
            })
            break;
        case 2:
            // currentCircle.radius = mutateValue(currentCircle.radius, lowerRadius, upperRadius);
            nextCircle = Object.assign({}, currentCircle, {
                radius: mutateValue(currentCircle.radius, lowerRadius, upperRadius)
            })
            break;
        case 3:
            // currentCircle.red = Math.round(mutateValue(currentCircle.red, lowerRed, upperRed));
            nextCircle = Object.assign({}, currentCircle, {
                red: Math.round(mutateValue(currentCircle.red, lowerRed, upperRed))
            })
            break;
        case 4:
            // currentCircle.green = Math.round(mutateValue(currentCircle.green, lowerGreen, upperGreen));
            nextCircle = Object.assign({}, currentCircle, {
                green: Math.round(mutateValue(currentCircle.green, lowerGreen, upperGreen))
            })
            break;
        case 5:
            // currentCircle.blue = Math.round(mutateValue(currentCircle.blue, lowerBlue, upperBlue));
            nextCircle = Object.assign({}, currentCircle, {
                blue: Math.round(mutateValue(currentCircle.blue, lowerBlue, upperBlue))
            })
            break;
        case 6:
            // currentCircle.alpha = parseFloat(mutateValue(currentCircle.alpha, 0, 1).toFixed(2));
            nextCircle = Object.assign({}, currentCircle, {
                alpha: parseFloat(mutateValue(currentCircle.alpha, 0, 1).toFixed(2))
            })
            break;
        default:
            nextCircle = Object.assign({}, currentCircle);
    }

    return nextCircle;
};

const mutateValue = (current: number, min: number, max: number): number => {
    var range: number = max - min;
    var mutateAmount: number = Math.random() * range;
    var newVal: number;

    if (current + mutateAmount > max && current) {
        newVal = current - mutateAmount;
    } else if (current - mutateAmount < min) {
        newVal = current + mutateAmount;
    } else if (Math.random() < 0.5) {
        newVal = current - mutateAmount;
    } else {
        newVal = current + mutateAmount;
    }

    if (newVal > max) {
        newVal = max;
    } else if (newVal < min) {
        newVal = min;
    }

    return newVal;
}


const args: GAOptions<Dna> = {
    generateRandomOrganism,
    scoreOrganism,
    crossoverDnas,
    mutateDna
};

window.start(function(newValue) {
    imageData = newValue;
    if (newValue) {
        gaCanvas = document.querySelector('#gaCanvas');
        evolveSolution(args);
    }
});