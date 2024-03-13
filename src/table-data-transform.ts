import type {
    MergeColumnsTransform, RenameColumnsTransform, DeriveColumnTransform
} from './MetaTable';
import {Datum} from "gosling.js/dist/src/gosling-schema";


export function transformData(transform,data){
    switch (transform.type){
        case "merge":
            return mergeData(transform,data);
        case "rename":
            return renameColumns(transform,data);
        case "derive":
            return deriveColumn(transform,data);
    }
}
/**
 * Apply filter
 */
export function mergeData(transform: MergeColumnsTransform, data: Datum[]) {
    const {fields, mergeChar, newField} = transform;
    const output = data.map(d => {
        const returnObj: Datum = {};
        const values = fields.map(f => d[f]).filter(v => v !== "" && v !== undefined && v !== null);
        returnObj[newField] = values.length > 0 ? values.reduce((a, v) => a + mergeChar + v) : "";
        Object.keys(d).forEach(key => {
            if (!transform.fields.includes(key)) {
                returnObj[key] = d[key]
            }
        })
        return (returnObj);
    })
    return (output);
}


export function renameColumns(transform: RenameColumnsTransform, data: Datum[]) {
    const {fields, newFields} = transform;
    const output: Datum[] = data.map(d => {
        const returnObj: Datum = {};
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

export function deriveColumn(transform: DeriveColumnTransform, data) {
    const {operator,fields, newField} = transform;
    const output = data.map(d => {
        const returnObj: Datum = {};
        switch (operator) {
            case "add":
                returnObj[newField] = d[fields[0]] + d[fields[1]];
                break;
            case "subtract":
                returnObj[newField] = d[fields[0]] - d[fields[1]];
                break;
            case "multiply":
                returnObj[newField] = d[fields[0]] * d[fields[1]];
                break;
            case "divide":
                returnObj[newField] = d[fields[0]] / d[fields[1]];
                break;
        }
        Object.keys(d).forEach(key => {
            if (!transform.fields.includes(key)) {
                returnObj[key] = d[key]
            }
        })
        return (returnObj);
    })
    return (output);
}
