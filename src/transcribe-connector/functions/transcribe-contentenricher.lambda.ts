import { Transcribe, TranscriptionJob } from "@aws-sdk/client-transcribe";
import middy from "@middy/core";
import inputOutputLogger from "@middy/input-output-logger";
import { EventBridgeEvent } from "aws-lambda";

export interface TranscribeJobStateChanged {
  TranscriptionJobName: string;
  TranscriptionJobStatus: string;
}

const transcribeClient = new Transcribe({});

/**
 * Handles a Transcribe job state change event from AWS EventBridge
 * @param {EventBridgeEvent} event - The EventBridge event object
 * @returns {EventBridgeEvent} - The enriched EventBridge event with the full transcription job details
 */
const lambdaHandler = async (
  event: EventBridgeEvent<"Transcribe Job State Change", TranscribeJobStateChanged>,
): Promise<EventBridgeEvent<"Transcribe Job State Change", TranscriptionJob>> => {
  const transcriptionJob = await transcribeClient.getTranscriptionJob({
    TranscriptionJobName: event.detail.TranscriptionJobName,
  });

  return {
    ...event,
    detail: { ...transcriptionJob.TranscriptionJob },
  };
};

/**
 * Middleware for logging input and output of the Lambda function
 */
export const handler = middy<
  EventBridgeEvent<"Transcribe Job State Change", TranscribeJobStateChanged>,
  EventBridgeEvent<"Transcribe Job State Change", TranscriptionJob>
>()
  .use(inputOutputLogger())
  .handler(lambdaHandler);
