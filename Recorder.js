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

module.exports = Recorder;