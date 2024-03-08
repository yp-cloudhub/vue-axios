import axios from 'axios';
import store from '@/store';

const instance = axios.create({
  baseURL: process.env.VUE_APP_API
});

instance.interceptors.request.use(function (config) {
  if (store.state.auth.token !== null) {
    config['headers'] = {
      Authorization: `Bearer ${store.state.auth.token}`
    };
  }

  return config
});



instance.interceptors.response.use(function (response) {
  store.commit('error/setValidationError', {});

  return response
}, async function (error) {
  if (error.response.status === 422) {
    store.commit('error/setValidationError', error.response.data.data);
  } else if (error.response.status === 401) {
    error.config.sent = true
    const token = await getAccessToken()
    console.log(token, 'here2')
    if (token) {
      console.log(instance)
      return instance.request(error.config)
    }
  } else {
    if (error.config.sent)
    return Promise.reject(error);
  }
})

const getAccessToken = async function () {
  try {
    const store = { refreshToken: 'rt' }
    const refreshToken = store.refreshToken
    instance.defaults.headers['Refresh-Token'] = refreshToken
    const token = await instance.get('/getToken').then(response => response.data.token)
    console.log(token, 'here1')
    return token
  } catch (error) {
    logout()
  }
}

const logout = () => {
  alert('logout')
}

export default instance;