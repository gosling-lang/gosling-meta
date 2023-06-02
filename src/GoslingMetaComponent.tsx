import React, {useRef, useState, useEffect} from 'react';
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
    const containerRef = useRef<HTMLInputElement>(null);

    const [renderGos, setRenderGos] = useState(metaSpec.type !== "tree")
    const [metaPos, setMetaPos] = useState({left: 100, top: 100})
    const [gosPos, setGosPos] = useState({left: 100 + metaSpec.width, top: 100})

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
        // TODO: get height of spec when connectionType=="strong" (Related to issue #909)
    }, [metaSpec.height, connectionType.type, containerRef.current])
    const metaContainerRef = useCallback((node) => {
        if (node!=null) {
            setGosPos({top: 100, left: 100 + node.getBoundingClientRect().width})
        }
    }, [])
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
