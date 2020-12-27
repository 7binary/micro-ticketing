import axios from 'axios';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const { processEnv } = publicRuntimeConfig;

const buildCilent = ({ req }) => {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: processEnv.SERVER_URL_BASE,
      headers: req.headers,
    });
  } else {
    return axios.create();
  }
};

export default buildCilent;
