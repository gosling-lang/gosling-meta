import { VegaLite } from 'react-vega';
import React from 'react';
import { Datum } from 'gosling.js/dist/src/gosling-schema';
import { TopLevelSpec } from 'vega-lite';

interface VegaLiteBoxplotProps {
    data: Datum[];
    field: string;
    width: number;
    height: number;
}

export function VegaLiteBoxPlot(props: VegaLiteBoxplotProps) {
    const { data, field, width, height } = props;
    const spec: TopLevelSpec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        data: { values: data },
        mark: 'boxplot',
        width: width,
        height: height,
        autosize: {
            type: 'fit',
            contains: 'padding'
        },
        encoding: {
            y: {
                field: field,
                type: 'quantitative',
                scale: { zero: false }
            }
        }
    };

    return <VegaLite spec={spec} />;
}
