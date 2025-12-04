# **API Schemas for Each Stage (Cine-AI Backend Specification)**

This document defines the API interfaces required for backend implementation of Cine-AI’s multi-stage workflow. Each stage exposes a clearly defined input/output schema to ensure modularity and model-agnostic operation.

---

# **1. Overview of API Architecture**
Cine-AI uses a **stage-based microservice API design**, where each stage is its own service endpoint:

1. `/api/stage1/story-generation`
2. `/api/stage2/story-editing`
3. `/api/stage3/scene-generation`
4. `/api/stage4/image-prompt-assembly`
5. `/api/stage5/video-motion-cues`

All endpoints:
- Accept **JSON** requests
- Return structured **JSON** responses
- Must follow strict validation rules

---

# **2. Stage 1 — Story Generation API**

### **Endpoint:**
`POST /api/stage1/story-generation`

### **Input Schema:**
```
{
  "coreIdea": "string",
  "genre": "string",
  "toneMood": "string",
  "wordCount": number,
  "languageStyle": "string",
  "narration": "string",
  "sceneCount": number,
  "characters": ["string"],
  "model": "string",
  "customPrompt": "string(optional)"
}
```

### **Output Schema:**
```
{
  "title": "string",
  "storyText": "string",
  "wordCountActual": number,
  "constraintsConfirmation": "string",
  "scenes": ["string"]
}
```

### **Validation Rules:**
- Scene count must match requested number
- Word count ±3%
- Must output static, cinematic style

---

# **3. Stage 2 — Story Editing API**

### **Endpoint:**
`POST /api/stage2/story-editing`

### **Input Schema:**
```
{
  "scenes": ["string"],
  "editRequests": [
    {
      "sceneIndex": number,
      "editType": "modify|regenerate",
      "instructions": "string"
    }
  ],
  "blueprint": { ... }
}
```

### **Output Schema:**
```
{
  "finalizedScenes": ["string"],
  "validationReport": {
    "isValid": boolean,
    "errors": ["string"]
  }
}
```

---

# **4. Stage 3 — Scene Generation API**

### **Endpoint:**
`POST /api/stage3/scene-generation`

### **Input Schema:**
```
{
  "finalizedScenes": ["string"],
  "characters": ["string"],
  "genre": "string",
  "tone": "string",
  "narration": "string",
  "model": "string"
}
```

### **Output Schema:**
```
{
  "sceneBreakdown": [
    {
      "sceneIndex": number,
      "originalScene": "string",
      "shotType": "string",
      "angle": "string",
      "view": "string",
      "staging": "string",
      "relationalStaging": "string",
      "sceneFunction": "string"
    }
  ],
  "characterProfiles": [...],
  "backgroundBlueprints": [...],
  "snippets": [...]
}
```

### **Validation Rules:**
- No continuous action verbs
- FFCPP clothing format enforced
- Background descriptions must exclude characters

---

# **5. Stage 4 — Image Prompt Assembly API**

### **Endpoint:**
`POST /api/stage4/image-prompt-assembly`

### **Input Schema:**
```
{
  "sceneBreakdown": [...],
  "snippets": [...],
  "backgroundBlueprints": [...],
  "userImageStyle": "string"
}
```

### **Output Schema:**
```
{
  "finalImagePrompts": [
    {
      "sceneIndex": number,
      "paragraph1": "string",
      "paragraph2": "string",
      "paragraph3": "string"
    }
  ]
}
```

### **Validation Rules:**
- Exactly 3 paragraphs
- Final shot combination formatted as `[View type], [Shot type]`

---

# **6. Stage 5 — Video Motion Cues API**

### **Endpoint:**
`POST /api/stage5/video-motion-cues`

### **Input Schema:**
```
{
  "sceneSynopses": ["string"],
  "characterPresenceFlags": [boolean]
}
```

### **Output Schema:**
```
{
  "motionCues": [
    {
      "sceneIndex": number,
      "synopsis": "string",
      "motionCue": "string"
    }
  ]
}
```

### **Validation Rules:**
- One blank line between synopsis and motion cue
- Motion cue ≤ 40 words
- Motion = minimal only

---

# **7. Error Response Format**
```
{
  "error": true,
  "message": "string",
  "details": {}
}
```

---

# **8. Summary**
These schemas enable Cine-AI to:
- Remain model-agnostic
- Maintain strict continuity
- Support pluggable 3rd-party AI systems
- Implement a deterministic multi-stage media pipeline