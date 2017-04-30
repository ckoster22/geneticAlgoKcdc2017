// @flow

import { evolveSolution } from '../genetic.algo';
import type { GAOptions, Organism, MaybeOrganism } from '../genetic.algo';

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
const CROSSOVER_RATE: number = 0.3;
const MUTATION_RATE: number = 0.03;

let NEW_CIRCLE_THRESHOLD: number = 0.99;
let RADIUS: number = 200;

let generation: number = 0;
let images: any = [];
let currentImageIndex = 0;

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
        score: null
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
    let originalRed;
    let originalGreen;
    let originalBlue;
    let originalAlpha;
    let cost: number = 0;

    for (let i = 0, n = pix.length; i < n; i += 4) {
        red = pix[i];
        green = pix[i+1];
        blue = pix[i+2];
        alpha = pix[i+3];
        originalRed = original[i];
        originalGreen = original[i+1];
        originalBlue = original[i+2];
        originalAlpha = original[i+3];

        cost += red > originalRed ? red - originalRed : originalRed - red;
        cost += green > originalGreen ? green - originalGreen : originalGreen - green;
        cost += blue > originalBlue ? blue - originalBlue : originalBlue - blue;
        cost += alpha > originalAlpha ? alpha - originalAlpha : originalAlpha - alpha;
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
    if (Math.random() >= NEW_CIRCLE_THRESHOLD) {
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
            nextCircle = Object.assign({}, currentCircle, {
                x: mutateValue(currentCircle.x, lowerX, upperX)
            })
            break;
        case 1:
            nextCircle = Object.assign({}, currentCircle, {
                y: mutateValue(currentCircle.y, lowerY, upperY)
            })
            break;
        case 2:
            nextCircle = Object.assign({}, currentCircle, {
                radius: mutateValue(currentCircle.radius, lowerRadius, upperRadius)
            })
            break;
        case 3:
            nextCircle = Object.assign({}, currentCircle, {
                red: Math.round(mutateValue(currentCircle.red, lowerRed, upperRed))
            })
            break;
        case 4:
            nextCircle = Object.assign({}, currentCircle, {
                green: Math.round(mutateValue(currentCircle.green, lowerGreen, upperGreen))
            })
            break;
        case 5:
            nextCircle = Object.assign({}, currentCircle, {
                blue: Math.round(mutateValue(currentCircle.blue, lowerBlue, upperBlue))
            })
            break;
        case 6:
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

const genCB = (maybeOrganism: MaybeOrganism<Dna>) => {
    generation++;
    console.log(generation);

    if (generation % 1000 === 0) {
        NEW_CIRCLE_THRESHOLD *= 0.995;
    }

    if (generation % 120 === 0) {
        const newRadius = RADIUS * 0.98;

        if (Math.floor(newRadius) === Math.floor(RADIUS)) {
            RADIUS = Math.max(1, RADIUS - 1);
        } else {
            RADIUS = newRadius
        }
    }

    if (generation % 5 === 0) {
        images.push(gaCanvas.toDataURL());
    }
}

window.playMoveClick = () => {
    console.log('playing..');
    currentImageIndex = 0;

    drawImages();
};

const drawImages = () => {
    const img: any = document.querySelector('#imagePlayback');
    img.src = images[currentImageIndex++];

    if (currentImageIndex < images.length) {
        setTimeout(function() {
            drawImages();
        }, 16);
    } else {
        console.log('done');
    }
}

const args: GAOptions<Dna> = {
    maxIterations: 500,
    generateRandomOrganism,
    scoreOrganism,
    crossoverDnas,
    mutateDna,
    genCB
};

window.start(function(newValue) {
    imageData = newValue;
    if (newValue) {
        gaCanvas = document.querySelector('#gaCanvas');
        evolveSolution(args);

        const img: any = document.querySelector('#imagePlayback');
        img.src = images[0];
    }
});