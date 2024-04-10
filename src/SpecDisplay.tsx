import React from 'react';
import { ConnectionType, MetaSpec } from './GoslingMetaComponent';
import { GoslingSpec } from 'gosling.js';

interface specDisplayProps {
    connectionType: ConnectionType;
    goslingSpec: GoslingSpec;
    metaSpec: MetaSpec;
}

export default function SpecDisplay(props: specDisplayProps) {
    const { connectionType, goslingSpec, metaSpec } = props;
    return (
        <div style={{ float: 'left' }}>
            <div>
                <pre style={{ color: 'blue' }}>
                    <code>{JSON.stringify({ connectionType: connectionType }, null, 2)}</code>
                </pre>
            </div>
            <div>
                <pre style={{ color: 'violet' }}>
                    <code>{JSON.stringify({ metaSpec: metaSpec }, null, 2)}</code>
                </pre>
            </div>
            <div>
                <pre style={{ color: 'green' }}>
                    <code>{JSON.stringify({ goslingSpec: goslingSpec }, null, 2)}</code>
                </pre>
            </div>
        </div>
    );
}
