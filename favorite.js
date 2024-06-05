const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const favoriteMovieList = JSON.parse(localStorage.getItem('favoriteMovies'))
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')
function renderMovieList(data) {
    // 原本資料存放

    let rawHTML = ''

    // process, 我們需要 movies 陣列當中的 title, image
    data.forEach(item => {
        rawHTML += `
    <div class="col-sm-3">
                <div class="mb-2">
                    <div class="card">
                        <img src="${BASE_URL}/posters/${item.image}"
                            class="card-img-top" alt="poster-image" />
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                        </div>
                        <div class="card-footer">
                            <!-- 修改這裡，跳出更多電影介紹（Modal id） -->
                            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                            <!-- data-target 需 = modal id -->
                            <button class="btn btn-danger btn-remove-favorite" data-id='${item.id}'>X</button>
                        </div>
                    </div>
                </div>
            </div>
    `
    })
    dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
    // 此 function 作為點選 more 按鈕呈現出頁面的函式
    // 函式傳入 id 才能從 INDEX API 中獲得相應的電影資料
    // 增加事件監聽器，以改動點選後相對應的畫面呈現
    const modalTitle = document.querySelector('#movie-modal-title')
    const modalImage = document.querySelector('#modal-image')
    const modalDate = document.querySelector('#movie-modal-date')
    const modalDescription = document.querySelector('#movie-modal-description')

    // 用 axios 將 API 的資料打入畫面

    axios.get(INDEX_URL + id).then(function (response) {
        const data = response.data.results
        modalTitle.innerText = data.title
        modalDate.innerText = 'Release Date:' + data.release_date
        modalDescription.innerText = data.description
        modalImage.innerHTML = `<img src="${POSTER_URL + data.image}"
                                    alt="movie-poster" class="img-fuid">`

    })
}

renderMovieList(favoriteMovieList)

function removeFromFavorite(id) {
    function isMovieIdMatched(movie) {
        return movie.id === id
    }
    const movieIndex = movies.findIndex(isMovieIdMatched)
    movies.splice(movieIndex, 1)

    localStorage.setItem('favoriteMovies', JSON.stringify(movies))
    renderMovieList(movies)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
    // console.log(event.target) -> 將點選的結果呈現在 console 中
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(Number(event.target.dataset.id))
    } else if (event.target.matches('.btn-remove-favorite')) {
        removeFromFavorite(Number(event.target.dataset.id))
    }
})

