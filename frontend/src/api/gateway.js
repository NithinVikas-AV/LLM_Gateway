import axios from 'axios'

export const chatWithGateway = (universalKey, model, messages) =>
  axios.post('/gateway/chat', { model, messages }, {
    headers: { 'x-api-key': universalKey }
  })