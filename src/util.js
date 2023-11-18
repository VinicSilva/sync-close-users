import readline from 'node:readline'
import axios from 'axios'

function log(message) {
  readline.cursorTo(process.stdout, 0)
  process.stdout.write(message)
}

async function makeRequest(data) {
  try {
    const response = await axios.post('http://localhost:3030', data);
    return response.status;
  } catch (error) {
    console.error('Erro na requisição:', error.message, error.response.data, {
      id: data.id,
      first_name: data.first_name,
    });
    return error.response.status;
  }
}

export {
  log,
  makeRequest
}