import { GoslingComponent, GoslingSpec } from 'gosling.js'
import React, { useRef, useEffect, useState } from 'react';
import './index.css';
import 'higlass/dist/hglib.css';

type MetaSpec = any; // TODO: define meta spec type

interface GoslingMetaComponentProps {
    goslingSpec: GoslingSpec;
    metaSpec: MetaSpec;
}

const detailID = 'detailedView';
const circularRadius = 200;

const linearHeight = 120;

export default function GoslingMetaComponent (props: GoslingMetaComponentProps) {
    const { goslingSpec, metaSpec } = props;

    // ...
    const gosPos = { left: 100, top: 100 }; // calculate the position of gosling component
    
    const gosRef = useRef(null);
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
	const tableKeys = ['Prediction Method', 'Gene name', 'Accnum', 'Product'];
    // ...

    return (
        <div>
            <div className='gosling-component-wrapper' style={{ ...gosPos }}>
                <GoslingComponent ref={gosRef} spec={goslingSpec} />
            </div>
            {/* Metadata visualization component */}
            {data.length === 0 ? null : (
				<div style={{
					height: linearHeight + 2 * circularRadius,
					overflowY: 'scroll',
					display: 'inline-block',
					width: '50%',
				}}>
					<table className='table-fixed border-collapse border border-slate-400'>
						<thead className='capitalize'>
							<tr className='border border-slate-300  bg-slate-100'>{tableKeys.map(d => <th className='px-1'
								key={d}>{d}</th>)}</tr>
						</thead>
						<tbody>
							{data.map(d => <tr className='border border-slate-300' key={d['Gene name']}>
								{tableKeys.map(key => {
									let value = '';
									if (key === 'Prediction Method') {
										if (d['Islands'].length > 0) {
											if (d['Annotations'].length > 0) {
												value = d['Islands'] + '/' + d['Annotations']
											} else {
												value = d['Islands']
											}
										} else if (d['Annotations'].length > 0) {
											value = d['Annotations']
										}
									} else {
										value = d[key]
									}
									return (<td className='px-1' key={key}>{value}</td>)
								}
								)}
							</tr>)}
						</tbody>
					</table>
				</div>)}
        </div>
    );
}
