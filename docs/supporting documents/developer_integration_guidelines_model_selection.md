# **Developer Integration Guidelines for AI Model Selection (Cine-AI Model-Agnostic Framework)**

This document defines how Cine-AI maintains full model agnosticism across all stages. Developers can plug in ANY LLM, image model, audio model, or video model without modifying upstream logic.

---

# **1. Overview**
Cine-AI is designed to support:
- OpenAI models (text, image, video)
- Anthropic models
- Stability AI / SDXL / Flux
- Runway, Pika, Kling (video)
- Any custom model served through REST

Model independence is achieved through:
1. A unified model adapter layer
2. Normalized input/output schemas
3. Stage-locked constraints
4. Validation layers between each stage

---

# **2. Model Adapter Layer Architecture**
All models must implement the following interface:
```
model.generate({ prompt: string, parameters: {...} }) → { output: string | object }
```
The adapter transforms:
- Cine-AI prompts → model-specific payload
- Model output → Cine-AI standard schema

### **Responsibilities of Model Adapter:**
- Convert generic prompts to model-native format
- Apply model-specific parameters (temperature, style tokens, image size)
- Normalize model output fields back into Cine-AI schemas
- Handle failures and transform error messages

---

# **3. Model Assignment Rules by Stage**

### **Stage 1 — Story Generation (LLM)**
Model must:
- Support long text generations
- Maintain narrative coherence
- Obey constraints strictly

Recommended types:
- GPT, Claude, Gemini

---

### **Stage 2 — Story Editing Validator (LLM)**
Model must:
- Support controlled regeneration
- Operate in instruction-following mode

---

### **Stage 3 — Scene Generation (LLM)**
Model must:
- Produce highly structured outputs
- Follow PWA-4.0 rules without deviation

---

### **Stage 4 — Image Prompt Assembly (LLM)**
Any LLM can perform structured assembly here.

---

### **Stage 5 — Motion Cue Generation (LLM)**
Must:
- Produce short, controlled motion descriptors
- Avoid continuous actions

---

### **Image Model Requirements (for user-selected model)**
Image models must accept:
- Freeform prompt text
- Optional style parameters (if supported)

Output should be:
- Image data URL or storage reference
- Metadata describing seed/model used

---

### **Video Model Requirements**
Video models must accept:
- Scene image prompts
- Minimal motion cue
- Optional narration

Output:
- Video file reference
- Generation metadata

---

# **4. Model Registry Specification**
Developers maintain a registry:
```
models: {
  "gpt-5": { type: "llm", maxTokens: 8000 },
  "flux-image": { type: "image", size: "1024x1024" },
  "runway-video": { type: "video", fps: 24 }
}
```
Each model entry defines:
- Type
- Capabilities
- Rate limits
- Cost profile
- Default parameters

---

# **5. Switching Models Mid-Project**
Cine-AI allows model switching at ANY stage.

If the user changes the model:
- Re-run the current stage
- Downstream stages regenerate automatically
- Upstream stages remain intact

---

# **6. Error Handling for Unsupported Models**
If a model cannot satisfy a stage requirement:
- Adapter returns a structured error
- UI prompts user to choose another model

Error Example:
```
{
  "error": true,
  "stage": 3,
  "message": "Model cannot produce structured PWA-4.0 output. Choose another model."
}
```

---

# **7. Primary API Providers (Default Integrations)**
Cine-AI ships with two default API backends:

### **7.1 Text LLM Provider — OpenRouter**
OpenRouter serves as the default text-generation backend for:
- Stage 1 Story Generation
- Stage 2 Story Editing
- Stage 3 Scene Generation
- Stage 4 Prompt Assembly
- Stage 5 Motion Cue Writing

**Notes:**
- Supports multiple model families via unified OpenRouter API
- Allows user model switching without modifying Cine-AI internals
- Adapter auto‑formats prompts for OpenRouter schema

---

### **7.2 Image, Audio, and Video Provider — FAL.ai**
FAL.ai serves as the default multimodal backend for:
- Image generation (Stage 4 outputs)
- Audio narration (optional)
- Video rendering (Stage 5)

**Notes:**
- FAL models accept structured prompts and support custom seeds
- Unified adapter normalizes output URLs and metadata
- Video engine uses both image prompts + motion cues

---

# **8. Summary**
This guideline ensures Cine-AI remains:
- Vendor-independent
- Extensible
- Stable across evolving AI ecosystems
- Able to support high-quality outputs regardless of the backend model**
This guideline ensures Cine-AI remains:
- Vendor-independent
- Extensible
- Stable across evolving AI ecosystems
- Able to support high-quality outputs regardless of the backend model

