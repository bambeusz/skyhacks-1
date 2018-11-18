const fs = require('fs');

const uicNumbers = fs.readdirSync(__dirname + '/data');

uicNumbers.forEach(uicNumber => {
    const csv = fs.readFileSync(__dirname + '/csv/kosmicznispawacze_64_left.csv', 'utf-8');
    const number = fs.readFileSync(__dirname + '/data/' + uicNumber, 'utf-8');
    const newCsv = csv.split('\n').map((row, index) => {
        const frameNumber = index - 1;
        const [zero, wagon, side, frameWithExt] = uicNumber.split('_');
        const frame = parseInt(frameWithExt.split('.')[0]);
        if (frameNumber !== frame) {
            return row;
        }

        const [team, w, s, f, wagonCount, uic01, uicLabel] = row.split(',');
        return [team, w, s, f, wagonCount, '1', number].join(',');
    }).join('\n');
    fs.writeFileSync(__dirname + '/csv/kosmicznispawacze_64_left.csv', newCsv, 'utf-8');
});
