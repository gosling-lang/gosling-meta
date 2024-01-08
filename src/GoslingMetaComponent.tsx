import React, {useState} from 'react';
import {type GoslingSpec} from 'gosling.js';
import {MetaTableSpec} from './MetaTable';
import 'higlass/dist/hglib.css';
import './index.css';
import {PhyloTreeSpec} from "./PhyloTree";
import GoslingComponentWrapper from "./GoslingComponentWrapper";
import type {Datum} from "gosling.js/dist/src/gosling-schema";
import MetaComponentWrapper from "./MetaComponentWrapper";

export type MetaSpec = (MetaTableSpec | PhyloTreeSpec)

interface ConnectionType {
    type: 'weak' | 'strong';
    trackId: string;
    placeholderId: string;
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
    const [goslingSpecUpdateable, setGoslingSpec] = useState(structuredClone(goslingSpec));
    const [metaDimensions, setMetaDimensions] = useState({x: 0, y: 0, width: 100, height: 100})
    // range of data relevant for the meta visualization
    const [range, setRange] = useState<[{ chromosome: string, position: number }, {
        chromosome: string,
        position: number
    }]>([{chromosome: "", position: 0}, {chromosome: "", position: 0}])
    // data relevant for the meta visualization
    const [data, setData] = useState<Datum[]>([])
    return (
        <div>
            <div id="gosling-component-wrapper">
                <GoslingComponentWrapper type={metaSpec.type}
                                         spec={goslingSpecUpdateable}
                                         trackId={connectionType.trackId}
                                         placeholderId={connectionType.placeholderId}
                                         setMetaDimensions={setMetaDimensions}
                                         setData={setData}
                                         setRange={setRange}/>
            </div>
            <div id="metavis-component-wrapper">
                <MetaComponentWrapper metaSpec={metaSpec} goslingSpec={goslingSpec} setGoslingSpec={setGoslingSpec}
                                      linkedTrackId={connectionType.trackId}
                                      data={data} range={range}
                                      height={metaDimensions.height}
                                      width={metaDimensions.width}/>
            </div>
        </div>
    );
}
