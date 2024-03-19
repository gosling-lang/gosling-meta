import { VegaLite } from 'react-vega';
import React from 'react';
import { Datum } from 'gosling.js/dist/src/gosling-schema';
import { TopLevelSpec } from 'vega-lite';

interface VegaLiteHistogramProps {
    data: Datum[];
    field: string;
    width: number;
    height: number;
}

export function VegaLiteHistogram(props: VegaLiteHistogramProps) {
    const { data, field, width, height } = props;
    const spec: TopLevelSpec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        data: { values: data },
        mark: 'bar',
        width: width,
        height: height,
        autosize: {
            type: 'fit',
            contains: 'padding'
        },
        encoding: {
            x: {
                bin: true,
                field: field
            },
            y: {
                aggregate: 'count'
            }
        }
    };
    return <VegaLite spec={spec} />;
}
