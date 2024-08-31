// script.js

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const formObject = Object.fromEntries(formData.entries());

            console.log('Sending form data:', formObject); // Debug log

            fetch('/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject)
            })
            .then(response => {
                console.log('Response status:', response.status); // Debug log
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data); // Debug log
                if (data.success) {
                    alert('Thank you for your message. We will get back to you soon!');
                    form.reset();
                } else {
                    alert(`There was an error sending your message: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                alert(`There was an error sending your message: ${error.message}`);
            });
        });
    }

    // Load submissions for admin page
    const submissionsTable = document.getElementById('submissionsTable');
    if (submissionsTable) {
        fetch('/view-submissions')
            .then(response => response.json())
            .then(data => {
                const tableBody = submissionsTable.querySelector('tbody');
                data.forEach(submission => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${submission.id}</td>
                        <td>${submission.name}</td>
                        <td>${submission.email}</td>
                        <td>${submission.message}</td>
                        <td>${submission.timestamp}</td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error loading submissions:', error));
    }
});