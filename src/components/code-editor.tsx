import React, { useRef } from "react";
import "./code-editor.css";
import MonacoEditor, { OnMount } from "@monaco-editor/react";
import prettier from "prettier";
import parser from "prettier/parser-babel";

interface ICodeEditorProps {
	initialValue: string;
	onChange(value: string): void;
}

const CodeEditor: React.FC<ICodeEditorProps> = ({ onChange, initialValue }) => {
	const editorRef = useRef<any>();

	const onEditorChange: OnMount = (editor, monaco) => {
		editorRef.current = editor;

		editor.onDidChangeModelContent(() => {
			console.log(editor.getValue());
			onChange(editor.getValue());
		});

		editor.getModel()?.updateOptions({ tabSize: 2 });
	};

	const onFormatClick = () => {
		const unformatted = editorRef.current.getModel().getValue();

		const formatted = prettier
			.format(unformatted, {
				parser: "babel",
				plugins: [parser],
				useTabs: true,
				semi: true,
				singleQuote: true,
			})
			.replace(/\n$/, "");

		editorRef.current.setValue(formatted);
	};

	return (
		<div className="editor-wrapper">
			<button
				className="button button-format format-button is-primary is-small"
				onClick={onFormatClick}
			>
				Format
			</button>
			<MonacoEditor
				defaultValue={initialValue}
				onMount={onEditorChange}
				theme="vs-dark"
				language="javascript"
				height="500px"
				options={{
					wordWrap: "on",
					minimap: { enabled: false },
					showUnused: false,
					folding: false,
					lineNumbersMinChars: 3,
					fontSize: 16,
					scrollBeyondLastLine: false,
					automaticLayout: true,
				}}
			/>
		</div>
	);
};

export default CodeEditor;
