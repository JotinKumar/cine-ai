# **CINE-AI — COMPLETE PRODUCT REQUIREMENTS DOCUMENT (PRD)**
**Version:** 1.0  
**Audience:** Product Managers, Engineers, AI Architects, Designers, Stakeholders  
**Document Type:** Hybrid (Product-Level + Technical)  

---

# **1. PRODUCT OVERVIEW**

## **1.1 Vision Statement**
Cine-AI transforms a user’s written plot into a fully generated cinematic video through a guided, editable, AI-powered five‑stage pipeline. The platform blends automation with optional creative control, enabling users of all skill levels to produce tailored cinematic outputs.

## **1.2 Core Value Proposition**
- Begin with *any* plot → end with a *full cinematic video*.
- Users retain control at every stage through editing and regeneration.
- **AI model independence** is a core selling point — users can plug in any LLM, image model, audio model, or video model via API.
- Full transparency: every asset remembers which model created it.

## **1.3 Market Position**
A hybrid consumer + pro creator tool positioned at the intersection of AI storytelling, animation prototyping, and automated video production.

---

# **2. USER PROFILES**

### **Primary Users**
- Casual storytellers
- Content creators (YouTubers, indie filmmakers)
- Writers and novelists

### **Secondary Users**
- Educators
- Students
- Marketing teams
- Video studios and prototyping departments

---

# **3. HIGH-LEVEL APP FLOW (5-STAGE PIPELINE)**

## **Step 1 — Plot Input & Story Generation (Blueprint-Based)**
User enters core story blueprint fields:
- Core Idea (Plot)
- Genre
- Tone & Mood
- Word Count
- Language & Style
- Narration Perspective
- Scene Count
- Characters

Cine-AI compiles these into the *Creative Writer Blueprint Architect* system prompt and generates:
- Story Title
- Constraint Confirmation
- Full cinematic story
- Exact Word Count

## **Step 2 — Story File Dashboard**
User views and edits:
- Scenes
- Story beats
- Narrative text

System ensures compliance with blueprint constraints.

## **Step 3 — Character & Scene Generation**
From the story, Cine-AI extracts:
- Character descriptions
- Scene/environment descriptions
- Shot suggestions

User may edit or regenerate.

## **Step 4 — Asset Generation**
Using descriptions, Cine-AI generates:
- Character images
- Backgrounds
- Storyboard frames
- Optional narration audio

Each asset is linked to the model used.

## **Step 5 — Video Assembly**
Cine-AI compiles:
- Images
- Backgrounds
- Narration audio
- Scene transitions
- Shot instructions

Produces the final downloadable video file.

---

# **4. DETAILED FEATURE REQUIREMENTS**

## **4.1 Global Features**
- Model selector per stage (text, image, audio, video)
- Custom prompt override box
- Version history
- Locking system for protected assets
- Auto-saving project structure
- Context‑aware regeneration

## **4.2 Step-Specific Output Requirements**
### **Step 1 (Story) Output Must Include:**
1. Story Title
2. Constraint confirmation sentence
3. Story text (cinematic, static imagery, sparse dialogue)
4. Final word count

---

# **5. USER STORIES (PRODUCT LEVEL)**

### **Story Creation**
- “As a user, I want Cine-AI to turn my plot into a complete story so I can visualize my project.”

### **Story Editing**
- “As a user, I want to edit or regenerate any scene without breaking consistency.”

### **Asset Creation**
- “As a user, I want character and scene images generated from my story.”

### **Video Output**
- “As a user, I want to export a rendered video from my story and assets.”

---

# **6. ACCEPTANCE CRITERIA**

## **Step 1 — Story Generation**
- Blueprint fields validated.
- Output includes title, confirmation, full story, word count.
- Story meets constraints.
- Visual, static-imagery storytelling.

## **Step 2 — Story Dashboard**
- Scenes editable individually.
- Regenerations maintain blueprint constraints.
- Attempt to violate constraints triggers warning.

## **Step 3 — Character & Scene Generation**
- Characters include full visual descriptions.
- Scenes include environment + tone.

