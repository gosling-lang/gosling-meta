import { VegaLite } from 'react-vega';
import React, { useEffect, useState } from 'react';
import { Datum } from 'gosling.js/dist/src/gosling-schema';
import { TopLevelSpec } from 'vega-lite';

interface VegaLiteOwnSpecProps {
    data: Datum[];
    spec: TopLevelSpec;
}

export function VegaLiteOwnSpec(props: VegaLiteOwnSpecProps) {
    const { data, spec } = props;
    const [modifiableSpec, setModifiableSpec] = useState(spec);
    useEffect(() => {
        const newSpec = structuredClone(spec);
        newSpec['data'] = { values: data };
        setModifiableSpec(newSpec);
    }, [spec, data]);
    return <VegaLite spec={modifiableSpec} />;
}
