import React, { useCallback, useEffect, useRef } from 'react';
import { GoslingComponent, GoslingRef, GoslingSpec } from 'gosling.js';
import type { Datum } from 'gosling.js/dist/src/gosling-schema';
import { debounce } from 'vega';

interface GoslingComponentWrapperProps {
    type: 'table' | 'tree' | 'summary';
    spec: GoslingSpec;
    dataId: string;
    rangeId: string;
    placeholderId: string;
    position: string;
    setData: (data: Datum[]) => void;
    setRange: (
        range: [
            { chromosome: string; position: number },
            {
                chromosome: string;
                position: number;
            }
        ]
    ) => void;
    setMetaDimensions: (shape: { x: number; y: number; width: number; height: number }) => void;
}

/**
 * Wrapper for gosling component
 * @param props
 * @returns
 */
export default function GoslingComponentWrapper(props: GoslingComponentWrapperProps) {
    const { type, spec, dataId, rangeId, placeholderId, position, setData, setRange, setMetaDimensions } = props;
    const gosRef = useRef<GoslingRef>(null);
    const updateRange = useCallback(
        eventData => {
            if (eventData.id === rangeId) {
                setRange(eventData.genomicRange);
            }
        },
        [rangeId]
    );
    const debouncedUpdateRange = debounce(30, updateRange);
    useEffect(() => {
        if (gosRef.current == null) return;
        if (position !== ':0-0') {
            gosRef.current.api.zoomTo(rangeId, position, 5000);
        }
    }, [rangeId, position]);
    useEffect(() => {
        if (gosRef.current == null) return;
        gosRef.current.api.subscribe('onNewTrack', (type, eventData) => {
            if (eventData.id === placeholderId) {
                setMetaDimensions(gosRef.current?.api.getTrack(placeholderId).shape);
            }
        });
        if (type === 'table' || type === 'summary') {
            // TODO: not desired to have an extra track for the data! Maybe event that always returns full data?
            gosRef.current.api.subscribe('rawData', (type, eventData) => {
                if (dataId === eventData.id) {
                    setData(eventData.data);
                }
            });
            gosRef.current.api.subscribe('location', (type, eventData) => {
                debouncedUpdateRange(eventData);
            });
            return () => {
                gosRef.current?.api.unsubscribe('location');
                gosRef.current?.api.unsubscribe('rawData');
                gosRef.current?.api.unsubscribe('onNewTrack');
            };
        }
    }, []);
    return (
        <div>
            <GoslingComponent spec={spec} ref={gosRef} padding={0} experimental={{ reactive: true }} />
        </div>
    );
}
