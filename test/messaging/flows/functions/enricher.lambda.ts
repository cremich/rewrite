// a new lambda function handler that returns hello world
import { Handler } from "aws-lambda";

export const handler: Handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World!" }),
  };
};
