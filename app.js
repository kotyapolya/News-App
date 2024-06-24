// Custom Http Module
function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                xhr.send();
            } catch (error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }

                xhr.send(JSON.stringify(body));
            } catch (error) {
                cb(error);
            }
        },
    };
}
// Init http module
const https = customHttp();

const newsService = (function () {
    const apiKey = '5019640497fa4ab7985e062279c3fda7';
    const apiUrl = 'https://newsapi.org/v2';

    return {
        topHeadlines(country = 'us', cb) {
            https.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`, cb);
        },
        everithing(query, cb) {
            https.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
        },
    };
})();

const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
console.log(searchInput);
form.addEventListener('submit', e => {
    e.preventDefault();
    loadNews();
})

//  init selects
document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();
    loadNews();
});

//Load news function

function loadNews() {
    showLoader();

    const country = countrySelect.value;
    const searchText = searchInput.value;
    if (!searchText) {
        newsService.topHeadlines(country, onGetResponse);
    } else {
        newsService.everithing(searchText, onGetResponse);
    }

}

function onGetResponse(err, res) {
    removeLoader();
    if (err) {
        showAlert(err, 'error-msg');
        return;
    }
    if (!res.articles.length) {
        //show msh
        return;
    }
    renderNews(res.articles);
}

//Function render news
function renderNews(news) {
    const newsContainer = document.querySelector('.news-container .row');

    if (newsContainer.children.length) {
        clearContainer(newsContainer);
    }

    let fragment = '';

    news.forEach(newItem => {
        const el = newsTemplate(newItem);
        fragment += el;
    });

    newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

function newsTemplate({ urlToImage, title, url, description }) {
    const defaultImg = 'https://s.france24.com/media/display/e6279b3c-db08-11ee-b7f5-005056bf30b7/w:1024/p:16x9/news_en_1920x1080.jpg';
    const titleToShow = title || defaultImg;
    return `
    <div class="col s12">
       <div class="card">
             <div class="card-image">
                <img src="${urlToImage}">
                <span class="card-title"> ${titleToShow} </span>
             </div>
             <div class="card-description">
                <p>${description || ''}</p>
             </div>
             <div class="card-action">
                <a href="${url}">Read more</a>
             </div>
        </div>
    </div>
    `
}

function showAlert(msg, type = 'success') {
    M.toast({ html: msg, classes: type });
}

// function clear container
function clearContainer(container) {
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

// Show loader function

function showLoader() {
    document.body.insertAdjacentHTML('afterbegin', `
    
     <div class="progress">
        <div class="indeterminate"></div>
     </div>
    `)
}

// Remove loader function

function removeLoader() {
    const loader = document.querySelector('.progress');
    if (loader) {
        loader.remove();
    }
}