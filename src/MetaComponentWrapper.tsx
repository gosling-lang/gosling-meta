import React, {useCallback} from 'react';
import {GoslingSpec} from "gosling.js";
import {Datum} from "gosling.js/dist/src/core/gosling.schema";
import MetaTable from "./MetaTable";
import PhyloTree from "./PhyloTree";
import {MetaSpec} from "./GoslingMetaComponent";

interface MetaComponentWrapperProps {
    metaSpec: MetaSpec;
    goslingSpec: GoslingSpec;
    linkedTrack: string;
    data: Datum[];
    range: [{ chromosome: string, position: number }, {
        chromosome: string,
        position: number
    }];
    setMetaWidth: (height: number) => void;
    height: number;
    setRenderGos: (renderGos: boolean) => void;
}

/**
 * Wrapper for gosling component
 * @param props
 * @returns
 */
export default function MetaComponentWrapper(props: MetaComponentWrapperProps) {
    const {metaSpec, goslingSpec,linkedTrack, data, range, setMetaWidth, height, setRenderGos} = props;
    const containerRef = useCallback((node) => {
        setMetaWidth(node?.getBoundingClientRect().width)
    }, [props])
    let metaView: React.ReactElement | null = null;
    console.log(height)
    switch (metaSpec.type) {
        case "table":
            metaView = <MetaTable dataTransform={metaSpec.dataTransform}
                                  range={range}
                                  data={data}
                                  genomicColumns={metaSpec.genomicColumns}
                                  columns={metaSpec.columns}
                                  width={metaSpec.width}
                                  height={height}/>
            break;
        case "tree":
            metaView = <PhyloTree setRenderGos={setRenderGos} gosSpec={goslingSpec} linkedTrack={linkedTrack}
                                  width={metaSpec.width} height={height}/>
            break;
    }
    return (<div ref={containerRef}>{metaView}</div>);
}
