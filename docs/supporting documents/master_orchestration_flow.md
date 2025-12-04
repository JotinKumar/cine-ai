# **Master Orchestration Flow (Cine-AI)**

This document describes how Stages 1–5 connect end-to-end, including data dependencies, execution order, and contextual continuity rules.

---

## **1. Overview of the Pipeline**
Cine-AI operates through a five-stage sequential workflow:
1. **Story Generation (Blueprint Architect)**
2. **Story Editing (User + Validator)**
3. **Scene Generation (PWA-4.0)**
4. **Image Prompt Assembly (Final Scene Prompts)**
5. **Video Generation (Minimal Animation Writer)**

Each stage produces structured outputs that become *mandatory inputs* for the next stage.

---

## **2. Dependency Rules Between Stages**

### **Stage 1 → Stage 2**
- Stage 1 outputs a fully compliant story structure:
  - Story title
  - Scene-limited story text
  - Word count compliance
- Stage 2 uses these scenes for editing; modified scenes must preserve blueprint constraints.

### **Stage 2 → Stage 3**
- Stage 2 produces finalized scenes.
- Stage 3 consumes these scenes to generate:
  - Shot Blueprints
  - Character Master Profiles
  - Background Blueprints
  - Cinematic Snippets

### **Stage 3 → Stage 4**
- Stage 3 provides:
  - Per-shot staging lines
  - Matched shot/view combinations
  - Reusable character snippets
  - Background architectural templates
- Stage 4 assembles these into unified prompts for image generation.

### **Stage 4 → Stage 5**
- Stage 4 generates image prompts per shot.
- Stage 5 adds motion cues + synopsis for video models.

### **Stage 5 → Final Output**
- Stage 5 outputs minimal motion descriptors enabling stable, unified video sequences across scenes.

---

## **3. Orchestration Logic**

### **3.1 Hard Dependencies**
- A stage cannot run until the previous stage validates its output.
- Editing a stage invalidates future stages.

### **3.2 Upstream Change Rules**
If a user edits:
- **Story text** → Regenerate Stages 3–5
- **Character appearance** → Regenerate Stages 3–4 (images) and update Stage 5 if motion cues reference characters
- **Scene structure** → All Shot Blueprints reset

### **3.3 Downstream Regeneration Rules**
Users may regenerate:
- Any Shot Blueprint → Rebuild Stage 4+5 automatically
- Any Image Prompt → Does *not* affect Story or Scene metadata
- Any Motion Cue → Does *not* affect Image prompts

---

## **4. Continuity Enforcement**

### **4.1 Character Continuity**
- Character profiles must remain unchanged unless user explicitly edits them.
- FFCPP clothing rules enforce consistent wardrobe.

### **4.2 Scene Continuity**
- Shot types, angles, and views generated in Stage 3 MUST carry into Stage 4.
- Background master blueprints ensure location continuity.

### **4.3 Temporal Continuity**
- Stage 5 motion cues must avoid contradictions with image-level static poses.

---

## **5. Execution Summary**
The orchestration ensures Cine-AI produces:
1. Story integrity
2. Visual consistency
3. Reusable modular prompts
4. High-coherence video outputs

This flow is the backbone of Cine-AI’s multi-agent pipeline.