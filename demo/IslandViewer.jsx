import React from 'react';
import { GoslingMetaComponent } from '../src/index.ts';

const islandData = {
    data: {
        type: 'csv',
        url: 'https://s3.amazonaws.com/gosling-lang.org/data/IslandViewer/NC_004631.1_islands.csv',
        chromosomeField: 'Accession',
        genomicFields: ['Island start', 'Island end']
    },
    x: { field: 'Island start', type: 'genomic' },
    xe: { field: 'Island end', type: 'genomic' }
};
const dataID = 'dataView';
const detailID = 'detailedView';
const circularRadius = 200;
const centerRadius = 0.5;

const linearHeight = 120;
const linearSize = linearHeight / 6;

const goslingSpec = {
    title: 'IslandViewer 4 (Bertelli et al. 2017)',
    subtitle: 'Salmonella enterica subsp. enterica serovar Typhi Ty2, complete genome.',
    description: 'Reimplementation of https://www.pathogenomics.sfu.ca/islandviewer/accession/NC_004631.1/',
    assembly: [['NC_004631.1', 4791961]],
    arrangement: 'horizontal',
    spacing: 0,
    views: [
        {
            tracks: [
                {
                    type: 'dummy-track',
                    id: 'table'
                }
            ],
            width: 600,
            // TODO: automatically align dummy track to other tracks or find a way to get height of titles etc., see issue #980
            height: linearHeight + circularRadius * 2 + 30
        },
        {
            arrangement: 'vertical',
            views: [
                {
                    layout: 'circular',
                    static: true,
                    alignment: 'overlay',
                    spacing: 0.1,
                    tracks: [
                        {
                            data: {
                                url: 'https://s3.amazonaws.com/gosling-lang.org/data/IslandViewer/NC_004631.1_genes.csv',
                                type: 'csv',
                                sampleLength: 1.7976931348623157e308,
                                chromosomeField: 'Accession',
                                genomicFields: ['Gene start', 'Gene end']
                            },
                            id: dataID,
                            x: { field: 'Gene start', type: 'genomic' },
                            xe: { field: 'Gene end', type: 'genomic' },
                            mark: 'rect',
                            visibility: [
                                {
                                    threshold: 1,
                                    target: 'mark',
                                    operation: 'lt',
                                    measure: 'zoomLevel'
                                }
                            ]
                        },
                        {
                            data: {
                                url: 'https://s3.amazonaws.com/gosling-lang.org/data/IslandViewer/NC_004631.1_GCcontent.csv',
                                type: 'csv',
                                separator: '\t',
                                genomicFields: ['Position']
                            },
                            y: { field: 'GCcontent', type: 'quantitative', range: [-250, 0], axis: 'none' },
                            mark: 'line',
                            size: { value: 0.5 },
                            x: { field: 'Position', type: 'genomic' },
                            color: {
                                value: 'black'
                            }
                        },
                        {
                            style: { outlineWidth: 1, outline: 'black' },
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
                            y: { field: 'row', type: 'nominal', flip: true },
                            mark: 'point',
                            x: { field: 'Gene start', type: 'genomic' },
                            size: { value: 3 },
                            color: {
                                field: 'Type',
                                type: 'nominal',
                                domain: ['Victors', 'BLAST', 'RGI', 'PAG'],
                                range: ['#460B80', '#A684EA', '#FF9CC1', '#FF9CC1']
                            }
                        },
                        {
                            ...islandData,
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
                            x: { linkingId: 'detail' }
                        }
                    ],
                    width: circularRadius * 2,
                    centerRadius: centerRadius
                },
                {
                    layout: 'linear',
                    xDomain: { chromosome: 'NC_004631.1', interval: [1000000, 1500000] },
                    linkingId: 'detail',
                    alignment: 'overlay',
                    tracks: [
                        {
                            data: {
                                url: 'https://s3.amazonaws.com/gosling-lang.org/data/IslandViewer/NC_004631.1_genes.csv',
                                type: 'csv',
                                chromosomeField: 'Accession',
                                genomicFields: ['Gene start', 'Gene end']
                            },
                            id: detailID,
                            x: { field: 'Gene start', type: 'genomic' },
                            xe: { field: 'Gene end', type: 'genomic' },
                            y: { value: 5.5 * linearSize },
                            size: { value: linearSize },
                            mark: 'rect',
                            dataTransform: [{ type: 'filter', field: 'Strand', oneOf: ['1'] }],
                            color: { value: '#E9967A' },
                            tooltip: [{ field: 'Gene name', type: 'nominal', alt: 'Name' }]
                        },
                        {
                            data: {
                                url: 'https://s3.amazonaws.com/gosling-lang.org/data/IslandViewer/NC_004631.1_genes.csv',
                                type: 'csv',
                                chromosomeField: 'Accession',
                                genomicFields: ['Gene start', 'Gene end']
                            },
                            x: { field: 'Gene start', type: 'genomic' },
                            xe: { field: 'Gene end', type: 'genomic' },
                            y: { value: 4.5 * linearSize },
                            size: { value: linearSize },
                            mark: 'rect',
                            dataTransform: [{ type: 'filter', field: 'Strand', oneOf: ['-1'] }],
                            color: { value: '#87976E' },
                            tooltip: [{ field: 'Gene name', type: 'nominal', alt: 'Name' }]
                        },
                        {
                            ...islandData,
                            mark: 'rect',
                            dataTransform: [{ type: 'filter', field: 'Method', oneOf: ['IslandPath-DIMOB'] }],
                            y: { value: 0.5 * linearSize },
                            size: { value: linearSize },
                            color: { value: '#4169E1' }
                        },
                        {
                            ...islandData,
                            mark: 'rect',
                            dataTransform: [{ type: 'filter', field: 'Method', oneOf: ['SIGI-HMM'] }],
                            y: { value: 1.5 * linearSize },
                            size: { value: linearSize },
                            color: { value: '#FF8C00' }
                        },
                        {
                            ...islandData,
                            mark: 'rect',
                            dataTransform: [{ type: 'filter', field: 'Method', oneOf: ['IslandPick'] }],
                            y: { value: 2.5 * linearSize },
                            size: { value: linearSize },
                            color: { value: '#008001' }
                        },
                        {
                            ...islandData,
                            mark: 'rect',
                            dataTransform: [{ type: 'filter', field: 'Method', oneOf: ['Islander'] }],
                            y: { value: 3.5 * linearSize },
                            size: { value: linearSize },
                            color: { value: '#40E0D0' }
                        },
                        {
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
                            row: { field: 'row', type: 'nominal' },
                            mark: 'point',
                            x: { field: 'Gene start', type: 'genomic' },
                            size: { value: 3 },
                            color: {
                                field: 'Type',
                                type: 'nominal',
                                domain: ['Victors', 'BLAST', 'RGI', 'PAG'],
                                range: ['#460B80', '#A684EA', '#FF9CC1', '#FF9CC1']
                            },
                            tooltip: [{ field: 'Type', type: 'nominal', alt: 'Name' }]
                        }
                    ],
                    width: circularRadius * 2,
                    height: linearHeight
                }
            ]
        }
    ]
};
const metaSpec = {
    type: 'table',
    dataTransform: [
        {
            type: 'merge',
            fields: ['Islands', 'Annotations'],
            mergeChar: '/',
            newField: 'Prediction Method'
        }
    ],
    genomicColumns: ['Gene start', 'Gene end'],
    chromosomeField: 'Accession',
    metadataColumns: [
        { type: 'genomic', columnName: 'Gene start' },
        { type: 'genomic', columnName: 'Gene end' },
        { type: 'nominal', columnName: 'Prediction Method' },
        { type: 'nominal', columnName: 'Gene name' },
        { type: 'nominal', columnName: 'Accnum' },
        { type: 'nominal', columnName: 'Product' }
    ],
    linkageType: 'jump',
    dataId: dataID
};

export default function IslandViewer() {
    return (
        <GoslingMetaComponent
            goslingSpec={goslingSpec}
            metaSpec={metaSpec}
            connectionType={{ type: 'weak', trackId: detailID, placeholderId: 'table' }}
        />
    );
}
