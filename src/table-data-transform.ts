import type * as d3 from 'd3';
import type {
    MergeColumnsTransform, RenameColumnsTransform
} from './MetaTable';
import {Datum} from "gosling.js/dist/src/core/gosling.schema";


/**
 * Apply filter
 */
export function mergeData(transform: MergeColumnsTransform, data: Datum[]) {
    const {fields, mergeChar, newField} = transform;
    const output = Array.from(data);
    output.forEach(d => {
        const values = fields.map(f => d[f]).filter(v => v !== "" && v !== undefined && v !== null);
        d[newField] = values.length>0?values.reduce((a, v) => a + mergeChar + v):"";
    })
    return (output);
}


export function renameColumns(transform: RenameColumnsTransform, data: Datum[]) {
    const {fields, newFields} = transform;
    const output: Datum[] = data.map(d => {
        const returnObj = {};
        Object.keys(d).forEach(key => {
            const fieldIndex = fields.indexOf(key);
            if (fieldIndex === -1) {
                returnObj[key] = d[key]
            } else {
                returnObj[newFields[fieldIndex]] = d[key]
            }
        })
        return (returnObj)
    })
    return (output);
}

