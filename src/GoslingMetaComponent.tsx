import React, {useRef, useState, useEffect} from 'react';
import {GoslingComponent, type GoslingRef, type GoslingSpec} from 'gosling.js';
import MetaTable, {MetaTableSpec} from './MetaTable';
import 'higlass/dist/hglib.css';
import './index.css';

export type MetaSpec = {
    width: number;
    height?: number;
} & MetaTableSpec

interface AlignmentType {
    type: 'loose' | 'tight';
    trackID: string;
}


interface GoslingMetaComponentProps {
    goslingSpec: GoslingSpec;
    metaSpec: MetaSpec;
    alignmentType: AlignmentType;
}

/**
 * Main component that renders gosling visualization and metadata visualization.
 * @param props
 * @returns
 */
export default function GoslingMetaComponent(props: GoslingMetaComponentProps) {
    const {goslingSpec, metaSpec, alignmentType} = props;

    const gosRef = useRef<GoslingRef>(null);
    const containerRef = useRef<HTMLInputElement>(null);

    let gosPos, metaPos;
    if (alignmentType.type == 'loose') {
        gosPos = {left: 100 + metaSpec.width, top: 100};
        metaPos = {left: 100, top: 100};
    } else {
        // TODO: get position of track that is used for alignment when alignmentType=="tight" (Related to issue #909)
    }

    const [metaHeight, setMetaHeight] = useState(metaSpec.height !== undefined ? metaSpec.height : 100);
    useEffect(() => {
        if (containerRef.current == null) return;
        // if the user does not provide a height and the alignmentType is "loose" use the full height of the gosling component
        if (metaSpec.height === undefined && alignmentType.type === "loose") {
            setMetaHeight(containerRef.current.clientHeight)
        }
        // TODO: get height of spec when alignmentType=="tight" (Related to issue #909)
    }, [metaSpec.height, alignmentType.type, containerRef.current])


    return (
        <div>
            <div id="gosling-component-wrapper" style={{...gosPos}} ref={containerRef}>
                <GoslingComponent ref={gosRef} spec={goslingSpec} padding={0}/>
            </div>
            <div id="metavis-component-wrapper" style={{...metaPos}}>
                {metaSpec.type === 'table' ?
                    <MetaTable dataTransform={metaSpec.dataTransform}
                               gosRef={gosRef}
                               linkedTrack={alignmentType.trackID}
                               genomicColumns={metaSpec.genomicColumns}
                               columns={metaSpec.columns}
                               width={metaSpec.width}
                               height={metaHeight}/> : null}
            </div>
        </div>
    );
}
