const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')


// 將電影的資料存到 movies 這個陣列當中 （之後就跟陣列 movies 的資料做互動）
const movies = [];
let filterMovies = [];

// 將 movie 資料用 DOM render 到 HTML 上
// 需要呈現在畫面的資料有：posters 畫面、movie title，可以透過上面 axios 取出的資料拿到，並用 DOM 變更於 HTML
// 創建一個 function 處理畫面 render （請記得：一個 function 只要有一個功能就好）
// 要 render 的目的地在 index.html 的 data-panel
const dataPanel = document.querySelector('#data-panel')

// 在這裏 function 不直接寫入第六行的 movies，是因為保留未來修改 render 內容使用。若直接寫死，就會需要一個一個改。
// 因此，這邊以 data 作為帶入的變數，後續在呼叫函式時，再帶入 movies 即可。
function renderMovieList(data) {
    // 原本資料存放

    let rawHTML = ''

    // process, 我們需要 movies 陣列當中的 title, image

    data.forEach(item => {
        rawHTML += `
    <div class="col-sm-3">
                <div class="mb-2">
                    <div class="card">
                        <img src="${POSTER_URL + item.image}"
                            class="card-img-top" alt="poster-image" />
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                        </div>
                        <div class="card-footer">
                            <!-- 修改這裡，跳出更多電影介紹（Modal id） -->
                            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                            <!-- data-target 需 = modal id -->
                            <button class="btn btn-info btn-add-favorite" data-id='${item.id}'>+</button>
                        </div>
                    </div>
                </div>
            </div>
    `
    })




    // 最後資料呈現
    dataPanel.innerHTML = rawHTML


}

function getMoviesByPage(page) {
    const data = filterMovies.length > 0 ? filterMovies : movies
    // page 1 -> 0-11
    // page 2 -> 12-23 ...
    const startIndex = (page - 1) * MOVIES_PER_PAGE
    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
    // 80 / 12 = 6 ... 8 , 無條件進位 => 7
    let rawHTML = ''
    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `<li class="page-item"><a class="page-link"  href="#" data-page="${page}">${page}</a></li>`
    }
    paginator.innerHTML = rawHTML

}

paginator.addEventListener('click', function onPaginatorClicked(event) {
    if (event.target.tagName !== 'A') return
    const page = Number(event.target.dataset.page)
    renderMovieList(getMoviesByPage(page))
    // 'A' -> <a></a>
})

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

function addToFavorite(id) {
    function isMovieIdMatched(movie) {
        return movie.id === id
    }
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = movies.find(isMovieIdMatched)
    if (list.some(isMovieIdMatched)) {
        alert('電影已經在蒐藏清單中')
    } else {
        list.push(movie)
        localStorage.setItem('favoriteMovies', JSON.stringify(list))
    }

    console.log(list)

}

// 綁定事件：點選 dataPanel 上的 more 時，能夠跳出視窗
// 視窗上呈現：1. 正確的電影名稱 2. 正確的電影海報 3. 正確的上映日期 4. 正確的敘述
dataPanel.addEventListener('click', function onPanelClicked(event) {
    // console.log(event.target) -> 將點選的結果呈現在 console 中
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(Number(event.target.dataset.id))
    } else if (event.target.matches('.btn-add-favorite')) {
        addToFavorite(Number(event.target.dataset.id))
    }
    // 先確認點選的是不是「more」btn，如果是，再呈現相應的頁面（執行 showMovieModal function)


})



// 用 axios 取出 API 當中 Movie 的索引資料
axios.get(INDEX_URL).then((response) => {
    // 叫出 response 當中 Array(80) 的陣列，在這個陣列裡面放所有電影清單的資料
    movies.push(...response.data.results)
    // ... names: 展開運算，用來把陣列的資料拆開
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
}).catch(error => {
    console.log(error)
})

const searchInput = document.querySelector('#search-input')
const searchForm = document.querySelector('#search-form')
searchForm.addEventListener('submit', function searchMovie() {
    event.preventDefault();
    // 因為瀏覽器預設在 submit 時重新整理，因此用 preventDefault() 避免瀏覽器重整
    const keyword = searchInput.value.trim().toLowerCase()
    // 用 DOM 取得 input 標籤裡的值，'.value'，儲存在變數 keyword 當中
    // toLowerCase() 全部轉成小寫
    // trim() 去掉前後的空白


    // // 方法一：用 for...of... 遍歷
    // for (const movie of movies) {
    //     if (movie.title.trim().toLowerCase().includes(keyword)) {
    //         filterMovies.push(movie)
    //         // 若 keyword 是空值，程式會認為 movie.title 都包含空值，因此都會放進 filterMovies() 中
    //     }
    // }

    // 方法二：用 array.forEach 遍歷
    // movies.forEach((movie) => {
    //     if (movie.title.trim().toLowerCase().includes(keyword)) {
    //         filterMovies.push(movie)
    //     }
    // })
    // 也可以使用 forEach 遍歷



    // 方法三：用 array.filter() 篩選
    filterMovies = movies.filter(movie => { return movie.title.toLowerCase().includes(keyword) })




    if (filterMovies.length === 0) {
        return alert('沒有 ' + keyword + ' 的相關結果')
    }
    // 避免 user 輸入沒有的東西

    renderPaginator(filterMovies.length)
    renderMovieList(getMoviesByPage(1))
})