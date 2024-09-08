class RecorderFactory {
  createRecorder(type) {
    throw new Error("This method should be overridden!");
  }
}

module.exports = RecorderFactory;