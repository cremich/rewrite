import { Tags, Stack, StackProps, aws_events as events } from "aws-cdk-lib";
import { Construct } from "constructs";
import { TranscribeEventProcessing } from "./constructs/event-processing";
import { MessageBus } from "../messaging/constructs/channels/bus";
import { APPLICATION_NAME } from "../shared/constants";

export interface TranscribeConnectorStackProps extends StackProps {
  messageBusName: string;
}

export class TranscribeConnectorStack extends Stack {
  constructor(scope: Construct, id: string, props: TranscribeConnectorStackProps) {
    super(scope, id, props);
    this.applyTagging();

    const messageBus = MessageBus.fromEventBus(
      this,
      "RewriteMessageBus",
      events.EventBus.fromEventBusName(this, "RewriteEventBus", props.messageBusName),
    );
    const defaultBus = MessageBus.fromEventBus(
      this,
      "DefaultMessageBus",
      events.EventBus.fromEventBusName(this, "DefaultEventBus", "default"),
    );

    new TranscribeEventProcessing(this, "TranscribeEventProcessing", {
      eventSource: defaultBus,
      eventTarget: messageBus,
    });
  }

  private applyTagging() {
    Tags.of(this).add("application", APPLICATION_NAME);
    Tags.of(this).add("component", "transcribe-connector");
  }
}
