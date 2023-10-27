import React, {useEffect, useRef} from 'react';
import {GoslingComponent, GoslingRef, GoslingSpec} from "gosling.js";
import type {Datum} from 'gosling.js/dist/src/gosling-schema';

interface GoslingComponentWrapperProps {
    type: "table" | "tree";
    spec: GoslingSpec;
    trackId: string;
    placeholderId: string;
    setData: (data: Datum[]) => void;
    setRange: (range: [{ chromosome: string, position: number }, {
        chromosome: string,
        position: number
    }]) => void;
    setMetaDimensions: (shape: { x: number, y: number, width: number, height: number }) => void;
}


/**
 * Wrapper for gosling component
 * @param props
 * @returns
 */
export default function GoslingComponentWrapper(props: GoslingComponentWrapperProps) {
    const {type, spec, trackId, placeholderId, setData, setRange, setMetaDimensions} = props;
    const gosRef = useRef<GoslingRef>(null)
    useEffect(() => {
        if (gosRef.current == null) return;
        setMetaDimensions(gosRef.current.api.getTrack(placeholderId).shape)
        if (type === "table") {
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
        }
    }, []);
    return (<div><GoslingComponent spec={spec} ref={gosRef} padding={0}
                                   experimental={{"reactive": true}}/></div>);
}
