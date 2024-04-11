"use strict";
const submitStoryForm = document.getElementById('submit')
const addedStory = document.getElementById('addStoryForm')
/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */
function navSubmitStoryClick(evt) {
  console.debug("navSubmitStoryClick", evt);
  hidePageComponents();
  addedStory.style.display = 'block';
}

submitStoryForm.addEventListener('click', navSubmitStoryClick )
  

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show(); // This assumes you have elements with this class that should be shown
  $("#nav-login").hide(); // Hides the login/signup link
  $("#nav-logout").show(); // Shows the logout link
  $("#submit").show(); // Shows the "Submit" link
  $("#nav-user-profile").text(`${currentUser.username}`).show(); // Shows the user profile link and sets the username
}