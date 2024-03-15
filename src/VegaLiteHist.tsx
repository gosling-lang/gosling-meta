import {VegaLite} from "react-vega";
import React from "react";
import {Datum} from "gosling.js/dist/src/gosling-schema";

interface VegaLiteHistogramProps {
    data: Datum[];
    field: string;
    sort?: string[];
    width: number;
    height: number;
}

export function VegaLiteHistogram(props: VegaLiteHistogramProps) {
    const {data, field, sort, width, height} = props;
    const schema = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {"values": data},
        "mark": "bar",
        "width": width,
        "height": height,
        "autosize": {
            "type": "fit",
            "contains": "padding"
        },
        "encoding": {
            "x": {
                "bin": true,
                "field": field,
            },
            "y": {
                "aggregate": "count",
            }
        }
    }
    return <VegaLite spec={schema}/>
}