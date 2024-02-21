import { aws_events as events, aws_logs as logs, aws_events_targets as targets } from "aws-cdk-lib";
import { IEventBus } from "aws-cdk-lib/aws-events";
import { Construct } from "constructs";

export interface WireTapProps {
  inputChannel: events.IEventBus | events.IRule;
  outputChannel: logs.ILogGroup;
  messageFilter: events.EventPattern;
}

/**
 * The Wire Tap is a fixed Recipient List with two output channels. It consumes messages off the input channel and publishes
 * the unmodified message to both output channels.
 * @see https://www.enterpriseintegrationpatterns.com/patterns/messaging/WireTap.html
 *
 * The input channel can be either the eventbus itself to consume all messages using a new created rule
 * Or the input channel can be an existing rule attaching a new output channel as a target to caputre
 * only the messages that match the rule.
 *
 * The output channel can be any log group to capture the messages.
 *
 * @example
 * ```ts
 * const wireTap = new WireTap(this, "wire-tap", {
 *   inputChannel: bus,
 *   outputChannel: new logs.LogGroup(this, "wire-tap-log-group"),
 *   messageFilter: {
 *     source: ["my-app"],
 *   },
 * }
 */
export class WireTap extends Construct {
  constructor(scope: Construct, id: string, props: WireTapProps) {
    super(scope, id);

    const boundTarget = this.createOutputChannel(props.outputChannel);
    if (props.inputChannel instanceof events.Rule) {
      props.inputChannel.addTarget(boundTarget);
    } else {
      const inputChannelRule = new events.Rule(scope, `catch-rule`, {
        eventBus: props.inputChannel as IEventBus,
        eventPattern: props.messageFilter,
      });
      inputChannelRule.addTarget(boundTarget);
    }
  }

  private createOutputChannel(target: logs.ILogGroup): events.IRuleTarget | undefined {
    return new targets.CloudWatchLogGroup(target);
  }
}
