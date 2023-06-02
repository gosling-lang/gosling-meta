import React, {useCallback, useMemo} from 'react';
import {mergeData, renameColumns} from "./table-data-transform";
import {DataDeep, Datum} from "gosling.js/dist/src/core/gosling.schema";

export type MetaTableSpec = {
    type: "table",
    // TODO: allow custom data specification for metatable
    data?: DataDeep;
    dataTransform: tableDataTransform[];
    genomicColumns: [string, string] | [string];
    columns?: string[];
}

interface MetaTableProps extends Omit<MetaTableSpec, 'type' | 'data'> {
    data: Datum[];
    range: [number, number]
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

/**
 * Metadata table component
 * @param props
 * @constructor
 */
export default function MetaTable(props: MetaTableProps) {
    const {data, range, dataTransform, genomicColumns, columns, width, height} = props;
    const transformData = useCallback((data) => {
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
        return (dataTransformed);
    }, [dataTransform]);
    const dataInRange = useMemo(() => {
        let inRange: Datum[];
        // features have start and end
        if (genomicColumns.length === 2) {
            const start = genomicColumns[0];
            const end = genomicColumns[1];
            inRange = data.filter(
                entry =>
                    (Number(entry[start]) > range[0] && Number(entry[start]) < range[1]) ||
                    (Number(entry[end]) > range[0] && Number(entry[end]) < range[1])
            );
            // features have only start (point features)
        } else {
            const position = genomicColumns[0];
            inRange = data.filter(
                entry => Number(entry[position]) > range[0] && Number(entry[position]) < range[1]
            );
        }
        const uniqueInRange = inRange.filter(
            (v, i, a) => a.findIndex(v2 => JSON.stringify(v2) === JSON.stringify(v)) === i
        );
        return (transformData(uniqueInRange));
    }, [data, range])
    const columnNames = useMemo(() => {
        return columns ?? (dataInRange.length > 0 ? Object.keys(dataInRange[0]) : []);
    }, [columns])
    return (
        <>
            {dataInRange.length === 0 ? null :
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
                            <tr className="border border-slate-300" key={JSON.stringify(d)}>
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
            }
        </>
    );
}
