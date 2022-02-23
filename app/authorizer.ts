import {
  Handler,
  AuthResponse,
  APIGatewaySimpleAuthorizerWithContextResult,
  APIGatewaySimpleAuthorizerResult,
} from "aws-lambda";

export const handler: Handler<any, APIGatewaySimpleAuthorizerResult> = async (
  event,
  context,
  callback
) => {
  console.log(`event >`, JSON.stringify(event, null, 2));
  const {
    authorizationToken,
    requestContext: { apiId, accountId },
  } = event;
  console.log(`event >`, authorizationToken);
  const response = {
    isAuthorized: true,
    resolverContext: {
      userid: "test-user-id",
      info: "contextual information A",
      more_info: "contextual information B",
    },
    deniedFields: [`Mutation.createEvent`],
    ttlOverride: 10,
  };
  console.log(`response >`, JSON.stringify(response, null, 2));
  return response;
};
