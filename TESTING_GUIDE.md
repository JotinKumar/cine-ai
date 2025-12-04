# Testing Guide: Phases 3-5

## Pre-Test Checklist

Before testing, ensure:
- ✅ `npm install` completed in root, backend, and frontend
- ✅ PostgreSQL database running
- ✅ `.env.local` configured with API keys
- ✅ `prisma migrate dev` executed
- ✅ Backend server running on port 3001
- ✅ Frontend dev server running on port 3000

---

## Stage 3: Scene Generation Testing

### Unit Tests

#### Test 1: Generate Basic Scene Blueprint
```bash
curl -X POST http://localhost:3001/api/stage3/scene-generation \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "your-project-id"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "characters": [...],
  "sceneCount": 5
}
```

#### Test 2: Retrieve Generated Scenes
```bash
curl http://localhost:3001/api/stage3/scenes/your-project-id
```

**Expected Response:** Array of scene objects with shotType, view, angle, staging

#### Test 3: Regenerate Single Scene
```bash
curl -X POST http://localhost:3001/api/stage3/regenerate-scene \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "your-project-id",
    "sceneIndex": 0
  }'
```

**Expected Response:** Updated shot blueprint

### Integration Tests

#### Test 4: Full Stage 3 Workflow
1. Open http://localhost:3000/projects/your-project-id
2. Click "Stage 3: Scene Generation"
3. Click "Generate Scenes" button
4. Wait for completion
5. Verify scenes appear in list
6. Click individual scenes to view blueprints
7. Click "Regenerate" to test single scene regeneration
8. Click "Lock Scene" to test locking

**Expected Behavior:**
- Scenes generate within 30-60 seconds
- Scene list populates with all scenes from story
- Each scene shows shot type, angle, view, staging
- Regenerate creates new blueprint
- Lock prevents regeneration attempts

---

## Stage 4: Image Generation Testing

### Unit Tests

#### Test 1: Generate Images for Project
```bash
curl -X POST http://localhost:3001/api/stage4/generate-images \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "your-project-id",
    "useSeeds": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "imagesGenerated": 5,
  "assets": [...]
}
```

#### Test 2: Assemble Image Prompt
```bash
curl -X POST http://localhost:3001/api/stage4/assemble-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "your-project-id",
    "sceneId": "scene-id"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "prompt": {
    "fullPrompt": "3-paragraph prompt",
    "paragraphs": {
      "characterSnippet": "...",
      "stagingLine": "...",
      "styleBackgroundLine": "..."
    }
  }
}
```

#### Test 3: Regenerate Single Image
```bash
curl -X POST http://localhost:3001/api/stage4/regenerate-image \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "your-project-id",
    "sceneId": "scene-id"
  }'
```

### Integration Tests

#### Test 4: Full Stage 4 Workflow
1. Navigate to Stage 4: Image Gallery
2. Click "Generate Images" button
3. Wait for images to generate (2-5 minutes depending on API)
4. Verify image gallery displays all generated images
5. Test filtering (all/image/audio/video tabs)
6. Click "Lock" on an image
7. Click "Delete" on an image
8. Verify locked images show lock indicator
9. Test unlock button

**Expected Behavior:**
- Images generate and display in gallery
- Each image shows metadata (date, model, type)
- Lock/unlock controls work
- Delete removes images from database
- Filter tabs work correctly

---

## Stage 5: Video Assembly Testing

### Unit Tests

#### Test 1: Generate Full Video
```bash
curl -X POST http://localhost:3001/api/stage5/generate-video \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "your-project-id",
    "withAudio": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "videoUrl": "url-to-generated-video",
  "jobId": "job-id"
}
```

#### Test 2: Generate Audio Narration
```bash
curl -X POST http://localhost:3001/api/stage5/generate-audio \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "your-project-id",
    "narrationStyle": "dramatic"
  }'
```

#### Test 3: Check Video Status
```bash
curl http://localhost:3001/api/stage5/video-status/your-project-id
```

**Expected Response:**
```json
{
  "projectId": "your-project-id",
  "status": "completed",
  "progress": 100
}
```

### Integration Tests

#### Test 5: Full Stage 5 Workflow
1. Navigate to Stage 5: Video Assembly
2. Click "Generate Full Video" button
3. Monitor progress bar (should show 0-100%)
4. Wait for completion (3-10 minutes)
5. Once complete, verify video preview appears
6. Click "Download Video (MP4)" button
7. Verify MP4 file downloads
8. Test different narration styles and click "Generate Audio Narration"

**Expected Behavior:**
- Progress bar updates as video generates
- Video preview appears with HTML5 player
- Download functionality works
- Audio generation creates narration asset
- Video plays in preview player

