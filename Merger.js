const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");



class Merger {
    mergeVideos() {
      const videoFiles = fs
        .readdirSync(path.join(__dirname, "ffmpeg"))
        .filter((file) => file.startsWith("output_") && file.endsWith(".mp4"));
      const groupedFiles = videoFiles.reduce((acc, file) => {
        const key = file.replace(/screen|video/, "");
        if (!acc[key]) acc[key] = [];
        acc[key].push(file);
        return acc;
      }, {});
  
      for (const key in groupedFiles) {
        if (groupedFiles[key].length < 2) continue;
        console.warn(`Объединение видео ${key}`);
        const videoFilePath = path.join(
          __dirname,
          "ffmpeg",
          groupedFiles[key].find((file) => !file.includes("screen")),
        );
        const screenFilePath = path.join(
          __dirname,
          "ffmpeg",
          groupedFiles[key].find((file) => file.includes("screen")),
        );
        const outputFilePath = path.join(
          __dirname,
          "ffmpeg",
          `merged_${key}.mp4`,
        );
  
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
          console.warn(
            `Исходные файлы удалены: ${videoFilePath}, ${screenFilePath}`,
          );
        });
      }
    }
  }

  module.exports = Merger;