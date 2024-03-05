import { aws_events as events, aws_logs as logs } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EventBridgeFlow } from "../flows/eventbridge-flow";
import { Flow } from "../flows/flow";
import { WireTap } from "../management/wire-tap";

export interface MessageBusProps {
  readonly name: string;
}

export interface IMessageBus {
  readonly eventBus: events.IEventBus;
  flow(id: string): Flow;
}

abstract class MessageBusBase extends Construct implements IMessageBus {
  abstract eventBus: events.IEventBus;

  public flow(id: string): Flow {
    return new EventBridgeFlow(this, id, {
      eventSource: this.eventBus,
    });
  }
}

class ImportedMessageBus extends MessageBusBase {
  constructor(
    scope: Construct,
    id: string,
    public eventBus: events.IEventBus,
  ) {
    super(scope, id);
    this.eventBus = eventBus;
  }
}

export class MessageBus extends MessageBusBase {
  public static fromEventBus(scope: Construct, id: string, eventBus: events.IEventBus): IMessageBus {
    return new ImportedMessageBus(scope, id, eventBus);
  }

  eventBus: events.IEventBus;
  logGroup: logs.LogGroup | undefined;

  constructor(scope: Construct, id: string, props: MessageBusProps) {
    super(scope, id);

    this.eventBus = new events.EventBus(this, "CustomEventBus", {
      eventBusName: props.name,
    });
  }

  withMessageLogger() {
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
  }
}
