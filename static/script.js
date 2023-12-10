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
// When login button is clicked
$("#loginbutton").on("click", function(){
    let username = $("#user_name").val();
    let password = $("#password").val()
    // console.log(username);
    // console.log(password);
    if (username !== "" && password !== "") {
        // console.log("test1");
        $.ajax({
            url: "http://127.0.0.1:5000/",
            type: "POST",
            data: JSON.stringify({"username" : username, "password" : password}),
            contentType: "application/JSON",
            success: function(response){
                // console.log("test2");
                window.location.href = "http://127.0.0.1:5000/" + response;
            }, 
            error: function(jqXHR, textStatus, errorThrown){
                console.log(errorThrown);
            }
        });
    }
    else{
        console.log('wrong username or password');
    }
});