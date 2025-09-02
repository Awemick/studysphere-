// script.js
import { supabase, userAPI, notesAPI } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

// --- Event Listeners ---
function setupEventListeners() {
  // Auth
  document.getElementById('authBtn').addEventListener('click', () => {
    document.getElementById('authModal').classList.remove('hidden');
  });

  document.getElementById('startLearningBtn').addEventListener('click', () => {
    switchToTab('generate');
  });

  // File Upload
  const fileInput = document.getElementById('fileUpload');
  fileInput.addEventListener('change', handleFileUpload);

  const imageInput = document.getElementById('imageUpload');
  imageInput.addEventListener('change', handleImageUpload);

  // OCR
  document.getElementById('extractTextBtn').addEventListener('click', extractTextFromImage);

  // Voice Recording
  document.getElementById('recordBtn').addEventListener('click', handleRecordClick);

  // AI Summary
  document.getElementById('generateBtn').addEventListener('click', generateSummary);

  // Premium / Paystack
  document.getElementById('upgradeLink').addEventListener('click', () => switchToTab('premium'));
}

// --- Tab Switching ---
function switchToTab(tabName) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
  if (targetTab) targetTab.classList.add('active');
  const targetPane = document.getElementById(`${tabName}-tab`);
  if (targetPane) targetPane.classList.add('active');
}

// --- File Upload ---
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('filePreview').classList.remove('hidden');
  await notesAPI.uploadNote(file);
}

// --- Image Upload & OCR ---
async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  document.getElementById('previewImage').src = URL.createObjectURL(file);
  document.getElementById('imagePreview').classList.remove('hidden');
}

async function extractTextFromImage() {
  const imageInput = document.getElementById('imageUpload');
  const file = imageInput.files[0];
  if (!file) return alert('Select an image first');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('apikey', 'K85308176588957');
  const res = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  const text = data.ParsedResults?.[0]?.ParsedText || '';
  document.querySelector('.notes-input').value = text;
  alert('Text extracted from image!');
}

// --- AI Summary using Hugging Face ---
async function generateSummary() {
  const text = document.querySelector('.notes-input').value;
  if (!text) return alert('Add content first');

  const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
    method: 'POST',
    headers: { 
      Authorization: 'Bearer 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',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: text })
  });
  const data = await response.json();
  document.getElementById('summaryOutput').textContent = data[0]?.summary_text || 'Failed to summarize';
}

// --- Voice Recording (simulation) ---
function handleRecordClick() {
  const transcriptPreview = document.getElementById('transcriptPreview');
  transcriptPreview.textContent = "Simulated voice-to-text transcript.";
}

// --- Premium / Paystack ---
async function payWithPaystack(amountKobo = 1000) {
  const handler = PaystackPop.setup({
    key: 'pk_test_c8085f6e5ec5f58ab4146937afe3daf700003bfe',
    email: 'customer@example.com',
    amount: amountKobo,
    callback: function(response) {
      alert('Payment successful! Reference: ' + response.reference);
    },
    onClose: function() {
      alert('Transaction was not completed.');
    }
  });
  handler.openIframe();
}
