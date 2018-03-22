import { evolveSolution, GAOptions, Organism, MaybeOrganism } from '../genetic.algo';

type Line = {
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    red: number,
    green: number,
    blue: number,
    alpha: number,
};
type Dna = Array<Line>;

const WIDTH: number = 555;
const HEIGHT: number = 465;
const CROSSOVER_RATE: number = 0.3;
const MUTATION_RATE: number = 0.03;

let NEW_LINE_THRESHOLD: number = 0.9;

let generation: number = 0;
let images: any = [];
let currentImageIndex = 0;
let numTimesStuck = 0;
let currentBestScore = -1;

// frown at any type.. TODO fix if time
let gaCanvas: any;
let imageData: any = {};

const generateRandomOrganism = (): Organism<Dna> => {
    const randDna: Dna = [];

    for (let i = 0; i < 5; ++i) {
        randDna.push(getRandomLine());
    }

    return {
        dna: randDna,
        score: null
    };
};
const getRandomLine = (): Line => {
    return {
        x1: Math.floor(Math.random() * WIDTH),
        x2: Math.floor(Math.random() * WIDTH),
        y1: Math.floor(Math.random() * HEIGHT),
        y2: Math.floor(Math.random() * HEIGHT),
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
        green = pix[i + 1];
        blue = pix[i + 2];
        alpha = pix[i + 3];
        originalRed = original[i];
        originalGreen = original[i + 1];
        originalBlue = original[i + 2];
        originalAlpha = original[i + 3];

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
        let line: Line = organism.dna[i];
        context.beginPath();
        context.moveTo(line.x1, line.y1);
        context.lineTo(line.x2, line.y2);
        context.strokeStyle = 'rgba(' + line.red + ', ' + line.green + ', ' + line.blue + ', ' + line.alpha + ')';
        context.lineWidth = 10;
        context.stroke();
    }
}

const crossoverDnas = (dna1: Dna, dna2: Dna): Dna => {
    let childLines = dna1.slice(0, Math.floor(CROSSOVER_RATE * dna1.length));
    childLines = childLines.concat(dna2.slice(Math.floor(CROSSOVER_RATE * dna2.length)));

    return childLines;
};

const mutateDna = (dna: Dna): Dna => {
    if (Math.random() >= NEW_LINE_THRESHOLD) {
        const nextDna = dna.slice();
        nextDna.push(getRandomLine());

        return nextDna;
    } else {
        const randIndex: number = Math.floor(Math.random() * dna.length);
        const currentLine: Line = dna[randIndex];

        const nextLine = mutateLine(currentLine);
        return [...dna.slice(0, randIndex), nextLine, ...dna.slice(randIndex + 1)];
    }
}

const mutateLine = (currentLine: Line): Line => {
    const randAttr: number = Math.floor(Math.random() * 8);
    const lowerX1: number = Math.max(0, currentLine.x1 - currentLine.x1 * MUTATION_RATE);
    const upperX1: number = Math.min(WIDTH, currentLine.x1 + currentLine.x1 * MUTATION_RATE);
    const lowerX2: number = Math.max(0, currentLine.x2 - currentLine.x2 * MUTATION_RATE);
    const upperX2: number = Math.min(WIDTH, currentLine.x2 + currentLine.x2 * MUTATION_RATE);
    const lowerY1: number = Math.max(0, currentLine.y1 - currentLine.y1 * MUTATION_RATE);
    const upperY1: number = Math.min(HEIGHT, currentLine.y1 + currentLine.y1 * MUTATION_RATE);
    const lowerY2: number = Math.max(0, currentLine.y2 - currentLine.y2 * MUTATION_RATE);
    const upperY2: number = Math.min(HEIGHT, currentLine.y2 + currentLine.y2 * MUTATION_RATE);
    const lowerRed: number = Math.max(0, currentLine.red - currentLine.red * MUTATION_RATE);
    const upperRed: number = Math.min(255, currentLine.red + currentLine.red * MUTATION_RATE);
    const lowerGreen: number = Math.max(0, currentLine.green - currentLine.green * MUTATION_RATE);
    const upperGreen: number = Math.min(255, currentLine.green + currentLine.green * MUTATION_RATE);
    const lowerBlue: number = Math.max(0, currentLine.blue - currentLine.blue * MUTATION_RATE);
    const upperBlue: number = Math.min(255, currentLine.blue + currentLine.blue * MUTATION_RATE);
    let nextLine;

    switch (randAttr) {
        case 0:
            nextLine = {
                ...currentLine,
                x1: mutateValue(currentLine.x1, lowerX1, upperX1)
            }
            break;
        case 1:
            nextLine = {
                ...currentLine,
                x2: mutateValue(currentLine.x2, lowerX2, upperX2)
            }
            break;
        case 2:
            nextLine = {
                ...currentLine,
                y1: mutateValue(currentLine.y1, lowerY1, upperY1)
            }
            break;
        case 3:
            nextLine = {
                ...currentLine,
                y2: mutateValue(currentLine.y2, lowerY2, upperY2)
            }
            break;
        case 4:
            nextLine = {
                ...currentLine,
                red: Math.round(mutateValue(currentLine.red, lowerRed, upperRed))
            }
            break;
        case 5:
            nextLine = {
                ...currentLine,
                green: Math.round(mutateValue(currentLine.green, lowerGreen, upperGreen))
            }
            break;
        case 6:
            nextLine = {
                ...currentLine,
                blue: Math.round(mutateValue(currentLine.blue, lowerBlue, upperBlue))
            }
            break;
        case 7:
            nextLine = {
                ...currentLine,
                alpha: parseFloat(mutateValue(currentLine.alpha, 0, 1).toFixed(2))
            }
            break;
        default:
            nextLine = {
                ...currentLine
            }
    }

    return nextLine;
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

const isDoneEvolving = (maybeOrganism: MaybeOrganism<Dna>, currentIteration: number) => {
    generation++;
    console.log(generation);

    if (maybeOrganism) {
        if (currentBestScore === maybeOrganism.score) {
            numTimesStuck++;
        } else if (maybeOrganism.score !== null) {
            currentBestScore = maybeOrganism.score;
        }

        if (generation % 5 === 0) {
            drawOrganism(maybeOrganism);
            images.push(gaCanvas.toDataURL());
        }

        if (generation % 40 === 0 && maybeOrganism.score) {
            console.log('Score %o - Dna length %o ', maybeOrganism.score, maybeOrganism.dna.length);
        }
    }

    return generation > 12000;
}

(window as any).playMoveClick = () => {
    console.log('playing..');
    currentImageIndex = 0;

    drawImages();
};

const drawImages = () => {
    const img: any = document.querySelector('#imagePlayback');
    img.src = images[currentImageIndex++];

    if (currentImageIndex < images.length) {
        setTimeout(function () {
            drawImages();
        }, 16);
    } else {
        console.log('done');
    }
}

const args: GAOptions<Dna> = {
    generateRandomOrganism,
    scoreOrganism,
    crossoverDnas,
    mutateDna,
    isDoneEvolving
};

(window as any).start(function (newValue: any) {
    imageData = newValue;
    if (newValue) {
        gaCanvas = document.querySelector('#gaCanvas');
        evolveSolution(args);

        const img: any = document.querySelector('#imagePlayback');
        img.src = images[0];
    }
});