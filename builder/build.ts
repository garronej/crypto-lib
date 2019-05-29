import * as buildTools from "frontend-build-tools";
import * as path from "path";

const module_dir_path = path.join(__dirname, "..", "..");

(async () => {

    await buildTools.tsc_browserify_minify(
        path.join(module_dir_path, "sync", "tsconfig.json"),
        path.join(module_dir_path, "dist", "sync", "_worker_thread" ,"main.js"),
        path.join(module_dir_path, "dist", "sync", "_worker_thread", "bundle.js")
    );

    await buildTools.tsc(
        path.join(module_dir_path, "async", "tsconfig.json")
    );

    await buildTools.tsc(
        path.join(module_dir_path, "test", "tsconfig.json")
    );


    for (const test_file_basename of ["aes", "perf"]) {

        const entry_point_file_path= path.join(module_dir_path, "dist", "test", `${test_file_basename}.js`);
        const dst_file_path = path.join(path.dirname(entry_point_file_path), `${test_file_basename}-bundled.js`);

        await buildTools.browserify(
            entry_point_file_path,
            dst_file_path
        );
        
        await buildTools.minify(dst_file_path);

        await buildTools.buildTestHtmlPage(dst_file_path);

    }


})();



