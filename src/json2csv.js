const fs = require('fs');

const teamName = 'kosmicznispawacze';

const transform = () => {
    const trains = JSON.parse(fs.readFileSync(__dirname + '/data.json'));
    trains.forEach(sides => {
        sides.forEach(frames => {
            let lastgap = false;
            let wagon = 0;
            let starting = true;
            const header = ['team_name','train_number','left_right','frame_number','wagon','uic_0_1','uic_label'].join(',');
            const csv = [header, ...frames.map((frame, i) => {
                const ending = !(i + 1 < frames.length && frame.gap !== frames[i + 1].gap);
                const [zero, train, side, frameWithExtension, ...rest] = frame.frame.split('_');
                const framenumber = frameWithExtension.split('.')[0];
                if (!frame.gap) {
                    starting = false;
                }

                if (!lastgap && frame.gap && !starting && !ending) {
                    wagon++;
                }

                if (lastgap !== frame.gap && !ending) {
                    lastgap = frame.gap;
                }

                return [teamName, train, side, framenumber, wagon, wagon === 0 ? 'locomotive' : 0, 0].join(',');
            })]
                .join('\n');
            const [ zero, train, side, ...rest ] = frames[0].frame.split('_');

            const fileName = [teamName, train, side].join('_');
            fs.writeFileSync(__dirname + '/csv/' + fileName + '.csv', csv);
        });
    });
};

module.exports = transform;

