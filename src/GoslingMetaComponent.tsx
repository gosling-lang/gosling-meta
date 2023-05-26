import React, {useRef, useState, useEffect} from 'react';
import {GoslingComponent, type GoslingRef, type GoslingSpec} from 'gosling.js';
import {type Datum} from 'gosling.js/dist/src/core/gosling.schema';
import MetaTable, {MetaTableProps} from './MetaTable';
import 'higlass/dist/hglib.css';
import './index.css';

export type MetaSpec = {
    width: number;
    height?: number;
} & MetaTableProps

interface AlignmentType {
    type: 'loose' | 'tight';
    trackID?: string;
}

interface GoslingMetaComponentProps {
    goslingSpec: GoslingSpec;
    metaSpec: MetaSpec;
    // tracks that are linked in metaSpec and goslingSpec
    dataTracks: string[];
    alignmentType: AlignmentType;
}

/**
 * Main component that renders gosling visualization and metadata visualization.
 * @param props
 * @returns
 */
export default function GoslingMetaComponent(props: GoslingMetaComponentProps) {
    const {goslingSpec, metaSpec, dataTracks, alignmentType} = props;

    const gosRef = useRef<GoslingRef>(null);
    const containerRef = useRef<HTMLInputElement>(null);

    let gosPos, metaPos;
    if (alignmentType.type == 'loose') {
        gosPos = {left: 100 + metaSpec.width, top: 100};
        metaPos = {left: 100, top: 100};
    } else {
        // TODO get position of track that is used for alignment when alignmentType=="tight"
    }

    const [data, setData] = useState<Datum[]>([]);
    const [metaHeight, setMetaHeight] = useState(metaSpec.height!==undefined?metaSpec.height:100);
    useEffect(() => {
        // if the user does not provide a height and the alignmentType is "loose" use the full height of the gosling component
        if(metaSpec.height===undefined && alignmentType.type==="loose") {
            if (containerRef.current == null) return;
            setMetaHeight(containerRef.current.clientHeight)
        }
        // TODO: get height of spec when alignmentType=="tight"
    }, [])
    useEffect(() => {
        if (gosRef.current == null) return;
        if (metaSpec.type === "table") {
            // TODO Better: Use a brush event in gosling.js
            gosRef.current.api.subscribe('rawData', (type, rawdata) => {
                const range = gosRef.current?.hgApi.api.getLocation(dataTracks[0]).xDomain;
                // TODO remove 'Accnum' check when rawdata event is adapted
                if (rawdata.data.length > 0 && dataTracks.includes(rawdata.id) && 'Accnum' in rawdata.data[0]) {
                    // TODO get genomic coordinates fields from spec
                    const dataInRange = rawdata.data.filter(
                        entry =>
                            (entry['Gene start'] > range[0] && entry['Gene start'] < range[1]) ||
                            (entry['Gene end'] > range[0] && entry['Gene end'] < range[1])
                    );
                    const uniqueInRange = dataInRange.filter(
                        (v, i, a) => a.findIndex(v2 => v2['Gene name'] === v['Gene name']) === i
                    );
                    setData(uniqueInRange);
                }
            });
            return () => {
                gosRef.current?.api.unsubscribe('rawData');
            };
        }
    }, []);
    // ...

    return (
        <div>
            <div id="gosling-component-wrapper" style={{...gosPos}} ref={containerRef}>
                <GoslingComponent ref={gosRef} spec={goslingSpec} padding={0}/>
            </div>
            <div id="metavis-component-wrapper" style={{...metaPos}}>
                {metaSpec.type === 'table' ?
                    <MetaTable data={data} width={metaSpec.width} height={metaHeight}
                               dataTransform={metaSpec.dataTransform}
                               columns={metaSpec.columns} type="table"/> : null}
            </div>
        </div>
    );
}
