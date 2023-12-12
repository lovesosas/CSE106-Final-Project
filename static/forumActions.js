document.addEventListener('DOMContentLoaded', () => {
    let isDarkMode = false; // Define isDarkMode in a broader scope
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Check local storage for dark mode preference and apply it
    const storedDarkMode = localStorage.getItem('dark_mode');
    if (storedDarkMode) {
        isDarkMode = storedDarkMode === 'dark'; // Update isDarkMode based on the stored value
        document.body.classList.toggle('dark-mode', isDarkMode);
        darkModeToggle.setAttribute('data-mode', storedDarkMode);
    }

    darkModeToggle.addEventListener('click', function () {
        toggleDarkMode();

        // Save the updated dark mode preference to local storage
        const newMode = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('dark_mode', newMode);
    });

    darkModeToggle.addEventListener('mouseout', () => {
        darkModeToggle.style.animation = '';
    });

    // Define the toggleDarkMode function
    function toggleDarkMode() {
        isDarkMode = !isDarkMode; // Toggle the dark mode status
        document.body.classList.toggle('dark-mode', isDarkMode);
        darkModeToggle.setAttribute('data-mode', isDarkMode ? 'dark' : 'light');
    }

    document.querySelectorAll('.like-form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const postId = this.dataset.postId;
            likePost(postId);
        });
    });
    toggleDarkMode(isDarkMode);

        // Save the updated dark mode preference to local storage
        const newMode = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('dark_mode', newMode);
    
    document.querySelectorAll('.dislike-form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const postId = this.dataset.postId;
            dislikePost(postId);
        });
    });

    document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const postId = this.dataset.postId;
            const commentContent = this.querySelector('.comment-input').value;
            const csrfToken = this.querySelector('input[name="csrf_token"]').value; 
            submitComment(postId, commentContent, csrfToken);
            this.querySelector('.comment-input').value = ''; 
        });
    });
});

function getCsrfToken() {
    // Get the CSRF token from the hidden input in the form
    return document.querySelector('input[name="csrf_token"]').value;
}

function likePost(postId) {
    fetch(`/like_post/${postId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        const likesElement = document.getElementById(`likes-${postId}`);
        likesElement.textContent = `Likes: ${data.likes}`;
    })
    .catch(error => console.error('Error:', error));
}

function dislikePost(postId) {
    fetch(`/dislike_post/${postId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        const dislikesElement = document.getElementById(`dislikes-${postId}`);
        dislikesElement.textContent = `Dislikes: ${data.dislikes}`;
    })
    .catch(error => console.error('Error:', error));
}

function submitComment(postId, content, csrfToken) {
    const darkModeEnabled = document.body.classList.contains('dark-mode');

    fetch(`/comment_post/${postId}?dark_mode=${darkModeEnabled}`, {
        method: 'POST',
        body: JSON.stringify({ comment: content }),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken // Include the CSRF token in the header
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) { // Check if the comment ID is returned
            const commentsSection = document.getElementById(`comments-${postId}`);
            const newComment = document.createElement('div');
            newComment.classList.add('comment');
            // newComment.textContent = content; 
            newComment.innerHTML = `<strong>${data.author}</strong>: ${data.content}`; 

            commentsSection.appendChild(newComment);
        }
    })
    .catch(error => console.error('Error:', error));
}

function searchPosts() {
    const searchQuery = document.getElementById('searchQuery').value;
    fetch(`/home?search_query=${searchQuery}`)
        .then(response => response.json())
        .then(data => {
            // Update the DOM with the search results
            // Replace this with your logic to display the posts dynamically
            console.log('Search Results:', data);
        })
        .catch(error => console.error('Error:', error));
}

