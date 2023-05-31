import React, {useRef, useState, useEffect} from 'react';
import {GoslingComponent, type GoslingRef, type GoslingSpec} from 'gosling.js';
import MetaTable, {MetaTableSpec} from './MetaTable';
import 'higlass/dist/hglib.css';
import './index.css';

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

    const gosRef = useRef<GoslingRef>(null);
    const containerRef = useRef<HTMLInputElement>(null);

    let gosPos, metaPos;
    if (connectionType.type == 'weak') {
        gosPos = {left: 100 + metaSpec.width, top: 100};
        metaPos = {left: 100, top: 100};
    } else {
        // TODO: get position of track that is used for alignment when connectionType=="strong" (Related to issue #909)
    }

    const [metaHeight, setMetaHeight] = useState(metaSpec.height ?? 100);
    useEffect(() => {
        if (containerRef.current == null) return;
        // if the user does not provide a height and the alignmentType is "loose" use the full height of the gosling component
        if (!metaSpec.height && connectionType.type === "weak") {
            setMetaHeight(containerRef.current.clientHeight)
        }
        // TODO: get height of spec when connectionType=="strong" (Related to issue #909)
    }, [metaSpec.height, connectionType.type, containerRef.current])


    return (
        <div>
            <div id="gosling-component-wrapper" style={{...gosPos}} ref={containerRef}>
                <GoslingComponent ref={gosRef} spec={goslingSpec} padding={0}/>
            </div>
            <div id="metavis-component-wrapper" style={{...metaPos}}>
                {metaSpec.type === 'table' ?
                    <MetaTable dataTransform={metaSpec.dataTransform}
                               gosRef={gosRef}
                               linkedTrack={connectionType.trackId}
                               genomicColumns={metaSpec.genomicColumns}
                               columns={metaSpec.columns}
                               width={metaSpec.width}
                               height={metaHeight}/> : null}
            </div>
        </div>
    );
}
