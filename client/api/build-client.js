import axios from 'axios';

const buildCilent = ({req}) => {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: process.env.SERVER_URL_BASE,
      headers: req.headers,
    });
  } else {
    return axios.create();
  }
}

export default buildCilent;
