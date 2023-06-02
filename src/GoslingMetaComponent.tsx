import React, {useRef, useState, useEffect, useCallback} from 'react';
import {type GoslingSpec} from 'gosling.js';
import MetaTable, {MetaTableSpec} from './MetaTable';
import 'higlass/dist/hglib.css';
import './index.css';
import GoslingComponentWrapper from "./GoslingComponentWrapper";
import {Datum} from "gosling.js/dist/src/core/gosling.schema";

export type MetaSpec = {
    width: number;
    height?: number;
} & MetaTableSpec

interface ConnectionType {
    type: 'weak' | 'strong';
    trackId: string;
}


interface GoslingMetaComponentProps {
    goslingSpec: GoslingSpec;
    metaSpec: MetaSpec;
    connectionType: ConnectionType;
}

/**
 * Main component that renders gosling visualization and metadata visualization.
 * @param props
 * @returns
 */
export default function GoslingMetaComponent(props: GoslingMetaComponentProps) {
    const {goslingSpec, metaSpec, connectionType} = props;

    const containerRef = useRef<HTMLInputElement>(null);

    let gosPos, metaPos;
    if (connectionType.type == 'weak') {
        gosPos = {left: 100 + metaSpec.width, top: 100};
        metaPos = {left: 100, top: 100};
    } else {
        // TODO: get position of track that is used for alignment when connectionType=="strong" (Related to issue #909)
    }

    const [metaHeight, setMetaHeight] = useState(metaSpec.height ?? 100);
    // range of data relevant for the meta visualization
    const [range, setRange] = useState<[number, number]>([0, 0])
    // data relevant for the meta visualization
    const [data, setData] = useState<Datum[]>([])
    const handleRangeUpdate = useCallback((range, data) => {
        setRange(range);
        setData(data);
    }, [])
    useEffect(() => {
        if (containerRef.current == null) return;
        // if the user does not provide a height and the alignmentType is "loose" use the full height of the gosling component
        if (!metaSpec.height && connectionType.type === "weak") {
            setMetaHeight(containerRef.current.clientHeight)
        }
        // TODO: get height of spec when connectionType=="strong" (Related to issue #909)
    }, [metaSpec.height, connectionType.type, containerRef.current])

    let goslingView: React.ReactElement | null = null;
    let metaView: React.ReactElement | null = null;
    switch (metaSpec.type) {
        case "table":
            // dataId will be removed when rawData event only returns the data of the track, or when we have a proper brush event
            goslingView = <GoslingComponentWrapper spec={goslingSpec} trackId={connectionType.trackId}
                                                   onRangeUpdate={handleRangeUpdate} dataId={"Accnum"}/>
            metaView = <MetaTable dataTransform={metaSpec.dataTransform}
                                  range={range}
                                  data={data}
                                  genomicColumns={metaSpec.genomicColumns}
                                  columns={metaSpec.columns}
                                  width={metaSpec.width}
                                  height={metaHeight}/>
            break;
    }
    return (
        <div>
            <div id="gosling-component-wrapper" style={{...gosPos}} ref={containerRef}>
                {goslingView}
            </div>
            <div id="metavis-component-wrapper" style={{...metaPos}}>
                {metaView}
            </div>
        </div>
    );
}
