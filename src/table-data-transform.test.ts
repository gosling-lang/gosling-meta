import { mergeData, renameColumns } from './table-data-transform';

describe('Table Data Transformation', () => {
    it('Merge', () => {
        const merged = mergeData({ type: 'merge', fields: ['a', 'b'], mergeChar: '/', newField: 'd' }, [
            { a: 'a', b: 1, c: 'c' },
            { a: 'b', b: '1', c: 'd' },
            { a: 'a', b: 3, c: 'c' },
            { a: 'b', b: 4, c: 'a' },
            { a: 'b', b: '4', c: 'c' }
        ]);
        expect(merged).toMatchInlineSnapshot(`
          [
            {
              "c": "c",
              "d": "a/1",
            },
            {
              "c": "d",
              "d": "b/1",
            },
            {
              "c": "c",
              "d": "a/3",
            },
            {
              "c": "a",
              "d": "b/4",
            },
            {
              "c": "c",
              "d": "b/4",
            },
          ]
        `);
    });
    it('Rename', () => {
        const renamed = renameColumns({ type: 'rename', fields: ['a', 'b'], newFields: ['d', 'e'] }, [
            { a: 'a', b: 1, c: 'c' },
            { a: 'b', b: '1', c: 'd' },
            { a: 'a', b: 3, c: 'c' },
            { a: 'b', b: 4, c: 'a' },
            { a: 'b', b: '4', c: 'c' }
        ]);
        expect(renamed).toMatchInlineSnapshot(`
          [
            {
              "c": "c",
              "d": "a",
              "e": 1,
            },
            {
              "c": "d",
              "d": "b",
              "e": "1",
            },
            {
              "c": "c",
              "d": "a",
              "e": 3,
            },
            {
              "c": "a",
              "d": "b",
              "e": 4,
            },
            {
              "c": "c",
              "d": "b",
              "e": "4",
            },
          ]
        `);
    });
});
