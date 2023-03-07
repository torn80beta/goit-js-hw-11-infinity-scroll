import { Notify } from 'notiflix/build/notiflix-notify-aio';
import MoreButton from './js/more-button';
import UrlCreator from './js/url-creator';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const axios = require('axios').default;

const loadMoreButton = new MoreButton();
const urlCreator = new UrlCreator();
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
};

let gallery = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  scrollZoom: false,
});

refs.formEl.addEventListener('submit', onFormSubmit);
loadMoreButton.button.addEventListener('click', onLoadMore);

function onFormSubmit(e) {
  e.preventDefault();
  loadMoreButton.hide();
  refs.galleryEl.innerHTML = '';
  urlCreator.clearPageValue();
  urlCreator.getQuery();
  if (urlCreator.searchQuery === '') {
    Notify.warning('Enter your search parameters, please.', notiflixParams);
    return;
  } else {
    fetchUrl(urlCreator.getUrl()).then(response => {
      if (response.totalHits > 40) {
        Notify.success(`Hooray! We found ${response.totalHits} images.`, {
          ...notiflixParams,
          position: 'left-top',
        });
      }
      drawCards(response.hits);
      scroll();
    });
  }
}

function onLoadMore() {
  urlCreator.incrementPage();
  fetchUrl(urlCreator.getUrl()).then(data => {
    drawCards(data.hits);
    scroll();
  });
  //console.log(urlCreator.page);
}

async function fetchUrl(targetUrl) {
  let data;
  try {
    const response = await axios.get(targetUrl).then(response => {
      data = response.data;
      if (response.data.hits.length === 0) {
        loadMoreButton.hide();
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          { ...notiflixParams, position: 'center-center' }
        );
      } else if (urlCreator.page * 40 >= response.data.totalHits) {
        loadMoreButton.hide();
        return Notify.info(
          "We're sorry, but you've reached the end of search results.",
          notiflixParams
        );
      }
      loadMoreButton.show();
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

function scroll() {
  try {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 20,
      behavior: 'smooth',
    });
  } catch (error) {
    console.log(error);
  }
}

// const searchParams = {
//   image_type: 'photo',
//   orientation: 'horizontal',
//   safesearch: 'true',
// };
//&safesearch=true