## **Step 4 — Asset Generation**
- Each generated asset stores model metadata.
- Regenerations respect locked assets.

## **Step 5 — Video**
- Video renders scenes sequentially.
- User can preview & download.

---

# **7. SYSTEM ARCHITECTURE (CONCEPTUAL)**

## **Components**
1. **Frontend** — React/Native UI for inputs & editing
2. **Backend** — Orchestrates model calls, manages sessions & storage
3. **Model Adapter Layer** — Connects 3rd-party AI models via unified schema
4. **Asset Storage** — Stores characters, scenes, audio, images, videos
5. **Rendering Engine** — Converts assets & storyboard into video

---

# **8. DATA FLOW DESCRIPTION**
1. User submits blueprint.
2. Compiler constructs Step‑1 Story Prompt.
3. Story generated → stored → sent to Step‑2.
4. Edited story → characters/scenes extracted.
5. Assets generated per description.
6. Renderer compiles video.

---

# **9. WIREFRAME DESCRIPTIONS**

## **Screen 1 — Story Blueprint Input**
Fields:
- Plot Idea
- Genre
- Tone & Mood
- Word Count
- Language/Style
- Narration
- Scene Count
- Characters

Buttons:
- Generate Story

Output Panel:
- Story title
- Confirmation
- Story text
- Word count

## **Screen 2 — Story Dashboard**
- Scene cards
- Edit buttons
- Regenerate buttons
- Lock toggle

## **Screen 3 — Characters & Scenes**
- Character list with editable fields
- Scene list with editable fields

## **Screen 4 — Asset Generator**
- Gallery grid
- Model selector
- Custom prompt field

## **Screen 5 — Video Builder**
- Scene timeline
- Asset preview
- Render & download

---

# **10. TECHNICAL REQUIREMENTS**

## **API Requirements**
- Modular LLM/Image/Audio/Video model adapter
- Unified input/output schema

## **Project Format**
Stores:
- Blueprint
- Story
- Characters
- Scenes
- Assets metadata
- Video configuration

## **Infrastructure**
- GPU backend optional for self-host deployments
- Scalable generation queues
- Auth & CDN for assets

---

# **11. RISKS & MITIGATION**
- **High compute cost** → Allow user model choice
- **Inconsistency in images** → Enforce style tokens and seed reuse
- **Blueprint violations** → Step‑2 compliance engine

---

# **12. SUCCESS METRICS**
- Project completion rate
- Regeneration frequency
- Retention per project
- Exported videos per active user

---

# **13. ROADMAP**
**Phase 1:** Story + Blueprint + Editing  
**Phase 2:** Asset Generation + Narration  
**Phase 3:** Full Video Rendering + Export  

---

# **14. OPTIONAL ENHANCEMENTS (FULLY INCLUDED)**

---

# **14.1 Final Developer-Ready System Prompt**
*(Exact prompt Cine-AI uses for Story Generation)*

```
SYSTEM INSTRUCTION — CREATIVE WRITER BLUEPRINT ARCHITECT

You are the 'Creative Writer Blueprint Architect', a specialized LLM agent.
Your task is to ACT as a professional creative writer and generate a complete, coherent, cinematic, and novel story based EXCLUSIVELY on the user-provided narrative blueprint.

1. MASTER PROTOCOLS
- Follow genre, tone, narration, scene count, characters, and word count precisely.
- Use simple, visual, static imagery only.
- Keep dialogue sparse.
- Use clear scene transitions.
- Maintain cinematic pacing.

2. BLUEPRINT INPUT
Use every field:
- Core Idea
- Genre
- Tone & Mood
- Word Count
- Language & Style
- Narration
- Scene Count
- Characters

3. OUTPUT FORMAT
1. Story Title
2. Constraint confirmation sentence
3. Full story text
4. Exact word count
```

---

# **14.2 Blueprint JSON → Prompt Compiler Specification**

### Compiler Responsibilities
- Validate all fields
- Convert fields to a formatted USER BLUEPRINT section
- Append blueprint to system prompt
- Block generation if required fields are invalid

