# **Prompt Chaining & Validation Logic (Cine-AI Compliance Engine Specification)**

This document describes how Cine-AI ensures every stage—Story, Scene Breakdown, Image Prompting, and Video Motion Cues—remains compliant with constraints, style rules, and structural requirements. It defines the logic behind chained prompts, cross-stage validation, error handling, and regeneration triggers.

---

# **1. Overview of Prompt Chaining Architecture**
Cine-AI uses a **strict sequential prompt chaining system**, where:
- Each stage generates structured outputs.
- Outputs are validated against rules.
- Validated outputs become REQUIRED inputs for the next stage.
- Any violation breaks the chain and forces regeneration.

Chaining ensures **continuity, consistency, and constraint adherence** across all media outputs.

---

# **2. Prompt Chaining Flow (High-Level)**

### **Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5**
Each stage passes a validated, structured payload to the next.

If ANY stage fails validation:
- The chain stops.
- Downstream stages are invalidated.
- User is prompted to fix or regenerate.

---

# **3. Stage-Specific Validation Logic**

## **3.1 Stage 1 Validation (Story Generation)**
Must check:
- Scene count compliance
- Word count ±3%
- Static imagery enforcement
- Sparse dialogue
- No continuous-action verbs
- Correct narration POV
- Genre/Tone alignment

If fail → user must edit blueprint or regenerate.

---

## **3.2 Stage 2 Validation (Edited Story)**
Checks:
- Scene boundaries preserved
- No added characters unless allowed
- No POV changes
- No tone/genre drift
- No new scenes or removed scenes

If fail → highlight violating scenes.

---

## **3.3 Stage 3 Validation (PWA-4.0)**
Checks:
- Shot Blueprints follow Narrative Logic Priority rules
- All staging lines end with correct view tag
- Static imagery present (no continuous verbs)
- FFCPP rules strictly applied for all outfits
- Background descriptions contain *zero characters*
- Snippets follow correct shot/view format

If fail → Stage 4 cannot begin.

---

## **3.4 Stage 4 Validation (Image Prompt Assembly)**
Checks:
- Output is EXACTLY 3 paragraphs
- Paragraph 1 includes:
  - Character snippet
  - Staging line
  - Final shot combination `[View type], [Shot type]`
- Paragraph 2 begins with `Image Style:`
- Paragraph 3 contains ONLY environment description

If fail → regenerate Stage 4.

---

## **3.5 Stage 5 Validation (Motion Cue Generation)**
Checks:
- Exactly TWO lines separated by ONE blank line
- Motion cue is ≤ 40 words
- Motion cue is ONE sentence
- Motion is minimal/subtle only
- If no characters exist: environment-only motion

If fail → regenerate motion cue.

---

# **4. Cross-Stage Validation Logic**

### **4.1 Character Consistency Checks**
- Stage 3 character profiles must match Stage 1/2 character lists
- Stage 4 prompts must embed Stage 3 snippets correctly
- Stage 5 cannot introduce new character motion

### **4.2 Scene Continuity Checks**
- Scene count must remain constant across all stages
- Shot/View types from Stage 3 must match Stage 4 structure

### **4.3 Background Continuity Checks**
- Stage 3 master blueprints remain constant
- Stage 4 uses correct background overlays
- Stage 5 motion cue cannot contradict scene environment

---

# **5. Error Handling & Regeneration Logic**

### **5.1 Hard Violations → Immediate Block**
Examples:
- Scene count mismatch
- POV shift
- Missing FFCPP components
- Background descriptions containing characters

System Response:
1. Stop execution.
2. Invalidate downstream stages.
3. Provide structured error feedback.

---

### **5.2 Soft Violations → Warnings**
Examples:
- Tone deviation
- Excessive dialogue
- Minor shot mismatch

System Response:
1. Notify user.
2. Allow override or auto-correction.

---

# **6. Regeneration Triggers**

### **User Edits Story (Stage 2)**
Triggers regeneration of:
- Stage 3
- Stage 4
- Stage 5

### **User Edits Character Profiles**
Triggers regeneration of:
- Snippets (Stage 3)
- Image Prompts (Stage 4)
- Motion Cues if character motion referenced

### **User Overrides Shot Type/View**
Triggers regeneration of:
- Stage 4
- Stage 5

### **User Changes Image Style**
Triggers regeneration of:
- Stage 4 only

---

# **7. Prompt Chaining Summary**
Cine-AI’s chaining and validation workflow ensures:
- Structural coherence
- Visual and narrative continuity
- Model-agnostic stability
- Fully deterministic scene-to-video generation

This architecture guarantees that every output from scene text → shot blueprints → image prompts → video cues remains consistent, compliant, and production-ready.