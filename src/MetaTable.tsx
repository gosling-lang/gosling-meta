import React from 'react';

interface MetaTableProps {
    data: Array<Array<Record<string, string | number>>>; // this type seems to be incorrect
    width: number | string;
    height: number | string;
}

export default function MetaTable(props: MetaTableProps) {
    const { data, width, height } = props;

    // ...
    const tableKeys = ['Prediction Method', 'Gene name', 'Accnum', 'Product'];
    // ...

    return (
        <>
            {data.length === 0 ? null : (
                <div
                    style={{
                        height,
                        overflowY: 'scroll',
                        display: 'inline-block',
                        width
                    }}
                >
                    <table className="table-fixed border-collapse border border-slate-400">
                        <thead className="capitalize">
                            <tr className="border border-slate-300  bg-slate-100">
                                {tableKeys.map(d => (
                                    <th className="px-1" key={d}>
                                        {d}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(d => (
                                <tr className="border border-slate-300" key={d['Gene name']}>
                                    {tableKeys.map(key => {
                                        let value = '';
                                        if (key === 'Prediction Method') {
                                            if (d.Islands.length > 0) {
                                                if (d.Annotations.length > 0) {
                                                    value = d.Islands + '/' + d.Annotations;
                                                } else {
                                                    value = d.Islands;
                                                }
                                            } else if (d.Annotations.length > 0) {
                                                value = d.Annotations;
                                            }
                                        } else {
                                            value = d[key];
                                        }
                                        return (
                                            <td className="px-1" key={key}>
                                                {value}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
