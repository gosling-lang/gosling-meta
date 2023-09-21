import React, {useCallback, useEffect, useRef, useState} from 'react';
import {GoslingComponent, GoslingRef, GoslingSpec} from "gosling.js";
import {Datum} from "gosling.js/dist/src/core/gosling.schema";

interface GoslingComponentWrapperProps {
    type: "table" | "tree";
    spec: GoslingSpec;
    trackId: string;
    onRangeUpdate: (range: [{ chromosome: string, position: number }, {
        chromosome: string,
        position: number
    }], data: Datum[]) => void;
    setGosHeight: (height: number) => void;
    setTrackShape: (shape: { x: number, y: number, width: number, height: number }) => void;
}


/**
 * Wrapper for gosling component
 * @param props
 * @returns
 */
export default function GoslingComponentWrapper(props: GoslingComponentWrapperProps) {
    const {type, spec, trackId, onRangeUpdate, setGosHeight, setTrackShape} = props;
    const [data,setData]=useState(null);
    const gosRef = useRef<GoslingRef>(null)
    useEffect(() => {
        if (gosRef.current == null) return;
        const tracks = gosRef.current.api.getTracks();
        const referenceTrack = tracks[tracks.map(d => d.id)
            .indexOf(trackId)];
        if (referenceTrack) setTrackShape(referenceTrack.shape)
        if (type === "table") {
            // TODO Better: Use a brush event in gosling.js (related issue: #910)
            gosRef.current.api.subscribe('rawData',(type,eventData)=>{
                if(trackId===eventData.id){
                    setData(eventData.data);
                }
            })
            gosRef.current.api.subscribe('location', (type, eventData) => {
                // TODO remove this dataId check if brushevent is created (related issues: #909, #894)
                if (eventData.id === trackId && data!==null) {
                    console.log(eventData.genomicRange)
                    onRangeUpdate(eventData.genomicRange, data);
                }
            });
            return () => {
                gosRef.current?.api.unsubscribe('location');
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
