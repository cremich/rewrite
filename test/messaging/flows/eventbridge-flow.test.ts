import path from "path";
import { Stack, aws_events as events, aws_lambda as lambda, aws_iam as iam } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { EventBridgeFlow } from "../../../src/messaging/constructs/flows/eventbridge-flow";

describe("EventBridgeFlow", () => {
  let stack: Stack;
  let flow: EventBridgeFlow;
  let eventSource: events.IEventBus;
  beforeEach(() => {
    stack = new Stack();
    eventSource = new events.EventBus(stack, "test-event-bus");
    flow = new EventBridgeFlow(stack, "test", {
      eventSource,
    });
  });

  describe("constructor()", () => {
    it("connects flow with event source", () => {
      expect(flow.rule).toBeDefined();
    });

    it("fails to synthesize without filter", () => {
      expect(() => {
        Template.fromStack(stack);
      }).toThrow();
    });
  });

  describe(".withFilter()", () => {
    it("adds event pattern to rule", () => {
      flow.withFilter({
        detailType: ["test"],
      });

      Template.fromStack(stack).hasResourceProperties("AWS::Events::Rule", {
        EventPattern: {
          "detail-type": ["test"],
        },
      });
    });
  });

  describe(".withEnricher()", () => {
    beforeEach(() => {
      flow.withFilter({
        detailType: ["test"],
      });
    });

    it("creates enricher lambda", () => {
      flow.withEnricher(lambda.Code.fromAsset(path.join(__dirname, "./functions")));
      Template.fromStack(stack).resourceCountIs("AWS::Lambda::Function", 1);
    });

    it("adds enricher lambda as rule target", () => {
      flow.withEnricher(lambda.Code.fromAsset(path.join(__dirname, "./functions")));
      Template.fromStack(stack).hasResourceProperties("AWS::Events::Rule", {
        Targets: Match.arrayWith([Match.objectLike({ Arn: Match.anyValue() })]),
      });
    });

    it("lambda enricher gets permissions from provided policies", () => {
      const policy = new iam.PolicyStatement({
        actions: ["test:*"],
        resources: ["*"],
      });

      flow.withEnricher(lambda.Code.fromAsset(path.join(__dirname, "./functions")), [policy]);
      Template.fromStack(stack).hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: [
            {
              Action: "test:*",
              Effect: "Allow",
              Resource: "*",
            },
          ],
        },
      });
    });
  });

  describe(".withEventTarget()", () => {
    let eventTarget: events.IEventBus;

    beforeEach(() => {
      flow.withFilter({
        detailType: ["test"],
      });
      eventTarget = new events.EventBus(stack, "test-event-target");
    });

    it("uses lambda destination as channel for enricher lambda", () => {
      flow.withEnricher(lambda.Code.fromAsset(path.join(__dirname, "./functions")));
      flow.withEventTarget(eventTarget);
      Template.fromStack(stack).hasResourceProperties("AWS::Lambda::EventInvokeConfig", {
        DestinationConfig: {
          OnSuccess: {
            Destination: Match.anyValue(),
          },
        },
      });
    });

    it("adds event target to rule", () => {
      flow.withEventTarget(eventTarget);
      Template.fromStack(stack).hasResourceProperties("AWS::Events::Rule", {
        Targets: Match.arrayWith([Match.objectLike({ Arn: Match.anyValue() })]),
      });
    });
  });
});