### Input JSON
```
{
  "coreIdea": "...",
  "genre": "...",
  "toneMood": "...",
  "wordCount": 1800,
  "languageStyle": "English, cinematic",
  "narration": "First-person",
  "sceneCount": 5,
  "characters": ["..."]
}
```

### Error Conditions
- Missing required fields
- Word count not numeric
- Scene count > allowed
- Characters exceed allowed

---

# **14.3 Step-2 Story Editor Compliance Rules**

### Allowed Edits
- Modify scene text
- Regenerate individual scenes
- Adjust pacing
- Strengthen atmosphere

### Forbidden Without Re-Blueprinting
- Change POV
- Add scenes
- Add characters
- Change tone or genre

Edits must preserve:
- Scene boundaries
- Character limitations
- Narrative style
- Static imagery language

---

# **14.4 Automated Story Compliance Validator**

### Checklist
- Word count within 3%
- Scene count exact
- Only approved characters appear
- Minimal dialogue
- No continuous action verbs
- Tone & genre match blueprint
- Clear scene transitions

### Flag Types
- Minor: dialogue too high, tone drift
- Major: new characters, wrong POV, wrong scene count

---

# **15. STAGE 3 — SCENE GENERATION SYSTEM PROMPT (FULL INTEGRATION)**

This section documents the *Story → Scene Generation* stage using the **Prescriptive Workflow Architect (PWA‑4.0)** system prompt. This becomes the official Stage‑3 engine inside Cine‑AI.

---

## **15.1 Purpose of Stage 3**
Transform a full story into:
1. **Shot-Based Scene Breakdowns** (Keyframe Director)
2. **Character Master Profiles** (Contextual Architect)
3. **Background Design Blueprints** (Environment Architect)
4. **Pre-Assembled Cinematic Character Snippets**

These outputs feed directly into **Step 4: Asset Generation**.

---

## **15.2 Stage 3 System Prompt (Developer‑Ready)**

### **OVERARCHING ROLE: Prescriptive Workflow Architect (PWA‑4.0)**
Responsible for converting *one complete narrative* into structured, modular visual building blocks.

---

# **STAGE 1: THE KEYFRAME DIRECTOR (Scene Breakdown)**
Goal: Produce clear, non‑redundant **Shot Blueprints**.

### **Master Protocol 0 – Narrative Logic Priority**
Camera view is determined by **character action**, not emotion.

| Action Type | Allowed View Types | Allowed Shot Types |
|------------|--------------------|---------------------|
| Arrival / Looking Ahead | Back View / OTS | Wide / Establishing |
| Emotional Response | Front View | Medium / Close‑up |
| Conversation | Profile / Side / OTS | Medium / Shot‑reverse |
| Observation / Thinking | Back or Side View | Medium / Wide |
| Spying / Peeking | OTS / Framed | Medium / Close‑up |

---

### **Protocol X – Spatial Staging Rule**
Every shot description MUST:
1. Show static/frozen pose only (no continuous verbs).
2. State character’s physical placement.
3. State facing direction if useful.
4. END the line with view type in brackets.

---

### **Shot Blueprint Output Template**
```
Final Scene X (Original Scene Y): [Original story line]
Shot: [Shot Type, Angle, View]
Staging: [Character]: [Static pose + object reference + direction] (View Type)
Relational Staging: [Distance/relationship between characters]
Scene Function: [Tone, reveal, transition purpose]
```

---

# **STAGE 2: THE CONTEXTUAL ARCHITECT (Character Profiles & Backgrounds)**
Goal: Convert story context into reusable, visually consistent modules.

## **A. CHARACTER MASTER PROFILES**
Each character receives:
- Name, Role
- Base Appearance (Eyes, Skin, Hair)
- **Default Outfit using FFCPP**:
  - Format: **[Color] [Fabric/Style] [Garment Type]**
  - Required: Upper / Lower / Footwear
- Props & Items
- **Character Design Prompt (Full Body)**

