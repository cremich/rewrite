import { Tags, Stack, StackProps, Aspects } from "aws-cdk-lib";
import { AwsSolutionsChecks, NagSuppressions } from "cdk-nag";
import { Construct } from "constructs";
import { MessageBus } from "./constructs/channels/bus";
import { APPLICATION_NAME } from "../shared/constants";

export interface MessagingStackProps extends StackProps {
  messageBusName: string;
}

export class MessagingStack extends Stack {
  public readonly messageBus: MessageBus;
  constructor(scope: Construct, id: string, props: MessagingStackProps) {
    super(scope, id, props);

    this.messageBus = new MessageBus(this, "MessageBus", {
      name: props.messageBusName,
    });
    this.messageBus.withMessageLogger();

    this.applyTagging();
  }

  private applyTagging() {
    Tags.of(this).add("application", APPLICATION_NAME);
    Tags.of(this).add("component", "messaging");
  }

  public addSecurityChecks() {
    Aspects.of(this).add(new AwsSolutionsChecks({ verbose: false }));

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      `/${this.stackName}/EventsLogGroupPolicyrewritemessagingdevMessageBuscatchrule5951C1E3/CustomResourcePolicy/Resource`,
      [{ id: "AwsSolutions-IAM5", reason: "log retention lambda custom resource" }],
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      `/${this.stackName}/AWS679f53fac002430cb0da5b7982bd2287/ServiceRole/Resource`,
      [{ id: "AwsSolutions-IAM4", reason: "log retention lambda custom resource" }],
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      `/${this.stackName}/AWS679f53fac002430cb0da5b7982bd2287/Resource`,
      [{ id: "AwsSolutions-L1", reason: "log retention lambda custom resource" }],
    );
  }
}
