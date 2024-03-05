import { Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { CfnEventBus } from "aws-cdk-lib/aws-events";
import { MessageBus } from "../../../src/messaging/constructs/channels/bus";

describe("MessageBus", () => {
  let stack: Stack;
  let bus: MessageBus;

  beforeEach(() => {
    stack = new Stack();
    bus = new MessageBus(stack, "test", { name: "test-bus" });
  });

  describe("constructor()", () => {
    it("creates event bus", () => {
      Template.fromStack(stack).hasResourceProperties("AWS::Events::EventBus", {
        Name: "test-bus",
      });
    });
  });

  describe(".fromEventBus()", () => {
    it("creates MessageBus from already created bus", () => {
      const importedMessageBus = MessageBus.fromEventBus(stack, "imported-bus", bus.eventBus);
      expect(importedMessageBus.eventBus).toEqual(bus.eventBus);
    });
  });

  describe(".flow()", () => {
    it("creates new integration flow rule", () => {
      const flow = bus.flow("test");
      expect(flow).toBeDefined();
    });
  });

  describe(".withMessageLogger()", () => {
    beforeEach(() => {
      bus.withMessageLogger();
    });

    it("logs messages to cloudwatch log group", () => {
      Template.fromStack(stack).resourceCountIs("AWS::Logs::LogGroup", 1);
      Template.fromStack(stack).hasResourceProperties("AWS::Events::Rule", {
        EventBusName: Match.objectLike({ Ref: stack.getLogicalId(bus.eventBus.node.defaultChild as CfnEventBus) }),
        EventPattern: {
          source: [{ prefix: "" }],
        },
      });
    });
  });
});

describe("Imported MessageBus", () => {});
