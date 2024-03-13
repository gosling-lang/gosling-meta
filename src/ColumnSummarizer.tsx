import {Datum} from "gosling.js/dist/src/gosling-schema";
import {tableDataTransform} from "./MetaTable";
import React, {useMemo} from "react";
import {transformData} from "./table-data-transform";
import {VegaLiteBarchart} from "./VegaLiteBarchart";
import {VegaLiteBoxPlot} from "./VegaLiteBoxplot";

export type ColumnSummarizerSpec = {
    type: "summary",
    dataTransform: tableDataTransform[];
    targetColumn: 'string';
    plotType: 'hist' | 'boxplot' | 'bar' | 'own';
    vegaLiteSpec?: 'string';
    dataId: string;
}

interface ColumnSummarizerProps extends Omit<ColumnSummarizerSpec, 'type' | 'dataId'> {
    data: Datum[];
    width: number | string;
    height: number | string;


}

export default function ColumnSummarizer(props: ColumnSummarizerProps) {
    const {
        data,
        dataTransform,
        width,
        height,
        plotType,
        targetColumn,
        vegaLiteSpec
    } = props;
    const transformedData = useMemo(() => {
        if (dataTransform) {
            let dataTransformed: Datum[] = Array.from(data);
            dataTransform.forEach(transform => {
                dataTransformed = transformData(transform, data);
            })
            return (dataTransformed);
        } else return data;
    }, [dataTransform, data]);
    switch (plotType) {
        case "bar":
            return <VegaLiteBarchart data={transformedData} field={targetColumn} isNumerical={false}
                                     width={Number(width)}
                                     height={Number(height)}/>
        case "hist":
            return <VegaLiteBarchart data={transformedData} field={targetColumn} isNumerical={true}
                                     width={Number(width)}
                                     height={Number(height)}/>
        case "boxplot":
            return <VegaLiteBoxPlot data={transformedData} field={targetColumn} width={Number(width)}
                                    height={Number(height)}/>;
        case "own":
            return null;
    }

}