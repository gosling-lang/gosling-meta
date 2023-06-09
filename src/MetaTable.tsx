import React, {useCallback, useEffect, useState} from 'react';
import {mergeData, renameColumns} from "./table-data-transform";
import {DataDeep, Datum} from "gosling.js/dist/src/core/gosling.schema";
import {GoslingRef} from "gosling.js";

export type MetaTableSpec = {
    type: "table",
    // TODO: allow custom data specification for metatable
    data?: DataDeep;
    dataTransform: tableDataTransform[];
    genomicColumns: [string,string] | [string];
    columns?: string[];
}

interface MetaTableProps extends Omit<MetaTableSpec, 'type' | 'data'> {
    data?: Datum[];
    gosRef: React.RefObject<GoslingRef>;
    linkedTrack: string;
    width: number | string;
    height: number | string;
}

export type tableDataTransform =
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
    const { dataTransform, gosRef, linkedTrack, genomicColumns, columns, width, height} = props;
    const [dataInRange, setDataInRange] = useState<Datum[]>([]);
    const [columnNames, setColumnNames]=useState<string[]>([])
    const transformData = useCallback((data)=>{
         let dataTransformed: Datum[] = Array.from(data);
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
        return(dataTransformed);
    },[dataTransform]);
    useEffect(() => {
        if (gosRef.current == null) return;
        // TODO Better: Use a brush event in gosling.js (related issue: #910)
        gosRef.current.api.subscribe('rawData', (type, rawdata) => {
            if(rawdata.data.length > 0 && rawdata.id === linkedTrack) {
                // TODO remove next two lines when rawdata event is adapted (related issues: #909, #894)
                // gets the column names after applying transformations
                const transformedColumns=Object.keys(transformData([rawdata.data[0]])[0])
                const tableKeys = columns && columns.length > 0 ? columns : transformedColumns;
                setColumnNames(tableKeys);
                const range = gosRef.current?.hgApi.api.getLocation(linkedTrack).xDomain;
                // TODO remove column check when rawdata event is adapted (related issues: #909, #894)
                if (tableKeys.every((col) => transformedColumns.includes(col))) {
                    let dataInRange: Datum[] = [];
                    // features have start and end
                    if (genomicColumns.length === 2) {
                        const start = genomicColumns[0];
                        const end = genomicColumns[1];
                        dataInRange = rawdata.data.filter(
                            entry =>
                                (entry[start] > range[0] && entry[start] < range[1]) ||
                                (entry[end] > range[0] && entry[end] < range[1])
                        );
                        // features have only start (point features)
                    } else {
                        const position = genomicColumns[0];
                        dataInRange = rawdata.data.filter(
                            entry => entry[position] > range[0] && entry[position] < range[1]
                        );
                    }
                    const uniqueInRange = dataInRange.filter(
                        (v, i, a) => a.findIndex(v2 => v2['Gene name'] === v['Gene name']) === i
                    );
                    setDataInRange(transformData(uniqueInRange));
                }
            }
        });
        return () => {
            gosRef.current?.api.unsubscribe('rawData');
        };
    }, []);

    return (
        <>
            {dataInRange.length === 0 ? null : (
                <div
                    style={{
                        height,
                        overflowY: 'scroll',
                        display: 'inline-block',
                        width: Number(width) - 10,
                    }}
                >
                    <table className="table-fixed border-collapse border border-slate-400">
                        <thead className="capitalize">
                        <tr className="border border-slate-300  bg-slate-100">
                            {columnNames.map(d => (
                                <th className="px-1" key={d}>
                                    {d}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {dataInRange.map(d => (
                            <tr className="border border-slate-300" key={d['Gene name']}>
                                {columnNames.map(key => {
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
