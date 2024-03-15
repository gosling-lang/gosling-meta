import {Datum} from "gosling.js/dist/src/gosling-schema";
import {tableDataTransform} from "./MetaTable";
import React, {useMemo} from "react";
import {transformData} from "./table-data-transform";
import {VegaLiteBarchart} from "./VegaLiteBarchart";
import {VegaLiteBoxPlot} from "./VegaLiteBoxplot";
import {rangeFilter} from "./data-filter";
import {VegaLiteOwnSpec} from "./VegaLiteOwnSpec";
import {VegaLiteHistogram} from "./VegaLiteHist";
import {TopLevelSpec} from "vega-lite";

export type ColumnSummarizerSpec = {
    type: "summary",
    dataTransform?: tableDataTransform[];
    targetColumn: string;
    genomicColumns: [string] | [string, string];
    plotType: 'hist' | 'boxplot' | 'bar' | 'own';
    vegaLiteSpec?: TopLevelSpec;
    dataId: string;
}

interface ColumnSummarizerProps extends Omit<ColumnSummarizerSpec, 'type' | 'dataId'> {
    data: Datum[];
    range: [{ chromosome: string, position: number }, {
        chromosome: string,
        position: number
    }];
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
        genomicColumns,
        range,
        vegaLiteSpec
    } = props;
    const transformedData = useMemo(() => {
        if (dataTransform) {
            let dataTransformed: Datum[] = Array.from(data);
            dataTransform.forEach(transform => {
                dataTransformed = transformData(transform, rangeFilter(data, genomicColumns, range));
            })
            return (dataTransformed);
        } else return rangeFilter(data, genomicColumns, range);
    }, [dataTransform, data, genomicColumns, range]);
    const dataValues = useMemo(() => {
        if (plotType === "bar") {
            return [...new Set(data.map(d => String(d[targetColumn])))].sort().filter(d => d != "")
        } else return [];
    }, [data, targetColumn])
    switch (plotType) {
        case "bar":
            return <VegaLiteBarchart data={transformedData} field={targetColumn}
                                     sort={dataValues}
                                     width={Number(width)}
                                     height={Number(height)}/>
        case "hist":
            return <VegaLiteHistogram data={transformedData} field={targetColumn}
                                      width={Number(width)}
                                      height={Number(height)}/>
        case "boxplot":
            return <VegaLiteBoxPlot data={transformedData} field={targetColumn} width={Number(width)}
                                    height={Number(height)}/>;
        case "own":
            if (vegaLiteSpec) {
                return <VegaLiteOwnSpec data={transformedData} spec={vegaLiteSpec}/>
            } else return null;
    }

}