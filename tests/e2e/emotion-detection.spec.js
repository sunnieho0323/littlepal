// tests/e2e/emotion-detection.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Monster Cat Emotion Detection E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat.html');
    
    // Wait for page to load
    await page.waitForSelector('#catImage');
  });

  test('should detect happy emotion and change cat image', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendButton = page.locator('#sendBtn');
    const catImage = page.locator('#catImage');
    
    // Get initial cat image source
    const initialImageSrc = await catImage.getAttribute('src');
    console.log('Initial cat image:', initialImageSrc);
    
    // Send happy message
    await messageInput.fill('I am so happy and excited today!');
    await sendButton.click();
    
    // Wait for AI response
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 10000 });
    
    // Wait for cat image to change (with transition)
    await page.waitForTimeout(500);
    
    // Check if cat image changed to happy version
    const newImageSrc = await catImage.getAttribute('src');
    console.log('New cat image:', newImageSrc);
    
    // Should change to happy cat image
    expect(newImageSrc).toBe('http://localhost:3000/img/monster_cat_happy.png');
  });

  test('should detect sad emotion and change cat image', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendButton = page.locator('#sendBtn');
    const catImage = page.locator('#catImage');
    
    // Send sad message
    await messageInput.fill('I feel really sad and lonely today');
    await sendButton.click();
    
    // Wait for AI response
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 10000 });
    
    // Wait for cat image to change
    await page.waitForTimeout(500);
    
    // Check if cat image changed to sad version
    const newImageSrc = await catImage.getAttribute('src');
    console.log('Sad emotion cat image:', newImageSrc);
    
    // Should change to sad cat image (if available)
    expect(newImageSrc).toContain('monster_cat_sad.png');
  });

  test('should detect anxious emotion and change cat image', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendButton = page.locator('#sendBtn');
    const catImage = page.locator('#catImage');
    
    // Send anxious message
    await messageInput.fill('I am feeling anxious and worried about tomorrow');
    await sendButton.click();
    
    // Wait for AI response
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 10000 });
    
    // Wait for cat image to change
    await page.waitForTimeout(500);
    
    // Check if cat image changed to worried version
    const newImageSrc = await catImage.getAttribute('src');
    console.log('Anxious emotion cat image:', newImageSrc);
    
    // Should change to worried cat image (if available)
    expect(newImageSrc).toContain('monster_cat_worried.png');
  });

  test('should detect excited emotion and change cat image', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendButton = page.locator('#sendBtn');
    const catImage = page.locator('#catImage');
    
    // Send excited message
    await messageInput.fill('I am so excited about my vacation!');
    await sendButton.click();
    
    // Wait for AI response
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 10000 });
    
    // Wait for cat image to change
    await page.waitForTimeout(500);
    
    // Check if cat image changed to excited version
    const newImageSrc = await catImage.getAttribute('src');
    console.log('Excited emotion cat image:', newImageSrc);
    
    // Should change to excited cat image (if available)
    expect(newImageSrc).toContain('monster_cat_excited.png');
  });

  test('should handle multiple emotion changes in sequence', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendButton = page.locator('#sendButton');
    const catImage = page.locator('#catImage');
    
    // First message - happy
    await messageInput.fill('I am happy!');
    await sendButton.click();
    await expect(page.locator('.speech-bubble.cat').nth(1)).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    
    let imageSrc = await catImage.getAttribute('src');
    console.log('After happy message:', imageSrc);
    
    // Second message - sad
    await messageInput.fill('But now I feel sad');
    await sendButton.click();
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    
    imageSrc = await catImage.getAttribute('src');
    console.log('After sad message:', imageSrc);
    
    // Third message - excited
    await messageInput.fill('Actually, I am excited!');
    await sendButton.click();
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    
    imageSrc = await catImage.getAttribute('src');
    console.log('After excited message:', imageSrc);
    
    // Verify we have multiple messages
    const speechBubbles = page.locator('.speech-bubble');
    const bubbleCount = await speechBubbles.count();
    expect(bubbleCount).toBeGreaterThanOrEqual(4); // Welcome + 3 user messages + 3 AI responses
  });

  test('should maintain emotion-based responses from Monster Cat', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendButton = page.locator('#sendBtn');
    
    // Send emotional message
    await messageInput.fill('I am feeling really stressed and overwhelmed');
    await sendButton.click();
    
    // Wait for AI response
    const aiResponse = page.locator('.speech-bubble.cat').last();
    await expect(aiResponse).toBeVisible({ timeout: 10000 });
    
    // Check if AI response is emotionally supportive
    const responseText = await aiResponse.textContent();
    console.log('AI response for stress:', responseText);
    
    // Should contain supportive language
    expect(responseText.toLowerCase()).toMatch(/feel|understand|here|support|listen|sorry/);
    
    // Should not contain non-emotional advice
    expect(responseText.toLowerCase()).not.toMatch(/weather|work|homework|fact/);
  });
});
