import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Product Service API",
        description: "Automatically generated swagger docs",
        version: "1.0.0",
    },
    host: "localhost:6002",
    schemes: ["http"],
};

const outputFile = './swagger-output.json';
const endPointFiles = ["./routes/product.routes.ts"];

swaggerAutogen()(outputFile, endPointFiles, doc);

