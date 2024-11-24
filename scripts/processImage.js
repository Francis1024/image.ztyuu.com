const fs = require('fs/promises');
const { transparentBackground } = require('transparent-background');
const path = require('path');

async function processImage(inputPath) {
  try {
    const input = await fs.readFile(inputPath);
    const output = await transparentBackground(input, 'png', {
      fast: false,
    });
    const outputPath = inputPath.replace('.png', '-output.png');
    await fs.writeFile(outputPath, output);
    return outputPath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

module.exports = processImage;