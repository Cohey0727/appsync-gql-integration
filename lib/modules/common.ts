import env from "./env";

export function createResourceName(name: string) {
  return `${env.stackName}${name}-${env.stackStage}`;
}
