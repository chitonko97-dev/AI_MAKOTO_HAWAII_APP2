import { cp, mkdir, rm } from "node:fs/promises";

const outputDirectory = new URL("../www/", import.meta.url);
const projectRoot = new URL("../", import.meta.url);
const files = [
  "index.html",
  "style.css",
  "script.js",
  "spots.json",
  "manifest.json",
  "assets"
];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const file of files) {
  await cp(new URL(file, projectRoot), new URL(file, outputDirectory), {
    recursive: true
  });
}

console.log("iOS用Webファイルを www に準備しました。");
