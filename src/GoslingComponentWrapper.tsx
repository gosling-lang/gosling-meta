import React, { useCallback, useEffect, useRef } from 'react';
import { GoslingComponent, GoslingRef, GoslingSpec } from 'gosling.js';
import type { Datum } from 'gosling.js/dist/src/gosling-schema';
import { debounce } from 'vega';

interface GoslingComponentWrapperProps {
    spec: GoslingSpec;
    position: [string, string][];
    setData: (data: Datum[], id: string) => void;
    setRange: (
        range: [
            { chromosome: string; position: number },
            {
                chromosome: string;
                position: number;
            }
        ],
        id: string
    ) => void;
    setMetaDimensions: (shape: { x: number; y: number; width: number; height: number }, id: string) => void;
}

/**
 * Wrapper for gosling component
 * @param props
 * @returns
 */
export default function GoslingComponentWrapper(props: GoslingComponentWrapperProps) {
    const { spec, position, setData, setRange, setMetaDimensions } = props;
    const gosRef = useRef<GoslingRef>(null);
    const updateRange = useCallback(eventData => {
        setRange(eventData.genomicRange, eventData.id);
    }, []);
    const debouncedUpdateRange = debounce(30, updateRange);
    useEffect(() => {
        if (gosRef.current == null) return;
        position.forEach(([pos, id]) => {
            if (pos !== ':0-0') {
                gosRef.current?.api.zoomTo(id, pos, 5000);
            }
        });
    }, [position]);
    useEffect(() => {
        if (gosRef.current == null) return;
        gosRef.current.api.subscribe('onNewTrack', (type, eventData) => {
            setMetaDimensions(gosRef.current?.api.getTrack(eventData.id).shape, eventData.id);
        });
        // TODO: not desired to have an extra track for the data! Maybe event that always returns full data?
        gosRef.current.api.subscribe('rawData', (type, eventData) => {
            setData(eventData.data, eventData.id);
        });
        gosRef.current.api.subscribe('location', (type, eventData) => {
            debouncedUpdateRange(eventData);
        });
        return () => {
            gosRef.current?.api.unsubscribe('location');
            gosRef.current?.api.unsubscribe('rawData');
            gosRef.current?.api.unsubscribe('onNewTrack');
        };
    }, []);
    return (
        <div>
            <GoslingComponent spec={spec} ref={gosRef} padding={0} experimental={{ reactive: true }} />
        </div>
    );
}
