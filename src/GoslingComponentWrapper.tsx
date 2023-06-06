import React, {useCallback, useEffect, useRef} from 'react';
import {GoslingComponent, GoslingRef, GoslingSpec} from "gosling.js";
import {Datum} from "gosling.js/dist/src/core/gosling.schema";

interface GoslingComponentWrapperProps {
    spec: GoslingSpec;
    trackId: string;
    dataId?: string;
    onRangeUpdate?: (range: [number, number], data: Datum[]) => void;
    setGosHeight: (height: number) => void;
    setTrackShape: (shape: { x: number, y: number, width: number, height: number }) => void;
}


/**
 * Wrapper for gosling component
 * @param props
 * @returns
 */
export default function GoslingComponentWrapper(props: GoslingComponentWrapperProps) {
    const {spec, trackId, dataId, onRangeUpdate, setGosHeight, setTrackShape} = props;
    const gosRef = useRef<GoslingRef>(null)
    useEffect(() => {
        if (gosRef.current == null) return;
        const tracks = gosRef.current.api.getTracks();
        const referenceTrack = tracks[tracks.map(d => d.id)
            .indexOf(trackId)];
        if(referenceTrack) setTrackShape(referenceTrack.shape)
        if (onRangeUpdate) {
            // TODO Better: Use a brush event in gosling.js (related issue: #910)
            gosRef.current.api.subscribe('rawData', (type, rawdata) => {
                // TODO remove this dataId check if brushevent is created (related issues: #909, #894)
                if (rawdata.data.length > 0 && rawdata.id === trackId && Object.keys(rawdata.data[0]).includes(dataId)) {
                    // gets the column names after applying transformations
                    const range = gosRef.current?.hgApi.api.getLocation(trackId).xDomain;
                    onRangeUpdate(range, rawdata.data);
                }
            });
            return () => {
                gosRef.current?.api.unsubscribe('rawData');
            };
        }
    }, []);
    const containerRef = useCallback((node) => {
        setGosHeight(node?.getBoundingClientRect().height)
    }, [props])
    return (<div ref={containerRef}><GoslingComponent spec={spec} ref={gosRef} padding={0}
                                                      experimental={{"reactive": true}}/></div>);
}
