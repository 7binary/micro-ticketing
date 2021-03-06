import React, { useState } from 'react';
import Router from 'next/router';

import useRequest from '../../hooks/use-request';

const page = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {doRequest, errors} = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: {email, password},
  });

  const onSubmit = (e) => {
    e.preventDefault();
    doRequest().then((response) => {
      Router.push('/');
    });
  };

  return (
    <div className="container">
      <form onSubmit={onSubmit}>
        <h1>Login</h1>
        <div className="form-group">
          <label>E-mail</label>
          <input
            type="text"
            className="form-control"
            onChange={e => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            onChange={e => setPassword(e.target.value)}
            value={password}
          />
        </div>

        {errors}

        <button className="btn btn-primary">Login</button>
      </form>
    </div>
  );
};

export default page;
