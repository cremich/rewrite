import { aws_events as events, aws_logs as logs } from "aws-cdk-lib";
import { Construct } from "constructs";
import { WireTap } from "../management/wire-tap";

export interface MessageBusProps {
  readonly name: string;
}

export class MessageBus extends Construct {
  public readonly eventBus: events.EventBus;
  public logGroup: logs.LogGroup | undefined;

  constructor(scope: Construct, id: string, props: MessageBusProps) {
    super(scope, id);

    this.eventBus = new events.EventBus(this, "CustomEventBus", {
      eventBusName: props.name,
    });
  }

  public withMessageLogger(): MessageBus {
    this.logGroup = new logs.LogGroup(this, "LogGroup", {
      retention: logs.RetentionDays.ONE_WEEK,
    });
    new WireTap(this, "MessageLogger", {
      inputChannel: this.eventBus,
      outputChannel: this.logGroup,
      messageFilter: {
        source: events.Match.prefix(""),
      },
    });

    return this;
  }
}
