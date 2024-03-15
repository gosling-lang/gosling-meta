import * as React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import IslandViewer from './IslandViewer';
import 'higlass/dist/hglib.css';
import GeneSpy from "./GeneSpy";
import IslandViewerHist from "./IslandViewerHist";
import IslandViewerBar from "./IslandViewerBar";
import IslandViewerVega from "./IslandViewerVega";

// The full list of examples
const examples = {
	IslandViewer: <IslandViewer/>,
	GeneSpy: <GeneSpy/>,
	IslandViewerHist: <IslandViewerHist/>,
	IslandViewerBar: <IslandViewerBar/>,
	IslandViewerVega: <IslandViewerVega/>
}

function App() {
	return (
		<div className='flex flex-row h-full w-full'>
			<div className='flex-none border-r-[1px]'>
				<div className='font-bold font-lg m-3'>Examples</div>
				<ol className='list-decimal list-inside divide-y divide-solid'>
					{Object.entries(examples).map(entry => <li className='p-3' key={entry[0]}><Link className='hover:underline' to={`/${entry[0].replace(' ', '_')}`}>{entry[0]}</Link></li>)}
				</ol>
			</div>
			<div className=''>
				<Routes>
					<Route path="/" element={examples.IslandViewer} />
					{Object.entries(examples).map(entry => <Route key={entry[0]} path={`/${entry[0].replace(' ', '_')}`} element={entry[1]}/>)}
				</Routes>
			</div>
		</div>
	);
}

export default App;