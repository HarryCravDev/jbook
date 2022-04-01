import * as esbuild from "esbuild-wasm";

export const unpkgPathPlugin = () => {
	return {
		name: "unpkg-path-plugin",
		setup(build: esbuild.PluginBuild) {
			// * Handle root entry file of name 'index.js'
			build.onResolve({ filter: /(^index\.js$)/ }, (args: any) => {
				return { path: args.path, namespace: "a" };
			});

			// * Handle relative paths in module
			build.onResolve({ filter: /^\.+\// }, (args: any) => {
				return {
					path: new URL(args.path, "https://unpkg.com" + args.resolveDir + "/")
						.href,
					namespace: "a",
				};
			});

			// * Handle main file of module
			build.onResolve({ filter: /.*/ }, async (args: any) => {
				console.log("onResole", args);
				return { path: `https://unpkg.com/${args.path}`, namespace: "a" };
			});
		},
	};
};
