import React, { useCallback, useEffect, useState } from 'react';
import { type GoslingSpec } from 'gosling.js';
import { MetaTableSpec } from './MetaTable';
import SpecDisplay from './SpecDisplay';
import 'higlass/dist/hglib.css';
import './index.css';
import { PhyloTreeSpec } from './PhyloTree';
import GoslingComponentWrapper from './GoslingComponentWrapper';
import type { Datum } from 'gosling.js/dist/src/gosling-schema';
import { PartialTrack, Track, View } from 'gosling.js/dist/src/gosling-schema';
import MetaComponentWrapper from './MetaComponentWrapper';
import { ColumnSummarizerSpec } from './ColumnSummarizer';

export type MetaView = (MetaTableSpec | PhyloTreeSpec | ColumnSummarizerSpec) & {
    connectionType: ConnectionType;
};

export interface ConnectionType {
    type: 'weak' | 'strong';
    dataId: string;
    rangeId?: string;
    placeholderId: string;
}

interface MetaViewProps {
    goslingSpec: GoslingSpec;
    metaView: MetaView;
}

/**
 * Main component that renders gosling visualization and metadata visualization.
 * @param props
 * @returns
 */
export default function MetaView(props: MetaViewProps) {
    const { goslingSpec, metaView } = props;
    const [goslingSpecUpdateable, setGoslingSpec] = useState(structuredClone(goslingSpec));
    const [metaDimensions, setMetaDimensions] = useState({ x: 0, y: 0, width: 100, height: 100 });
    // range of data relevant for the meta visualization
    const [range, setRange] = useState<
        [
            { chromosome: string; position: number },
            {
                chromosome: string;
                position: number;
            }
        ]
    >([
        { chromosome: '', position: 0 },
        { chromosome: '', position: 0 }
    ]);
    const [zoomTo, setZoomTo] = useState<
        [
            { chromosome: string; position: number },
            {
                chromosome: string;
                position: number;
            }
        ]
    >([
        { chromosome: '', position: 0 },
        { chromosome: '', position: 0 }
    ]);
    const [genomicFields, setGenomicFields] = useState();
    const [chromosomeField, setChromosomeField] = useState();
    const traverseTracks = useCallback(
        (spec: GoslingSpec | View | PartialTrack, callback: (t: Partial<Track>) => void) => {
            if ('tracks' in spec) {
                spec.tracks.forEach(t => {
                    callback(t);
                    traverseTracks(t, callback);
                });
            } else if ('views' in spec) {
                spec.views.forEach(t => {
                    callback(t);
                    traverseTracks(t, callback);
                });
            }
        },
        []
    );
    useEffect(() => {
        traverseTracks(goslingSpec, (viewSpec: GoslingSpec | View | PartialTrack) => {
            if (viewSpec.id === metaView.connectionType.dataId) {
                setChromosomeField(viewSpec.data.chromosomeField);
                setGenomicFields(viewSpec.data.genomicFields);
            }
        });
    }, [goslingSpec, metaView]);

    // data relevant for the meta visualization
    const [data, setData] = useState<Datum[]>([]);
    return (
        <div>
            <div style={{ display: 'inline-block' }}>
                {genomicFields ? (
                    <div id="metavis-component-wrapper">
                        <MetaComponentWrapper
                            metaView={metaView}
                            goslingSpec={goslingSpec}
                            genomicColumns={genomicFields}
                            chromosomeField={chromosomeField ? chromosomeField : ''}
                            setGoslingSpec={setGoslingSpec}
                            data={data}
                            range={range}
                            height={metaDimensions.height}
                            width={metaDimensions.width}
                            setZoomTo={setZoomTo}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
