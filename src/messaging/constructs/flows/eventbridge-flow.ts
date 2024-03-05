import {
  aws_events as events,
  aws_lambda as lambda,
  aws_events_targets as targets,
  aws_lambda_destinations as destinations,
  aws_iam as iam,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { Flow } from "./flow";
import { LAMBDA_RUNTIME } from "../../../shared/constants";

export interface EventBridgeFlowProps {
  eventSource: events.IEventBus;
}

export class EventBridgeFlow extends Construct implements Flow {
  readonly rule: events.Rule;
  enricher?: lambda.Function;

  constructor(scope: Construct, id: string, props: EventBridgeFlowProps) {
    super(scope, id);
    this.rule = new events.Rule(scope, "Rule", {
      eventBus: props.eventSource,
    });
  }

  withFilter(filter: events.EventPattern): EventBridgeFlow {
    this.rule.addEventPattern(filter);
    return this;
  }

  withEnricher(code: lambda.AssetCode, policies?: iam.PolicyStatement[]) {
    this.enricher = new lambda.Function(this.rule, "Enricher", {
      handler: "index.lambda",
      code,
      runtime: new lambda.Runtime(LAMBDA_RUNTIME, lambda.RuntimeFamily.NODEJS),
    });

    policies?.forEach((p) => this.enricher?.addToRolePolicy(p));

    this.rule.addTarget(new targets.LambdaFunction(this.enricher));
    return this;
  }

  withEventTarget(eventTarget: events.IEventBus) {
    if (this.enricher) {
      new lambda.EventInvokeConfig(this, "EnricherEventTarget", {
        function: this.enricher,
        onSuccess: new destinations.EventBridgeDestination(eventTarget),
      });
    } else {
      this.rule.addTarget(new targets.EventBus(eventTarget));
    }
    return this;
  }
}
