const Recorder = require("./Recorder");
const schedule = require("node-schedule");

const VIDEO_SIZE = "1280x720";
const SCREEN_SIZE = "1920x1080";
const FRAME_RATE = 30;

const videoRecorder = new Recorder(
  "video",
  (outputFilePath) =>
    `ffmpeg -f avfoundation -framerate ${FRAME_RATE} -video_size ${VIDEO_SIZE} -i "0" -t 2 -c:v libx264 ${outputFilePath}`,
);

const screenRecorder = new Recorder(
  "screen",
  (outputFilePath) =>
    `ffmpeg -f avfoundation -pix_fmt uyvy422 -framerate ${FRAME_RATE} -video_size ${SCREEN_SIZE} -probesize 100M -i "3:none" -t 2 -c:v libx264 -preset fast -crf 23 -level 4.1 ${outputFilePath}`,
);

schedule.scheduleJob("* * * * *", () => {
  try {
    videoRecorder.record();
    screenRecorder.record();
  } catch (error) {
    console.error("Error occurred:", error);
  }
});
