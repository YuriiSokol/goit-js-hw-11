'use strict';
const userKey = `35198946-b1cb389529bf0ab91bbbb016e`;
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { throttle } from 'throttle-debounce';

const loadMoreBtn = document.querySelector('.load-more');
const searchInput = document.querySelector('form input');
const searchBtn = document.querySelector('form button');
const loadMoreDiv = document.querySelector('.load-more-footer');
const scrollTopBtn = document.querySelector('.scrollTopButton');
const gallery = document.querySelector('.gallery');
const loadFormBtn = document.querySelector('.loadModeBtn');
let loadMoreVisiblecheck = false;
let autoScrollFlag = true;
//

let galleryItemsLimit = 0;
let galleryItemsRendered = 0;
let pageCounter = 1;
let numbersOfPagesToRender = 0;
let simpleGallery = new SimpleLightbox('.gallery a');
let isFirstSearch = true;
scrollTopBtn.style.display = 'none';
//

const loadMoreVisible = value => {
  if (value && loadMoreVisiblecheck && searchInput.value != '') {
    loadMoreBtn.style.display = 'block';
    loadMoreDiv.style.display = 'flex';
  } else {
    loadMoreBtn.style.display = 'none';
    loadMoreDiv.style.display = 'none';
  }
};
loadMoreVisible(false);

searchBtn.addEventListener('click', event => {
  event.preventDefault();
  newSearch(searchInput.value);
});

const fetchImages = async searchString => {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${userKey}&q=${searchString}&image_type=photo$orientation=horizontal&safesearch=true?fields=webformatURL,largeImageURL,tags,likes,views,comments,downloads&per_page=40&page=${pageCounter}`
    );
    galleryItemsLimit = response.data.total;
    console.log(galleryItemsLimit);
    if (response.data.hits.length != 0) {
      renderImages(response.data.hits);
      if (pageCounter === 1) {
        simpleGallery.refresh();
        loadMoreVisible(true);
        Notiflix.Notify.info(`Hooray! We found ${response.data.total} images.`);
      }
    } else {
      loadMoreVisible(false);
      return Notiflix.Notify.info(
        '"Sorry, there are no images matching your search query. Please try again."'
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const newSearch = searchString => {
  loadMoreVisible(false);
  if (!isFirstSearch) {
    gallery.innerHTML = '';
    pageCounter = 1;
    galleryItemsRendered = 0;
  }
  fetchImages(searchString);
};

const renderImages = data => {
  isFirstSearch = false;
  numbersOfPagesToRender -= 1;

  const element = data
    .map(elem => {
      galleryItemsRendered += 1;

      return `
      <div class="photo-card">
       <a href=${elem.largeImageURL}><img src="${elem.webformatURL}" width="300" height="200" alt="" loading="lazy" /></a>
      <div class="info">
     <p class="info-item">
        <b><span>Likes:</span></b> <span> ${elem.likes}</span>
      </p>
     <p class="info-item">
        <b><span>Views:</span></b><span>${elem.views}</span>
     </p>
     <p class="info-item">
       <b><span>Comments:</span></b>${elem.comments}</span>
      </p>
      <p class="info-item">
         <b><span>Downloads:</span></b><span>${elem.downloads}</span>
    </p>
  </div>
</div>`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', element);
  simpleGallery.refresh();
  if (galleryItemsRendered === galleryItemsLimit) {
    endReached();
  }
  let abc = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollTo({
    top: Math.abs(abc.top),
    behavior: 'smooth',
  });
};
const endReached = () => {
  loadMoreVisible(false);
  Notiflix.Notify.failure(
    "We're sorry, but you've reached the end of search results."
  );
};
loadMoreBtn.addEventListener('click', () => {
  pageCounter += 1;
  fetchImages(searchInput.value);
});

//Scroll Top button

const scrollFunction = () => {
  if (document.documentElement.scrollTop > 20) {
    scrollTopBtn.style.display = 'block';
  } else {
    scrollTopBtn.style.display = 'none';
  }
};
window.onscroll = () => {
  scrollFunction();
};

const goTopFunction = () => {
  document.documentElement.scrollTop = 0;
};
scrollTopBtn.addEventListener('click', () => {
  goTopFunction();
});

//  Infinite Scroll

const loadmore = () => {
  pageCounter += 1;
  fetchImages(searchInput.value);
};

const handleScroll = autoScrollFlag => {
  if (autoScrollFlag) {
    const endOfPage =
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
    if (endOfPage && galleryItemsRendered < galleryItemsLimit) loadmore();
  }
};

window.addEventListener(
  'scroll',
  throttle(250, () => {
    handleScroll(autoScrollFlag);
  })
);

const loadFormBtnAction = () => {
  const checkValue = () => {
    if (loadFormBtn.innerText === 'Auto load') {
      loadMoreVisiblecheck = true;
      loadMoreVisible(true);
      autoScrollFlag = false;
      return 'On demand';
    }
    if (loadFormBtn.innerText === 'On demand') {
      loadMoreVisible(false);
      autoScrollFlag = true;
      return 'Auto load';
    }
  };
  loadFormBtn.innerText = checkValue();
};

loadFormBtn.addEventListener('click', () => {
  loadFormBtnAction();
});
