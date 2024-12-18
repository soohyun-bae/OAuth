
const kakaoLoginButton = document.querySelector('#kakao')
const naverLoginButton = document.querySelector('#naver')
const userImage = document.querySelector('img')
const userName = document.querySelector('#user_name')
const logoutButton = document.querySelector('#logout_button')

let currentOAuthService = ''

const kakaoClientId = 'fcf63c4854456897230ba97b45beb8ba'
const redirectURI = 'http://localhost:5500'
let kakaoAccessToken = ''

const naverClientId = 'cBtroufVBR0aZjUnYreJ'
const naverClientSecret = 'CtLnPRSobt'
const naverSecret = 'it_is_me'
let naverAccessToken = ''

function renderUserInfo(imgURL, name) {
  userImage.src = imgURL
  userName.textContent = name
}

kakaoLoginButton.onclick = () => {
  location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${redirectURI}&response_type=code`
}

naverLoginButton.onclick = () => {
  location.href = `https://nid.naver.com/oauth2.0/authorize?client_id=${naverClientId}&response_type=code&redirect_uri=${redirectURI}&state=${naverSecret}`
}

//페이지가 처음 로드됐을 때
window.onload = () => {
  const url = new URL(location.href)
  const urlParams = url.searchParams
  const authorizationCode = urlParams.get('code')
  const naverState = urlParams.get('state')

  if (authorizationCode) {
    if (naverState) {
      axios.post('http://localhost:3000/naver/login', { authorizationCode })
        .then(res => {
          naverAccessToken = res.data
          return axios.post('http://localhost:3000/naver/userInfo', { naverAccessToken })
        })
        .then(res => {
          renderUserInfo(res.data.profile_image, res.data.name)
          currentOAuthService = 'naver'
        })
    } else {
      axios.post('http://localhost:3000/kakao/login', { authorizationCode })
        .then(res => {
          kakaoAccessToken = res.data
          return axios.post('http://localhost:3000/kakao/userInfo', { kakaoAccessToken })
        })
        .then(res => {
          renderUserInfo(res.data.profile_image, res.data.nickname)
          currentOAuthService = 'kakao'
        })
    }
  }
}

logoutButton.onclick = () => {
  if (currentOAuthService === 'kakao') {
    axios.delete('http://localhost:3000/kakao/logout', {
      data: { kakaoAccessToken }
    })
      .then(res => {
        {
          console.log(res.data)
          renderUserInfo('', '')
        }
      })
  } else if (currentOAuthService === 'naver') {
    axios.delete('http://localhost:3000/naver/logout', {
      data: { naverAccessToken }
    })
      .then(res => renderUserInfo('', ''))
  }
}