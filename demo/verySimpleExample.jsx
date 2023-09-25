import React, {useCallback, useEffect, useRef} from 'react';
import {GoslingComponent} from "gosling.js";


const circularRadius = 200;
const centerRadius = 0.5;

const linearHeight = 120;
const linearSize = linearHeight / 6;
const islandData = {
    data: {
        type: 'csv',
        url: 'https://s3.amazonaws.com/gosling-lang.org/data/IslandViewer/NC_004631.1_islands.csv',
        chromosomeField: 'Accession',
        genomicFields: ['Island start', 'Island end']
    },
    x: {field: 'Island start', type: 'genomic'},
    xe: {field: 'Island end', type: 'genomic'}
};
const goslingSpec = {
    title: 'IslandViewer 4 (Bertelli et al. 2017)',
    subtitle: 'Salmonella enterica subsp. enterica serovar Typhi Ty2, complete genome.',
    description: 'Reimplementation of https://www.pathogenomics.sfu.ca/islandviewer/accession/NC_004631.1/',
    assembly: [['NC_004631.1', 4791961]],
    spacing: 50,
    views: [
        {
            layout: 'circular',
            static: true,
            alignment: 'overlay',
            spacing: 0.1,
            tracks: [
                {
                    data: {
                        url: 'https://s3.amazonaws.com/gosling-lang.org/data/IslandViewer/NC_004631.1_GCcontent.csv',
                        type: 'csv',
                        separator: '\t',
                        genomicFields: ['Position']
                    },
                    id: "first",
                    y: {field: 'GCcontent', type: 'quantitative', range: [-250, 0], axis: 'none'},
                    mark: 'line',
                    size: {value: 0.5},
                    x: {field: 'Position', type: 'genomic'},
                    color: {
                        value: 'black'
                    }
                },
                {
                    experimental: {mouseEvents: true},
                    style: {outlineWidth: 1, outline: 'black'},
                    id: "second",
                    data: {
                        url: 'https://s3.amazonaws.com/gosling-lang.org/data/IslandViewer/NC_004631.1_annotations.csv',
                        type: 'csv',
                        genomicFields: ['Gene start']
                    },
                    dataTransform: [
                        {
                            type: 'displace',
                            method: 'pile',
                            boundingBox: {
                                padding: 3.5,
                                startField: 'Gene start',
                                endField: 'Gene start'
                            },
                            newField: 'row'
                        }
                    ],
                    y: {field: 'row', type: 'nominal', flip: true},
                    mark: 'point',
                    x: {field: 'Gene start', type: 'genomic'},
                    size: {value: 3},
                    color: {
                        field: 'Type',
                        type: 'nominal',
                        domain: ['Victors', 'BLAST', 'RGI', 'PAG'],
                        range: ['#460B80', '#A684EA', '#FF9CC1', '#FF9CC1']
                    }
                },
                {
                    ...islandData,
                    id: "third",
                    row: {
                        field: 'Method',
                        domain: [
                            'Predicted by at least one method',
                            'IslandPath-DIMOB',
                            'SIGI-HMM',
                            'IslandPick',
                            'Islander'
                        ],
                        type: 'nominal'
                    },
                    color: {
                        field: 'Method',
                        type: 'nominal',
                        domain: [
                            'Predicted by at least one method',
                            'IslandPath-DIMOB',
                            'SIGI-HMM',
                            'IslandPick',
                            'Islander'
                        ],
                        range: ['#B22222', '#4169E1', '#FF8C00', '#008001', '#40E0D0']
                    },
                    mark: 'rect'
                },
                {
                    mark: 'brush',
                    id: 'brush',
                    x: {linkingId: 'detail'}
                }
            ],
            width: circularRadius * 2,
            centerRadius: centerRadius
        }
    ]
};


export default function VerySimple() {
    const gosRef = useCallback(current => {
        console.log(current?.api.getTrackIds())
        console.log(current?.api.getTracksAndViews())
    }, [])
    return (
        <GoslingComponent ref={gosRef} spec={goslingSpec}/>
    );
}
