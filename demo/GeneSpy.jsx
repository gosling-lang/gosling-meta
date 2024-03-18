import React from 'react';
import { GoslingMetaComponent } from '../src/index.ts';

const gosId = 'gosID';
const goslingSpec = {
    title: 'GeneSpy + iTol',
    subtitle: 'Genomic neighborhood visualization with aligned phylogenetic tree',
    description: 'Idea: https://doi.org/10.1093/bioinformatics/bty459',
    assembly: [['', 11000]],
    arrangement: 'horizontal',
    spacing: 0,
    static: true,
    views: [
        {
            tracks: [
                {
                    type: 'dummy-track',
                    id: 'tree'
                }
            ],
            width: 350,
            // TODO: see issue #980
            height: 330
        },
        {
            alignment: 'overlay',
            data: {
                url: 'https://s3.amazonaws.com/gosling-lang.org/data/GeneSpy/gene_spy_example.csv',
                type: 'csv',
                genomicFields: ['Gene start', 'Gene end']
            },
            color: {
                field: 'type',
                type: 'nominal',
                domain: ['anchor', 'conserved', 'disrupted'],
                range: ['red', 'gray', 'yellow']
            },
            id: gosId,
            row: {
                field: 'Accession',
                type: 'nominal'
            },
            tracks: [
                {
                    dataTransform: [{ type: 'filter', field: 'Strand', oneOf: ['+'] }],
                    mark: 'triangleRight',
                    style: { align: 'right' },
                    x: { field: 'Gene start', type: 'genomic', axis: 'none' },
                    xe: { field: 'Gene end', type: 'genomic' }
                },
                {
                    dataTransform: [{ type: 'filter', field: 'Strand', oneOf: ['-'] }],
                    mark: 'triangleLeft',
                    style: { align: 'left' },
                    x: { field: 'Gene start', type: 'genomic' },
                    xe: { field: 'Gene end', type: 'genomic' }
                }
            ],
            height: 300
        }
    ]
};
const metaSpec = {
    type: 'tree',
    data: {
        url: 'https://s3.amazonaws.com/gosling-lang.org/data/GeneSpy/gene_spy_tree.json',
        type: 'json'
    },
    width: 400
};

export default function GeneSpy() {
    return (
        <GoslingMetaComponent
            goslingSpec={goslingSpec}
            metaSpec={metaSpec}
            connectionType={{ type: 'strong', trackId: gosId, placeholderId: 'tree' }}
        />
    );
}
