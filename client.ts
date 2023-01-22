import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/random";

const PORT = 8002;

const PROTO_FILE = "./proto/random.proto";

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE));

const grpcObj = grpc.loadPackageDefinition(
  packageDef
) as unknown as ProtoGrpcType;

// Create grpc Client
const client = new grpcObj.randomPackage.Random(
  `0.0.0.0:${PORT}`,
  grpc.credentials.createInsecure()
);

const deadline = new Date();

deadline.setSeconds(deadline.getSeconds() + 5);

client.waitForReady(deadline, (err) => {
  if (err) {
    console.error(err);
    return false;
  }
  onClientReady();
});

function onClientReady() {
    client.PingPong({ message: "Ping" }, (err, result) => {
      if (err) {
        console.error(err);
        return false;
      }
      console.log(result);
    });

  const stream = client.RandomNumbers({ maxVal: 100 });

  stream.on("data", (chunk) => {
    console.log(chunk);
  });

  stream.on("end", () => {
    console.log("Communication ended...");
  });
}
