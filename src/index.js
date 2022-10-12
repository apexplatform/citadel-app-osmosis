import React from 'react';
import './components/styles/index.css';
import App from './App';
import { store } from './store/store';
import { Provider } from 'react-redux';
import Splash from '@citadeldao/apps-ui-kit/dist/components/uiKit/Splash';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { Config } from './components/config/config';
import osmosis from './components/assets/osmosis.svg';
import osmosisLogo from './components/assets/osmosisLogo.svg';

const enabled = window.location.href.search('/localhost') === -1 &&
    window.location.href.search('/192.168.') === -1;

Sentry.init({
    dsn: enabled ?
        'https://5c05e134a0f74a7b985c06ad96e81e73@o510489.ingest.sentry.io/6477719'
        : null,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
});
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Provider store={store}><App/></Provider>);

const splashContainer = document.getElementById('splash');
const splashRoot = createRoot(splashContainer);
splashRoot.render(<Splash config={ {
    title: "Osmosis",
    fullName: 'Osmosis Swap',
    description: "Try decentralized peer-to-peer blockchain that people can use to create liquidity and trade IBC enabled tokens.",
    background_color: "#170A52",
    background: osmosis,
    circle_1: '#7C63F5',
    circle_2: '#3A2D7D',
    circle_3: 'rgba(99, 84, 180, 0.2)',
    circle_4: 'rgba(255, 255, 255, 0.1)',
    textColor: '#FFFFFF',
    mobileTextColor: '#FFFFFF',
    iconColor: '',
    mobileIconColor: '',
    logo: osmosisLogo
}}/>);

const r = document.querySelector(':root');
const config = new Config();
r.style.setProperty('--appThemeColor', config.tabbarParamsFromConfig('BACKGROUND_COLOR'));