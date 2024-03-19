import React from 'react';
import { GoslingSpec } from 'gosling.js';
import type { Datum } from 'gosling.js/dist/src/gosling-schema';
import MetaTable from './MetaTable';
import PhyloTree from './PhyloTree';
import { MetaSpec } from './GoslingMetaComponent';
import ColumnSummarizer from './ColumnSummarizer';

interface MetaComponentWrapperProps {
    metaSpec: MetaSpec;
    goslingSpec: GoslingSpec;
    chromosomeField: string;
    genomicColumns: [string] | [string, string];
    setGoslingSpec: (object) => void;
    dataId: string;
    data: Datum[];
    range: [
        { chromosome: string; position: number },
        {
            chromosome: string;
            position: number;
        }
    ];
    height: number;
    width: number;
    setZoomTo: (
        range: [
            { chromosome: string; position: number },
            {
                chromosome: string;
                position: number;
            }
        ]
    ) => void;
}

/**
 * Wrapper for gosling component
 * @param props
 * @returns
 */
export default function MetaComponentWrapper(props: MetaComponentWrapperProps) {
    const {
        metaSpec,
        goslingSpec,
        chromosomeField,
        genomicColumns,
        setGoslingSpec,
        dataId,
        data,
        range,
        height,
        width,
        setZoomTo
    } = props;
    let metaView: React.ReactElement | null = null;
    switch (metaSpec.type) {
        case 'table':
            metaView = (
                <MetaTable
                    dataTransform={metaSpec.dataTransform}
                    range={range}
                    data={data}
                    genomicColumns={genomicColumns}
                    chromosomeField={chromosomeField}
                    metadataColumns={metaSpec.metadataColumns}
                    width={width}
                    height={height}
                    setZoomTo={setZoomTo}
                    linkageType={metaSpec.linkageType}
                />
            );
            break;
        case 'tree':
            metaView = (
                <PhyloTree
                    dataUrl={metaSpec.data.url}
                    gosSpec={goslingSpec}
                    setGoslingSpec={setGoslingSpec}
                    dataId={dataId}
                    width={width}
                    height={height}
                />
            );
            break;
        case 'summary':
            metaView = (
                <ColumnSummarizer
                    range={range}
                    data={data}
                    genomicColumns={genomicColumns}
                    width={width}
                    height={height}
                    dataTransform={metaSpec.dataTransform}
                    targetColumn={metaSpec.targetColumn}
                    vegaLiteSpec={metaSpec.vegaLiteSpec}
                    plotType={metaSpec.plotType}
                />
            );
    }
    return <div style={{ marginTop: 46 }}>{metaView}</div>;
}
