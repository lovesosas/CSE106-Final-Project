

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

    document.querySelector('.container').addEventListener('click', function (event) {
        const postId = event.target.closest('.like-form, .dislike-form')?.dataset.postId;
        const commentId = event.target.closest('.like-comment-form, .dislike-comment-form')?.dataset.commentId;

        if (postId) {
            // If like or dislike button for a post is clicked
            event.preventDefault();
            if (event.target.classList.contains('like-button')) {
                likePost(postId);
            } else if (event.target.classList.contains('dislike-button')) {
                dislikePost(postId);
            }
        } else if (commentId) {
            // If like or dislike button for a comment is clicked
            event.preventDefault();
            if (event.target.classList.contains('like-button')) {
                likeComment(commentId);
            } else if (event.target.classList.contains('dislike-button')) {
                dislikeComment(commentId);
            }
        }
    });
    
    toggleDarkMode(isDarkMode);

        // Save the updated dark mode preference to local storage
        const newMode = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('dark_mode', newMode);
    

        document.querySelectorAll('.comment-form').forEach(form => {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const postId = this.dataset.postId;
                const commentContent = this.querySelector('.comment-input').value;
                const csrfToken = getCsrfToken(); // Use the correct CSRF token
                submitComment(postId, commentContent, csrfToken);
                this.querySelector('.comment-input').value = '';
            });
        });
        
});

function likeComment(commentId) {
    const likesElement = document.getElementById(`likes-comment-${commentId}`);
    // Update the text content before making the fetch request
    likesElement.textContent = parseInt(likesElement.textContent) + 1;

    // Fetch request and handling remain the same
    fetch(`/like_comment/${commentId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        // Refine the text content based on the server response
        likesElement.textContent = data.likes;
    })
    .catch(error => console.error('Error:', error));
}

function dislikeComment(commentId) {
    const dislikesElement = document.getElementById(`dislikes-comment-${commentId}`);
    // Update the text content before making the fetch request
    dislikesElement.textContent = parseInt(dislikesElement.textContent) + 1;

    // Fetch request and handling remain the same
    fetch(`/dislike_comment/${commentId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        // Refine the text content based on the server response
        dislikesElement.textContent = data.dislikes;
    })
    .catch(error => console.error('Error:', error));
}



function getCsrfToken() {
    // Get the CSRF token from the hidden input in the form
    return document.querySelector('input[name="csrf_token"]').value;
}

function likePost(postId) {
    const likesElement = document.getElementById(`likes-${postId}`);
    // Update the text content before making the fetch request
    likesElement.textContent = parseInt(likesElement.textContent) + 1;

    // Fetch request and handling remain the same
    fetch(`/like_post/${postId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        // Refine the text content based on the server response
        likesElement.textContent = data.likes;
    })
    .catch(error => {
        console.error('Error:', error);
        // If there's an error, revert the text content to the original state
        likesElement.textContent = parseInt(likesElement.textContent) - 1;
    });
}

function dislikePost(postId) {
    const dislikesElement = document.getElementById(`dislikes-${postId}`);
    // Update the text content before making the fetch request
    dislikesElement.textContent = parseInt(dislikesElement.textContent) + 1;

    // Fetch request and handling remain the same
    fetch(`/dislike_post/${postId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        // Refine the text content based on the server response
        dislikesElement.textContent = data.dislikes;
    })
    .catch(error => {
        console.error('Error:', error);
        // If there's an error, revert the text content to the original state
        dislikesElement.textContent = parseInt(dislikesElement.textContent) - 1;
    });
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

