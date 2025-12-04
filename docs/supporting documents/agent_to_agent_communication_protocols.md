# **Agent-to-Agent Communication Protocols (Cine-AI)**

This document defines how the agents governing Stages 1–5 communicate, transfer structured payloads, enforce compliance, and maintain data continuity.

---

# **1. Overview**
Cine-AI uses a *multi-agent sequential pipeline* where each stage produces structured, validated data consumed by the next. Communication follows strict contract-based handoff rules.

Agents involved:
1. **Blueprint Architect (Stage 1)**
2. **Story Editor + Validator (Stage 2)**
3. **Prescriptive Workflow Architect (PWA-4.0) — Stage 3**
4. **Image Prompt Assembler (Stage 4)**
5. **Minimal Animation Writer (Stage 5)**

---

# **2. Communication Principles**

### **2.1 Contracts, Not Conversations**
Each agent receives:
- A fixed-format payload
- No dialogue
- No request for clarification
- Only structured data passthrough

### **2.2 Deterministic Handoff**
Each stage must:
- Verify inputs
- Validate constraints
- Produce predictable outputs
- Reject malformed payloads

---

# **3. Inter-Agent Handoff Definitions**

## **3.1 Stage 1 → Stage 2**
Payload includes:
- `title`
- `storyText` (scene-bounded)
- `wordCountActual`
- `constraintsConfirmation`

Rules:
- Stage 2 may edit text but cannot violate constraints.
- Stage 2 must preserve scene boundaries.

---

## **3.2 Stage 2 → Stage 3**
Payload includes:
- `finalizedScenes[]`
- `characterList[]`
- `narrationPerspective`
- `genre`, `tone`, `style`

Rules:
- Stage 3 generates Shot Blueprints, Character Profiles, Backgrounds.
- If Stage 2 text violates blueprint constraints → BLOCK.

---

## **3.3 Stage 3 → Stage 4**
Payload includes:
- `sceneBreakdown[]` (Shot Blueprints)
- `characterProfiles[]`
- `backgroundBlueprints[]`
- `cinematicSnippets[]`
- `userImageStyle`

Rules:
- Stage 4 assembles exactly 3-paragraph prompts per shot.
- Any missing field → Stage 4 rejects payload.

---

## **3.4 Stage 4 → Stage 5**
Payload includes:
- `finalImagePrompts[]`
- `sceneSynopses[]`
- `characterPresenceFlags[]`

Rules:
- Stage 5 generates motion cues only.
- Stage 5 must not reference static staging elements.

---

# **4. Error Handling Protocols**

### **4.1 Hard Fail Conditions**
- Missing mandatory fields
- Violating blueprint constraints
- POV inconsistencies
- Wrong scene counts
- Missing FFCPP items

System response: **Reject → Return structured error → Halt downstream stages**

---

### **4.2 Soft Fail Conditions**
- Minor tone drift
- Dialogue overuse
- Slight pacing mismatch

System response: **Flag → Suggest revision → Allow downstream execution**

---

# **5. Data Integrity Rules**
- All agents must treat received data as authoritative.
- No agent may alter upstream meaning (only structure or clarity).
- No freeform creativity beyond the constraints.

---

# **6. Continuity Enforcement Between Agents**
- Characters must remain visually identical across stages.
- Shot types, angles, staging must propagate exactly.
- Background architecture must persist from Stage 3 → Stage 4 → Stage 5.

---

# **7. Summary**
Cine-AI’s agent communication is deterministic, schema-driven, and constraint-bound. This ensures:
- Modular substitution of models
- Predictable outputs
- High visual coherence
- Automatic regeneration of dependent stages