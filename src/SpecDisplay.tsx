import React from 'react';
import { MetaSpec } from './GoslingMetaComponent';
import { GoslingSpec } from 'gosling.js';

interface specDisplayProps {
    goslingSpec: GoslingSpec;
    metaSpec: MetaSpec;
}

export default function SpecDisplay(props: specDisplayProps) {
    const { goslingSpec, metaSpec } = props;
    return (
        <div style={{ float: 'left' }}>
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
