import { AutoModel, AutoProcessor, env, RawImage } from "@huggingface/transformers";

// Since we will download the model from the Hugging Face Hub, we can skip the local model check
env.allowLocalModels = true;

// Proxy the WASM backend to prevent the UI from freezing
env.backends.onnx.wasm.proxy = true;

class RMBGModelSingleton {
  static pretrainedModel = 'briaai/RMBG-1.4';
  static model = null;
  static processor = null;

  static async getInstance() {
    if (!this.model || !this.processor) {
      self.postMessage({ status: 'initiate', message: '开始加载模型...' });

      try {
        [this.model, this.processor] = await Promise.all([
          (async () => {
            self.postMessage({ status: 'loading', message: '加载 RMBG 模型中...' });
            return await AutoModel.from_pretrained(this.pretrainedModel, {
              config: { model_type: 'custom' },
            });
          })(),
          (async () => {
            self.postMessage({ status: 'loading', message: '加载图像处理器中...' });
            return await AutoProcessor.from_pretrained(this.pretrainedModel, {
              config: {
                do_normalize: true,
                do_pad: false,
                do_rescale: true,
                do_resize: true,
                image_mean: [0.5, 0.5, 0.5],
                feature_extractor_type: "ImageFeatureExtractor",
                image_std: [1, 1, 1],
                resample: 2,
                rescale_factor: 0.00392156862745098,
                size: { width: 1024, height: 1024 },
              }
            });
          })()
        ]);

        self.postMessage({ status: 'ready', message: '模型加载完成，可以开始处理图片' });
      } catch (error) {
        self.postMessage({
          status: 'error',
          message: '模型加载失败',
          error: error.message
        });
        throw error;
      }
    }
    return { model: this.model, processor: this.processor };
  }
}

// Initialize the model and processor when the worker loads
RMBGModelSingleton.getInstance();

self.addEventListener('message', async ({ data }) => {
  const { model, processor } = await RMBGModelSingleton.getInstance();
  const image = await RawImage.fromURL(data.url);
  // Preprocess image and predict alpha matte
  const { pixel_values } = await processor(image);
  const { output } = await model({ input: pixel_values });

  // Resize mask back to original size
  const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height);

  // Send the output back to the main thread
  self.postMessage({
    status: 'complete',
    mask,
  });
});