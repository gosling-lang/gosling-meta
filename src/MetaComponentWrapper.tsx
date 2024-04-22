import React from 'react';
import { GoslingSpec } from 'gosling.js';
import type { Datum } from 'gosling.js/dist/src/gosling-schema';
import MetaTable, { MetaTableSpec } from './MetaTable';
import PhyloTree, { PhyloTreeSpec } from './PhyloTree';
import ColumnSummarizer, { ColumnSummarizerSpec } from './ColumnSummarizer';

export type MetaView = (MetaTableSpec | PhyloTreeSpec | ColumnSummarizerSpec) & {
    connectionType: ConnectionType;
};

export interface ConnectionType {
    type: 'weak' | 'strong';
    dataId: string;
    rangeId?: string;
    placeholderId: string;
}

interface MetaComponentWrapperProps {
    metaView: MetaView;
    goslingSpec: GoslingSpec;
    chromosomeField: string;
    genomicColumns: [string] | [string, string];
    setGoslingSpec: (object) => void;
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
        ],
        id: string
    ) => void;
}

/**
 * Wrapper for gosling component
 * @param props
 * @returns
 */
export default function MetaComponentWrapper(props: MetaComponentWrapperProps) {
    const {
        metaView,
        goslingSpec,
        chromosomeField,
        genomicColumns,
        setGoslingSpec,
        data,
        range,
        height,
        width,
        setZoomTo
    } = props;
    let view: React.ReactElement | null = null;
    switch (metaView.type) {
        case 'table':
            view = (
                <MetaTable
                    dataTransform={metaView.dataTransform}
                    range={range}
                    data={data}
                    genomicColumns={genomicColumns}
                    chromosomeField={chromosomeField}
                    metadataColumns={metaView.metadataColumns}
                    width={width}
                    height={height}
                    setZoomTo={zoomTo => setZoomTo(zoomTo, metaView.connectionType.rangeId)}
                    linkageType={metaView.linkageType}
                />
            );
            break;
        case 'tree':
            view = (
                <PhyloTree
                    dataUrl={metaView.data.url}
                    gosSpec={goslingSpec}
                    setGoslingSpec={setGoslingSpec}
                    dataId={metaView.connectionType.dataId}
                    width={width}
                    height={height}
                />
            );
            break;
        case 'summary':
            view = (
                <ColumnSummarizer
                    range={range}
                    data={data}
                    genomicColumns={genomicColumns}
                    width={width}
                    height={height}
                    dataTransform={metaView.dataTransform}
                    targetColumn={metaView.targetColumn}
                    vegaLiteSpec={metaView.vegaLiteSpec}
                    plotType={metaView.plotType}
                />
            );
    }
    return (
        <div id="meta-component-wrapper" style={{ marginTop: 46 }}>
            {view}
        </div>
    );
}
