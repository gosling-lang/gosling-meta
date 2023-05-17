import { GoslingComponent, type GoslingSpec } from 'gosling.js';
import React, { useRef } from 'react';
import './index.css';
import 'higlass/dist/hglib.css';

type MetaSpec = any; // TODO: define the type of spec for metadata vis.

interface GoslingMetaComponentProps {
    goslingSpec: GoslingSpec;
    metaSpec: MetaSpec;
}

export default function GoslingMetaComponent(props: GoslingMetaComponentProps): HTMLElement {
    const { goslingSpec, metaSpec } = props;

    // ...
    const gosRef = useRef(null);
    // ... calculate the position of gosling component and metadata vis
    const gosPos = { left: 100, top: 100 };
    const metaPos = { left: 100, top: 0 };
    // ...

    return (
        <div>
            <div id="gosling-component-wrapper" style={{ ...gosPos }}>
                <GoslingComponent
                    ref={gosRef}
                    spec={goslingSpec}
                    padding={0}
                    background={'none'}
                />
            </div>
            <div id="metavis-component-wrapper" style={{ ...metaPos }}>
                <h3>Placeholder of Metadata Vis</h3>
            </div>
        </div>
    );
}
