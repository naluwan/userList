const BASE_URL = `https://lighthouse-user-api.herokuapp.com`;
const INDEX_URL = BASE_URL + `/api/v1/users/`;
const LIST_PRE_PAGE = 16

let users = []
let filteredUsers = []
let selectPage = 1
let mode = JSON.parse(localStorage.getItem('mode'))

const datapanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const genderBtn = document.querySelector('.btn-group')
const favoriteBtn = document.querySelector('.modal-content')
const switchMode = document.querySelector('.switch-mode')

// 初始化渲染畫面
axios.get(INDEX_URL)
  .then(response => {
    users.push(...response.data.results)
    // console.log(users)
    // renderUserList(getUsersByPage(1))
    // renderUserListListMode(getUsersByPage(1))
    displayListData()
    renderPage(users.length)
  }).catch(error => {
    console.log(error)
  })

// 初始化顯示mode
// modeAddLocalstorage('card')
if (!mode) {
  modeAddLocalstorage('card')
}

// func
// card mode渲染畫面
function renderUserListCardMode(data) {
  let html = ``;

  data.forEach(user => {
    html += `
      <div class="col-sm-3" id="card-wrapper">
          <div class="card border-light">
            <img src="${user.avatar}" class="card-img-top" alt="avatar" data-toggle="modal"
                data-target="#user-modal" data-id="${user.id}" id="card-user-avatar">
                <div class="card-user-wrapper ">
              <h5 class="card-user-name">${user.name + ` ` + user.surname}</h5>
              <h5 class="card-user-age">age：${user.age}</h5>
              <h5 class="card-user-region">region：${user.region}</h5>
                </div> 
          </div>
      </div>
    `
  });
  datapanel.innerHTML = html
}

// list mode渲染畫面
function renderUserListListMode(data) {
  let html = ``;

  html += `
    <table class="table">
        <tbody>
  `
  data.forEach(user => {
    html += `
      <tr>
        <td><img src="${user.avatar}" id="list-avatar">${user.name + ` ` + user.surname}</td>

        <td>
          <button class="btn btn-primary btn-show-user" data-toggle="modal" data-target="#user-modal" data-id="${user.id}">More</button>
        </td>
      </tr>
    `
  });
  html += `
      </tbody>
    </table>
  `
  datapanel.innerHTML = html
}

// 判斷mode change
function displayListData() {
  const data = getUsersByPage(selectPage)
  mode === 'card' ? renderUserListCardMode(data) : renderUserListListMode(data)
}

// 顯示user detail
function showUserDetails(id) {
  const modalName = document.querySelector('#user-modal-name')
  const modalAge = document.querySelector('#user-modal-age')
  const modalBirthday = document.querySelector('#user-modal-birthday')
  const modalEmail = document.querySelector('#user-modal-email')
  const modalRegion = document.querySelector('#user-modal-region')
  const modalImg = document.querySelector('#user-modal-avatar')
  const modalAddFavorite = document.querySelector('.btn-add-favorite')

  axios.get(INDEX_URL + id)
    .then(response => {
      const data = response.data
      // console.log(data.id)
      // console.log(modalAddFavorite)
      modalName.innerHTML = data.name + ` ` + data.surname
      modalAge.innerText = ` age: ` + data.age
      modalBirthday.innerText = ` birthday: ` + data.birthday
      modalEmail.innerText = ` email: ` + data.email
      modalRegion.innerText = ` region: ` + data.region
      modalImg.innerHTML = `
        <img src="${data.avatar}" alt="user-avatar">
      `;
      modalAddFavorite.innerHTML = `
       <i class="fas fa-heart fa-2x" data-id="${data.id}"></i>
      `;
    }).catch(error => {
      console.log(error)
    })
}

// 顯示分頁數
function renderPage(amount) {
  const numberOfPages = Math.ceil(amount / LIST_PRE_PAGE)

  let rawHTML = ``

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

// user per page
function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * LIST_PRE_PAGE

  return data.slice(startIndex, startIndex + LIST_PRE_PAGE)
}

// filter gender
function filteredGender(data, condition) {
  filteredUsers = data.filter(obj => obj.gender === condition)

  selectPage = 1
  displayListData()
  renderPage(filteredUsers.length)
}

// add to favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsersList')) || []
  const user = users.find(user => user.id === id)
  if (list.some(user => user.id === id)) {
    return alert(`${user.name}已經在最愛清單囉!!`)
  }

  list.push(user)

  localStorage.setItem('favoriteUsersList', JSON.stringify(list))
}

// 存 mode 至localStorage
function modeAddLocalstorage(data) {
  localStorage.removeItem('mode')
  mode = data
  localStorage.setItem('mode', JSON.stringify(mode))
}

// event
// datapanel點擊事件 顯示user detail
datapanel.addEventListener('click', event => {
  const target = event.target
  if (target.matches('#card-user-avatar') || target.matches('.btn-show-user')) {
    // console.log(target.dataset.id)
    showUserDetails(Number(target.dataset.id))
  }
})

// 分頁點擊事件 判斷點擊頁數及顯示該頁數資料
paginator.addEventListener('click', function onPaginatorClicked(event) {
  let target = event.target
  if (target.tagName !== 'A') return
  selectPage = Number(target.dataset.page)

  displayListData()
})

// 性別點擊事件
genderBtn.addEventListener('click', function onGenderbtnClicked(event) {
  let target = event.target
  if (target.matches('.btn-male')) {
    filteredGender(users, 'male')
  } else if (target.matches('.btn-female')) {
    filteredGender(users, 'female')
  } else if (target.matches('.btn-all')) {
    filteredGender(users)
  }
})

// 加入最愛點擊事件
favoriteBtn.addEventListener('click', function onFavoriteClicked(event) {
  event.preventDefault();
  let target = event.target

  // data-id設置在<i></i>上，要判斷是否點擊到<i></i>，而不是button
  if (target.matches('.fa-heart')) {
    addToFavorite(Number(target.dataset.id))
    if (target.matches('.checked')) return
    target.classList.toggle('checked')
    // console.log(target.dataset.id)
  }
})

// switch mode 點擊事件
switchMode.addEventListener('click', function onSwitchmodeClicked(event) {
  event.preventDefault()
  let target = event.target
  if (target.matches('#list-mode')) {
    // localStorage.removeItem('mode')
    // mode = 'list'
    // localStorage.setItem('mode', JSON.stringify(mode))
    modeAddLocalstorage('list')
  } else {
    // localStorage.removeItem('mode')
    // mode = 'card'
    // localStorage.setItem('mode', JSON.stringify(mode))
    modeAddLocalstorage('card')
  }
  displayListData()
})

