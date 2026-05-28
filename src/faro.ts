import {
  initializeFaro,
  getWebInstrumentations,
  ReactIntegration,
  createReactRouterV7Options,
} from '@grafana/faro-react';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

initializeFaro({
  url: 'https://faro-collector-prod-ap-south-1.grafana.net/collect/4024d2d6fa58369071a1f7b840917eab',
  app: {
    name: 'Expense Hub (Web)',
    version: '0.1.0',
    environment: process.env.NODE_ENV,
  },
  ignoreErrors: [
    /^ResizeObserver loop limit exceeded$/,
    /^ResizeObserver loop completed with undelivered notifications$/,
    /^Script error\.$/,
    /chrome-extension:\/\//,
    /moz-extension:\/\//,
  ],
  instrumentations: [
    ...getWebInstrumentations(),
    new TracingInstrumentation(),
    new ReactIntegration({
      router: createReactRouterV7Options({
        createRoutesFromChildren,
        matchRoutes,
        Routes,
        useLocation,
        useNavigationType,
      }),
    }),
  ],
});
