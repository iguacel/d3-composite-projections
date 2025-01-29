import tape from "tape";
import { readFileSync, createWriteStream } from "fs";
import { geoPath, geoGraticule } from "d3-geo";
import pixelmatch from "pixelmatch";
import { createCanvas } from "canvas";
import { PNG } from "pngjs";
import topojson from "topojson-client";


import geoConicConformalSpain from "../src/conicConformalSpain.js";

const projections = [
  {
    name: "conicConformalSpain",
    projection: geoConicConformalSpain,
    topojson: "./data/provincias.json",
    field: "provincias",
  },
];

// tape("Checks the actual image outputs", async function (test) {
//   for (const d of projections) {
//     await render(d.projection, d.name, d.topojson, d.field);
//     let img1 = PNG.sync.read(readFileSync("test/output/" + d.name + ".png"));
//     let img2 = PNG.sync.read(readFileSync("test/samples/" + d.name + ".png"));
//     let diff = pixelmatch(img1.data, img2.data, null, img1.width, img1.height, {
//       threshold: 0.0,
//     });

//     test.true(diff == 0, d.name + " matches the sample file");
//   }

//   test.end();
// });

function render(projection, name, topojsonName, layerName) {
  const width = 960,
    height = 500;

  const canvas = createCanvas(width, height),
    context = canvas.getContext("2d");

  const data = JSON.parse(readFileSync(`./test/${topojsonName}`), "utf8"),
    graticule = geoGraticule(),
    outline = { type: "Sphere" };
  const path = geoPath()
    .projection(projection().precision(0.1))
    .context(context);

  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.save();

  context.beginPath();
  path(topojson.feature(data, data.objects[layerName]));
  context.fillStyle = "#aca";
  context.strokeStyle = "#000";
  context.fill();
  context.stroke();

  context.beginPath();
  path(graticule());
  context.strokeStyle = "rgba(119,119,119,0.5)";
  context.stroke();

  context.restore();

  context.beginPath();
  path(outline);
  context.strokeStyle = "#00F";
  context.stroke();

  context.beginPath();
  context.strokeStyle = "#F00";
  projection().drawCompositionBorders(context);
  context.stroke();

  return new Promise((resolve) => {
    const out = createWriteStream(`test/output/${name}.png`);
    canvas.createPNGStream().pipe(out);
    out.on("finish", () => resolve());
  });
}
