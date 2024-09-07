const { exec } = require("child_process");
const path = require("path");
const schedule = require("node-schedule");
const fs = require("fs");

class Recorder {
  constructor(name, command) {
    this.name = name;
    this.command = command;
  }

  getOutputFilePath() {
    const files = fs.readdirSync(path.join(__dirname, "ffmpeg"));
    let fileCount = files.length;
    if (this.name === "screen") {
      fileCount = fileCount + "screen";
    }
    return path.join(__dirname, `ffmpeg/output_${fileCount}.mp4`);
  }

  record() {
    const outputFilePath = this.getOutputFilePath();
    console.error(`Старт записи ${this.name}`);
    exec(this.command(outputFilePath), (error, _stdout, _stderr) => {
      if (error) {
        console.error(`Ошибка при записи ${this.name}: ${error.message}`);
        return;
      }
      console.log(
        `Видео ${this.name} записано и сохранено в ${outputFilePath}`,
      );
    });
  }
}

class Merger {
  mergeVideos() {
    const videoFiles = fs.readdirSync(path.join(__dirname, "ffmpeg")).filter(file => file.startsWith("output_") && file.endsWith(".mp4"));
    const groupedFiles = videoFiles.reduce((acc, file) => {
      const key = file.replace(/screen|video/, '');
      if (!acc[key]) acc[key] = [];
      acc[key].push(file);
      return acc;
    }, {});

    for (const key in groupedFiles) {
      if (groupedFiles[key].length < 2) continue;

      const videoFilePath = path.join(__dirname, "ffmpeg", groupedFiles[key].find(file => !file.includes("screen")));
      const screenFilePath = path.join(__dirname, "ffmpeg", groupedFiles[key].find(file => file.includes("screen")));
      const outputFilePath = path.join(__dirname, "ffmpeg", `merged_${key}.mp4`);

      const mergeCommand = `ffmpeg -i ${videoFilePath} -i ${screenFilePath} -filter_complex "[0:v]scale=1280:-1[v0];[1:v]scale=1280:-1[v1];[v0][v1]vstack=inputs=2[v]" -map "[v]" ${outputFilePath}`;

      exec(mergeCommand, (error, _stdout, _stderr) => {
        if (error) {
          console.error(`Ошибка при объединении видео: ${error.message}`);
          return;
        }
        console.log(`Видео успешно объединены и сохранены в ${outputFilePath}`);

        // Удаление исходных файлов после объединения
        fs.unlinkSync(videoFilePath);
        fs.unlinkSync(screenFilePath);
        console.log(`Исходные файлы удалены: ${videoFilePath}, ${screenFilePath}`);
      });
    }
  }
}

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

schedule.scheduleJob("* * * * *", () => videoRecorder.record());
schedule.scheduleJob("* * * * *", () => screenRecorder.record());

const merger = new Merger();
schedule.scheduleJob("*/2 * * * *", () => merger.mergeVideos());