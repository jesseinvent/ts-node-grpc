import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/random";
import { RandomHandlers } from "./proto/randomPackage/Random";

const PORT = 8002;

const PROTO_FILE = "./proto/random.proto";

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE));

const grpcObj = grpc.loadPackageDefinition(
  packageDef
) as unknown as ProtoGrpcType;

const randomPackage = grpcObj.randomPackage;

function InitializeGrpcServer() {
  const server = new grpc.Server();
  server.addService(randomPackage.Random.service, {
    PingPong: (req, res) => {
      console.log(req.request);
      res(null, { message: "Pong" });
    },
    RandomNumbers: (call) => {
      const { maxVal = 10 } = call.request;

      let count = 0;

      const interval = setInterval(() => {
        const num = Math.floor(Math.random() * maxVal);
        console.log(num);

        call.write({ num });

        if (count >= 50) {
          clearInterval(interval);
          call.end();
        }
        count++;
      }, 500);
    },
  } as RandomHandlers);

  return server;
}

function main() {
  const server = InitializeGrpcServer();

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
        return false;
      }

      server.start();
      console.log(`GRPC server starting on PORT ${PORT}`);
    }
  );
}

main();
