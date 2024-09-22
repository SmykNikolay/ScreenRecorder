const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

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

  mergeAllMergedVideos() {
    console.log("Объединение всех видео в одно...");
    const now = new Date();

    const mergedFiles = fs
      .readdirSync(path.join(__dirname, "ffmpeg"))
      .filter((file) => file.startsWith("merged_") && file.endsWith(".mp4"));

    if (mergedFiles.length === 0) {
      console.warn("Нет файлов для объединения.");
      return;
    }

    const outputFilePath = path.join(
      __dirname,
      "ffmpeg",
      `final_merged_output${now.toISOString()}.mp4`,
    );

    // Если файл уже существует, добавьте его в начало списка
    if (fs.existsSync(outputFilePath)) {
      mergedFiles.unshift("final_merged_output.mp4");
    }

    const fileListPath = path.join(__dirname, "ffmpeg", "filelist.txt");
    fs.writeFileSync(
      fileListPath,
      mergedFiles
        .map((file) => `file '${path.join(__dirname, "ffmpeg", file)}'`)
        .join("\n"),
    );

    const mergeCommand = `ffmpeg -f concat -safe 0 -i ${fileListPath} -c copy ${outputFilePath}`;

    exec(mergeCommand, (error, _stdout, _stderr) => {
      if (error) {
        console.error(`Ошибка при объединении всех видео: ${error.message}`);
        return;
      }
      console.log(
        `Все видео успешно объединены и сохранены в ${outputFilePath}`,
      );

      // Удаление временного файла списка
      fs.unlinkSync(fileListPath);
      console.warn(`Временный файл списка удален: ${fileListPath}`);

      // Удаление объединенных файлов после успешного объединения
      mergedFiles.forEach((file) => {
        if (file !== "final_merged_output.mp4") {
          const filePath = path.join(__dirname, "ffmpeg", file);
          fs.unlinkSync(filePath);
          console.warn(`Удален файл: ${filePath}`);
        }
      });
      console.warn("Все исходные файлы объединены и удалены.");
    });
  }
}

module.exports = Merger;

