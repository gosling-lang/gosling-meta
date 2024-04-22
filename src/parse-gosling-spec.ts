import { GoslingSpec } from 'gosling.js';
import { PartialTrack, Track, View } from 'gosling.js/dist/src/gosling-schema';

// track should be asssociated with
// genomic fileds, chromosome field
// genomic range
function traverseTracks(
    spec: GoslingSpec | View | PartialTrack,
    obj,
    data,
    count,
    callback: (t: { [key: number]: Partial<Track> | View }) => void
) {
    let localData = data;
    count++;
    if ('tracks' in spec) {
        spec.tracks.forEach(t => {
            if ('data' in t) {
                localData = t.data;
            }
            if ('id' in t) {
                obj[t.id] = { data: localData };
            }
            traverseTracks(t, obj, localData, count, callback);
        });
    }
    if ('views' in spec) {
        spec.views.forEach(t => {
            if ('data' in t) {
                localData = t.data;
            }
            if ('id' in t) {
                obj[t.id] = { data: localData };
            }
            traverseTracks(t, obj, localData, count, callback);
        });
    }
    count--;
    if (count === 0) callback(obj);
}

export function parseGoslingSpec(spec, callback) {
    traverseTracks(spec, {}, {}, 0, callback);
}
