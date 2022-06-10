import "bulmaswatch/superhero/bulmaswatch.min.css";
import ReachDom from "react-dom";
import React, { useState, useEffect, useRef } from "react";
import * as esBuild from "esbuild-wasm";
import { unpkgPathPlugin } from "./plugins/esBuildPlugin";
import { fetchPlugin } from "./plugins/fetchPlugin";
import CodeEditor from "./components/code-editor";

const jsxString = "import react from 'react'";

const App = () => {
	const ref = useRef<any>();
	const iframe = useRef<any>();
	const [input, setInput] = useState(jsxString);
	const [code, setCode] = useState("");

	useEffect(() => {
		startService();
	}, []);

	const onSubmit = async () => {
		if (!ref.current) {
			return;
		}

		iframe.current.srcdoc = html;

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

		// setCode(result.outputFiles[0].text);
		iframe.current.contentWindow.postMessage(result.outputFiles[0].text, "*");
	};

	const html = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('message', (event) => {
            try {
              eval(event.data);
            } catch (err) {
              const root = document.querySelector('#root');
              root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
              console.error(err);
            }
          }, false);
        </script>
      </body>
    </html>
  `;

	const startService = async () => {
		ref.current = await esBuild.startService({
			worker: true,
			wasmURL: "/esbuild.wasm",
		});
	};

	return (
		<div>
			<CodeEditor
				initialValue="console.log('Hello World');"
				onChange={(value) => setInput(value)}
			/>
			<textarea
				value={input}
				onChange={(e) => setInput(e.target.value)}
			></textarea>
			<div>
				<button onClick={onSubmit}>Submit</button>
			</div>
			<iframe
				title="code preview"
				sandbox="allow-scripts"
				srcDoc={html}
				ref={iframe}
			/>
			<pre>{code}</pre>
		</div>
	);
};

ReachDom.render(<App />, document.querySelector("#root"));
