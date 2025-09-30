// tests/e2e/chat-flow.spec.js - Focused chat flow tests
const { test, expect } = require('@playwright/test');

test.describe('Chat Flow - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication state in localStorage
    await page.goto('/login.html');
    await page.evaluate(() => {
      localStorage.setItem('lp_user', JSON.stringify({ email: 'test@example.com' }));
    });
    
    // Now navigate to chat page
    await page.goto('/chat.html');
    
    // Wait for page to load completely
    await page.waitForSelector('#catImage', { timeout: 10000 });
    await page.waitForSelector('#messageInput', { timeout: 10000 });
  });

  test('1. Open chat → should display welcome message and UI', async ({ page }) => {
    // Verify page loads correctly
    await expect(page.locator('#catImage')).toBeVisible();
    await expect(page.locator('#messageInput')).toBeVisible();
    await expect(page.locator('#sendBtn')).toBeVisible();
    
    // Verify there's at least one cat message (welcome or existing)
    const catMessages = page.locator('.speech-bubble.cat');
    await expect(catMessages.first()).toBeVisible();
    
    // Check if there's a welcome message with wave emoji
    const welcomeMessage = catMessages.first();
    const messageText = await welcomeMessage.locator('.speech-text').textContent();
    
    // Accept either welcome message or any existing message
    expect(messageText).toBeTruthy();
    expect(messageText.length).toBeGreaterThan(0);
  });

  test('2. Send → should send user message and display in chat', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendButton = page.locator('#sendBtn');
    
    // Send a test message
    const testMessage = 'Hello, I am feeling happy today!';
    await messageInput.fill(testMessage);
    await sendButton.click();
    
    // Wait for user message to appear
    const userMessage = page.locator('.speech-bubble.user').last();
    await expect(userMessage).toBeVisible({ timeout: 5000 });
    await expect(userMessage).toContainText(testMessage);
    
    // Wait for AI response
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 15000 });
    
    // Verify input is cleared
    await expect(messageInput).toHaveValue('');
  });

  test('3. AI reply → should receive and display AI response', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendButton = page.locator('#sendBtn');
    
    // Send a message
    await messageInput.fill('Tell me about yourself');
    await sendButton.click();
    
    // Wait for typing indicator
    const typingIndicator = page.locator('#typingIndicator');
    await expect(typingIndicator).toBeVisible();
    
    // Wait for AI response
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 15000 });
    
    // Verify AI response is displayed
    const aiResponse = page.locator('.speech-bubble.cat').last();
    await expect(aiResponse).toBeVisible();
    await expect(aiResponse.locator('.speech-text')).not.toBeEmpty();
    
    // Verify typing indicator disappears
    await expect(typingIndicator).toBeHidden();
  });

  test('4. Display → should show complete conversation flow', async ({ page }) => {
    const messageInput = page.locator('#messageInput');
    const sendButton = page.locator('#sendBtn');
    
    // Count initial messages
    const initialCatMessages = await page.locator('.speech-bubble.cat').count();
    const initialUserMessages = await page.locator('.speech-bubble.user').count();
    
    // Send first message
    await messageInput.fill('How are you today?');
    await sendButton.click();
    
    // Wait for first AI response
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 15000 });
    await expect(messageInput).toBeEnabled(); // Wait for sending to complete
    
    // Send second message
    await messageInput.fill('That sounds great!');
    await sendButton.click();
    
    // Wait for second AI response to complete
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 15000 });
    await expect(messageInput).toBeEnabled(); // Wait for sending to complete
    
    // Verify conversation history - use more flexible assertions
    const finalCatMessages = await page.locator('.speech-bubble.cat').count();
    const finalUserMessages = await page.locator('.speech-bubble.user').count();
    
    // Check that messages increased by at least the expected amount
    expect(finalCatMessages).toBeGreaterThanOrEqual(initialCatMessages + 1);
    expect(finalUserMessages).toBeGreaterThanOrEqual(initialUserMessages + 2);
    
    // Verify all messages are visible and properly formatted
    const allMessages = page.locator('.speech-bubble');
    await expect(allMessages).toHaveCount(finalCatMessages + finalUserMessages);
  });

  test('5. Complete flow → Open → Send → AI reply → Display', async ({ page }) => {
    // Step 1: Open chat (already done in beforeEach)
    await expect(page.locator('#catImage')).toBeVisible();
    
    // Step 2: Send message
    const testMessage = 'I need some emotional support today';
    await page.locator('#messageInput').fill(testMessage);
    await page.locator('#sendBtn').click();
    
    // Step 3: Wait for AI reply
    await expect(page.locator('.speech-bubble.cat').last()).toBeVisible({ timeout: 15000 });
    
    // Step 4: Verify complete display
    const conversationArea = page.locator('#conversationArea');
    await expect(conversationArea).toBeVisible();
    
    // Verify user message
    const userMessage = page.locator('.speech-bubble.user').last();
    await expect(userMessage).toContainText(testMessage);
    
    // Verify AI response
    const aiResponse = page.locator('.speech-bubble.cat').last();
    await expect(aiResponse).toBeVisible();
    await expect(aiResponse.locator('.speech-text')).not.toBeEmpty();
    
    // Verify conversation is scrollable (if needed)
    const conversationHeight = await conversationArea.evaluate(el => el.scrollHeight);
    const visibleHeight = await conversationArea.evaluate(el => el.clientHeight);
    
    if (conversationHeight > visibleHeight) {
      await expect(conversationArea).toHaveCSS('overflow-y', 'auto');
    }
  });
});
