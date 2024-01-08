import React from 'react';
import {GoslingSpec} from "gosling.js";
import type {Datum} from 'gosling.js/dist/src/gosling-schema';
import MetaTable from "./MetaTable";
import PhyloTree from "./PhyloTree";
import {MetaSpec} from "./GoslingMetaComponent";

interface MetaComponentWrapperProps {
    metaSpec: MetaSpec;
    goslingSpec: GoslingSpec;
    setGoslingSpec: (object) => void;
    linkedTrackId: string;
    data: Datum[];
    range: [{ chromosome: string, position: number }, {
        chromosome: string,
        position: number
    }];
    height: number;
    width: number;
}

/**
 * Wrapper for gosling component
 * @param props
 * @returns
 */
export default function MetaComponentWrapper(props: MetaComponentWrapperProps) {
    const {metaSpec, goslingSpec, setGoslingSpec, linkedTrackId, data, range, height, width} = props;
    let metaView: React.ReactElement | null = null;
    switch (metaSpec.type) {
        case "table":
            metaView = <MetaTable dataTransform={metaSpec.dataTransform}
                                  range={range}
                                  data={data}
                                  genomicColumns={metaSpec.genomicColumns}
                                  metadataColumns={metaSpec.metadataColumns}
                                  width={width}
                                  height={height}/>
            break;
        case "tree":
            metaView = <PhyloTree gosSpec={goslingSpec} setGoslingSpec={setGoslingSpec}
                                  linkedTrackId={linkedTrackId}
                                  width={width} height={height}/>
            break;
    }
    return (<div style={{marginTop: 46}}>{metaView}</div>);
}
