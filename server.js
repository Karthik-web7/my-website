const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware
app.use(express.static(path.join(__dirname,'/'))); // Serve static files from the current directory
//app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// In-memory storage for submissions
let submissions = [];

// Load existing submissions from file
const submissionsFile = path.join(__dirname, 'submissions.json');
if (fs.existsSync(submissionsFile)) {
  const data = fs.readFileSync(submissionsFile, 'utf8');
  submissions = JSON.parse(data);
}

// Helper function to save submissions to file
function saveSubmissions() {
  fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));
}

// Handle form submission
app.post('/submit-form', (req, res) => {
  console.log('Received form submission:', req.body);
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const submission = {
    id: Date.now(),
    name,
    email,
    message,
    timestamp: new Date().toISOString(),
    eventSuccessful: false // Default to unsuccessful
  };
  
  submissions.push(submission);
  console.log('New submission:', submission);
  
  saveSubmissions();
  
  res.json({ success: true });
});

// Route to view submissions
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

// Delete a submission
app.delete('/api/submissions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = submissions.findIndex(sub => sub.id === id);
  
  if (index !== -1) {
    submissions.splice(index, 1);
    saveSubmissions();
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: 'Submission not found' });
  }
});

// Toggle event status
app.post('/api/submissions/:id/toggle-status', (req, res) => {
  const id = parseInt(req.params.id);
  const submission = submissions.find(sub => sub.id === id);
  
  if (submission) {
    submission.eventSuccessful = !submission.eventSuccessful;
    saveSubmissions();
    res.json({ eventSuccessful: submission.eventSuccessful });
  } else {
    res.status(404).json({ success: false, message: 'Submission not found' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`View the website at http://localhost:${PORT}`);
  console.log(`View admin page at http://localhost:${PORT}/admin`);
});