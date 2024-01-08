import React, {useCallback, useState, useMemo, useEffect} from 'react';
import type {
    DataDeep,
    Datum,
    PartialTrack,
    Track,
    View
} from 'gosling.js/dist/src/gosling-schema';
import {GoslingSpec} from "gosling.js";
import {Vega} from "react-vega";


export type PhyloTreeSpec = {
    type: "tree",
    data: DataDeep;
}

interface PhyloTreeProps {
    data?: Datum[];
    gosSpec: GoslingSpec;
    setGoslingSpec: (object) => void;
    linkedTrackId: string;
    width: number;
    height: number;
}


export default function PhyloTree(props: PhyloTreeProps) {
    const {gosSpec, setGoslingSpec, linkedTrackId, width, height} = props;
    const [maxDist, setMaxDist] = useState(1);
    const [trackOrder, setTrackOrder] = useState<string[]>([])
    const [containerWidth, setContainerWidth] = useState(width);
    // the width of the tree needs to be recalculated since the width of the tree leaves can vary
    const localWidth = useMemo(() => {
        if (containerWidth > width && containerWidth < 2 * width) {
            return width - (containerWidth - width);
        } else {
            return width;
        }
    }, [width, containerWidth])
    const traverseTracks = useCallback((
        spec: GoslingSpec | View | PartialTrack,
        callback: (t: Partial<Track>, i: number, ts: Partial<Track>[]) => void) => {
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
    }, [])

    useEffect(() => {
        if (trackOrder.length > 0) {
            const spec = structuredClone(gosSpec);
            traverseTracks(spec, (viewSpec: GoslingSpec | View | PartialTrack, i: number, parentTracks: Partial<Track>[]) => {
                if (viewSpec.id === linkedTrackId) {
                    parentTracks[i] = {...viewSpec, row: {...viewSpec.row, domain: trackOrder}};
                    setGoslingSpec(spec)
                }
            });
        }
    }, [trackOrder])

    const vegaSpec = useMemo(() => {
        return ({
            $schema: 'https://vega.github.io/schema/vega/v5.json',
            description: 'An example of Cartesian layouts for a node-link diagram of hierarchical data.',
            width: localWidth,
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
                            x2: {value: localWidth},
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
                            x: {value: localWidth},
                            y: {field: 'y'},
                            dx: {signal: 'datum.children ? -7 : 7'},
                            align: 'right'
                        }
                    }
                }
            ]
        })
    }, [maxDist, height, width, localWidth])
    const onNewView = useCallback(view => {
        const leaves = view.data('leaves').slice();
        const renderedWidth = view.container().getBoundingClientRect().width;
        if (width < renderedWidth) {
            setContainerWidth(renderedWidth);
        }
        leaves.sort((a, b) => a.x - b.x);
        setTrackOrder(leaves.map(leaf => leaf.id))
        setMaxDist(Math.max(...leaves.map(d => d.distance)))
    }, [width])


    return (
        <Vega spec={vegaSpec} onNewView={onNewView} actions={false}/>
    );
}
