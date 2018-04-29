import React from 'react';
import { AppContainer } from 'react-hot-loader';
import ReactDOM  from 'react-dom';
import AppRouter from './routes';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/app.scss';

const render = (Component) =>
    ReactDOM.render(
        <AppContainer>
            <Component />
        </AppContainer>,
        document.getElementById('root')
    );

render(AppRouter);

if (module.hot) {
    module.hot.accept('./routes', () => {
        require('./routes');
        render(AppRouter);
    });
}