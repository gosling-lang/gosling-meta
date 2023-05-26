import React from 'react';
import {mergeData, renameColumns} from "./table-data-transform";
import {Datum} from "gosling.js/dist/src/core/gosling.schema";

export interface MetaTableProps {
    type: "table",
    data: Datum[]; // this type seems to be incorrect
    dataTransform: dataTransform[];
    columns: string[];
    width: number | string;
    height: number | string;
}

type dataTransform =
    | MergeColumnsTransform
    | RenameColumnsTransform;

export interface MergeColumnsTransform {
    type: 'merge';
    fields: string[];
    mergeChar: string;
    newField: string;
}


export interface RenameColumnsTransform {
    type: 'rename',
    fields: string[];
    newFields: string[];
}


export default function MetaTable(props: MetaTableProps) {
    const {data, dataTransform, columns, width, height} = props;
    let dataTransformed = Array.from(data);
    dataTransform.forEach(transform => {
        switch (transform.type) {
            case("merge"):
                dataTransformed = mergeData(transform, data);
                break;
            case("rename"):
                dataTransformed = renameColumns(transform, data);
                break;
        }
    })
    // ...
    const tableKeys = columns.length > 0 ? columns : dataTransformed.length > 0 ? Object.keys(dataTransformed[0]) : [];
    // ...

    return (
        <>
            {data.length === 0 ? null : (
                <div
                    style={{
                        height,
                        overflowY: 'scroll',
                        display: 'inline-block',
                        width: Number(width)-10,
                    }}
                >
                    <table className="table-fixed border-collapse border border-slate-400">
                        <thead className="capitalize">
                        <tr className="border border-slate-300  bg-slate-100">
                            {tableKeys.map(d => (
                                <th className="px-1" key={d}>
                                    {d}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {dataTransformed.map(d => (
                            <tr className="border border-slate-300" key={d['Gene name']}>
                                {tableKeys.map(key => {
                                    return (
                                        <td className="px-1" key={key}>
                                            {d[key]}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
