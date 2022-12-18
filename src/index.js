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
    searchNameImg = e.currentTarget.elements.searchQuery.value.trim();
    if (searchNameImg === '') {
      Notify.failure("Sorry, you didn't enter anything!!!", { timeout: 4000, },);
      refs.formImput.reset();
      return;
    }   
    onFetchArrayImg(searchNameImg);
    refs.formImput.reset();                          
}

async function onFetchArrayImg (searchNameImg) {
  try {
    const fetchArrayImg = await fetchImg(searchNameImg);
    const {data: {hits, totalHits}} = fetchArrayImg;
    if (totalHits === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.', { timeout: 6000, },);
      return;
    }
    Notify.success(`Hooray! We found ${totalHits} images.`, { timeout: 4000, },);
    restLoadImage = totalHits;
    onMarkupImg(hits);
    onSimpleLightbox();
    onScrollBy();
    restLoadImage -= 40;
    if (hits.length === 40 && hits.length < totalHits) {
      refs.loadMoreBtn.classList.remove('visually-hidden');       
    } else {
      refs.loadMoreBtn.classList.add('visually-hidden');
    }    
  } catch (error) {
    console.log(error);
  }  
}

async function onLoadMoreImg () {
  try {
    incrementPage();
    const fetchArrayImg = await fetchImg(searchNameImg);
    const { data: {hits} } = fetchArrayImg;
    onMarkupImg(hits);
    onSimpleLightbox();
    if (restLoadImage <= 40) {
      refs.loadMoreBtn.classList.add('visually-hidden');
      Notify.info(
        "We're sorry, but you've reached the end of search results.", 
        { 
          timeout: 6000, 
          position: 'center-bottom',
          width: '320px',        
        },      
        );
    }
    onScrollByOnLoadMore();
    restLoadImage -= 40;
  } catch (error) {
    console.log(error);
  }  
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
  window.scrollBy({
    top: 0,
    behavior: "smooth",
  });
}

function onScrollByOnLoadMore () {
  const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * 2,
  behavior: "smooth",
});
}
