const express = require('express')
const cors = require('cors')
const axios = require('axios')

const kakaoClientId = 'fcf63c4854456897230ba97b45beb8ba'
const redirectURI = 'http://localhost:5500'

const naverClientId = 'cBtroufVBR0aZjUnYreJ'
const naverClientSecret = 'CtLnPRSobt'
const naverSecret = 'it_is_me'

const googleClientId = '1031200764429-v26f2pc6nv0o1gnkt1q6j5sp32e14jrp.apps.googleusercontent.com'
const googleClientSecret = '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'

const app = express()

app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ["OPTIONS", 'POST', 'DELETE'],
}))

app.use(express.json())

app.post('/kakao/login', (req, res) => {
  const authorizationCode = req.body.authorizationCode
  axios.post('https://kauth.kakao.com/oauth/token', {
    grant_type: 'authorization_code',
    client_id: kakaoClientId,
    redirect_uri: redirectURI,
    code: authorizationCode,
  },
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }
    }
  )
  .then(response => res.send(response.data.access_token))
})

app.post('/naver/login', (req, res) => {
  const authorizationCode = req.body.authorizationCode 
  axios.post(`https://nid.naver.com/oauth2.0/token?client_id=${naverClientId}&client_secret=${naverClientSecret}&grant_type=authorization_code&state=${naverSecret}&code=${authorizationCode}`)
  .then(response => res.send(response.data.access_token))
})

app.post('/google/login', (req, res) => {
  const authorizationCode = req.body.authorizationCode
  axios.post(`https://oauth2.googleapis.com/token?client_id=${googleClientId}&client_secret=${googleClientSecret}&code=${authorizationCode}&grant_type=authorization_code&redirect_uri=${redirectURI}`)
  .then(response => res.send(response.data.access_token))
})

app.post('/kakao/userInfo', (req, res) => {
  const {kakaoAccessToken} = req.body
  axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${kakaoAccessToken}`,
      'Content-Type' : 'application/x-www-form-urlencoded;charset=utf-8'
    }
  })
  .then(response => res.json(response.data.properties))
})

app.post('/naver/userInfo', (req, res) => {
  const {naverAccessToken} = req.body
  axios.get(`https://openapi.naver.com/v1/nid/me`, {
    headers:{
      Authorization: `bearer ${naverAccessToken}`
    }
  })
  .then(response => res.json(response.data.response))
})

app.post('/google/userInfo', (req, res) => {
  const {googleAccessToken} = req.body
  axios.get(`https://www.googleapis.com/oauth2/v2/userinfo`, {
    headers:{
      Authorization: `Bearer ${googleAccessToken}`
    }
  })
  .then(response => res.send(response.data))
})

app.delete('/kakao/logout', (req, res) => {
  const {kakaoAccessToken} = req.body
  axios.post('https://kapi.kakao.com/v1/user/logout', {}, {
    headers: {
      Authorization : `Bearer ${kakaoAccessToken}`
    }
  })
  .then(response => res.send('로그아웃 성공'))
})

app.delete('/naver/logout', (req, res) => {
  const {naverAccessToken} = req.body
  axios.post(`https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${naverClientId}&client_secret=${naverClientSecret}&access_token=${naverAccessToken}&service_provider=NAVER`)
  .then(response => res.send('로그아웃 성공'))
})

app.delete('/google/logout', (req, res) => {
  const {googleAccessToken} = req.body
  axios.post('https://oauth2.googleapis.com/revoke', null, {
    params: {
      token: googleAccessToken
    }
  })
  .then(response => res.send('로그아웃 성공'))
})
app.listen(3000, () => console.log('서버 열림'))