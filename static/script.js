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
    // Get the CSRF token from the hidden input in the form
    return document.querySelector('input[name="csrf_token"]').value;
}
// When login button is clicked
$("#loginbutton").on("click", function(event){
    event.preventDefault(); // Prevent the default form submission

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
                window.location.href = response.redirect_url; // Adjust according to the response from your server
            }, 
            error: function(jqXHR, textStatus, errorThrown){
                console.log("Login error:", errorThrown);
            }
        });
    } else {
        console.log('Username or password is missing.');
    }
});


// $.ajaxSetup({
//     beforeSend: function(xhr, settings) {
//         if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
//             xhr.setRequestHeader("X-CSRFToken", csrfToken);
//         }
//     }
// });
