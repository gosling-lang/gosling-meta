import { VegaLite } from 'react-vega';
import React from 'react';
import { Datum } from 'gosling.js/dist/src/gosling-schema';
import { TopLevelSpec } from 'vega-lite';

interface VegaLiteBarchartProps {
    data: Datum[];
    field: string;
    sort: string[];
    width: number;
    height: number;
}

export function VegaLiteBarchart(props: VegaLiteBarchartProps) {
    const { data, field, sort, width, height } = props;
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
        transform: [
            {
                filter: { not: { field: field, equal: '' } }
            },
            {
                aggregate: [{ op: 'count', field: field, as: 'count' }],
                groupby: [field]
            },
            {
                impute: 'count',
                key: field,
                keyvals: sort,
                value: 0
            }
        ],
        encoding: {
            x: {
                field: field,
                sort: sort
            },
            y: {
                field: 'count',
                type: 'quantitative'
            }
        }
    };
    return <VegaLite spec={spec} />;
}
