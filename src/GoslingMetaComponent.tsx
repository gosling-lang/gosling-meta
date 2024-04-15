import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type GoslingSpec } from 'gosling.js';
import SpecDisplay from './SpecDisplay';
import 'higlass/dist/hglib.css';
import './index.css';
import GoslingComponentWrapper from './GoslingComponentWrapper';
import type { Datum } from 'gosling.js/dist/src/gosling-schema';
import { PartialTrack, Track, View } from 'gosling.js/dist/src/gosling-schema';
import MetaComponentWrapper from './MetaComponentWrapper';
import { MetaView } from './MetaView';

export type MetaSpec = {
    views: MetaView[];
};

interface GoslingMetaComponentProps {
    goslingSpec: GoslingSpec;
    metaSpec: MetaSpec;
}

/**
 * Main component that renders gosling visualization and metadata visualization.
 * @param props
 * @returns
 */
export default function GoslingMetaComponent(props: GoslingMetaComponentProps) {
    const { goslingSpec, metaSpec } = props;
    const [goslingSpecUpdateable, setGoslingSpec] = useState(structuredClone(goslingSpec));
    const [metaDimensions, setMetaDimensions] = useState(
        metaSpec.views.map(() => ({ x: 0, y: 0, width: 100, height: 100 }))
    );
    // range of data relevant for the meta visualization
    const [range, setRange] = useState<
        [
            { chromosome: string; position: number },
            {
                chromosome: string;
                position: number;
            }
        ][]
    >([
        [
            { chromosome: '', position: 0 },
            { chromosome: '', position: 0 }
        ]
    ]);
    const [zoomTo, setZoomTo] = useState<
        [
            { chromosome: string; position: number },
            {
                chromosome: string;
                position: number;
            }
        ][]
    >([
        [
            { chromosome: '', position: 0 },
            { chromosome: '', position: 0 }
        ]
    ]);
    const [genomicFields, setGenomicFields] = useState(Array(metaSpec.views.length).fill(undefined));
    const [chromosomeField, setChromosomeField] = useState(Array(metaSpec.views.length).fill(undefined));
    const traverseTracks = useCallback(
        (
            spec: GoslingSpec | View | PartialTrack,
            obj,
            ids,
            callback: (t: { [key: number]: Partial<Track> | View }) => void
        ) => {
            if (Object.keys(obj).length < ids.length) {
                if ('tracks' in spec || 'views' in spec) {
                    spec.tracks.forEach(t => {
                        const idIdx = ids.indexOf(t.id);
                        if (idIdx !== -1) {
                            obj[idIdx] = t;
                        }
                        traverseTracks(t, obj, ids, callback);
                    });
                }
            } else {
                callback(obj);
            }
        },
        []
    );
    const dataIds = useMemo(() => {
        return metaSpec.views.map(d => d.connectionType.dataId);
    }, [metaSpec]);
    const placeholderIds = useMemo(() => {
        return metaSpec.views.map(d => d.connectionType.placeholderId);
    }, [metaSpec]);
    const updateMetaDimensions = useCallback((dimensions, id) => {
        const idIdx = placeholderIds.indexOf(id);
        if (idIdx !== -1) {
            const metaDimensionsLocal = metaDimensions.slice();
            metaDimensionsLocal[idIdx] = dimensions;
            setMetaDimensions(metaDimensionsLocal);
        }
    }, []);
    const updateData = useCallback((data, id) => {
        const idIdx = dataIds.indexOf(id);
        if (idIdx !== -1) {
            if (metaSpec.views[idIdx].connectionType.type === 'weak') {
                const dataLocal = metaDimensions.slice();
                dataLocal[idIdx] = data;
                setData(dataLocal);
            }
        }
    }, []);
    const updateRange = useCallback((data, id) => {
        const idIdx = placeholderIds.indexOf(id);
        if (idIdx !== -1) {
            if (metaSpec.views[idIdx].connectionType.type === 'weak') {
                const rangeLocal = range.slice();
                rangeLocal[idIdx] = data;
                setRange(rangeLocal);
            }
        }
    }, []);
    useEffect(() => {
        traverseTracks(goslingSpec, {}, dataIds, obj => {
            setChromosomeField(dataIds.map((d, i) => obj[i].chromosomeField));
            setGenomicFields(dataIds.map((d, i) => obj[i].genomicFields));
        });
    }, [goslingSpec, metaSpec]);
    const metaViews = metaSpec.views.map((view, i) => (
        <MetaComponentWrapper
            metaView={view}
            goslingSpec={goslingSpec}
            chromosomeField={chromosomeField[i]}
            genomicColumns={genomicFields[i]}
            setGoslingSpec={setGoslingSpec}
            data={data[i]}
            range={range[i]}
            height={metaDimensions[i].height}
            width={metaDimensions[i].width}
            setZoomTo={setZoomTo}
        />
    ));

    // data relevant for the meta visualization
    const [data, setData] = useState<Datum[]>([]);
    return (
        <div>
            <div style={{ display: 'inline-block' }}>
                <div id="gosling-component-wrapper">
                    <GoslingComponentWrapper
                        spec={goslingSpecUpdateable}
                        position={`${zoomTo[0].chromosome}:${zoomTo[0].position}-${zoomTo[1].position}`}
                        setMetaDimensions={updateMetaDimensions}
                        setData={updateData}
                        setRange={updateRange}
                    />
                </div>
                {metaViews}
            </div>
            <SpecDisplay metaSpec={metaSpec} goslingSpec={goslingSpec} />
        </div>
    );
}
