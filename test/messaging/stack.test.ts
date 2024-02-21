import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { MessagingStack } from "../../src/messaging/stack";
import { MESSAGE_BUS_NAME_DEV } from "../../src/shared/constants";

test("Snapshot for MessagingStack", () => {
  const app = new App();
  const stack = new MessagingStack(app, "rewrite-messaging-dev", {
    messageBusName: MESSAGE_BUS_NAME_DEV,
  });

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
