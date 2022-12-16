import './css/styles.css';
import axios from 'axios';
import { Notify } from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


const API_KEY = '31996403-8756c258c06c01931ffa2e280';
const baseUrl = 'https://pixabay.com/api/?image_type=photo&orientation=horizontal&safesearch=true';
let page = 1;
let perPage = 40;
let searchNameImg ='';
let restLoadImage = 0;

async function fetchImg(nameImg) {
  try {
    const response = await axios.get(`${baseUrl}&key=${API_KEY}&q=${nameImg}&page=${page}&per_page=${perPage}`);
    return response;
  } catch (error) {
    console.error(error);
  }
}

function incrementPage () {
  page += 1;
}
function resetPage () {
  page = 1;
}

const refs = {
    formImput: document.querySelector('#search-form'),
    galleryContainer: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
}

refs.formImput.addEventListener('submit', onBtnSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreImg);

refs.loadMoreBtn.classList.add('visually-hidden');

function onBtnSubmit (e) {
    e.preventDefault();
    resetPage();
    refs.galleryContainer.innerHTML = '';
    refs.loadMoreBtn.classList.add('visually-hidden');
    searchNameImg = e.currentTarget.elements.searchQuery.value;    
    fetchImg(searchNameImg)
        .then(({data}) => {
            Notify.success(`Hooray! We found ${data.totalHits} images.`, { timeout: 4000, },);
            restLoadImage = data.totalHits;
            const arrayImg = data.hits;            
            if (data.totalHits === 0) {
                Notify.failure('Sorry, there are no images matching your search query. Please try again.', { timeout: 6000, },);
            }

            onMarkupImg(arrayImg);
            onSimpleLightbox();
            onScrollBy();
            restLoadImage -= 40;

            if (arrayImg.length === 40 && arrayImg.length < data.totalHits) {
              refs.loadMoreBtn.classList.remove('visually-hidden');       
            } else {
              refs.loadMoreBtn.classList.add('visually-hidden');
            }
        });
    refs.formImput.reset();                       
}

function onLoadMoreImg () {
  incrementPage();

  fetchImg(searchNameImg)
    .then(({data}) => {
      onMarkupImg(data.hits);
      onSimpleLightbox();
    });  
  if (restLoadImage <= 40) {
    refs.loadMoreBtn.classList.add('visually-hidden');
    Notify.info(
      'Sorry, there are no images matching your search query. Please try again.', 
      { 
        timeout: 6000, 
        position: 'center-bottom',
        width: '320px',        
      },      
      );
  }
  onScrollBy();
  restLoadImage -= 40;
}

function onMarkupImg(arrayImg) {
    const markupImg = arrayImg.map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => {
          return `<div class="photo-card">
                <a href="${largeImageURL}"> 
                  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                </a>
                <div class="info">
                  <p class="info-item">
                    <b>Likes: </b>${likes}
                  </p>
                  <p class="info-item">
                    <b>Views: </b>${views}
                  </p>
                  <p class="info-item">
                    <b>Comments: </b>${comments}
                  </p>
                  <p class="info-item">
                    <b>Downloads: </b>${downloads}
                  </p>
                </div>
        </div>`;
        }
      )
      .join('');        
    refs.galleryContainer.insertAdjacentHTML('beforeend', markupImg);
};

function onSimpleLightbox () {
    const bigImg = new SimpleLightbox(".gallery a", {
      captionsData: "alt",
      captionDelay: 250,
    });
    bigImg.refresh();
};

function onScrollBy () {
  const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}