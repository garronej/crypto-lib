import * as buildTools from "frontend-build-tools";
import * as path from "path";

const module_dir_path = path.join(__dirname, "..", "..");

(async () => {

    const watch = process.argv[2] === "-w" ? "WATCH" as const : undefined;

    await buildTools.tsc_browserify_minify(
        path.join(module_dir_path, "sync", "tsconfig.json"),
        path.join(module_dir_path, "dist", "sync", "_worker_thread", "main.js"),
        path.join(module_dir_path, "dist", "sync", "_worker_thread", "bundle.js"),
        watch
    );

    await buildTools.tsc(
        path.join(module_dir_path, "async", "tsconfig.json"),
        watch
    );

    await buildTools.brfs(
        path.join(module_dir_path, "dist", "async", "index.js"),
        watch
    );

    await buildTools.tsc(
        path.join(module_dir_path, "test", "tsconfig.json"),
        watch
    );

    for (const test_file_basename of ["perf", "scrypt", "rsa"]) {

        (async () => {

            const entry_point_file_path = path.join(module_dir_path, "dist", "test", `${test_file_basename}.js`);
            const dst_file_path = path.join(module_dir_path, "docs", `${test_file_basename}-bundled.js`);

            await buildTools.browserify(
                entry_point_file_path,
                dst_file_path,
                watch
            );

            await buildTools.minify(
                dst_file_path,
                watch
            );

            await buildTools.buildTestHtmlPage(
                dst_file_path,
                watch
            );


        })();


    }


})();



