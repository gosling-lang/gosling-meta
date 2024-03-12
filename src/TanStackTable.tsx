import React from 'react'

import './index.css'

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'
import {Datum} from "gosling.js/dist/src/gosling-schema";

interface TanStackTableProps {
    data: Datum[];
    columnNames: string[];
    isSortable: boolean;
    isJumpable: boolean;
    jump: (range: [{ chromosome: string, position: number }, {
        chromosome: string,
        position: number
    }]) => void;
}

export default function TanStackTable(props: TanStackTableProps) {
    const {data, columnNames, isSortable, isJumpable, jump} = props;

    const [sorting, setSorting] = React.useState<SortingState>([])

    const columns = React.useMemo<ColumnDef<Datum>[]>(() => {
        return columnNames.map(col => {
            return ({
                accessorKey: col,
            })
        })
    }, [])
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className="p-2">
            <div className="h-2"/>
            <table>
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => {
                            return (
                                <th key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : (
                                            isSortable?<div
                                                {...{
                                                    className: header.column.getCanSort()
                                                        ? 'cursor-pointer select-none'
                                                        : '',
                                                    onClick: header.column.getToggleSortingHandler(),
                                                }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {{
                                                    asc: ' 🔼',
                                                    desc: ' 🔽',
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </div>:
                                                flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )
                                        )}
                                    </th>
                            )
                        })}
                        {isJumpable ? <th/> : null}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table
                    .getRowModel()
                    .rows
                    .map(row => {
                        return (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => {
                                    return (
                                        <td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    )
                                })}
                                {isJumpable ? <td>
                                    <button onClick={() =>
                                        jump([{
                                            chromosome: String(row.original.Accession),
                                            position: Number(row.original["Gene start"])
                                        }, {
                                            chromosome: String(row.original.Accession),
                                            position: Number(row.original["Gene end"])
                                        }])
                                    }>Jump
                                    </button>
                                </td> : null}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <div>{table.getRowModel().rows.length} Rows</div>
        </div>
    )
}
