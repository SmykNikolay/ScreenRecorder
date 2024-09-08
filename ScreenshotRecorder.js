const { exec } = require("child_process");
const path = require("path");

class ScreenshotRecorder {
  constructor(name, command) {
    this.name = name;
    this.command = command;
  }

  getOutputFilePath() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    let fileName = this.name === "screen" ? `${minutes}screen` : minutes;
    return path.join(__dirname, `ffmpeg/screenshot_${fileName}.png`);
  }

  capture() {
    const outputFilePath = this.getOutputFilePath();
    console.error(`Старт захвата скриншота ${this.name}`);
    exec(this.command(outputFilePath), (error, _stdout, _stderr) => {
      if (error) {
        console.error(`Ошибка при захвате скриншота ${this.name}: ${error.message}`);
        return;
      }
      console.log(
        `Скриншот ${this.name} захвачен и сохранен в ${outputFilePath}`,
      );
    });
  }
}

module.exports = ScreenshotRecorder;