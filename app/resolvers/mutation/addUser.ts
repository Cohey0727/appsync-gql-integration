import * as AWS from "aws-sdk";
import { Handler } from "aws-lambda";

process.env.AWS_REGION;
const dbClient = new AWS.DynamoDB.DocumentClient();

export const handler: Handler = (event, context, callback) => {
  console.log({ event, context, callback });
  var params = {
    TableName: process.env.USER_TABLE_NAME!,
    Key: { id: "okamoto" },
  };
  dbClient.get(params, (err, data) => {
    console.debug({ err, data });
    callback(null, { id: "ID", name: "hello getUser", sex: "MALE" });
  });
};
