const asyncHandler = require("express-async-handler");
const { path: ffmpegPath } = require("@ffmpeg-installer/ffmpeg");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

const ROOT_DIR = path.resolve(__dirname);
const VIDEO_PATH = path.join(ROOT_DIR, "video.mp4");

async function drawCirclesOnFrame(framePath, circles, radius) {
  return new Promise(async (resolve, reject) => {
    try {
      const image = await Jimp.read(framePath);
      const circleColor = Jimp.rgbaToInt(255, 0, 0, 255); // Red color

      for (const { x, y } of circles) {
        for (let angle = 0; angle < 360; angle++) {
          const radians = angle * (Math.PI / 180);
          const dx = Math.round(radius * Math.cos(radians));
          const dy = Math.round(radius * Math.sin(radians));
          image.setPixelColor(circleColor, x + dx, y + dy);
        }
      }

      await image.writeAsync(framePath);
      console.log(`Circles drawn on frame: ${framePath}`);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function combineFramesToVideo(outputDir, outputVideo, fps) {
  return new Promise((resolve, reject) => {
    console.log(`Combining frames into video ${outputVideo}...`);

    ffmpeg()
      .addInput(path.join(outputDir, "frame-%d.png"))
      .inputFPS(fps)
      .output(outputVideo)
      .on("end", () => {
        console.log(`Video created: ${outputVideo}`);
        resolve();
      })
      .on("error", (err) => {
        console.error(`Error combining frames into video: ${err.message}`);
        reject(err);
      })
      .run();
  });
}

// API route to process video
const generateVideo = asyncHandler(async (req, res) => {
  const data = req.body.circles;
  const radius = 10;
  const inputVideo = VIDEO_PATH;
  const outputDir = path.join(ROOT_DIR, "frames");
  const outputVideo = path.join(ROOT_DIR, "output.mp4");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  try {
    console.log(`Extracting all frames from video...`);
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputVideo, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });

    const fps = metadata.streams[0].r_frame_rate
      .split("/")
      .reduce((a, b) => a / b);
    const duration = metadata.streams[0].duration;
    const frameCount = Math.ceil(duration * fps);

    await new Promise((resolve, reject) => {
      ffmpeg(inputVideo)
        .output(path.join(outputDir, "frame-%d.png"))
        .outputOptions("-vf", `fps=${fps}`)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    const framesToProcess = Array.from({ length: frameCount }, (_, i) => i + 1);
    const circleFrames = data.map(({ time }) => Math.round(time * fps));

    for (const frameIndex of framesToProcess) {
      const relevantCircles = new Set(
        circleFrames.filter((circleFrame) => circleFrame <= frameIndex)
      ); // Use Set for efficient membership checking

      const framePath = path.join(outputDir, `frame-${frameIndex}.png`);
      const circlesToDraw = [];
      for (let i = 0; i < data.length; i++) {
        if (relevantCircles.has(circleFrames[i])) {
          circlesToDraw.push(data[i]);
        }
      }

      await drawCirclesOnFrame(framePath, circlesToDraw, radius);
    }

    console.log(`Combining frames to video...`);
    await combineFramesToVideo(outputDir, outputVideo, fps);
    res.json({ message: "Video processing complete!", outputVideo });
  } catch (err) {
    console.error(`Error processing video: ${err.message}`);
    res
      .status(500)
      .json({ error: "Error processing video", details: err.message });
  } finally {
    fs.readdir(outputDir, (err, files) => {
      if (err) {
        console.error(`Error reading frames directory: ${err.message}`);
        return;
      }
      for (const file of files) {
        fs.unlink(path.join(outputDir, file), (err) => {
          if (err) {
            console.error(`Error deleting frame file ${file}: ${err.message}`);
          } else {
            console.log(`Deleted frame file: ${file}`);
          }
        });
      }
    });
  }
});

module.exports = { generateVideo };
