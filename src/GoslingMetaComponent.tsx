import React, {useState, useCallback, useMemo} from 'react';
import {type GoslingSpec} from 'gosling.js';
import {MetaTableSpec} from './MetaTable';
import 'higlass/dist/hglib.css';
import './index.css';
import {PhyloTreeSpec} from "./PhyloTree";
import GoslingComponentWrapper from "./GoslingComponentWrapper";
import {Datum} from "gosling.js/dist/src/core/gosling.schema";
import MetaComponentWrapper from "./MetaComponentWrapper";

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

    const [renderGos, setRenderGos] = useState(metaSpec.type !== "tree")

    const [metaWidth, setMetaWidth] = useState(0);
    const [gosHeight, setGosHeight] = useState(0);
    const [trackShape, setTrackShape] = useState({x: 0, y: 0, height: 0, width: 0});
    // range of data relevant for the meta visualization
    const [range, setRange] = useState<[{ chromosome: string|null, position: number }, {
        chromosome: string|null,
        position: number
    }]>([{chromosome:null, position: 0}, {chromosome:null,position:0}])
    // data relevant for the meta visualization
    const [data, setData] = useState<Datum[]>([])
    const handleRangeUpdate = useCallback((range, data) => {
        setRange(range);
        setData(data);
    }, [])
    const metaHeight = useMemo(() => {
        let height = 0
        if (connectionType.type === "strong") {
            height = trackShape.height
        } else if (!metaSpec.height) {
            height = gosHeight;
        }
        return (height);
    }, [gosHeight, trackShape, connectionType.type]);
    const gosPos = useMemo(() => {
        const pos = {left: 100 + metaWidth, top: 100}
        return (pos);
    }, [metaWidth])
    const metaPos = useMemo(() => {
        let pos = {left: 100, top: 100}
        if (connectionType.type === "strong") {
            pos = {left: 100, top: 100 + trackShape.y}
        }
        return (pos)
    }, [trackShape])
    return (
        <div>
            <div id="gosling-component-wrapper" style={{...gosPos}}>
                <GoslingComponentWrapper type={metaSpec.type} spec={goslingSpec} trackId={connectionType.trackId}
                                         onRangeUpdate={handleRangeUpdate}
                                         setGosHeight={setGosHeight} setTrackShape={setTrackShape}/>
            </div>
            <div id="metavis-component-wrapper" style={{...metaPos}}>
                <MetaComponentWrapper metaSpec={metaSpec} goslingSpec={goslingSpec} linkedTrack={connectionType.trackId}
                                      data={data} range={range} setMetaWidth={setMetaWidth} height={metaHeight}
                                      setRenderGos={setRenderGos}/>
            </div>
        </div>
    );
}
