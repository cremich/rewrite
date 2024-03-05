import { Transcribe, TranscriptionJob } from "@aws-sdk/client-transcribe";
import middy from "@middy/core";
import inputOutputLogger from "@middy/input-output-logger";
import { EventBridgeEvent } from "aws-lambda";

export interface TranscribeJobStateChanged {
  TranscriptionJobName: string;
  TranscriptionJobStatus: string;
}

const transcribeClient = new Transcribe({});

const lambdaHandler = async (
  event: EventBridgeEvent<"Transcribe Job State Change", TranscribeJobStateChanged>,
): Promise<TranscriptionJob> => {
  const transcriptionJob = await transcribeClient.getTranscriptionJob({
    TranscriptionJobName: event.detail.TranscriptionJobName,
  });

  return { ...transcriptionJob.TranscriptionJob };
};

export const handler = middy<
  EventBridgeEvent<"Transcribe Job State Change", TranscribeJobStateChanged>,
  TranscriptionJob
>()
  .use(inputOutputLogger())
  .handler(lambdaHandler);
