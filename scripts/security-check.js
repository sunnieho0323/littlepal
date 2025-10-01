// scripts/security-check.js - Security validation script
const fs = require('fs');
const path = require('path');

console.log('🔒 Running security checks...\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  
  // Check if .env contains placeholder values
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your-openai-api-key')) {
    console.log('⚠️  WARNING: .env contains placeholder API key');
    console.log('   Please replace with your actual OpenAI API key');
  } else {
    console.log('✅ .env contains actual API key (not placeholder)');
  }
} else {
  console.log('❌ .env file not found');
  console.log('   Please create .env file from .env.example');
}

// Check if .env is in .gitignore
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env')) {
    console.log('✅ .env is properly ignored by Git');
  } else {
    console.log('❌ .env is NOT in .gitignore');
  }
}

// Check if .env.example exists
const envExamplePath = path.join(__dirname, '..', '.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('✅ .env.example template exists');
} else {
  console.log('❌ .env.example template missing');
}

console.log('\n🔒 Security check complete!');
