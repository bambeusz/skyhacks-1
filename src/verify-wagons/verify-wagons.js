const jsdom = require('jsdom');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const json2csv = require('./json2csv');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>track</title>

    <script src="build/tracking.js"></script>

    <style>
        #gap {
            display: none;
        }

        .demo-container {
            position: relative;
            overflow: hidden;
        }

        #image {
            position: absolute;
            top: -100%;
        }
    </style>
</head>
<body>

<div class="demo-frame">
    <div class="demo-container">
        <img id="image" src="./Validation/0_54/0_54_left/0_54_left_31.jpg" />
        <canvas id="canvas"></canvas>
        <div id="gap"></div>
    </div>
</div>

</body>
</html>`;

const dom = new jsdom.JSDOM(html, { runScripts: "dangerously", ProcessExternalResources: ['script', 'img'] });

var window = dom.window;
global.window = window;
global.navigator = window.navigator;
global.document = window.document;
global.tracking = window.tracking || {};

var t = require('tracking');

class SequencePromise {
    constructor(promiseFactories = []) {
        this.factories = promiseFactories;
    }

    execute() {
        return this.factories.reduce((acu, factory) => acu.then(data => factory(data)), Promise.resolve([]))
    }
}

const configR = () => {
    const errorRatio = .15;
    const actualrectSize = {
        w: 20,
        h: 15,
    };
    const searchSize = {
        w: 27,
        h: 24,
    };
    const allowedError = {
        w: actualrectSize.w * errorRatio,
        h: actualrectSize.h * errorRatio,
    };
    const A = { x: 561, y: 341 };
    return {
        A,
        actualrectSize,
        searchSize,
        allowedError,
    };
};
const configL = () => {
    const errorRatio = .15;
    const actualrectSize = {
        w: 20,
        h: 20,
    };
    const searchSize = {
        w: 27,
        h: 26,
    };
    const allowedError = {
        w: actualrectSize.w * errorRatio,
        h: actualrectSize.h * errorRatio,
    };
    const A = { x: 635, y: 329 };
    return {
        A,
        actualrectSize,
        searchSize,
        allowedError,
    };
};

const verify = (basePath, frame) => {
    const left = frame.split('_').findIndex(part => part === 'left') !== -1;
    const { actualrectSize, A, searchSize, allowedError } = left ? configL() : configR();

    return loadImage(basePath)
        .then(image => {
            const width = image.width;
            const height = image.height;
            const gap = document.getElementById('gap');
            gap.innerText = 'false';
            const canvas = createCanvas(width, height);
            const context = canvas.getContext('2d');

            tracking.Fast.THRESHOLD = 25;
            context.drawImage(image, 0, 0, width, height);

            const imageData = context.getImageData(A.x, A.y, searchSize.w, searchSize.h);
            const gray = tracking.Image.grayscale(imageData.data, searchSize.w, searchSize.h);
            const corners = tracking.Fast.findCorners(gray, searchSize.w, searchSize.h);

            for (let i = 0; i < gray.length; i++) {
                imageData.data[i] = gray[i];
            }

            const coordinates = corners.reduce((acu, corner, index) => {
                if (index % 2 === 0) {
                    return {
                        ...acu,
                        x: [
                            ...acu.x,
                            corner,
                        ],
                    };
                }
                return {
                    ...acu,
                    y: [
                        ...acu.y,
                        corner,
                    ],
                };
            }, {x: [], y: []});

            const top = Math.min(...coordinates.y);
            const left = Math.min(...coordinates.x);
            const right = Math.max(...coordinates.x);
            const bottom = Math.max(...coordinates.y);

            const w = Math.abs(left - right);
            const h = Math.abs(top - bottom);

            return {
                frame: frame,
                gap: (Math.abs(w - actualrectSize.w) <= allowedError.w && Math.abs(h - actualrectSize.h) <= allowedError.h),
            };
        });
};

const getFrameFactories = (baseURL, frames) => {
    return frames
        .sort((a, b) => {
            const partsA = a.split('_');
            const partsB = b.split('_');
            if (parseInt(partsA[partsA.length - 1]) > parseInt(partsB[partsB.length -1])) {
                return 1;
            }

            return -1;
        })
        .map(frame => (frameData) => {
            const dir = baseURL + '/' + frame;
            if (!fs.existsSync(dir)) {
                return Promise.resolve(frameData);
            }

            return verify(dir, frame)
                .then(frame => {
                    return [...frameData, frame];
                });
        });
};

const getSideFactories = (baseURL, sides) => {
    return sides
        .map(side => (sideData) => {
            const dir = baseURL + '/' + side;
            if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
                return Promise.resolve(sideData);
            }

            const frames = fs.readdirSync(dir);
            const framesFactories = getFrameFactories(dir, frames);
            return new SequencePromise(framesFactories).execute()
                .then(frames => {
                    console.log('side done', side, new Date().toISOString());
                    return [...sideData, frames];
                });
        });
};
const getTrainFactories = (baseURL, trains) => {
    return trains
        .sort((a, b) => {
            const partsA = a.split('_');
            const partsB = b.split('_');
            if (parseInt(partsA[partsA.length - 1]) > parseInt(partsB[partsB.length -1])) {
                return 1;
            }

            return -1;
        })
        .map((train) => (trainData) => {
            const dir = baseURL + '/' + train;
            if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()){
                return Promise.resolve(trainData);
            }

            const sides = fs.readdirSync(dir);
            const sideFactories = getSideFactories(dir, sides);

            return new SequencePromise(sideFactories).execute()
                .then((sides) => {
                    console.log('train done', train, new Date().toISOString());
                    return [...trainData, sides];
                });
        });
};

const getContainingFactories = (baseURL, containingPaths) => {
    return containingPaths
        .map(containingPath => (containingPathData) => {
            const dir = baseURL + '/' + containingPath;
            if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
                return Promise.resolve(containingPathData);
            }

            const trains = fs.readdirSync(dir);
            const trainFactories = getTrainFactories(dir, trains);

            return new SequencePromise(trainFactories).execute()
                .then(data => {
                    console.log('containing path done', containingPath, new Date().toISOString());
                    return [...containingPathData, ...data];
                });
        })
};

window.addEventListener('load', () => {
    const start = new Date().toISOString();
    console.log('started', start);
    const containingPaths = ['Validation', 'Special', 'Training'];
    const containingPathsFactories = getContainingFactories(__dirname + '/footage', containingPaths);

    new SequencePromise(containingPathsFactories).execute()
        .then((data) => {
            fs.writeFileSync(__dirname + '/data.json', JSON.stringify(data), 'utf-8');
            console.log('started', start, 'ended', new Date().toISOString());
            json2csv();
        });
});
