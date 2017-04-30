// @flow

import { evolveSolution } from '../genetic.algo';
import type { GAOptions, Organism, MaybeOrganism } from '../genetic.algo';

// type Point = {
//     x: number,
//     y: number
// };
type Triangle = {
    point1x: number,
    point1y: number,
    point2x: number,
    point2y: number,
    point3x: number,
    point3y: number,
    red: number,
    green: number,
    blue: number,
    alpha: number,
};
type Dna = Array<Triangle>;

const WIDTH: number = 640;
const HEIGHT: number = 480;
const CROSSOVER_RATE: number = 0.3;
const MUTATION_RATE: number = 0.03;

let NEW_TRIANGLE_THRESHOLD: number = 0.99;

let generation: number = 0;
let images: any = [];
let currentImageIndex = 0;

// frown at any type.. TODO fix if time
let gaCanvas: any;
let imageData: any = {};

const generateRandomOrganism = (): Organism<Dna> => {
    const randDna: Dna = [];

    for (let i = 0; i < 5; ++i) {
        randDna.push(getRandomTriangle());
    }

    return {
        dna: randDna,
        score: null
    };
};
const getRandomTriangle = (): Triangle => {
    return {
        point1x: Math.floor(Math.random() * WIDTH),
        point1y: Math.floor(Math.random() * HEIGHT),
        point2x: Math.floor(Math.random() * WIDTH),
        point2y: Math.floor(Math.random() * HEIGHT),
        point3x: Math.floor(Math.random() * WIDTH),
        point3y: Math.floor(Math.random() * HEIGHT),
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
        let triangle: Triangle = organism.dna[i];
        context.beginPath();
        context.moveTo(triangle.point1x, triangle.point1y);
        context.lineTo(triangle.point2x, triangle.point2y);
        context.lineTo(triangle.point3x, triangle.point3y);
        context.fillStyle = 'rgba(' + triangle.red + ', ' + triangle.green + ', ' + triangle.blue + ', ' + triangle.alpha + ')';
        context.fill();
    }
}

const crossoverDnas = (dna1: Dna, dna2: Dna): Dna => {
    let dnaParts = dna1.slice(0, Math.floor(CROSSOVER_RATE * dna1.length));
    dnaParts = dnaParts.concat(dna2.slice(Math.floor(CROSSOVER_RATE * dna2.length)));

    return dnaParts;
};

const mutateDna = (dna: Dna): Dna => {
    if (Math.random() >= NEW_TRIANGLE_THRESHOLD) {
        const nextDna = dna.slice();
        nextDna.push(getRandomTriangle());

        return nextDna;
    } else {
        const randIndex: number = Math.floor(Math.random() * dna.length);
        const currentTriangle: Triangle = dna[randIndex];

        const nextTriangle = mutateTriangle(currentTriangle);
        return [...dna.slice(0, randIndex), nextTriangle, ...dna.slice(randIndex+1)];
    }
}

const mutateTriangle = (currentTriangle: Triangle): Triangle => {
    const randAttr: number = Math.floor(Math.random() * 9);
    const lowerPoint1X: number = Math.max(0, currentTriangle.point1x - currentTriangle.point1x * MUTATION_RATE);
    const upperPoint1X: number = Math.min(WIDTH, currentTriangle.point1x + currentTriangle.point1x * MUTATION_RATE);
    const lowerPoint1Y: number = Math.max(0, currentTriangle.point1y - currentTriangle.point1y * MUTATION_RATE);
    const upperPoint1Y: number = Math.min(HEIGHT, currentTriangle.point1y + currentTriangle.point1y * MUTATION_RATE);
    const lowerPoint2X: number = Math.max(0, currentTriangle.point2x - currentTriangle.point2x * MUTATION_RATE);
    const upperPoint2X: number = Math.min(WIDTH, currentTriangle.point2x + currentTriangle.point2x * MUTATION_RATE);
    const lowerPoint2Y: number = Math.max(0, currentTriangle.point2y - currentTriangle.point2y * MUTATION_RATE);
    const upperPoint2Y: number = Math.min(HEIGHT, currentTriangle.point2y + currentTriangle.point2y * MUTATION_RATE);
    const lowerPoint3X: number = Math.max(0, currentTriangle.point3x - currentTriangle.point3x * MUTATION_RATE);
    const upperPoint3X: number = Math.min(WIDTH, currentTriangle.point3x + currentTriangle.point3x * MUTATION_RATE);
    const lowerPoint3Y: number = Math.max(0, currentTriangle.point3y - currentTriangle.point3y * MUTATION_RATE);
    const upperPoint3Y: number = Math.min(HEIGHT, currentTriangle.point3y + currentTriangle.point3y * MUTATION_RATE);
    const lowerRed: number = Math.max(0, currentTriangle.red - currentTriangle.red * MUTATION_RATE);
    const upperRed: number = Math.min(255, currentTriangle.red + currentTriangle.red * MUTATION_RATE);
    const lowerGreen: number = Math.max(0, currentTriangle.green - currentTriangle.green * MUTATION_RATE);
    const upperGreen: number = Math.min(255, currentTriangle.green + currentTriangle.green * MUTATION_RATE);
    const lowerBlue: number = Math.max(0, currentTriangle.blue - currentTriangle.blue * MUTATION_RATE);
    const upperBlue: number = Math.min(255, currentTriangle.blue + currentTriangle.blue * MUTATION_RATE);
    let nextTriangle;

    switch (randAttr) {
        case 0:
            nextTriangle = {
                ...currentTriangle,
                point1x: mutateValue(currentTriangle.point1x, lowerPoint1X, upperPoint1X)
            }
            break;
        case 1:
            nextTriangle = {
                ...currentTriangle,
                point1y: mutateValue(currentTriangle.point1y, lowerPoint1Y, upperPoint1Y)
            }
            break;
        case 1:
            nextTriangle = {
                ...currentTriangle,
                point2x: mutateValue(currentTriangle.point2x, lowerPoint2X, upperPoint2X)
            }
            break;
        case 2:
            nextTriangle = {
                ...currentTriangle,
                point2y: mutateValue(currentTriangle.point2y, lowerPoint2Y, upperPoint2Y)
            }
            break;
        case 3:
            nextTriangle = {
                ...currentTriangle,
                point3x: mutateValue(currentTriangle.point3x, lowerPoint3X, upperPoint3X)
            }
            break;
        case 4:
            nextTriangle = {
                ...currentTriangle,
                point3y: mutateValue(currentTriangle.point3y, lowerPoint3Y, upperPoint3Y)
            }
            break;
        case 5:
            nextTriangle = {
                ...currentTriangle,
                red: Math.round(mutateValue(currentTriangle.red, lowerRed, upperRed))
            }
            break;
        case 6:
            nextTriangle = {
                ...currentTriangle,
                green: Math.round(mutateValue(currentTriangle.green, lowerGreen, upperGreen))
            }
            break;
        case 7:
            nextTriangle = {
                ...currentTriangle,
                blue: Math.round(mutateValue(currentTriangle.blue, lowerBlue, upperBlue))
            }
            break;
        case 8:
            nextTriangle = {
                ...currentTriangle,
                alpha: parseFloat(mutateValue(currentTriangle.alpha, 0, 1).toFixed(2))
            }
            break;
        default:
            nextTriangle = {
                ...currentTriangle
            }
    }

    return nextTriangle;
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
        NEW_TRIANGLE_THRESHOLD *= 0.995;
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