### **FFCPP Clothing Rules**
- No vague adjectives.
- No continuous action.
- Appearance and outfit must be consistent across scenes.

---

## **B. BACKGROUND DESIGN BLUEPRINTS (Hierarchical Set Design)**
### **1. Master Location Blueprints**
Include:
- Permanent structures
- Architectural style
- Physical fixtures
- Atmosphere and environmental tone

### **2. Scene Overlays**
Add:
- Lighting
- Weather
- Time‑of‑day
- Temporary props

### **Mandatory Exclusions**
Background descriptions MUST NOT include:
- Any characters
- Viewers
- Implied human presence
- POV‑based or camera‑based phrasing

---

## **C. CHARACTER DESCRIPTION SNIPPETS (Cinematic Modules)**
For each character, generate reusable blocks:
- Close‑Up (Front / Side / Back)
- Medium Shot (Front / Side / Back)
- Wide Shot (Front / Side / Back)

Snippets MUST embed:
- FFCPP outfit
- Character appearance
- Pose restrictions (static only)

---

# **15.3 Stage‑3 Output Data Schema**

### **Scene Breakdowns (Shot Blueprints)**
```
sceneBreakdown: [
  {
    sceneIndex: number,
    originalScene: string,
    shotType: string,
    angle: string,
    view: string,
    staging: string,
    relationalStaging: string,
    sceneFunction: string
  }
]
```

### **Character Profiles**
```
characters: [
  {
    name: string,
    role: string,
    appearance: { eyes, skin, hair },
    outfit: { upper, lower, footwear },
    props: [string],
    designPrompt: string,
    snippets: { closeup, medium, wide }
  }
]
```

### **Background Blueprints**
```
backgrounds: [
  {
    locationName: string,
    masterBlueprint: string,
    overlays: { lighting, weather, timeOfDay }
  }
]
```

---

# **15.4 Acceptance Criteria for Stage 3**
- [ ] No continuous actions used.
- [ ] All staging lines end with view tags.
- [ ] Camera logic follows Narrative Logic Priority.
- [ ] FFCPP rules applied strictly.
- [ ] Background descriptions contain ZERO characters.
- [ ] Snippets cover all required shot + view combinations.
- [ ] Outputs are modular, reusable, and feed directly into Step 4 asset generation.

---

# **17. STAGE 4 — IMAGE GENERATION SYSTEM PROMPT (FINAL IMAGE PROMPT ASSEMBLY)**

This section defines the *Image Generation Prompt Assembly Engine*, which converts Stage‑3 outputs into **camera-ready final prompts** for any AI image model.

---

## **17.1 Purpose of Stage 4**
To assemble modular components from Stage 3 into a **single, unified, production-ready image prompt** for each shot.

Inputs come from:
- **Shot Blueprint** (Staging, View type, Shot type)
- **Character Snippet** (view‑matched cinematic block)
- **Background Blueprint** (master + overlay)
- **User-selected Art Style**

Output is a **three‑paragraph final image prompt**.

---

## **17.2 Mandatory Output Structure (Exactly 3 Paragraphs)**
Each image prompt MUST contain the following paragraphs in order:

---

### **Paragraph 1 — Character/Staging Paragraph**
This paragraph SHALL combine:
1. The **Character Description Snippet** (shot-matched and view-matched).  
2. The **Staging Line** from the Shot Blueprint (static imagery only).  
3. The **Final Cinematic Shot Combination**, formatted exactly as:

```
[View type], [Shot type]
```

Example: `Back view, Medium shot`

Rules:
- Must not include continuous actions.
- Must not contradict FFCPP outfit or appearance.
- Must remain strictly visual and animation-friendly.

---

### **Paragraph 2 — Style Paragraph**
Single required line:
```
Image Style: [user-defined image style]
```
Examples: "cinematic lighting", "digital painting", "photorealistic", "anime dramatic frame".

---

### **Paragraph 3 — Background Paragraph**
This paragraph SHALL contain only:
- The **Context-Aware Background description** for the scene
- Derived from Stage 3’s Master Location Blueprint + Scene Overlay

