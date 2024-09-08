const { exec } = require("child_process");
const path = require("path");

class Recorder {
  constructor(name, command) {
    this.name = name;
    this.command = command;
  }

  getOutputFilePath() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    let fileName = this.name === "screen" ? `${minutes}screen` : minutes;
    return path.join(__dirname, `ffmpeg/output_${fileName}.mp4`);
  }

  createBlackScreenVideo(outputFilePath) {
    const blackScreenCommand = `ffmpeg -f lavfi -i color=c=black:s=1280x720:d=10 -c:v libx264 ${outputFilePath}`;
    exec(blackScreenCommand, (error, _stdout, _stderr) => {
      if (error) {
        console.error(`Ошибка при создании черного экрана: ${error.message}`);
        return;
      }
      console.log(`Черный экран создан и сохранен в ${outputFilePath}`);
    });
  }

  createBlackScreenImage(outputFilePath) {
    const blackScreenCommand = `ffmpeg -f lavfi -i color=c=black:s=1280x720 -vframes 1 ${outputFilePath}`;
    exec(blackScreenCommand, (error, _stdout, _stderr) => {
      if (error) {
        console.error(`Ошибка при создании черного экрана: ${error.message}`);
        return;
      }
      console.log(`Черный экран создан и сохранен в ${outputFilePath}`);
    });
  }

  record() {
    const outputFilePath = this.getOutputFilePath();
    console.error(`Старт записи ${this.name}`);
    exec(this.command(outputFilePath), (error, _stdout, _stderr) => {
      if (error) {
        console.error(`Ошибка при записи ${this.name}: ${error.message}`);
        this.createBlackScreenVideo(outputFilePath);
        return;
      }
      console.log(
        `Видео ${this.name} записано и сохранено в ${outputFilePath}`,
      );
    });
  }

  capture() {
    const outputFilePath = this.getOutputFilePath();
    console.error(`Старт захвата скриншота ${this.name}`);
    exec(this.command(outputFilePath), (error, _stdout, _stderr) => {
      if (error) {
        console.error(`Ошибка при захвате скриншота ${this.name}: ${error.message}`);
        this.createBlackScreenImage(outputFilePath);
        return;
      }
      console.log(
        `Скриншот ${this.name} захвачен и сохранен в ${outputFilePath}`,
      );
    });
  }
}

module.exports = Recorder;