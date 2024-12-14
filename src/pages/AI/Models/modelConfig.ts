// src/pages/AI/Models/modelConfig.ts

export const providers = [
    { label: '阿里百炼', value: 'Aliyun' },
    { label: 'DeepSeek', value: 'DeepSeek' },
    { label: '智谱清言', value: 'ChatGLM' },
    { label: '硅基流动', value: 'Siliconflow' },
    { label: 'Ollama', value: 'Ollama' },
    { label: 'OpenAI', value: 'OpenAI' },
    { label: '零一万物', value: 'YI' },
  ];
  
  export const modelTypes = [
    { label: '聊天', value: 'Chat' },
    { label: '向量', value: 'Embedding' },
    { label: '图片', value: 'Image' },
    { label: '视觉', value: 'Vision' },
    { label: '音频', value: 'Voice' },
  ];
  
  export const providerModels = {
    Aliyun: [
      { type: 'Chat', model: 'qwen-max-latest' },
      { type: 'Chat', model: 'qwen-plus' },
      { type: 'Vision', model: 'qwen-vl-max' },
      { type: 'Embedding', model: 'text-embedding-v3' },
      { type: 'Image', model: 'flux-schnell' },
      { type: 'Voice', model: 'paraformer-v2' },
      { type: 'Voice', model: 'cosyvoice-v1' },
    ],
    DeepSeek: [{ type: 'Chat', model: 'deepseek-chat' }],
    ChatGLM: [
      { type: 'Chat', model: 'glm-4-plus' },
      { type: 'Vision', model: 'glm-4v-plus' },
      { type: 'Embedding', model: 'embedding-3' },
    ],
    OpenAI: [
      { type: 'Chat', model: 'gpt-4o-mini' },
      { type: 'Chat', model: 'gpt-4o' },
      { type: 'Vision', model: 'gpt-4o' },
      { type: 'Embedding', model: 'text-embedding-3-small' },
      { type: 'Embedding', model: 'text-embedding-3-large' },
    ],
    Siliconflow: [
      { type: 'Image', model: 'black-forest-labs/FLUX.1-schnell' },
      { type: 'Voice', model: 'FunAudioLLM/SenseVoiceSmall' },
    ],
    YI: [
      { type: 'Chat', model: 'yi-lightning' },
    ],
    Ollama: [
      { type: 'Chat', model: 'qwen2.5:14b' },
      { type: 'Chat', model: 'qwen2.5:32b' },
      { type: 'Chat', model: 'qwen2.5:72b' },
      { type: 'Embedding', model: 'shaw/dmeta-embedding-zh' },
      { type: 'Vision', model: 'minicpm-v:latest' },
    ],
  };
  
  export const providerBaseURLMap = {
    OpenAI: 'https://api.openai-hk.com/v1',
    Aliyun: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    DeepSeek: 'https://api.deepseek.com/v1',
    Ollama: 'http://localhost:11434/v1',
    Siliconflow: 'https://api.siliconflow.cn/v1',
    ChatGLM: 'https://open.bigmodel.cn/api/paas/v4',
    YI: 'https://api.lingyiwanwu.com/v1',
    MiniMax: 'https://api.minimax.chat/v1',
    Claude: 'https://api.anthropic.com/v1',
  };