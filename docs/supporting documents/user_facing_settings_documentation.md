# **User-Facing Settings Documentation (Cine-AI UI/UX Specification)**

This document defines all configurable settings exposed to Cine-AI users, including style presets, character locks, scene overrides, model selection UI, and global preferences.

---

# **1. Overview**
Cine-AI provides user-facing settings that influence:
- Story generation
- Scene breakdown behavior
- Character/scene consistency
- Image style
- Model selection
- Regeneration control

These settings empower both casual users and advanced creators.

---

# **2. Global Settings Panel**
Accessible from any step in the workflow.

### **2.1 Model Selection Dropdowns**
Users may select models for:
- **Text LLM** (default: OpenRouter)
- **Image Generation** (default: FAL.ai)
- **Audio Generation** (optional, FAL.ai)
- **Video Generation** (default: FAL.ai)

Each dropdown includes:
- Model name
- Cost indicator
- Speed indicator
- Capabilities badge

---

# **3. Style Settings**

### **3.1 Image Style Presets**
Users may choose from:
- Cinematic
- Photorealistic
- Digital painting
- Anime
- Noir
- Minimalist

Custom option: **“User-defined Style String”**

Displayed in Step 4 as the `Image Style:` line.

---

### **3.2 Story Tone & Mood Presets**
Selections influence Stage 1 + Stage 3:
- Light-hearted
- Suspenseful
- Dramatic
- Horror / Dread
- Epic
- Melancholic

---

# **4. Character Controls**

### **4.1 Character Locking**
Users may lock:
- Appearance
- Clothing (FFCPP)
- Props

Locked characters:
- Cannot be regenerated in Stage 3 profiles
- Cannot be altered by snippet generation
- Must remain visually identical in all scenes

---

### **4.2 Character Overrides**
Users may override:
- Eyes, hair, skin description
- Clothing fields (Upper / Lower / Footwear)

All overrides must remain FFCPP compliant:
- `[Color] [Fabric/Style] [Garment Type]`

---

# **5. Scene Controls**

### **5.1 Scene Locking**
Users may freeze:
- Shot type
- View type
- Staging line
- Background blueprint

Regeneration rules:
- Locked scenes skip Stage 3 recompute
- Dependent image prompts remain frozen

---

### **5.2 Shot Overrides**
Users may manually select:
- Shot type (Wide / Medium / Close-up)
- View (Front / Back / OTS / Profile)
- Angle

These override the PWA-4.0 output for that scene.

---

# **6. Regeneration Controls**

### **6.1 Per-Scene Regeneration**
Buttons available:
- Regenerate Story Scene
- Regenerate Shot Blueprint
- Regenerate Image Prompt
- Regenerate Motion Cue

### **6.2 Per-Character Regeneration**
- Rebuild Clothing
- Rebuild Props
- Rebuild Snippets

### **6.3 Global Regeneration**
- Re-run all scenes
- Re-run asset generation

---

# **7. Advanced Controls**

### **7.1 Custom System Prompt Field**
Users may insert instructions appended to the stage-level prompt.

### **7.2 Seed Control (for deterministic images)**
Available only for models that support seeding (e.g., FAL.ai).

### **7.3 Image Resolution Selector**
- 512 × 512
- 768 × 768
- 1024 × 1024
- Custom

---

# **8. Validation Warnings Shown to Users**
If user changes a setting that violates constraints:
- POV change → warning
- Scene count change → full pipeline regeneration
- Character addition → blueprint mismatch error

Warnings appear inline with actionable fixes.

---

# **9. Summary**
User-facing settings in Cine-AI allow:
- Full customization
- Controlled regeneration
- Style tuning
- Strict story + visual consistency

These settings ensure both creative freedom and structural stability across all stages.