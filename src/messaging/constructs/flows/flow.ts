import { aws_lambda as lambda, aws_events as events, aws_iam as iam } from "aws-cdk-lib";

export interface Flow {
  withFilter(filter: events.EventPattern): Flow;
  withEnricher(code: lambda.AssetCode, policies?: iam.PolicyStatement[]): Flow;
  withEventTarget(eventTarget: events.IEventBus): void;
}
