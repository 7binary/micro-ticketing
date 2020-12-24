import axios from 'axios';
import React, { useState } from 'react';

const useRequest = ({ url, method = 'post', body = {} }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = (params = {}) => {

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios[method](url, { ...body, ...params });
        setErrors(null);
        resolve(response);
      } catch (err) {
        setErrors((
          <div className="alert alert-danger">
            <h4>Errors:</h4>
            <ul className="my-0">
              {err.response.data.errors.map(e => (
                <li key={e.message}>{e.message}</li>
              ))}
            </ul>
          </div>
        ));
        // reject();
      }
    });
  };

  return { doRequest, errors };
};

export default useRequest;
