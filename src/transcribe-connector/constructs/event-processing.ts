import path from "path";
import { aws_lambda as lambda, aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
import { IMessageBus } from "../../messaging/constructs/channels/bus";

export interface TranscribeEventProcessingProps {
  eventSource: IMessageBus;
  eventTarget: IMessageBus;
}

export class TranscribeEventProcessing extends Construct {
  constructor(scope: Construct, id: string, props: TranscribeEventProcessingProps) {
    super(scope, id);

    props.eventSource
      .flow("TranscribeContentEnrichment")
      .withFilter({
        source: ["aws.transcribe"],
        detailType: ["Transcribe Job State Change"],
      })
      .withEnricher(
        lambda.Code.fromAsset(
          path.join(__dirname, "../../../assets/transcribe-connector/functions/transcribe-contentenricher.lambda"),
        ),
        [
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["transcribe:GetTranscriptionJob"],
          }),
        ],
      )
      .withEventTarget(props.eventTarget.eventBus);
  }
}
