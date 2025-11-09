import serverless from "serverless-http";
import { createApp } from "../../server/src/app";

const app = createApp();

export const handler = serverless(app, {
  basePath: "/.netlify/functions/server",
});


