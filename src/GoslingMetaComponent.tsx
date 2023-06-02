import React, {useRef, useState, useEffect, useCallback} from 'react';
import {GoslingComponent, type GoslingRef, type GoslingSpec} from 'gosling.js';
import MetaTable, {MetaTableSpec} from './MetaTable';
import 'higlass/dist/hglib.css';
import './index.css';
import PhyloTree, {PhyloTreeSpec} from "./PhyloTree";

export type MetaSpec = {
    width: number;
    height?: number;
} & (MetaTableSpec | PhyloTreeSpec)

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

    const [renderGos, setRenderGos] = useState(metaSpec.type !== "tree")
    const [metaPos, setMetaPos] = useState({left: 100, top: 100})
    const [gosPos, setGosPos] = useState({left: 100 + metaSpec.width, top: 100})

    const [metaHeight, setMetaHeight] = useState(metaSpec.height ?? 100);
    useEffect(() => {
        if (!gosRef.current || !renderGos || connectionType.type === "weak") return;
        if(connectionType.type==="strong") {
            const tracks = gosRef.current.api.getTracks();
            const referenceTrack = tracks[tracks.map(d => d.id)
                .indexOf(connectionType.trackId)];
            setMetaPos({top: 100 + referenceTrack.shape.y, left: 100})
            setMetaHeight(referenceTrack.shape.height);
        }else if(!metaSpec.height){
            setMetaHeight(gosRef.current.getBoundingClientRect().height)
        }
    }, [metaSpec.height, connectionType.type,gosRef.current])
    const metaContainerRef = useCallback((node) => {
        if (node!=null) {
            setGosPos({top: 100, left: 100 + node.getBoundingClientRect().width})
        }
    }, [])
    return (
        <div>
            <div id="gosling-component-wrapper" style={{...gosPos}}>
                {renderGos ? <GoslingComponent ref={gosRef} spec={goslingSpec} padding={0}
                                               experimental={{"reactive": true}}/> : null}
            </div>
            <div id="metavis-component-wrapper" style={{...metaPos}} ref={metaContainerRef}>
                {metaSpec.type === 'table' ?
                    <MetaTable dataTransform={metaSpec.dataTransform}
                               gosRef={gosRef}
                               linkedTrack={connectionType.trackId}
                               genomicColumns={metaSpec.genomicColumns}
                               columns={metaSpec.columns}
                               width={metaSpec.width}
                               height={metaHeight}/> :
                    <PhyloTree renderGos={setRenderGos} gosSpec={goslingSpec}
                               linkedTrack={connectionType.trackId}
                               width={metaSpec.width} height={metaHeight}/>}
            </div>
        </div>
    );
}
