import "dotenv/config";

export default {
  stackName: process.env.STACK_NAME!,
  stackStage: process.env.STACK_STAGE!,
};
