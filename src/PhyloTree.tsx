import React, {useCallback, useState, useMemo} from 'react';
import {
    DataDeep,
    Datum,
	PartialTrack,
	Track,
	View
} from 'gosling.js/dist/src/core/gosling.schema';import {GoslingRef, GoslingSpec} from "gosling.js";
import {Vega} from "react-vega";


export type PhyloTreeSpec = {
    type: "tree",
    data: DataDeep;
}

interface PhyloTreeProps {
    data?: Datum[];
    setRenderGos: (value: boolean | ((prevVar: boolean) => boolean)) => void;
    gosSpec: GoslingSpec;
    linkedTrack: string;
    width: number | string;
    height: number | string;
}


export default function PhyloTree(props: PhyloTreeProps) {
    const {setRenderGos, gosSpec, linkedTrack, width, height} = props;
    const [maxDist, setMaxDist] = useState(1);
    const [trackOrder, setTrackOrder]=useState<string[]>([])
    const traverseTracks = (
        spec: GoslingSpec | View | PartialTrack,
        callback: (t: Partial<Track>, i: number, ts: Partial<Track>[]) => void)=>{
        if ('tracks' in spec) {
            spec.tracks.forEach((t, i, ts) => {
                traverseTracks(t, callback);
            });
        } else if ('views' in spec) {
             spec.views.forEach((t, i, ts) => {
                callback(t, i, ts);
                traverseTracks(t, callback);
            });
        }
    }

    traverseTracks(gosSpec, (viewSpec:GoslingSpec | View | PartialTrack, i:number, parentTracks:Partial<Track>[]) => {
        if(viewSpec.id === linkedTrack) {
            parentTracks[i] = { ...viewSpec, row: { ...viewSpec.row, domain: trackOrder } };
            setRenderGos(true);
        }
    });
    const vegaSpec = useMemo(() => {
        return ({
            $schema: 'https://vega.github.io/schema/vega/v5.json',
            description: 'An example of Cartesian layouts for a node-link diagram of hierarchical data.',
            width: width,
            height: height,
            padding: 0,
            data: [
                {
                    name: 'tree',
                    url: 'https://s3.amazonaws.com/gosling-lang.org/data/GeneSpy/gene_spy_tree.json',
                    transform: [
                        {
                            type: 'stratify',
                            key: 'id',
                            parentKey: 'parent'
                        },
                        {
                            type: 'tree',
                            method: 'cluster',
                            field: {field: 'distance'},
                            sort: {field: 'value', order: 'ascending'},
                            size: [{signal: 'height'}, {signal: 'width'}],
                            separation: false,
                            as: ['y', 'x', 'depth', 'children']
                        },
                        {
                            type: 'formula',
                            expr: 'width  * (datum.distance/' + maxDist + ')',
                            as: 'x'
                        }
                    ]
                },
                {
                    name: 'leaves',
                    source: 'tree',
                    transform: [
                        {
                            type: 'filter',
                            expr: '!datum.children'
                        }
                    ]
                },
                {
                    name: 'links',
                    source: 'tree',
                    transform: [
                        {type: 'treelinks'},
                        {
                            type: 'linkpath',
                            orient: 'horizontal',
                            shape: 'orthogonal'
                        }
                    ]
                }
            ],
            marks: [
                {
                    type: 'path',
                    from: {data: 'links'},
                    encode: {
                        update: {
                            path: {field: 'path'},
                            stroke: {value: '#000'}
                        }
                    }
                },
                {
                    type: 'rule',
                    from: {data: 'leaves'},
                    encode: {
                        update: {
                            x: {field: 'x'},
                            y: {field: 'y'},
                            x2: {value: width},
                            y2: {field: 'y'},
                            stroke: {value: '#eee'},
                        }
                    }
                },
                {
                    type: 'text',
                    from: {data: 'leaves'},
                    encode: {
                        enter: {
                            text: {field: 'name'},
                            fontSize: {value: 9},
                            baseline: {value: 'middle'}
                        },
                        update: {
                            x: {value: width},
                            y: {field: 'y'},
                            dx: {signal: 'datum.children ? -7 : 7'},
                            align: 'right'
                        }
                    }
                }
            ]
        })
    }, [maxDist, height, width])
    const onNewView = useCallback(view => {
        console.log(view)
        const leaves = view.data('leaves').slice();
        leaves.sort((a, b) => a.x - b.x);
        setTrackOrder(leaves.map(leaf => leaf.id))
        setMaxDist(Math.max(...leaves.map(d => d.distance)))
    }, [])


    return (
        <Vega spec={vegaSpec} onNewView={onNewView} actions={false}/>
    );
}
