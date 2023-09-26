import React, {useCallback, useEffect, useRef, useState} from 'react';
import {GoslingComponent, GoslingRef, GoslingSpec} from "gosling.js";
import {Datum} from "gosling.js/dist/src/core/gosling.schema";

interface GoslingComponentWrapperProps {
    type: "table" | "tree";
    spec: GoslingSpec;
    trackId: string;
    setData: (data: Datum[]) => void;
    setRange: (range: [{ chromosome: string, position: number }, {
        chromosome: string,
        position: number
    }]) => void;
    setGosHeight: (height: number) => void;
    setTrackShape: (shape: { x: number, y: number, width: number, height: number }) => void;
}


/**
 * Wrapper for gosling component
 * @param props
 * @returns
 */
export default function GoslingComponentWrapper(props: GoslingComponentWrapperProps) {
    const {type, spec, trackId, setData, setRange, setGosHeight, setTrackShape} = props;
    const gosRef = useRef<GoslingRef>(null)
    useEffect(() => {
        if (gosRef.current == null) return;
        if (type === "table") {
            const referenceTrack = gosRef.current.api.getTrack(trackId)
            if (referenceTrack) setTrackShape(referenceTrack.shape)
            gosRef.current.api.subscribe('rawData', (type, eventData) => {
                if (trackId === eventData.id) {
                    setData(eventData.data);
                }
            })
            gosRef.current.api.subscribe('location', (type, eventData) => {
                if (eventData.id === trackId) {
                    setRange(eventData.genomicRange);
                }
            });
            return () => {
                gosRef.current?.api.unsubscribe('location');
                gosRef.current?.api.unsubscribe('rawData');

            };
        } else if (type === 'tree') {
            const referenceTrack= gosRef.current.api.getTrack("trackId")
            if (referenceTrack) setTrackShape(referenceTrack.shape)
        }
    }, []);
    const containerRef = useCallback((node) => {
        setGosHeight(node?.getBoundingClientRect().height)
    }, [props])
    return (<div ref={containerRef}><GoslingComponent spec={spec} ref={gosRef} padding={0}
                                                      experimental={{"reactive": true}}/></div>);
}
