import 'bootstrap/dist/css/bootstrap.css';

import buildCilent from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  console.log('..starting');

  return (
    <div>
      <Header currentUser={currentUser}/>
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async appContext => {
  const client = buildCilent(appContext.ctx);
  const { data: { currentUser } } = await client.get('/api/users/me');
  let pageProps = {};

  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps({ ...appContext, client, currentUser });
  }

  return { pageProps, currentUser };
};

export default AppComponent;
