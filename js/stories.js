"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  await loadUserFavorites(); // Ensure this completes before rendering stories
  putStoriesOnPage();
}
/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, isFavorite) {
  let li = document.createElement('li');
  li.id = `story-${story.storyId}`;

  // Add checkbox for favorite status
  let checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.classList.add('favorite-checkbox');
  checkbox.checked = isFavorite;
  checkbox.dataset.storyId = story.storyId;
  li.appendChild(checkbox);

  // Add story link
  let link = document.createElement('a');
  link.href = story.url;
  link.target = "_blank";
  link.classList.add('story-link');
  link.textContent = story.title;
  li.appendChild(link);

  // Add hostname, author, user display
  let hostname = document.createElement('small');
  hostname.classList.add('story-hostname');
  hostname.textContent = `(${story.getHostName()})`;
  li.appendChild(hostname);

  let author = document.createElement('small');
  author.classList.add('story-author');
  author.textContent = `by ${story.author}`;
  li.appendChild(author);

  let user = document.createElement('small');
  user.classList.add('story-user');
  user.textContent = `posted by ${story.username}`;
  li.appendChild(user);

  // Only add a remove button for favorites
  if (isFavorite) {
    let removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.dataset.storyId = story.storyId;
    removeBtn.classList.add('remove-favorite-btn');
    li.appendChild(removeBtn);
  }

  return li;
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

 
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

document.getElementById('addStoryForm').addEventListener('submit', async function addNewStory(evt){
  evt.preventDefault();
  const author = document.getElementById('author').value;
  const title = document.getElementById('title').value;
  const url = document.getElementById('url').value;
  const username = currentUser.username
  const storyData = { title, author, url, username };
  const story = await storyList.addStory(currentUser, storyData);
  let storyys = generateStoryMarkup(story);
  allStoriesList.append(storyys);
});

async function addFavorites(user, { username, storyId }) {
  const token = user.loginToken;
  try {
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/users/${username}/favorites/${storyId}`, 
      data: { token },
    });
    const story = new Story(response.data.story);
   
    user.favorites.unshift(story); 
    saveUserToFavorites(user); 
    return story;
  } catch (error) {
    console.error("Failed to add favorite:", error);
    throw error;
  }
}

async function removeFavorites(user, { username, storyId }) {
  const token = user.loginToken;
  try {
    await axios({
      method: "DELETE",
      url: `${BASE_URL}/users/${username}/favorites/${storyId}`,
      data: { token },
    });

    const storyIndex = user.favorites.findIndex(story => story.storyId === storyId);
    if (storyIndex > -1) {
      user.favorites.splice(storyIndex, 1);
      saveUserToFavorites(user);
    }
    
  
  } catch (error) {
    console.error("Failed to remove favorite:", error);
    throw error; 
  }
}

document.querySelector('.favorites').addEventListener('click', toggleFavoriteStoriesVisibility);

let showingFavorites = false; 

function toggleFavoriteStoriesVisibility() {
  showingFavorites = !showingFavorites; 

  const stories = document.querySelectorAll('#all-stories-list li');
  stories.forEach(story => {
    const checkbox = story.querySelector('.favorite-checkbox');
    if (checkbox) {
      if (showingFavorites && !checkbox.checked) {
       
        story.style.display = 'none';
      } else {
        
        story.style.display = '';
       
        if (showingFavorites) {
        
          if (!story.querySelector('.remove-favorite-btn') && checkbox.checked) {
            let removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.dataset.storyId = checkbox.dataset.storyId;
            removeBtn.classList.add('remove-favorite-btn');
            removeBtn.addEventListener('click', async function(event) {
              await removeFavorites(currentUser, { username: currentUser.username, storyId: checkbox.dataset.storyId });
              story.remove(); 
            });
            story.appendChild(removeBtn);
          }
        } else {
          let removeBtn = story.querySelector('.remove-favorite-btn');
          if (removeBtn) {
            removeBtn.remove();
          }
        }
      }
    }
  });
}




async function loadUserFavorites() {
  const favoritesData = localStorage.getItem('userFavorites');
  if (favoritesData) {
      const favoriteIds = JSON.parse(favoritesData);
      const allStories = await fetchAllStories();
      currentUser.favorites = allStories.filter(story => favoriteIds.includes(story.storyId));
  }
}



const submittedStories = document.getElementById('submittedStories');

document.getElementById('addStoryForm').addEventListener('submit', async function addNewStory(evt){
  evt.preventDefault();
  const author = document.getElementById('author').value;
  const title = document.getElementById('title').value;
  const url = document.getElementById('url').value;
  const username = currentUser.username;
  const storyData = { title, author, url, username };
  const story = await storyList.addStory(currentUser, storyData);
  let storyMarkup = generateStoryMarkup(story);  
  submittedStories.append(storyMarkup);
});

let showingSubmitted = false; 

function toggleMyStoriesVisible() {
  showingSubmitted = !showingSubmitted;
  document.getElementById('submittedStories').style.display = showingSubmitted ? 'block' : 'none';
  
  const allStories = document.querySelectorAll('#all-stories-list li');
  allStories.forEach(story => {
    if (showingSubmitted) {
     
      if (story.dataset.username !== currentUser.username) {
        story.style.display = 'none';
      }
    } else {
      story.style.display = 'block';
    }
  });
}


document.querySelector('.stories').addEventListener('click', toggleMyStoriesVisible);

document.querySelector('.favorites').addEventListener('click', async function(event) {
  if (event.target.classList.contains('remove-favorite-btn')) {
    const storyId = event.target.dataset.storyId;
    const username = currentUser.username;

    await removeFavorites(currentUser, { username, storyId });
    event.target.parentElement.remove(); 
    
  }
});
