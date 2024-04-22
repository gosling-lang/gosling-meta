import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type GoslingSpec } from 'gosling.js';
import SpecDisplay from './SpecDisplay';
import 'higlass/dist/hglib.css';
import './index.css';
import GoslingComponentWrapper from './GoslingComponentWrapper';
import type { Datum } from 'gosling.js/dist/src/gosling-schema';
import MetaComponentWrapper, { MetaView } from './MetaComponentWrapper';
import { parseGoslingSpec } from './parse-gosling-spec';

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
    const [goslingParsed, setGoslingParsed] = useState(false);
    const [metaDimensions, setMetaDimensions] = useState(
        metaSpec.views.map(() => ({ x: 0, y: 0, width: 100, height: 100 }))
    );
    // data relevant for the meta visualization
    const [data, setData] = useState<Datum[][]>(metaSpec.views.map(() => []));
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
            string,
            [
                { chromosome: string; position: number },
                {
                    chromosome: string;
                    position: number;
                }
            ]
        ][]
    >([
        [
            '',
            [
                { chromosome: '', position: 0 },
                { chromosome: '', position: 0 }
            ]
        ]
    ]);
    metaSpec.views.forEach(d => {
        if (!d.connectionType.rangeId) {
            d.connectionType.rangeId = d.connectionType.dataId;
        }
    });
    const [genomicFields, setGenomicFields] = useState(Array(metaSpec.views.length).fill(undefined));
    const [chromosomeField, setChromosomeField] = useState(Array(metaSpec.views.length).fill(undefined));
    const dataIds = useMemo(() => {
        return metaSpec.views.map(d => d.connectionType.dataId);
    }, [metaSpec]);
    const placeholderIds = useMemo(() => {
        return metaSpec.views.map(d => d.connectionType.placeholderId);
    }, [metaSpec]);
    const rangeIds = useMemo(() => {
        return metaSpec.views.map(d => d.connectionType.rangeId);
    }, [metaSpec]);
    const updateMetaDimensions = useCallback(
        (dimensions, id) => {
            const idIdx = placeholderIds.indexOf(id);
            if (idIdx !== -1) {
                const metaDimensionsLocal = metaDimensions.slice();
                metaDimensionsLocal[idIdx] = dimensions;
                setMetaDimensions(metaDimensionsLocal);
            }
        },
        [metaDimensions]
    );
    const updateData = useCallback(
        (newData, id) => {
            const idIdx = dataIds.indexOf(id);
            if (idIdx !== -1) {
                if (metaSpec.views[idIdx].connectionType.type === 'weak') {
                    const dataLocal = data.slice();
                    dataLocal[idIdx] = newData;
                    setData(dataLocal);
                }
            }
        },
        [dataIds]
    );
    const updateRange = useCallback(
        (newRange, id) => {
            const idIdx = rangeIds.indexOf(id);
            if (idIdx !== -1) {
                if (metaSpec.views[idIdx].connectionType.type === 'weak') {
                    const rangeLocal = range.slice();
                    rangeLocal[idIdx] = newRange;
                    setRange(rangeLocal);
                }
            }
        },
        [rangeIds]
    );
    const updateZoom = useCallback(
        (newZooom, id) => {
            const idIdx = rangeIds.indexOf(id);
            if (idIdx !== -1) {
                const zoomToLocal = zoomTo.slice();
                zoomToLocal[idIdx] = [id, newZooom];
                setZoomTo(zoomToLocal);
            }
        },
        [rangeIds]
    );
    useEffect(() => {
        if (!goslingParsed) {
            parseGoslingSpec(goslingSpec, obj => {
                setChromosomeField(dataIds.map(d => obj[d].data.chromosomeField));
                setGenomicFields(dataIds.map(d => obj[d].data.genomicFields));
                const localRanges = range.slice();
                rangeIds.forEach((id, i) => {
                    localRanges[i] = [
                        { chromosome: obj[id].data.chromosomeField, position: 0 },
                        { chromosome: obj[id].data.chromosomeField, position: 0 }
                    ];
                });
                setRange(localRanges);
                setGoslingParsed(true);
            });
        }
    }, [goslingSpec, metaSpec, rangeIds, range, goslingParsed]);
    const metaViews = metaSpec.views.map((view, i) => (
        <MetaComponentWrapper
            key={view.connectionType.placeholderId}
            metaView={view}
            goslingSpec={goslingSpec}
            chromosomeField={chromosomeField[i]}
            genomicColumns={genomicFields[i]}
            setGoslingSpec={setGoslingSpec}
            data={data[i]}
            range={range[i]}
            height={metaDimensions[i].height}
            width={metaDimensions[i].width}
            setZoomTo={updateZoom}
        />
    ));
    return (
        <div>
            <div style={{ display: 'inline-block' }}>
                <div id="gosling-component-wrapper">
                    <GoslingComponentWrapper
                        spec={goslingSpecUpdateable}
                        position={zoomTo.map(d => [
                            `${d[1][0].chromosome}:${d[1][0].position}-${d[1][1].position}`,
                            d[0]
                        ])}
                        setMetaDimensions={updateMetaDimensions}
                        setData={updateData}
                        setRange={updateRange}
                    />
                </div>
                {goslingParsed ? metaViews : null}
            </div>
            <SpecDisplay metaSpec={metaSpec} goslingSpec={goslingSpec} />
        </div>
    );
}
