import {VegaLite} from "react-vega";
import React from "react";
import {Datum} from "gosling.js/dist/src/gosling-schema";

interface VegaLiteBarchartProps {
    data: Datum[];
    field: string;
    isNumerical: boolean;
    width: number;
    height: number;
}

export function VegaLiteBarchart(props: VegaLiteBarchartProps) {
    const {data, field, isNumerical, width, height} = props;
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
                "bin": isNumerical,
                "field": field
            },
            "y": {"aggregate": "count", "field": field}
        }
    }
    return <VegaLite spec={schema}/>
}