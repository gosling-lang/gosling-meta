import { Datum } from 'gosling.js/dist/src/gosling-schema';

export const rangeFilter = function (data, genomicColumns, range) {
    let inRange: Datum[];
    // features have start and end
    if (genomicColumns.length === 2) {
        const start = genomicColumns[0];
        const end = genomicColumns[1];
        inRange = data.filter(
            entry =>
                (Number(entry[start]) > range[0].position && Number(entry[start]) < range[1].position) ||
                (Number(entry[end]) > range[0].position && Number(entry[end]) < range[1].position)
        );
        // features have only start (point features)
    } else {
        const position = genomicColumns[0];
        inRange = data.filter(
            entry => Number(entry[position]) > range[0].position && Number(entry[position]) < range[1].position
        );
    }
    const uniqueInRange = inRange.filter(
        (v, i, a) => a.findIndex(v2 => JSON.stringify(v2) === JSON.stringify(v)) === i
    );
    return uniqueInRange;
};
