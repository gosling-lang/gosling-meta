import React, {useState, useCallback, useRef, useMemo} from 'react';
import {type GoslingSpec} from 'gosling.js';
import MetaTable, {MetaTableSpec} from './MetaTable';
import 'higlass/dist/hglib.css';
import './index.css';
import PhyloTree, {PhyloTreeSpec} from "./PhyloTree";
import GoslingComponentWrapper from "./GoslingComponentWrapper";
import {Datum} from "gosling.js/dist/src/core/gosling.schema";

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

    const [gosHeight, setGosHeight] = useState(0);
    const [trackShape, setTrackShape] = useState({x: 0, y: 0, height: 0, width: 0});
    // range of data relevant for the meta visualization
    const [range, setRange] = useState<[number, number]>([0, 0])
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
        let pos = {left: 100 + metaSpec.width, top: 100}
        return (pos);
    }, [trackShape, connectionType.type])
    const metaPos = useMemo(() => {
        let pos = {left: 100, top: 100}
        if (connectionType.type === "strong") {
            pos = {left: 100, top: 100 + trackShape.y}
        }
        return (pos)
    }, [trackShape])
    let goslingView: React.ReactElement | null = null;
    let metaView: React.ReactElement | null = null;
    switch (metaSpec.type) {
        case "table":
            // dataId will be removed when rawData event only returns the data of the track, or when we have a proper brush event
            goslingView = <GoslingComponentWrapper spec={goslingSpec} trackId={connectionType.trackId}
                                                   onRangeUpdate={handleRangeUpdate} dataId={"Accnum"}
                                                   setGosHeight={setGosHeight} setTrackShape={setTrackShape}/>
            metaView = <MetaTable dataTransform={metaSpec.dataTransform}
                                  range={range}
                                  data={data}
                                  genomicColumns={metaSpec.genomicColumns}
                                  columns={metaSpec.columns}
                                  width={metaSpec.width}
                                  height={metaHeight}/>
            break;
        case "tree":
            goslingView =
                <GoslingComponentWrapper spec={goslingSpec} trackId={connectionType.trackId} setGosHeight={setGosHeight}
                                         setTrackShape={setTrackShape}/>
            metaView = <PhyloTree renderGos={setRenderGos} gosSpec={goslingSpec} linkedTrack={connectionType.trackId}
                                  width={metaSpec.width} height={metaHeight}/>
            break;
    }
    return (
        <div>
            <div id="gosling-component-wrapper" style={{...gosPos}}>
                {goslingView}
            </div>
            <div id="metavis-component-wrapper" style={{...metaPos}}>
                {metaView}
            </div>
        </div>
    );
}
