import { Notify } from 'notiflix/build/notiflix-notify-aio';
import UrlCreator from './js/url-creator';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const axios = require('axios').default;
const urlCreator = new UrlCreator();
let observer;
const observerOptions = {
  rootMargin: '100px',
};
const refs = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
  upButtonEl: document.querySelector('.up-button'),
};
const notiflixParams = {
  position: 'center-center',
  cssAnimationStyle: 'from-left',
  fontSize: '14px',
  distance: '1px',
  showOnlyTheLastOne: true,
};
let gallery = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  scrollZoom: false,
});

refs.formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(e) {
  e.preventDefault();
  refs.galleryEl.innerHTML = '';
  urlCreator.clearPageValue();
  urlCreator.getQuery();
  if (!urlCreator.searchQuery) {
    return Notify.warning(
      'Enter your search parameters, please.',
      notiflixParams
    );
  } else {
    fetchUrl(urlCreator.getUrl()).then(response => {
      if (response.totalHits === 0) {
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          notiflixParams
        );
      } else if (response.totalHits > 0) {
        Notify.success(`Hooray! We found ${response.totalHits} images.`, {
          ...notiflixParams,
          position: 'left-top',
        });
        drawCards(response.hits);
        createObserver();
      }
      return response;
    });
  }
}

function onScroll(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      urlCreator.incrementPage();
      fetchUrl(urlCreator.getUrl()).then(data => {
        if (data.hits.length === 0) {
          Notify.info(
            "We're sorry, but you've reached the end of search results.",
            notiflixParams
          );
          observer.unobserve(entry.target);
          return;
        }
        drawCards(data.hits);
      });
    }
  });
}

async function fetchUrl(targetUrl) {
  let data;
  try {
    const response = await axios.get(targetUrl).then(response => {
      data = response.data;
    });
    return data;
  } catch (error) {
    console.error(error);
  }
}

function drawCards(data) {
  const markup = data
    .map(
      ({
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        largeImageURL,
      }) =>
        `<div class="photo-card">
          <a href="${largeImageURL}">
            <img class="image" src="${webformatURL}" alt="${tags}" loading="lazy" />
          </a>
            <div class="info">
                <p class="info-item">
                <b>Likes: ${likes}</b>
                </p>
                <p class="info-item">
                <b>Views: ${views}</b>
                </p>
                <p class="info-item">
                <b>Comments :${comments}</b>
                </p>
                <p class="info-item">
                <b>Downloads: ${downloads}</b>
                </p>
            </div>
          </div>`
    )
    .join('');
  refs.galleryEl.insertAdjacentHTML('beforeend', markup);
  gallery.refresh();
}

function createObserver() {
  refs.galleryEl.insertAdjacentHTML('afterend', '<div id="scrollArea"></div>');
  refs.scrollTarget = document.querySelector('#scrollArea');
  observer = new IntersectionObserver(onScroll, observerOptions);
  observer.observe(refs.scrollTarget);
}
