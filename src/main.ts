import { App, Environment } from "aws-cdk-lib";
import { MessagingStack } from "./messaging/stack";
import { MESSAGE_BUS_NAME_DEV } from "./shared/constants";
// import { TranscribeConnectorStack } from "./transcribe-connector/stack";

// for development, use account/region from cdk cli
const devEnv: Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

const messagingStack = new MessagingStack(app, "rewrite-messaging-dev", {
  messageBusName: MESSAGE_BUS_NAME_DEV,
  ...devEnv,
});
// new TranscribeConnectorStack(app, "rewrite-transcribe-connector-dev", {
//   messageBusName: MESSAGE_BUS_NAME_DEV,
//   ...devEnv,
// });

messagingStack.addSecurityChecks();

app.synth();
