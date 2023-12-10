//url: "https://your-live-server.com/login",
//indow.location.href = "https://your-live-server.com/home";

var current_name = "";
var current_password = "";
var home_password = "";

// sets name to be inputted username
function setName(){
    current_name = document.getElementById("user_name").value;
}
// sets password to be inputted password
function setPassword(){
    current_password = document.getElementById("password").value;
}

function getCsrfToken() {
    return document.querySelector('input[name="csrf_token"]').value;
}

// When login button is clicked
$("#loginbutton").on("click", function(event){
    event.preventDefault();

    let csrfToken = getCsrfToken();
    let username = $("#user_name").val();
    let password = $("#password").val();

    if (username !== "" && password !== "") {
        $.ajax({
            url: "/login",
            type: "POST",
            data: JSON.stringify({"username": username, "password": password, "csrf_token": csrfToken}),
            contentType: "application/json",
            success: function(response){
                window.location.href = response.redirect_url;
            }, 
            error: function(jqXHR, textStatus, errorThrown){
                console.log("Login error:", errorThrown);
            }
        });
    } else {
        console.log('Username or password is missing.');
    }
});

// Forum search functionality
$("#searchButton").on("click", function() {
    let searchTerm = $("#searchInput").val();
    searchForum(searchTerm);
});

function searchForum(searchTerm) {
    $.ajax({
        url: "/search",
        type: "POST",
        data: JSON.stringify({"searchTerm": searchTerm}),
        contentType: "application/json",
        success: function(response){
            displaySearchResults(response.results);
        }, 
        error: function(jqXHR, textStatus, errorThrown){
            console.log("Search error:", errorThrown);
        }
    });
}

function displaySearchResults(results) {
    let resultsContainer = $("#searchResults");
    resultsContainer.empty();

    if (results.length === 0) {
        resultsContainer.html("<p>No results found.</p>");
    } else {
        resultsContainer.append("<p>Search Results:</p>");
        results.forEach(result => {
            resultsContainer.append(`<p>${result.title} by ${result.author}</p>`);
        });
    }
}