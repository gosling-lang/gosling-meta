import React, {useCallback, useMemo} from 'react';
import {transformData} from "./table-data-transform";
import type {Datum, DataDeep} from 'gosling.js/dist/src/gosling-schema';
import TanStackTable from "./TanStackTable";
import {rangeFilter} from "./data-filter";

export type MetaTableSpec = {
    type: "table",
    dataTransform: tableDataTransform[];
    genomicColumns: [string] | [string, string];
    chromosomeField: string;
    metadataColumns: { type: 'genomic' | 'nominal' | 'quantitative', columnName: string, columnFormat?: string }[];
    linkageType: 'jump' | 'window';    // jump: Click button in the table to jump to a gene in the visualization, window: The table shows only the selected range in the visualization
    dataId: string;

}

interface MetaTableProps extends Omit<MetaTableSpec, 'type' | 'data' | 'dataId' | 'chromosomeField'> {
    data: Datum[];
    range: [{ chromosome: string, position: number }, {
        chromosome: string,
        position: number
    }]
    width: number | string;
    height: number | string;
    setZoomTo: (range: [{ chromosome: string, position: number }, {
        chromosome: string,
        position: number
    }]) => void;
}

export type tableDataTransform =
    | MergeColumnsTransform
    | RenameColumnsTransform
    | DeriveColumnTransform;

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

export interface DeriveColumnTransform {
    type: 'derive',
    operator: 'subtract' | 'add' | 'multiply' | 'divide',
    fields: [string, string],
    newField: string
}

/**
 * Metadata table component
 * @param props
 * @constructor
 */
export default function MetaTable(props: MetaTableProps) {
    const {
        data,
        range,
        dataTransform,
        genomicColumns,
        metadataColumns,
        linkageType,
        width,
        height,
        setZoomTo
    } = props;
    const transformTableData = useCallback((data) => {
        if (dataTransform) {
            let dataTransformed: Datum[] = Array.from(data);
            dataTransform.forEach(transform => {
                dataTransformed = transformData(transform, data);
            })
            return (dataTransformed);
        } else return data;
    }, [dataTransform]);
    const dataInRange = useMemo(() => {
        switch (linkageType) {
            case "window":
                return transformTableData(rangeFilter(data, genomicColumns, range));
            case "jump":
                return transformTableData(data);
        }

    }, [genomicColumns, data, range])
    const columnNames = useMemo(() => {
        return metadataColumns.map(d => d.columnName) ?? (dataInRange.length > 0 ? Object.keys(dataInRange[0]) : []);
    }, [metadataColumns, dataInRange])
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
                    <TanStackTable data={dataInRange} columnNames={columnNames} isSortable={true} isJumpable={true}
                                   jump={setZoomTo}/>
                </div>
            }
        </>
    );
}
