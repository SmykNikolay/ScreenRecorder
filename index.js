const Recorder = require("./Recorder");
const Merger = require("./Merger");
const schedule = require("node-schedule");

const videoRecorder = new Recorder(
  "video",
  (outputFilePath) =>
    `ffmpeg -f avfoundation -framerate 30 -video_size 1280x720 -i "0" -t 10 -c:v libx264 ${outputFilePath}`,
);
const screenRecorder = new Recorder(
  "screen",
  (outputFilePath) =>
    `ffmpeg -f avfoundation -pix_fmt uyvy422 -framerate 30 -video_size 1920x1080 -probesize 100M -i "3:none" -t 10 -c:v libx264 -preset fast -crf 23 -level 4.1 ${outputFilePath}`,
);

const screenshotRecorder = new Recorder(
  "screen",
  (outputFilePath) =>
    `ffmpeg -f avfoundation -framerate 1 -video_size 1920x1080 -i "3:none" -vframes 1 ${outputFilePath}`,
);

const cameraScreenshotRecorder = new Recorder(
  "camera",
  (outputFilePath) =>
    `ffmpeg -f avfoundation -framerate 30 -video_size 1280x720 -i "0:none" -vframes 1 ${outputFilePath}`,
);

const merger = new Merger();
// schedule.scheduleJob("* * * * *", () => videoRecorder.record());
// schedule.scheduleJob("* * * * *", () => screenRecorder.record());
schedule.scheduleJob("* * * * *", () => screenshotRecorder.capture());
schedule.scheduleJob("* * * * *", () => cameraScreenshotRecorder.capture());

schedule.scheduleJob("* * * * *", () => merger.mergeVideos());
schedule.scheduleJob("* * * * *", () => merger.mergeAllMergedVideos());
