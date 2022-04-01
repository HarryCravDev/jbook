import ReachDom from "react-dom";
import React, { useState, useEffect, useRef } from "react";
import * as esBuild from "esbuild-wasm";
import { unpkgPathPlugin } from "./plugins/esBuildPlugin";
import { fetchPlugin } from "./plugins/fetchPlugin";

const jsxString = "import react from 'react'";

const App = () => {
	const ref = useRef<any>();
	const [input, setInput] = useState(jsxString);
	const [code, setCode] = useState("");

	useEffect(() => {
		startService();
	}, []);

	const onSubmit = async () => {
		if (!ref.current) {
			return;
		}

		const result = await ref.current.build({
			entryPoints: ["index.js"],
			bundle: true,
			write: false,
			plugins: [unpkgPathPlugin(), fetchPlugin(input)],
			define: {
				"process.env.NODE_ENV": "'production'",
				global: "window",
			},
		});

		setCode(result.outputFiles[0].text);
	};

	const startService = async () => {
		ref.current = await esBuild.startService({
			worker: true,
			wasmURL: "/esbuild.wasm",
		});
	};

	return (
		<div>
			<textarea
				value={input}
				onChange={(e) => setInput(e.target.value)}
			></textarea>
			<div>
				<button onClick={onSubmit}>Submit</button>
			</div>
			<pre>{code}</pre>
		</div>
	);
};

ReachDom.render(<App />, document.querySelector("#root"));