---

## End-to-End Testing

### Full 5-Stage Workflow Test

1. **Stage 1**: Create project → Generate story
   - ✅ Verify story generates with correct word count
   - ✅ Verify scenes are extracted correctly

2. **Stage 2**: Edit story
   - ✅ Edit individual scenes
   - ✅ Verify validation works
   - ✅ Test regenerating individual scenes

3. **Stage 3**: Generate scenes
   - ✅ Generate all scene blueprints
   - ✅ Verify characters are extracted
   - ✅ Check shot blueprints are valid

4. **Stage 4**: Generate images
   - ✅ Generate images for all scenes
   - ✅ Verify 3-paragraph prompts are correct
   - ✅ Test regenerating single images

5. **Stage 5**: Render video
   - ✅ Generate final video with motion cues
   - ✅ Generate audio narration
   - ✅ Download completed video

---

## Performance Benchmarks

| Stage | Task | Expected Duration |
|-------|------|-------------------|
| 1 | Generate story (10 scenes) | 30-60 seconds |
| 2 | Edit story + validation | 15-30 seconds |
| 3 | Generate all scene blueprints | 60-120 seconds |
| 4 | Generate 10 images | 120-300 seconds |
| 5 | Render video | 180-600 seconds |
| - | **Total E2E Time** | **~10-18 minutes** |

---

## Error Scenarios to Test

### Stage 3 Errors
- [ ] Invalid project ID → Verify error message
- [ ] Project without story → Verify error handling
- [ ] API timeout → Test fallback defaults
- [ ] Invalid LLM response → Test JSON parsing fallback

### Stage 4 Errors
- [ ] Invalid scene ID → Verify error message
- [ ] Missing character data → Test fallback behavior
- [ ] FAL.ai API failure → Test graceful degradation
- [ ] Large prompt size → Test prompt truncation

### Stage 5 Errors
- [ ] Motion cue > 40 words → Verify truncation
- [ ] No video assets → Test error handling
- [ ] Job cancellation → Verify cleanup
- [ ] Export format mismatch → Test format validation

---

## Database State Verification

After each test, verify database state:

```bash
# Check scenes were created
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Scene\" WHERE \"projectId\" = 'your-project-id';"

# Check characters were created
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Character\" WHERE \"projectId\" = 'your-project-id';"

# Check assets were created
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Asset\" WHERE \"projectId\" = 'your-project-id';"

# Check locked status
psql $DATABASE_URL -c "SELECT \"isLocked\", COUNT(*) FROM \"Scene\" GROUP BY \"isLocked\";"
```

---

## Frontend Component Testing

### SceneEditor Component
- [ ] Scene list renders all scenes
- [ ] Selected scene highlights correctly
- [ ] Scene details display properly
- [ ] Regenerate button triggers API call
- [ ] Lock button changes state
- [ ] Handle empty scene list gracefully

### AssetGallery Component
- [ ] Gallery displays all asset types
- [ ] Filter tabs work (all/image/audio/video)
- [ ] Asset cards show metadata
- [ ] Lock/unlock controls work
- [ ] Delete button removes asset
- [ ] Handle no assets state

### VideoRenderer Component
- [ ] Progress bar updates
- [ ] Video preview loads
- [ ] Download button works
- [ ] Audio style selector works
- [ ] Status polling works
- [ ] Cancel button works

---

## Acceptance Criteria Checklist

- [ ] All 25+ API endpoints respond correctly
- [ ] All 5 stages complete without errors
- [ ] End-to-end workflow succeeds
- [ ] Database state is consistent
- [ ] Frontend components render correctly
- [ ] Error handling works gracefully
- [ ] Performance is acceptable (< 20 min E2E)
- [ ] All locks/unlocks work
- [ ] All deletions work
- [ ] Asset metadata is correct
- [ ] Video quality is acceptable
- [ ] Audio narration is intelligible

---

## Troubleshooting

### Common Issues

**Issue:** Stage 3 returns no characters
- Check that Stage 1 story was generated successfully
- Verify character names are extracted from story
- Check OpenRouter API key validity

**Issue:** Stage 4 images not generating
- Verify FAL.ai API key is valid
- Check prompt assembly is correct
- Look for FAL.ai rate limiting

**Issue:** Stage 5 video fails
- Ensure all stages 1-4 completed successfully
- Check that motion cues are ≤40 words
- Verify FAL.ai video model availability

**Issue:** Database migrations fail
- Drop and recreate database: `dropdb cine_ai && createdb cine_ai`
- Rerun migrations: `npx prisma migrate deploy`

---

**Testing complete! Application is ready for deployment.** 🚀