Exclusions (strict):
- No characters
- No implied viewers
- No perspective-dependent phrasing
- No camera terms

---

## **17.3 Final Prompt Assembly Schema**
```
finalImagePrompt: {
  paragraph1_characterStaging: string,
  paragraph2_style: string,
  paragraph3_background: string
}
```

---

## **17.4 Acceptance Criteria for Stage 4**
- [ ] Output contains **exactly three paragraphs**.
- [ ] Paragraph 1 includes Character Snippet + Staging + Final Shot Combination.
- [ ] Final Shot Combination formatted as `[View type], [Shot type]`.
- [ ] Paragraph 2 uses the required prefix: `Image Style:`.
- [ ] Paragraph 3 contains ONLY background description.
- [ ] No continuous verbs appear anywhere.
- [ ] No contradictions with Stage 3 profiles, outfits, or staging.
- [ ] Prompt is ready for direct use in image models.

---

# **19. STAGE 5 — VIDEO GENERATION SYSTEM PROMPT (MINIMAL ANIMATION WRITER)**

This section defines the **Minimal Animation Writer**, responsible for generating micro-motion cues that guide video models while respecting Cine-AI’s static-image foundations.

---

## **19.1 Purpose of Stage 5**
To produce **minimal, controlled motion descriptors** suitable for video generation models, while preventing unwanted continuous action or camera movement.

Stage 5 outputs are appended to the final video assembly pipeline and help maintain:
- temporal consistency,
- subtle environmental motion, and
- controlled character motion.

---

## **19.2 Required Input for Stage 5**
For each Final Scene (from Stage 3):
- **Original Final Scene Synopsis Line**
- Character presence flag (determines whether motion is character-based or environment-only)

---

## **19.3 Stage 5 Output Format (STRICT)**
For every scene, return **exactly two lines separated by one blank line**:

### **Line 1 — Final Scene Synopsis**
Copied **verbatim** from Stage 3 output:
- `Final Scene X (Original Scene Y): [synopsis line]`

### **Line 2 — (Blank Line)**
A single empty line.

### **Line 3 — One-Sentence Animation Cue**
Rules:
- ≤ 40 words
- Mandatory single sentence
- Must describe **motion only**
- Motion must be minimal/subtle (no dynamic action sequences)
- If characters exist: subtle gestures or micro-movements only
- If no characters exist: environment-only motion

#### **Allowed Example Motions:**
- "soft drifting dust in the air"
- "slight tilt of the character's head as the lantern flickers"
- "gentle ripple of fabric from a low breeze"
- "faint vibration of distant machinery"
- "slow fog drift across the floor"

#### **Prohibited Motions:**
- Running, walking, climbing, fighting
- Camera pans, zooms, dolly movement
- Multiple sequential actions
- Any action contradicting static staging

---

## **19.4 Stage 5 Output Schema**
```
videoMotionCues: [
  {
    sceneIndex: number,
    synopsisLine: string,
    motionCue: string
  }
]
```

---

## **19.5 Acceptance Criteria for Stage 5**
- [ ] Exactly two lines per scene, separated by one blank line.
- [ ] Synopsis line copied verbatim.
- [ ] Motion cue ≤ 40 words.
- [ ] Motion cue = one sentence.
- [ ] No camera movement.
- [ ] No continuous or dynamic actions.
- [ ] Environment-only motion when no character present.
- [ ] Motion always minimal, subtle, atmosphere-driven.

---

# **20. Example Story Outputs (Structure Only)** (Structure Only)** (Structure Only)** (Structure Only)**

### Example 1 — Horror, First Person, 5 Scenes
- Title: *The Window That Breathes*
- Constraints satisfied
- 5 cinematic scenes
- Visual, static imagery style
- Word count: 1200

### Example 2 — Sci-Fi Mystery, Third Person, 4 Scenes
- Title: *Signal Over Ruin-9*
- Constraints satisfied
- Clear scene structure
- Word count: 1500

---

# **END OF CINE-AI COMPLETE PRD**

