// tests/e2e/chat.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Monster Cat Chat E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat.html');
    
    // Wait for page to load
    await page.waitForSelector('#catImage');
    
    // Wait a bit for any existing messages to load
    await page.waitForTimeout(1000);
  });

  test('should display Monster Cat and welcome message', async ({ page }) => {
    // Check if Monster Cat image is displayed
    const catImage = page.locator('#catImage');
    await expect(catImage).toBeVisible();
    
    // Check if welcome message is displayed (first cat message)
    const welcomeMessage = page.locator('.speech-bubble.cat').first().locator('.speech-text');
    await expect(welcomeMessage).toContainText('Monster Cat, your emotional support companion');
    
    // Check if input field is present
    const messageInput = page.locator('#messageInput');
    await expect(messageInput).toBeVisible();
    await expect(messageInput).toHaveAttribute('placeholder', 'Share your feelings with me...');
    
    // Check if send button is present
    const sendButton = page.locator('#sendBtn');
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toHaveText('Send');
  });

  test('should send a message and receive AI response', async ({ page }) => {
    // Type a message
    const messageInput = page.locator('#messageInput');
    const sendButton = page.locator('#sendBtn');
    
    await messageInput.fill('I am feeling happy today!');
    
    // Send the message
    await sendButton.click();
    
    // Wait for typing indicator to appear and disappear
    const typingIndicator = page.locator('#typingIndicator');
    await expect(typingIndicator).toBeVisible();
    
    // Wait for AI response (should appear within 10 seconds)
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 10000 });
    
    // Check if user message is displayed (last user message)
    const userMessage = page.locator('.speech-bubble.user').last();
    await expect(userMessage).toContainText('I am feeling happy today!');
    
    // Check if AI response is displayed (last cat message)
    const aiResponse = page.locator('.speech-bubble.cat').last();
    await expect(aiResponse).toBeVisible();
    
    // Verify input is cleared and re-enabled
    await expect(messageInput).toHaveValue('');
    await expect(messageInput).toBeEnabled();
    await expect(sendButton).toBeEnabled();
  });

  test('should handle Enter key to send message', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    
    await messageInput.fill('I feel sad');
    await messageInput.press('Enter');
    
    // Wait for AI response
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 10000 });
    
    // Check if message was sent
    const userMessage = page.locator('.speech-bubble.user').last();
    await expect(userMessage).toContainText('I feel sad');
  });

  test('should not send empty messages', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendButton = page.locator('#sendBtn');
    
    // Try to send empty message
    await sendButton.click();
    
    // Should not create new speech bubbles
    const speechBubbles = page.locator('.speech-bubble');
    const initialCount = await speechBubbles.count();
    
    // Wait a bit to ensure no new messages appear
    await page.waitForTimeout(1000);
    
    const finalCount = await speechBubbles.count();
    expect(finalCount).toBe(initialCount);
  });

  test('should show typing indicator while processing', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendButton = page.locator('#sendBtn');
    const typingIndicator = page.locator('#typingIndicator');
    
    await messageInput.fill('How are you?');
    await sendButton.click();
    
    // Typing indicator should appear
    await expect(typingIndicator).toBeVisible();
    
    // Should disappear when response arrives
    await expect(typingIndicator).toBeHidden({ timeout: 10000 });
  });

  test('should navigate back to home page', async ({ page }) => {
    const backButton = page.locator('.back-btn');
    await expect(backButton).toBeVisible();
    
    await backButton.click();
    
    // Should navigate to home page
    await expect(page).toHaveURL('/');
  });
});
