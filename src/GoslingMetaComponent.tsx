import { GoslingComponent, type GoslingSpec } from 'gosling.js';
import React, { useRef, useState, useEffect } from 'react';
import MetaTable from './MetaTable';
import 'higlass/dist/hglib.css';
import './index.css';

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
    const metaVisWidth = 600;
    const gosPos = { left: 100 + metaVisWidth, top: 100 };
    const metaPos = { left: 100, top: 100 };
    // ...
    const detailID = 'detailedView'
    const circularRadius = 200;
    const centerRadius = 0.5;
    const linearHeight = 120;
    const linearSize = linearHeight / 6;
    const [data, setData] = useState([]);
	useEffect(() => {
		if (!gosRef.current) return;
		gosRef.current.api.subscribe('rawData', (type, rawdata) => {
			const range = gosRef.current.hgApi.api.getLocation(detailID).xDomain
			if (rawdata.data.length > 0 && rawdata.id === detailID && 'Accnum' in rawdata.data[0]) {
				const dataInRange = rawdata.data.filter(entry => (entry['Gene start'] > range[0]
                    && entry['Gene start'] < range[1])
                    || (entry['Gene end'] > range[0]
                    && entry['Gene end'] < range[1]))
				const uniqueInRange = dataInRange.filter((v, i, a) => a.findIndex(v2 => (v2['Gene name'] === v['Gene name'])) === i)
				setData(uniqueInRange)
			}
		});
		return () => {
			gosRef.current.api.unsubscribe('rawData');
		}
	}, [gosRef]);
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
                <MetaTable data={data} width={metaVisWidth} height={646}/>
            </div>
        </div>
    );
}
